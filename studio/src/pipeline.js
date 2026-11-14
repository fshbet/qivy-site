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
  'READING LEVEL — this is the hardest rule to follow and the most important:',
  '- Write so a bright twelve-year-old could follow it without asking anyone a question. The reader may be an expert, but nobody has ever complained that something was too easy to read.',
  '- Short sentences. One idea each. Break up anything that needs a second comma to survive.',
  '- Explain every piece of jargon in the same sentence you first use it, in plain words. Not "use chain-of-thought prompting" but "ask it to show its working, which people call chain-of-thought prompting".',
  '- Where something is abstract, give one concrete everyday comparison — labelled boxes, giving someone directions, showing your working at school. One per section at most; they stop helping when they pile up.',
  '- No throat-clearing, no "it is important to note", no "leverage", no "utilise", no "delve".',
  '',
  'A REFERENCE UNDER EVERY SECTION:',
  '- Every ## section that states how something works ends with its own line, exactly in this form:',
  '  Reference: [Page or section title](https://full-url)',
  '- Link the most specific page you are sure of — a documentation page, or an anchor within one. Never a site home page, never a search result, never a URL you are not confident exists.',
  '- Put every URL you cite into the "sources" array as well.',
  '- A section with nothing worth referencing (a summary, a "what you should see") does not need one. Do not invent a link to satisfy the rule.',
  '',
  'FENCE ANYTHING WITH ANGLE BRACKETS — this one silently ruins articles:',
  '- Any example containing <tags>, HTML, XML or JSX MUST sit inside a triple-backtick fence.',
  '- Markdown passes raw tags straight through as real HTML. On the published page the tags vanish and only the text between them shows, so an article demonstrating tags loses the very thing it is demonstrating. It looks perfect in the editor and broken on the site.',
  '',
  'FRESH, NOT RECYCLED:',
  '- Describe how the tool behaves now. If you are not sure whether a detail is still current, leave it out and point the reader at the documentation instead.',
  '- Do not write a listicle of things the reader already knows. The angle has to be something they can act on.',
  '',
  'SEO, earned not stuffed:',
  '- Headings say what the section does, in the words someone would actually type into a search box. "Put labels around each part of your message" beats "Technique 1".',
  '- No keyword repetition for its own sake. The page is plain text with no images and no scripts, so clear structure and a real answer are the whole strategy.',
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
  '  "body": "the article in Markdown, starting with a paragraph. Use ## for sections, each ending with its own Reference: [title](url) line where it states how something works. Fence any example containing angle-bracket tags. Do NOT include an H1 — the title is rendered separately."',
  '}',
].join('\n');

export const DEFAULT_MODEL = 'google/gemma-4-31b-it:free';

// A slow answer is fine; a hung one is not. 60s was the first guess and it
// was wrong: it sat in the middle of the real distribution rather than past
// it. Nine successful runs took, end to end (model call plus source checks),
//
//   40  40  44  49  51  52  56  57  60   seconds
//
// against a 60s cap -- so the fastest four had room and the rest were racing
// it. Four of thirteen runs died on "aborted due to timeout", which is the
// same distribution with a cliff through the middle of it, not a separate
// fault. 150s puts the cliff well outside it. Cron invocations get minutes
// of wall time, and waiting on a fetch costs no CPU, so the only thing a
// longer wait spends is time nobody is watching.
const MODEL_TIMEOUT_MS = 150_000;

// Eight of these at most, once a day. Short: a slow doc site is not a
// reason to fail a run, only a reason to say the link was unreachable.
const SOURCE_TIMEOUT_MS = 10_000;

// Tried in order when one errors — OpenRouter does the failing over itself,
// so there is no retry loop here. Every entry is zero-priced and supports
// response_format, checked against /api/v1/models on 2026-11-08.
//
// The point is the VENDOR column, not the count. A 429 on gemma means
// Google AI Studio's shared free pool is busy, so another Google model is
// no use at all — it queues behind the same wall. Each fallback below is a
// different upstream.
//
//   nvidia/nemotron-3.5-super-vl   NVIDIA        1M ctx
//   xingchen-agi/xing4.0-29b-a4b   XingChen    262k ctx, text only
//
// openrouter/free would have been a third, but the cap is 3 including the
// primary, and an auto-router can route straight back to the busy pool.
//
// Deliberately excluded: google/gemma-4-26b-a4b-it:free (same pool as the
// primary), the Lyria models (music, not text), and stealth/crouton-alpha
// (a cloaked model — prompts there feed someone's evaluation, which is not
// a thing to opt into silently).
export const FALLBACK_MODELS = [
  'nvidia/nemotron-3.5-super-vl:free',
  'xingchen-agi/xing4.0-29b-a4b:free',
];

