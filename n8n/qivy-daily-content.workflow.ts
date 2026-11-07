/**
 * Qivy — Daily Content Pipeline (n8n Workflow SDK source)
 *
 * This file is the source of record for the workflow created in n8n. Keeping
 * it in the repo means the pipeline is reviewable and version-controlled like
 * the rest of the site, instead of living only inside the n8n UI.
 *
 * Flow:
 *   Schedule -> read ledger -> pick topic + duplicate check -> research &
 *   draft (AI) -> validate & build Markdown -> create branch -> commit file
 *   -> open PULL REQUEST -> update ledger -> notify admin
 *
 * The pull request IS the editorial dashboard and the approval gate. Nothing
 * reaches qivy.in until a human merges it.
 *
 * Guardrails enforced in code, not by convention:
 *   - verification is forced to 'researched'; the pipeline can never emit
 *     'tested', which would be a fabricated claim of first-hand experience.
 *   - at least one source URL is required, or the run fails.
 *   - first-person experiential language is detected and flagged loudly in
 *     the PR body for the reviewer.
 *   - near-duplicate topics are surfaced to a human, never silently dropped.
 */
import {
  workflow,
  node,
  trigger,
  sticky,
  newCredential,
  languageModel,
  expr,
} from '@n8n/workflow-sdk';

const REPO_OWNER = 'fshbet';
const REPO_NAME = 'qivy-site';
const LEDGER_ID = 'nt4YIGvd4r5gNydo';

// ── Trigger ───────────────────────────────────────────────────────────────
const dailyTrigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.4,
  config: {
    name: 'Daily 06:00',
    parameters: {
      rule: { interval: [{ field: 'days', triggerAtHour: 6, triggerAtMinute: 0 }] },
    },
    position: [-640, 0],
  },
});

// ── Ledger ────────────────────────────────────────────────────────────────
const readLedger = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Read content ledger',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: LEDGER_ID },
      returnAll: true,
    },
    position: [-420, 0],
  },
});

const pickTopic = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Pick topic + duplicate check',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: [
        "// Choose the next 'idea' row that is not a near-duplicate of anything",
        '// already drafted, published or rejected. Returning [] ends the run',
        '// quietly, which is the correct behaviour on a day with no queue.',
        'const rows = $input.all().map(function (i) { return i.json; });',
        '',
        'function norm(s) {',
        "  return String(s == null ? '' : s).toLowerCase()",
        "    .replace(/[^a-z0-9 ]/g, ' ').replace(/\\s+/g, ' ').trim();",
        '}',
        '',
        '// Words of 4+ chars carry the topic; shorter ones are mostly filler.',
        'function tokens(s) {',
        "  return norm(s).split(' ').filter(function (w) { return w.length > 3; });",
        '}',
        '',
        '// Jaccard similarity. Catches "Write better Claude prompts" vs',
        '// "How to improve your Claude prompting", which exact-title matching',
        '// would happily let through as two separate articles.',
        'function similarity(a, b) {',
        '  const A = tokens(a); const B = tokens(b);',
        '  if (!A.length || !B.length) return 0;',
        '  const setB = new Set(B);',
        '  let inter = 0;',
        '  A.forEach(function (t) { if (setB.has(t)) inter += 1; });',
        '  const union = new Set(A.concat(B)).size;',
        '  return union ? inter / union : 0;',
        '}',
        '',
        "const USED = ['published', 'drafted', 'in-review', 'approved', 'scheduled', 'rejected'];",
        'const taken = rows.filter(function (r) {',
        "  return USED.indexOf(String(r.status == null ? '' : r.status).toLowerCase()) !== -1;",
        '});',
        'const ideas = rows.filter(function (r) {',
        "  return String(r.status == null ? '' : r.status).toLowerCase() === 'idea';",
        '});',
        '',
        'if (!ideas.length) return [];',
        '',
        'const THRESHOLD = 0.5;',
        'const scored = ideas.map(function (idea) {',
        '  let best = 0; let against = null;',
        '  taken.forEach(function (t) {',
        '    const s = Math.max(',
        '      similarity(idea.topic, t.topic),',
        '      similarity(idea.topic, t.title),',
        '      similarity(idea.title, t.title)',
        '    );',
        '    if (s > best) { best = s; against = t.title || t.topic; }',
        '  });',
        '  return { idea: idea, best: best, against: against };',
        '});',
        '',
        'const clean = scored.filter(function (s) { return s.best < THRESHOLD; });',
        '',
        '// Nothing clean: surface the closest call to a human instead of',
        '// silently publishing a near-duplicate or silently doing nothing.',
        'if (!clean.length) {',
        '  const closest = scored.sort(function (a, b) { return a.best - b.best; })[0];',
        '  return [{ json: {',
        '    blocked: true,',
        '    reason: "every queued topic looks like a duplicate",',
        '    topic: closest.idea.topic,',
        '    rowId: closest.idea.id,',
        '    similarity: Number(closest.best.toFixed(2)),',
        '    duplicateOf: closest.against,',
        '  } }];',
        '}',
        '',
        'const chosen = clean[0];',
        'return [{ json: {',
        '  blocked: false,',
        '  rowId: chosen.idea.id,',
        '  topic: chosen.idea.topic,',
        "  category: chosen.idea.category || 'ai',",
        '  similarity: Number(chosen.best.toFixed(2)),',
        '  existingTitles: taken.map(function (t) { return t.title || t.topic; }).join(" | "),',
        '} }];',
      ].join('\n'),
    },
    position: [-200, 0],
  },
});

