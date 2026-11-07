/**
 * The drafting pipeline, ported from the n8n workflow it replaces.
 *
 * Same guardrails, same editorial rules, same strict validator — the only
 * thing that changed is where it runs. n8n ran on a PC at D:\AI\n8n, so the
 * daily draft silently did not happen whenever that machine was off. This
 * runs on Cloudflare's cron.
 */

export const SYSTEM_PROMPT = [
  'You write for Qivy, a practical knowledge platform about AI, automation and everyday technology. You are NOT writing news or opinion.',
  '',
  'THE TEST EVERY ARTICLE MUST PASS: can the reader do something differently in the next ten minutes? If not, the article is wrong.',
  '',
  'ABSOLUTE RULES — breaking any of these makes the article unpublishable:',
  '1. NEVER write in the first person about experience. No "I tested", "I ran this for three months", "in my experience", "we benchmarked". You did not do any of those things and claiming otherwise is a fabrication published under the site owner\'s name. Write in the second person ("you") and the imperative.',
  '2. NEVER invent benchmarks, timings, prices, version numbers or performance results. If you do not know a figure, leave it out or tell the reader where to check.',
  '3. NEVER invent product capabilities, CLI flags, menu paths or API fields. Anything specific must come from official documentation you cite.',
  '4. Cite at least one real official documentation URL. Prefer the vendor\'s own docs.',
  '5. Do not rewrite or paraphrase another site\'s article.',
  '',
  'STYLE:',
  '- 300-700 words. A simple tip can be 150-300. Do not pad.',
  '- Open with the problem in 1-3 sentences. No "In today\'s fast-paced world". No restating the title.',
  '- Numbered steps where there is a sequence. Real, complete, copy-pasteable commands or config.',
  '- Include an "Expected result" section so the reader knows it worked.',
  '- Short conclusion or none. No "In conclusion, as we have seen".',
  '- British spelling. Plain language; explain jargon on first use.',
  '- India-first on pricing and availability ONLY where it changes the answer. A prompting technique is not regional.',
  '',
  'LENGTH LIMITS — these are enforced by the site build and a breach fails the run:',
  '- title: 10-120 characters',
  '- summary: 20-300 characters, one sentence',
  '- seoTitle: 10-60 characters',
  '- metaDescription: 50-160 characters',
  '- tags: 1-8 lowercase hyphenated strings',
  '',
  'OUTPUT FORMAT — return ONLY a single JSON object, no prose, no markdown fence:',
  '{',
  '  "title": "clear searchable title",',
  '  "slug": "lowercase-hyphenated-slug",',
  '  "summary": "one sentence",',
  '  "seoTitle": "max 60 chars",',
  '  "metaDescription": "50-160 chars",',
  '  "tags": ["three", "to", "six"],',
  '  "sources": ["https://official-docs-url"],',
  '  "body": "the article in Markdown, starting with a paragraph. Use ## for sections. Do NOT include an H1 — the title is rendered separately."',
  '}',
].join('\n');

export const DEFAULT_MODEL = 'google/gemma-4-31b-it:free';

// ─── Duplicate detection ────────────────────────────────────────────────
// Jaccard similarity on words of 4+ characters. Catches "Write better Claude
// prompts" against "How to improve your Claude prompting", which exact-title
// matching would happily let through as two separate articles.

function tokens(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 3);
}

export function similarity(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.length || !B.length) return 0;
  const setB = new Set(B);
  let inter = 0;
  for (const t of A) if (setB.has(t)) inter += 1;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

const DUPLICATE_THRESHOLD = 0.5;

/**
 * Pick the oldest queued idea that is not a near-duplicate of anything
 * already published, drafted or rejected.
 */