// OpenRouter rejects a longer array outright: HTTP 400, "'models' array must
// have 3 items or fewer". So this is a hard ceiling on primary + fallbacks,
// not a preference. Adding a third fallback breaks EVERY run, including the
// cron, which is why the test asserts the list still fits rather than
// trusting the slice below to quietly drop one.
const MAX_CHAIN = 3;

// Primary first, no repeats. A duplicate would spend a fallback slot on a
// model that just failed.
export function modelChain(primary) {
  const first = primary || DEFAULT_MODEL;
  return [first, ...FALLBACK_MODELS.filter((m) => m !== first)].slice(0, MAX_CHAIN);
}

export { MAX_CHAIN };

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
  // Without this, a free-tier request that queues forever is not an error —
  // it is silence. The fetch never settles, Cloudflare eventually kills the
  // isolate, and the catch in /generate never runs, so nothing is written to
  // `runs` at all. A failure you cannot see is worse than a slow one: you
  // get a spinner and an empty history with no reason in it.
  let res;
  let text;
  try {
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
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
        // `models` (plural) is OpenRouter's own fallback routing: it walks
        // the list on error and bills only the one that answers.
        models: modelChain(model),
        // The validator rejects anything that is not JSON, and a weaker
        // fallback is far likelier to wrap it in chat. Every model in the
        // chain supports this, so ask for the contract instead of hoping.
        response_format: { type: 'json_object' },
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
    // Read inside the same try, deliberately. The abort signal covers the
    // whole exchange, not just the headers, and OpenRouter sends headers
    // early -- so a slow generation aborts here, at the body, long after the
    // fetch itself resolved. With this line outside the catch the DOMException
    // escaped raw and the runs log read "The operation was aborted due to
    // timeout", which named the symptom and hid both the cause and the
    // sentence below that says what to do about it.
    text = await res.text();
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error(
        `OpenRouter did not respond within ${MODEL_TIMEOUT_MS / 1000}s. ` +
          'Free models queue behind paid traffic, so this is usually load ' +
          'rather than a broken key — try again, or set a paid model in Settings.',
      );
    }
    throw new Error(`Could not reach OpenRouter: ${err.message}`);
  }

  if (!res.ok) {
    // Surface the provider's own words — "401 User not found" and
    // "402 negative balance" need different fixes and a generic message
    // hides which one you have.
    const chain = modelChain(model).join(', ');
    const exhausted =
      res.status === 429
        ? ` Every model in the chain was rate-limited (${chain}). ` +
          'This is free-tier contention, not a broken key. The 06:00 run ' +
          'will try again, or set a paid model in Settings.'
        : '';
    throw new Error(
      `OpenRouter returned HTTP ${res.status}: ${text.slice(0, 400)}${exhausted}`,
    );
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

// Astro passes raw HTML straight through Markdown, so a bare <instructions>
// in prose becomes a real unknown element: the browser shows the text inside
// and silently swallows the tags themselves. An article teaching XML-tag
// prompting then publishes with its examples gutted — and it looks correct
// in the draft box, because that is a textarea showing the source.
// Fenced and inline code are escaped properly, so only unfenced tags matter.
/** Everything outside a code fence — where markdown passes HTML through. */
export function stripFences(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`\n]*`/g, ' ');
}

export function unfencedTags(body) {
  const bare = stripFences(body);
  const found = new Set();
  for (const [, tag] of bare.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\s*\/?>/g)) {
    found.add(tag.toLowerCase());
  }
  return [...found];
}

// Tags with no business in an article, and every one of them a way to run
// code on qivy.in. Unfenced HTML in markdown is not escaped — it becomes
// part of the page — so this is the difference between showing an example
// and executing it.
const DANGEROUS_TAGS = /^(script|iframe|object|embed|base|meta|link|form|style|svg)$/;

/**
 * Reasons this markdown must not be published, if any.
 *
 * Fenced examples are fine: an article about HTML should be able to show a
 * script tag. This is only about markup that would reach the live page.
 */