// ── Draft ─────────────────────────────────────────────────────────────────
// The drafting model goes through OpenRouter, which turns "use a different
// provider" into editing one string rather than editing the workflow.
// 'openai/gpt-4.1' is the exact model this pipeline was built and prompted
// against — only the route to it changed.
//
// CHANGING PROVIDER: edit MODEL to any id from
// https://openrouter.ai/api/v1/models. 'anthropic/claude-sonnet-4.5',
// 'google/gemini-2.5-flash' and 'deepseek/deepseek-chat' all work with
// nothing else touched. Verified ids and current prices: n8n/README.md.
//
// RUNNING IT FREE AND LOCAL: replace this one sub-node with an Ollama Chat
// Model. Nothing else in the workflow changes. See n8n/README.md.
const MODEL = 'openai/gpt-4.1';

const draftModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOpenRouter',
  version: 1,
  config: {
    name: 'Drafting model',
    parameters: { model: MODEL },
    credentials: { openRouterApi: { id: 'amA9CBrla6PgucHX', name: 'OpenRouter Fshbet' } },
    position: [60, 200],
  },
});

const draftAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Research and draft article',
    parameters: {
      promptType: 'define',
      text: expr(
        '{{ "Write a Qivy article on this topic: " + $json.topic + ' +
          '"\\n\\nCategory: " + $json.category + ' +
          '"\\n\\nArticles that already exist (do NOT duplicate any of these): " + $json.existingTitles }}',
      ),
      options: {
        systemMessage: [
          "You write for Qivy, a practical knowledge platform about AI, automation and everyday technology. You are NOT writing news or opinion.",
          '',
          'THE TEST EVERY ARTICLE MUST PASS: can the reader do something differently in the next ten minutes? If not, the article is wrong.',
          '',
          'ABSOLUTE RULES — breaking any of these makes the article unpublishable:',
          '1. NEVER write in the first person about experience. No "I tested", "I ran this for three months", "in my experience", "we benchmarked". You did not do any of those things and claiming otherwise is a fabrication published under the site owner\'s name. Write in the second person ("you") and the imperative.',
          '2. NEVER invent benchmarks, timings, prices, version numbers or performance results. If you do not know a figure, leave it out or tell the reader where to check.',
          '3. NEVER invent product capabilities, CLI flags, menu paths or API fields. Anything specific must come from the official documentation you cite.',
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
          'OUTPUT FORMAT — return ONLY a single JSON object, no prose, no markdown fence:',
          '{',
          '  "title": "clear searchable title, 10-120 chars",',
          '  "slug": "lowercase-hyphenated-slug",',
          '  "summary": "one sentence, 20-300 chars",',
          '  "seoTitle": "max 60 chars",',
          '  "metaDescription": "50-160 chars",',
          '  "tags": ["3-6", "lowercase", "hyphenated"],',
          '  "sources": ["https://official-docs-url"],',
          '  "body": "the article in Markdown, starting with a paragraph. Use ## for sections. Do NOT include an H1 — the title is rendered separately."',
          '}',
        ].join('\n'),
      },
    },
    subnodes: { model: draftModel },
    position: [60, 0],
  },
});