export function pickTopic(rows) {
  const used = ['published', 'drafted', 'in-review', 'rejected'];
  const taken = rows.filter((r) => used.includes(String(r.status).toLowerCase()));
  const ideas = rows.filter((r) => String(r.status).toLowerCase() === 'idea');

  if (!ideas.length) {
    return { ok: false, reason: 'The topic queue is empty. Add a topic to generate an article.' };
  }

  const scored = ideas.map((idea) => {
    let best = 0;
    let against = null;
    for (const t of taken) {
      const s = Math.max(
        similarity(idea.topic, t.topic),
        similarity(idea.topic, t.title),
        similarity(idea.title, t.title),
      );
      if (s > best) {
        best = s;
        against = t.title || t.topic;
      }
    }
    return { idea, best, against };
  });

  const clean = scored.filter((s) => s.best < DUPLICATE_THRESHOLD);
  if (!clean.length) {
    const closest = scored.sort((a, b) => a.best - b.best)[0];
    return {
      ok: false,
      reason:
        `Every queued topic looks like a duplicate. The closest, "${closest.idea.topic}", ` +
        `scores ${closest.best.toFixed(2)} against "${closest.against}". ` +
        'Add a genuinely new topic, or delete the stale ones.',
    };
  }

  const chosen = clean[0];
  return {
    ok: true,
    topic: chosen.idea,
    similarity: Number(chosen.best.toFixed(2)),
    existingTitles: taken.map((t) => t.title || t.topic).join(' | '),
  };
}

// ─── Model call ─────────────────────────────────────────────────────────

export async function callModel({ apiKey, model, topic, category, existingTitles, siteUrl }) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // OpenRouter uses these for its own attribution page. Harmless, and it
      // keeps the request identifiable in your OpenRouter activity log.
      'HTTP-Referer': siteUrl || 'https://qivy.in',
      'X-Title': 'Qivy Studio',
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content:
            `Write a Qivy article on this topic: ${topic}\n\n` +
            `Category: ${category}\n\n` +
            `Articles that already exist (do NOT duplicate any of these): ${existingTitles}`,
        },
      ],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    // Surface the provider's own words — "401 User not found" and
    // "402 negative balance" need different fixes and a generic message
    // hides which one you have.
    throw new Error(`OpenRouter returned HTTP ${res.status}: ${text.slice(0, 400)}`);
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`OpenRouter returned a non-JSON body: ${text.slice(0, 300)}`);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`No completion in the OpenRouter response: ${text.slice(0, 300)}`);
  }
  return { content, usedModel: body.model || model };
}

// ─── Validation ─────────────────────────────────────────────────────────

