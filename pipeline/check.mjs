/**
 * Runs before the drafter, in the workflow and locally.
 *
 * It checks the things that fail silently rather than loudly: a queue entry
 * with a category the site does not have, an article whose title cannot be
 * parsed (and which the duplicate check is therefore blind to), a queue that
 * has run dry. None of those raise an exception on their own -- they just
 * quietly produce a worse article, or the same article twice.
 *
 *   node pipeline/check.mjs
 *
 * Exits non-zero on anything that would make a drafting run wrong. A thin
 * queue is a warning, not a failure: it still drafts, it just needs topics.
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pickTopic, similarity } from '../studio/src/pipeline.js';
import {
  readQueue,
  publishedTitles,
  buildRows,
  titleOf,
  PUBLISHED_DIR,
  CATEGORIES,
} from './queue.mjs';

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures += 1;
    console.log(`  FAIL ${name}\n       ${err.message.split('\n')[0]}`);
  }
};

// ─── titleOf, the one piece of parsing nothing else covers ───

check('reads a quoted title', () => {
  assert.equal(titleOf("---\ntitle: 'Hello world'\ncategory: ai\n---\n"), 'Hello world');
});

check('undoes the doubled-quote escape buildMarkdown writes', () => {
  // `Ollama''s` in YAML is one apostrophe. Getting this wrong would score
  // every title containing an apostrophe against the wrong string.
  assert.equal(titleOf("title: 'Ollama''s quantisation'\n"), "Ollama's quantisation");
});

check('reads a double-quoted title', () => {
  assert.equal(titleOf('title: "Hello"\n'), 'Hello');
});

check('reads an unquoted title', () => {
  assert.equal(titleOf('title: Hello world\n'), 'Hello world');
});

check('does not mistake another key for the title', () => {
  assert.equal(titleOf("seoTitle: 'Not this'\nsummary: 'Nor this'\n"), null);
});

check('returns null rather than guessing when there is no title', () => {
  assert.equal(titleOf('---\ncategory: ai\n---\n'), null);
});

// ─── The real repository ───

const queueFile = await readQueue(); // throws on a bad category or empty topic
const { titles, untitled } = await publishedTitles();
const articleFiles = (await readdir(PUBLISHED_DIR)).filter((f) => f.endsWith('.md'));

check('every published article has a readable title', () => {
  assert.deepEqual(untitled, [], `unparseable: ${untitled.join(', ')}`);
});

check('a title was read for every article file', () => {
  assert.equal(titles.length, articleFiles.length);
});

check('every queued category exists on the site', () => {
  for (const q of queueFile.queue) assert.ok(CATEGORIES.includes(q.category), q.category);
});

check('no two queued topics are near-duplicates of each other', () => {
  // pickTopic only scores an idea against what is already taken, so two
  // similar ideas would both be drafted. Catching it here is the only place.
  for (let i = 0; i < queueFile.queue.length; i += 1) {
    for (let j = i + 1; j < queueFile.queue.length; j += 1) {
      const s = similarity(queueFile.queue[i].topic, queueFile.queue[j].topic);
      assert.ok(
        s < 0.5,
        `"${queueFile.queue[i].topic}" vs "${queueFile.queue[j].topic}" scores ${s.toFixed(2)}`,
      );
    }
  }
});

check('the next topic is pickable against what is already published', () => {
  const picked = pickTopic(buildRows(titles, queueFile.queue));
  assert.ok(picked.ok, picked.reason);
  assert.equal(picked.topic.topic, queueFile.queue[0].topic, 'oldest queued topic is not next up');
});

// ─── The workflow that calls this script ───

// What this guards, measured: on 20 and 21 November the queue hit zero, this
// script exited 1 at ten seconds, and promote.mjs never ran -- so two drafts
// that were already written and already clean sat in pipeline/drafts/ for two
// days. promote.mjs does not read the queue, so it had no business waiting on
// it. Drafting must wait on this check. Publishing must not. And the run must
// still go red, or a dry queue is a green run nobody looks at.
const workflow = await readFile(
  new URL('../.github/workflows/articles.yml', import.meta.url),
  'utf8',
);

check('the workflow gates the drafting steps on this script and nothing else', () => {
  const step = (name) => {
    const i = workflow.indexOf(`- name: ${name}`);
    assert.ok(i !== -1, `no step named "${name}"`);
    const end = workflow.indexOf('\n      - ', i + 1);
    return workflow.slice(i, end === -1 ? undefined : end);
  };

  assert.match(step('Check the queue'), /continue-on-error: true/);

  for (const name of [
    'Draft with Claude',
    'Validate what Claude wrote',
    'Fall back to OpenRouter',
  ]) {
    assert.match(step(name), /steps\.check\.outcome == 'success'/, `${name} is not gated`);
  }

  for (const name of ['Publish up to the daily limit', 'Prove the site still builds', 'Commit']) {
    assert.doesNotMatch(step(name), /steps\.check\./, `${name} must not wait on the check`);
  }

  assert.match(
    step('Fail the run if the queue needs attention'),
    /steps\.check\.outcome != 'success'/,
  );
});

// ─── Runway, a warning rather than a failure ───

const PER_DAY = 10;
const days = Math.floor(queueFile.queue.length / PER_DAY);
console.log(
  `\n${queueFile.queue.length} topics queued, ${titles.length} published. ` +
    `At ${PER_DAY} a day that is ${days} day(s) of runway.`,
);
if (days < 3) {
  console.log('WARNING: under three days of topics left. Add some before the queue runs dry.');
}

if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