// Thumbnail generation is wired but DISABLED by default: every run would be a
// paid image call, and the site renders a category-tinted placeholder when an
// article has no image. Enable this node if you want generated thumbnails.
const generateThumbnail = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.3,
  config: {
    name: 'Generate thumbnail (disabled)',
    disabled: true,
    parameters: {
      resource: 'image',
      operation: 'generate',
      prompt: expr(
        '{{ "Minimal flat editorial illustration, deep navy background, indigo accent, no text: " + $json.title }}',
      ),
      options: { size: '1792x1024' },
    },
    credentials: { openAiApi: { id: '4lyNzFbPfB85ZtSh', name: 'OpenAI account' } },
    position: [280, 0],
  },
});

const buildMarkdown = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Validate draft + build Markdown',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: [
        '// Parse the model output, enforce the editorial rules, and assemble',
        '// the exact Markdown file the Astro build will validate against its',
        '// content schema. Anything that fails here fails loudly now rather',
        '// than producing a broken pull request.',
        "const raw = $input.first().json.output || $input.first().json.text || '';",
        'const meta = $(\'Pick topic + duplicate check\').first().json;',
        '',
        '// Models wrap JSON in fences often enough that stripping is routine.',
        "let text = String(raw).trim();",
        "text = text.replace(/^```(?:json)?\\s*/i, '').replace(/\\s*```$/, '').trim();",
        '',
        'let a;',
        'try { a = JSON.parse(text); }',
        "catch (e) { throw new Error('Model did not return valid JSON. First 300 chars: ' + text.slice(0, 300)); }",
        '',
        'function need(field) {',
        '  if (!a[field] || String(a[field]).trim() === "") {',
        "    throw new Error('Model output is missing required field: ' + field);",
        '  }',
        '}',
        "['title', 'slug', 'summary', 'seoTitle', 'metaDescription', 'body'].forEach(need);",
        '',
        'const sources = Array.isArray(a.sources) ? a.sources.filter(Boolean) : [];',
        'if (!sources.length) {',
        "  throw new Error('No sources returned. An article marked \"researched\" without a source is unverifiable and must not be published.');",
        '}',
        '',
        'const tags = (Array.isArray(a.tags) ? a.tags : []).slice(0, 8);',
        "if (!tags.length) tags.push(meta.category || 'ai');",
        '',
        '// Length limits mirror src/content.config.ts so the build cannot fail',
        '// on something we could have caught here.',
        'const seoTitle = String(a.seoTitle).slice(0, 60);',
        'let metaDescription = String(a.metaDescription).trim();',
        'if (metaDescription.length > 160) metaDescription = metaDescription.slice(0, 157).trim() + "...";',
        'if (metaDescription.length < 50) {',
        "  throw new Error('metaDescription is shorter than the 50 characters the content schema requires.');",
        '}',
        '',
        '// GUARDRAIL: first-person experiential claims. The pipeline has not',
        '// run anything, so any such claim is fabricated. Flag it hard for the',
        '// reviewer rather than letting it slip through as the owner\'s voice.',
        'const body = String(a.body);',
        'const FIRST_PERSON = /\\b(I |I\'ve|I\'m|I\'d|my |we tested|we ran|we benchmarked|in my experience|when I )/gi;',
        'const hits = body.match(FIRST_PERSON) || [];',
        'const uniqueHits = Array.from(new Set(hits.map(function (h) { return h.trim(); })));',
        '',
        'const slug = String(a.slug).toLowerCase()',
        "  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);",
        '',
        "const today = new Date().toISOString().slice(0, 10);",
        '',
        'function yaml(s) { return "\'" + String(s).replace(/\'/g, "\'\'") + "\'"; }',
        '',
        'const frontmatter = [',
        "  '---',",
        "  'title: ' + yaml(a.title),",
        "  'summary: ' + yaml(a.summary),",
        "  'category: ' + (meta.category || 'ai'),",
        "  'publishDate: ' + today,",
        "  'seoTitle: ' + yaml(seoTitle),",
        "  'metaDescription: ' + yaml(metaDescription),",
        '  // Forced. The pipeline can never claim first-hand testing.',
        "  'verification: researched',",
        "  'sources:',",
        '].concat(',
        "  sources.map(function (s) { return '  - ' + yaml(s); }),",
        "  ['tags:'],",
        "  tags.map(function (t) { return '  - ' + String(t).toLowerCase().replace(/[^a-z0-9-]+/g, '-'); }),",
        "  ['---', '']",
        ").join('\\n');",
        '',
        'const fileContent = frontmatter + body.trim() + "\\n";',
        '',
        'const warnings = [];',
        'if (uniqueHits.length) {',
        "  warnings.push('**First-person language detected** (' + uniqueHits.join(', ') + '). The pipeline did not run anything, so any claim of personal experience is fabricated. Rewrite these in the second person before merging.');",
        '}',
        'if (meta.similarity >= 0.35) {',
        "  warnings.push('**Topic similarity ' + meta.similarity + '** against an existing article. Check this is genuinely new ground.');",
        '}',
        '',
        'const prBody = [',
        "  '## Draft article for review',",
        '  "",',
        "  '| | |',",
        "  '|---|---|',",
        "  '| Topic | ' + meta.topic + ' |',",
        "  '| Category | ' + (meta.category || 'ai') + ' |',",
        "  '| Verification | `researched` (not personally tested) |',",
        "  '| Words | ' + body.trim().split(/\\s+/).length + ' |',",
        "  '| Sources | ' + sources.length + ' |',",
        '  "",',
        "  '### Sources cited',",
        "  sources.map(function (s) { return '- ' + s; }).join('\\n'),",
        '  "",',
        "  warnings.length ? '### :warning: Needs attention\\n\\n' + warnings.join('\\n\\n') : '_No automated warnings._',",
        '  "",',
        "  '---',",
        '  "",',
        "  '**Before merging:** check the commands and any version numbers against the cited docs. Merging publishes this to qivy.in on the next build. Close this PR to reject the topic — it stays in the ledger so it will not be proposed again.',",
        "].join('\\n');",
        '',
        'return [{ json: {',
        '  rowId: meta.rowId,',
        '  topic: meta.topic,',
        "  category: meta.category || 'ai',",
        '  title: a.title,',
        '  slug: slug,',
        '  seoTitle: seoTitle,',
        '  metaDescription: metaDescription,',
        "  tags: tags.join(', '),",
        "  sources: sources.join(' '),",
        '  fileContent: fileContent,',
        "  filePath: 'src/content/articles/' + slug + '.md',",
        "  branch: 'draft/' + today + '-' + slug,",
        '  prBody: prBody,',
        '  warningCount: warnings.length,',
        '  today: today,',
        '} }];',
      ].join('\n'),
    },
    position: [500, 0],
  },
});