const FIRST_PERSON =
  /\b(I |I've|I'm|I'd|my |we tested|we ran|we benchmarked|in my experience|when I )/gi;

/**
 * Parse the model output and enforce the editorial rules.
 *
 * Throws rather than repairing anything that matters. A draft that cannot
 * meet the rules should produce nothing, never a weak article — the article
 * carries a human's byline.
 */
export function validateDraft(raw, { category, topicSimilarity }) {
  let text = String(raw).trim();
  // Models wrap JSON in fences often enough that stripping is routine.
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let a;
  try {
    a = JSON.parse(text);
  } catch {
    throw new Error(
      `The model did not return valid JSON. First 300 characters:\n\n${text.slice(0, 300)}`,
    );
  }

  for (const field of ['title', 'slug', 'summary', 'seoTitle', 'metaDescription', 'body']) {
    if (!a[field] || String(a[field]).trim() === '') {
      throw new Error(`The model omitted a required field: ${field}`);
    }
  }

  const sources = Array.isArray(a.sources) ? a.sources.filter(Boolean) : [];
  if (!sources.length) {
    throw new Error(
      'No sources returned. An article marked "researched" with no source is ' +
        'unverifiable, so it must not be published.',
    );
  }
  for (const s of sources) {
    if (!/^https?:\/\//i.test(s)) {
      throw new Error(`Source is not a URL: ${s}`);
    }
  }

  const tags = (Array.isArray(a.tags) ? a.tags : [])
    .map((t) => String(t).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .slice(0, 8);
  if (!tags.length) tags.push(category || 'ai');

  // These mirror src/content.config.ts. Clamping what is safely clampable
  // and throwing on what is not keeps the site build from failing later,
  // where the error is far less obvious.
  const title = String(a.title).trim();
  if (title.length < 10) throw new Error(`Title is too short for the content schema: "${title}"`);

  const summary = String(a.summary).trim();
  if (summary.length < 20) throw new Error('Summary is shorter than the schema allows (20 chars).');

  const seoTitle = String(a.seoTitle).trim().slice(0, 60);
  if (seoTitle.length < 10) throw new Error('seoTitle is shorter than the schema allows (10 chars).');

  let metaDescription = String(a.metaDescription).trim();
  if (metaDescription.length > 160) metaDescription = `${metaDescription.slice(0, 157).trim()}...`;
  if (metaDescription.length < 50) {
    throw new Error('metaDescription is shorter than the 50 characters the schema requires.');
  }

  const body = String(a.body);
  const hits = [...new Set((body.match(FIRST_PERSON) || []).map((h) => h.trim()))];

  const slug = String(a.slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const warnings = [];
  if (hits.length) {
    warnings.push(
      `First-person language found (${hits.join(', ')}). Nothing was actually run, so a ` +
        'claim of personal experience here is fabricated. Rewrite in the second person before publishing.',
    );
  }
  if (topicSimilarity >= 0.35) {
    warnings.push(
      `Topic similarity ${topicSimilarity} against an existing article. Check this is genuinely new ground.`,
    );
  }
  const words = body.trim().split(/\s+/).length;
  if (words < 150) warnings.push(`Only ${words} words. The rules ask for 300-700, or 150-300 for a simple tip.`);
  if (words > 900) warnings.push(`${words} words. Over the 700-word guideline — check it is not padded.`);

  return {
    title: title.slice(0, 120),
    slug,
    summary: summary.slice(0, 300),
    seoTitle,
    metaDescription,
    tags,
    sources,
    body: body.trim(),
    warnings,
    words,
  };
}

// ─── Markdown ───────────────────────────────────────────────────────────

function yaml(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

/**
 * `verification` is hard-coded to 'researched' and there is no parameter to
 * change it. The pipeline must never be able to emit 'tested' — that claims
 * first-hand experience nobody had, under the owner's byline.
 */
export function buildMarkdown(draft, { category, publishDate }) {
  const lines = [
    '---',
    `title: ${yaml(draft.title)}`,
    `summary: ${yaml(draft.summary)}`,
    `category: ${category}`,
    `publishDate: ${publishDate}`,
    `seoTitle: ${yaml(draft.seoTitle)}`,
    `metaDescription: ${yaml(draft.metaDescription)}`,
    'verification: researched',
    'sources:',
    ...draft.sources.map((s) => `  - ${yaml(s)}`),
    'tags:',
    ...draft.tags.map((t) => `  - ${t}`),
    '---',
    '',
  ];
  return `${lines.join('\n')}${draft.body}\n`;
}

// ─── GitHub ─────────────────────────────────────────────────────────────

/**
 * Commit a file straight to the publishing branch. Merging a pull request
 * was the old approval gate; here the gate is this app — nothing is
 * committed until you press Publish.
 */
export async function commitFile({ token, owner, repo, branch, path, content, message }) {
  const base = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'qivy-studio',
    'Content-Type': 'application/json',
  };

  // An existing file needs its blob SHA, or the API rejects the write.
  let sha;
  const existing = await fetch(`${base}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) {
    sha = (await existing.json()).sha;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub lookup failed: HTTP ${existing.status} ${await existing.text()}`);
  }

  const res = await fetch(base, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message,
      branch,
      content: bytesToBase64(new TextEncoder().encode(content)),
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub commit failed: HTTP ${res.status} ${(await res.text()).slice(0, 400)}`);
  }
  const body = await res.json();
  return body.commit?.html_url || body.content?.html_url || null;
}

/** btoa() is byte-oriented, so UTF-8 has to be encoded before it is called. */
function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