export function dangerousHtml(markdown) {
  const found = new Set();
  for (const tag of unfencedTags(markdown)) {
    if (DANGEROUS_TAGS.test(tag)) found.add(`<${tag}>`);
  }
  const bare = stripFences(markdown);
  // Matched only inside a real tag, so prose containing "only=" is not an
  // event handler and a sentence mentioning javascript: is not a link.
  if (/<[a-zA-Z][^>]*\son[a-zA-Z]+\s*=/.test(bare)) found.add('an inline event handler');
  if (/(href|src)\s*=\s*["']?\s*javascript:/i.test(bare)) found.add('a javascript: URL');
  return [...found];
}

// ─── Validation ─────────────────────────────────────────────────────────

// Two patterns, because one of them has to be case-sensitive. The old single
// regex carried the `i` flag, so `\bI ` also matched a lowercase loop
// variable: `for i in range(10)` was reported as a fabricated claim of
// personal experience. Measured on a real draft -- the body matched ["i "]
// and the warning read "First-person language found (i)".
//
// It also ran on the WHOLE body, fences included, and a warning is what
// `holdWarnings` treats as needing a person. So every article containing a
// Python loop was diverted to needs-review/, which the publisher never reads.
// A gate that holds everything is not a cautious gate.
//
// The cost of reading prose only: "# I tested this" in a code comment is no
// longer caught. Worth it -- that is rare, and the false positive was daily.
const FIRST_PERSON_PRONOUN = /\b(I|I've|I'm|I'd) /g;
const FIRST_PERSON_CLAIM =
  /\b(my |we tested|we ran|we benchmarked|in my experience|when i )/gi;

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
    // content.config.ts asks for z.string().min(2), and a one-character tag
    // is the kind of thing a model writes for an article about C or about X.
    // `filter(Boolean)` let it through, and it then failed the SITE BUILD --
    // hours later, in a red deploy nobody was watching, with every later
    // article blocked behind it. The gap was that this list said it mirrored
    // the schema and did not.
    .filter((t) => t.length >= 2)
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
  // Prose only: see the note on the patterns above.
  const prose = stripFences(body);
  const hits = [
    ...new Set(
      [
        ...(prose.match(FIRST_PERSON_PRONOUN) || []),
        ...(prose.match(FIRST_PERSON_CLAIM) || []),
      ].map((h) => h.trim()),
    ),
  ];

  const slug = String(a.slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  // "!!!" is non-empty and normalises to nothing, which would commit a
  // file called ".md". The required-field check above cannot see that.
  if (!slug) throw new Error(`The slug contained nothing usable: "${a.slug}"`);

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
  const bareTags = unfencedTags(body);
  if (bareTags.length) {
    warnings.push(
      `Unfenced tags in the body (${bareTags.map((t) => `<${t}>`).join(', ')}). ` +
        'Markdown passes these through as real HTML, so on the page the tags ' +
        'vanish and only the text between them shows. Wrap the block in a ' +
        'triple-backtick fence before publishing.',
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

// ─── Source checking ────────────────────────────────────────────────────

/**
 * Every http(s) link this file would publish as something a reader can click.
 *
 * Deliberately not the same list as the frontmatter `sources`. A dead
 * citation can sit in the prose while the sources array is clean -- the
 * draft that prompted this had the same 404 in both places -- and a reader
 * clicking it neither knows nor cares which array it came from.
 *
 * Fenced and inline code comes out first, via the same helper the HTML check
 * uses: an article about an API has to be able to show
 * `POST https://api.example.com/v1/thing` without that placeholder having to
 * resolve.
 */
export function publishedLinks(markdown) {
  const found = new Set();
  // Stopping at a quote or bracket is what makes YAML quoting and markdown
  // link syntax both come out clean.
  for (const [u] of stripFences(markdown).matchAll(/https?:\/\/[^\s)'"<>\]]+/g)) {
    // Prose owns the full stop, not the URL. A real path can end in "/", so
    // only sentence punctuation comes off.
    found.add(u.replace(/[.,;:!?]+$/, ''));
  }
  return [...found];
}

// validateDraft stays pure and offline-testable, so this lives apart: it is
// the one editorial rule that cannot be checked without the network.
//
// Why it is needed at all: the validator proves a source is shaped like a
// URL, not that it leads anywhere. A model will happily cite
// platform.openai.com/docs/guides/chat-completions/system-message — correct
// vendor, plausible path, 404. An article carrying `verification:
// researched` with a dead citation is unverifiable, which is the exact
// claim that field is supposed to stand behind.
//
// Redirects are reported rather than treated as faults. Vendors move docs
// constantly, and the old URL usually still works — but the canonical one
// is what belongs in a published article.
//
// Three outcomes, not two, and the split is the whole point:
//
//   dead        404 or 410. The page is gone, and the question this check
//               exists to answer is settled: no reader can follow it.
//   unverified  Any other failure -- 401, 403, 429, a 5xx, a timeout, a DNS
//               error. The server either refused *us* or said nothing. That
//               is not evidence about the page. OpenAI's help centre and its
//               API reference both answer 403 to HEAD and to GET while
//               opening perfectly in a browser, and treating that as dead
//               threw away a whole draft on 12 November and blocked another.
//   moved       Resolved somewhere else. Worth tidying, nothing more.
//
// Only `dead` refuses a publish. The other two are things to tell a human.
/**
 * Whether a cited URL and the URL it resolved to are the same page.
 *
 * Two differences do not count as a redirect worth reporting:
 *
 *   the fragment   Response.url never carries one, so every anchored
 *                  citation looked like a redirect to its own page -- and
 *                  the style rules ask for anchors.
 *   a trailing /   docs.n8n.io strips it, so a perfectly canonical citation
 *                  was reported as "the canonical URL differs" followed by
 *                  two URLs a reader cannot tell apart. Measured on draft
 *                  11, where both of its sources said exactly that.
 *
 * A note that fires on a non-difference trains you to skip the notes.
 */
export function sameTarget(cited, resolved) {
  const bare = (u) => u.split('#')[0].replace(/\/+$/, '');
  return bare(cited) === bare(resolved);
}

export async function checkSources(sources, impl = fetch) {
  const dead = [];
  const unverified = [];
  const moved = [];

  await Promise.all(
    sources.map(async (url) => {
      try {
        // HEAD is cheaper, but plenty of doc sites answer 403/405 to it, so
        // fall back to GET before believing a failure.
        let res = await impl(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
        });
        if (res.status === 403 || res.status === 405 || res.status === 501) {
          res = await impl(url, {
            method: 'GET',
            redirect: 'follow',
            signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
          });
        }
        if (res.status === 404 || res.status === 410) {
          dead.push(`${url} (HTTP ${res.status})`);
        } else if (res.status >= 400) {
          // Still worth saying out loud. Some servers answer 403 for a path
          // that does not exist, so this can be a wrong citation wearing bot
          // protection as a disguise -- which is exactly why it reaches you
          // as a warning instead of being waved through silently.
          unverified.push(`${url} (HTTP ${res.status})`);
        } else if (res.url && sameTarget(url, res.url) === false) {
          moved.push(`${url} -> ${res.url}`);
        }
      } catch (err) {
        // A network error is not proof the page is gone. It never was: this
        // used to be filed under `dead` while saying "could not be reached",
        // and the wording was right where the bucket was wrong.
        unverified.push(`${url} (could not be reached: ${err.name || err.message})`);
      }
    }),
  );

  const warnings = [];
  if (dead.length) {
    warnings.push(
      `Dead or unreachable source${dead.length > 1 ? 's' : ''}: ${dead.join('; ')}. ` +
        'This article is marked "researched", which is only honest if a reader ' +
        'can follow the citation. Replace or remove it before publishing.',
    );
  }
  if (unverified.length) {
    const every = unverified.length === sources.length;
    warnings.push(
      `Could not verify ${every ? 'any source' : `source${unverified.length > 1 ? 's' : ''}`}: ` +
        `${unverified.join('; ')}. The page may be perfectly fine and simply refusing ` +
        'automated requests, which is common on vendor help centres — but nothing here ' +
        `has checked it, so open ${unverified.length > 1 ? 'each one' : 'it'} yourself.` +
        (every ? ' Nothing in this article has a citation anyone has followed.' : ''),
    );
  }
  if (moved.length) {
    warnings.push(
      `Source redirects, so the canonical URL differs: ${moved.join('; ')}. ` +
        'Worth updating — the current link works today and may not next year.',
    );
  }
  return {
    dead,
    unverified,
    moved,
    warnings,
    // Still only about `dead`: all sources 404 means the article cites
    // nothing that exists, which is worth refusing to store at all. All
    // sources merely unverified is a different thing -- a human can still
    // open them -- so that holds the draft for review instead of binning it.
    allDead: sources.length > 0 && dead.length === sources.length,
    allUnverified: sources.length > 0 && unverified.length === sources.length,
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
    // Quoted like every other value here. Unquoted, a tag of `true` is a
    // YAML boolean rather than a string, and the schema wants strings -- so
    // one plausible tag would fail the build instead of the draft.
    ...draft.tags.map((t) => `  - ${yaml(t)}`),
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
 *
 * It REFUSES to replace a file that already exists unless `overwrite` says
 * otherwise. The slug comes from a model, and two articles on neighbouring
 * topics produce the same filename — so the default behaviour was a silent
 * rewrite of a published page, recoverable only from git history. Overwriting
 * is now something a caller has to ask for by name.
 *
 * `impl` is the fetch to use, so a test can drive both branches without a
 * network. Same pattern as `checkSources`.
 */
export async function commitFile(
  { token, owner, repo, branch, path, content, message, overwrite = false },
  impl = fetch,
) {
  const base = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'qivy-studio',
    'Content-Type': 'application/json',
  };

  // An existing file needs its blob SHA, or the API rejects the write.
  let sha;
  const existing = await impl(`${base}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) {
    if (!overwrite) {
      throw new Error(
        `${path} already exists on ${branch}. Publishing would overwrite a live article ` +
          'that readers may already have seen — change the slug, or delete the published ' +
          'file first.',
      );
    }
    sha = (await existing.json()).sha;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub lookup failed: HTTP ${existing.status} ${await existing.text()}`);
  }

  const res = await impl(base, {
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