// ── GitHub ────────────────────────────────────────────────────────────────
// A branch has to exist before a file can be committed to it, and the GitHub
// node has no "create branch" operation — hence the two HTTP calls. Both reuse
// the same GitHub credential as the nodes below.
const getMainSha = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Get main branch SHA',
    parameters: {
      method: 'GET',
      url: `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/main`,
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      options: {},
    },
    credentials: { githubApi: newCredential('GitHub') },
    position: [720, 0],
  },
});

const createBranch = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Create draft branch',
    parameters: {
      method: 'POST',
      url: `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`,
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr(
        '{{ JSON.stringify({ ref: "refs/heads/" + $(\'Validate draft + build Markdown\').first().json.branch, sha: $json.object.sha }) }}',
      ),
      options: {},
    },
    credentials: { githubApi: newCredential('GitHub') },
    position: [940, 0],
  },
});

const commitFile = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Commit article file',
    parameters: {
      resource: 'file',
      operation: 'create',
      owner: { __rl: true, mode: 'name', value: REPO_OWNER },
      repository: { __rl: true, mode: 'name', value: REPO_NAME },
      filePath: expr("{{ $('Validate draft + build Markdown').first().json.filePath }}"),
      fileContent: expr("{{ $('Validate draft + build Markdown').first().json.fileContent }}"),
      commitMessage: expr(
        '{{ "Add draft article: " + $(\'Validate draft + build Markdown\').first().json.title }}',
      ),
      additionalParameters: {
        branch: {
          branch: expr("{{ $('Validate draft + build Markdown').first().json.branch }}"),
        },
      },
    },
    credentials: { githubApi: newCredential('GitHub') },
    position: [1160, 0],
  },
});

