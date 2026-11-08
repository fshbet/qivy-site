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
} from './src/pipeline.js';

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

console.log(`\n${passed} checks passed${process.exitCode ? ' — with failures above' : ''}.\n`);

// Emit a sample file so the caller can feed it to the real Astro schema.
if (process.argv.includes('--emit')) {
  const d = validateDraft(JSON.stringify(good), opts);
  process.stdout.write(buildMarkdown(d, { category: 'ai', publishDate: '2026-11-07' }));
}