const openPr = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Open pull request',
    parameters: {
      resource: 'pullRequest',
      operation: 'create',
      owner: { __rl: true, mode: 'name', value: REPO_OWNER },
      repository: { __rl: true, mode: 'name', value: REPO_NAME },
      base: 'main',
      head: expr("{{ $('Validate draft + build Markdown').first().json.branch }}"),
      title: expr(
        '{{ "Draft: " + $(\'Validate draft + build Markdown\').first().json.title }}',
      ),
      body: expr("{{ $('Validate draft + build Markdown').first().json.prBody }}"),
      draft: false,
    },
    credentials: { githubApi: newCredential('GitHub') },
    position: [1380, 0],
  },
});

// ── Ledger update + notify ────────────────────────────────────────────────
const updateLedger = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Mark topic as drafted',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: LEDGER_ID },
      matchType: 'allConditions',
      filters: {
        conditions: [
          {
            keyName: 'id',
            condition: 'eq',
            keyValue: expr(
              "{{ $('Validate draft + build Markdown').first().json.rowId }}",
            ),
          },
        ],
      },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          status: 'in-review',
          title: expr("{{ $('Validate draft + build Markdown').first().json.title }}"),
          slug: expr("{{ $('Validate draft + build Markdown').first().json.slug }}"),
          seoTitle: expr("{{ $('Validate draft + build Markdown').first().json.seoTitle }}"),
          metaDescription: expr(
            "{{ $('Validate draft + build Markdown').first().json.metaDescription }}",
          ),
          sources: expr("{{ $('Validate draft + build Markdown').first().json.sources }}"),
          tags: expr("{{ $('Validate draft + build Markdown').first().json.tags }}"),
          prUrl: expr('{{ $json.html_url }}'),
        },
      },
      options: {},
    },
    position: [1600, 0],
  },
});

const notifyAdmin = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Notify admin',
    parameters: {
      resource: 'message',
      operation: 'send',
      // CHANGE THIS to the address that should receive review notifications.
      sendTo: 'CHANGE_ME@example.com',
      subject: expr(
        '{{ "Qivy draft ready for review: " + $(\'Validate draft + build Markdown\').first().json.title }}',
      ),
      emailType: 'html',
      message: expr(
        '{{ "<p>A new Qivy draft is waiting for review.</p>" + ' +
          '"<p><strong>" + $(\'Validate draft + build Markdown\').first().json.title + "</strong><br>" + ' +
          '"Category: " + $(\'Validate draft + build Markdown\').first().json.category + "<br>" + ' +
          '"Verification: researched (not personally tested)</p>" + ' +
          '($(\'Validate draft + build Markdown\').first().json.warningCount > 0 ' +
          '? "<p style=\\"color:#b4512f\\"><strong>This draft has " + $(\'Validate draft + build Markdown\').first().json.warningCount + " automated warning(s)</strong> — see the pull request.</p>" ' +
          ': "<p>No automated warnings.</p>") + ' +
          '"<p><a href=\\"" + $(\'Open pull request\').first().json.html_url + "\\">Review the pull request</a></p>" + ' +
          '"<p>Merging publishes it to qivy.in on the next build. Closing the PR rejects the topic.</p>" }}',
      ),
      options: { appendAttribution: false },
    },
    credentials: { gmailOAuth2: { id: 'oofWMkdxkNiACs6m', name: 'Gmail account' } },
    position: [1820, 0],
  },
});

// ── Canvas notes ──────────────────────────────────────────────────────────
// sticky(content, nodes?, config?) — content is positional; the nodes array
// only sizes and anchors the note around them.
const noteGate = sticky(
  [
    '## The approval gate',
    '',
    'This workflow NEVER publishes. It opens a pull request on',
    '`fshbet/qivy-site` and stops.',
    '',
    'Merging the PR publishes the article on the next build.',
    'Closing the PR rejects it — the topic stays in the ledger so it',
    'is not proposed again.',
  ].join('\n'),
  [getMainSha, createBranch, commitFile, openPr],
  { color: 4 },
);

const noteSetup = sticky(
  [
    '## Before the first run',
    '',
    '1. Create a **GitHub** credential (personal access token with',
    '   `repo` scope) and select it on all four GitHub nodes — including',
    '   the two HTTP Request ones, which credential auto-assignment skips.',
    '2. Set the recipient on **Notify admin** — it is a placeholder.',
    '3. Add topic rows to the **Qivy Content Ledger** data table with',
    '   `status = idea`, `topic`, and `category`',
    '   (`ai` / `automation` / `tips`).',
    '4. Seed the ledger with existing article slugs so they are never',
    '   re-proposed (see n8n/README.md).',
    '',
    'This workflow is **inactive**. Nothing runs until you activate it.',
  ].join('\n'),
  [readLedger, pickTopic],
  { color: 3 },
);

// The provider switch, stated on the canvas so it is findable without
// reading this file. Prices were read from the OpenRouter API on
// 2026-11-07; they are not guesses, but they do go stale.
const noteModel = sticky(
  [
    '## Changing the model',
    '',
    '**Drafting model** is an **OpenRouter** node, so the provider is',
    'one field, not a workflow change.',
    '',
    'Edit its `model` to switch. Verified working ids:',
    '',
    '| Model | In / Out per 1M tokens |',
    '|---|---|',
    '| `openai/gpt-4.1` *(current)* | $2.00 / $8.00 |',
    '| `anthropic/claude-sonnet-4.5` | $3.00 / $15.00 |',
    '| `google/gemini-2.5-flash` | $0.30 / $2.50 |',
    '| `deepseek/deepseek-chat` | $0.32 / $0.89 |',
    '| `openai/gpt-4.1-mini` | $0.40 / $1.60 |',
    '',
    'Prices read from the OpenRouter API on 2026-11-07 — re-check',
    'before relying on them.',
    '',
    '**Free and local:** delete this sub-node and drag in an',
    '**Ollama Chat Model** (the credential already exists). Nothing',
    'else in the workflow changes.',
  ].join('\n'),
  [draftModel],
  { color: 5 },
);

const noteGuardrails = sticky(
  [
    '## Guardrails',
    '',
    '`verification` is hard-coded to **researched**.',
    'The pipeline can never claim an article was personally tested —',
    'that would be a fabrication published under your name.',
    '',
    'The run FAILS if the model returns no source URL.',
    '',
    'First-person language ("I tested", "in my experience") is',
    'detected and flagged in the PR body for you to rewrite.',
  ].join('\n'),
  [draftAgent, buildMarkdown],
  { color: 3 },
);

// ── Compose ───────────────────────────────────────────────────────────────
export default workflow('qivy-daily-content', 'Qivy — Daily Content Pipeline')
  .add(dailyTrigger)
  .to(readLedger)
  .to(pickTopic)
  .to(draftAgent)
  .to(generateThumbnail)
  .to(buildMarkdown)
  .to(getMainSha)
  .to(createBranch)
  .to(commitFile)
  .to(openPr)
  .to(updateLedger)
  .to(notifyAdmin)
  .add(noteSetup)
  .add(noteModel)
  .add(noteGuardrails)
  .add(noteGate)
  .group('Topic selection', [readLedger, pickTopic], {
    description:
      'Reads the ledger and picks the next idea that is not a near-duplicate of anything already drafted, published or rejected.',
  })
  .group('Draft', [draftAgent, draftModel, generateThumbnail, buildMarkdown], {
    description:
      'Researches and drafts the article, then validates it against the editorial rules and builds the Markdown file.',
  })
  .group('Open pull request', [getMainSha, createBranch, commitFile, openPr], {
    description:
      'Creates a draft branch, commits the article file, and opens the pull request that acts as the approval gate.',
  })
  .group('Record and notify', [updateLedger, notifyAdmin], {
    description:
      'Marks the ledger row as in-review with the PR link, then emails the administrator.',
  });
