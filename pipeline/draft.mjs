/**
 * The fallback drafter: writes articles with OpenRouter when Claude could not.
 *
 * Claude is the primary writer and runs as a step in the workflow above this
 * one. This exists for the run where that step fails -- a bad token, an
 * outage, a rate limit -- so a failed Claude run costs a better article
 * rather than the whole day's output.
 *
 * Everything here is borrowed, not written: `pickTopic`, `callModel`,
 * `validateDraft`, `checkSources` and `buildMarkdown` all come from
 * studio/src/pipeline.js, which is the same code the Cloudflare dashboard
 * runs and the same code the 95 tests cover. The only new logic is reading
 * the queue from a file instead of from D1.
 *
 *   OPENROUTER_API_KEY=... node pipeline/draft.mjs --count 10
 *   OPENROUTER_API_KEY=... node pipeline/draft.mjs --count 1 --dry-run
 *
 * A draft that fails validation costs that one article, not the run: the
 * loop records the reason and moves to the next topic. The run fails only
 * when nothing could be drafted at all, because then the workflow should go
 * red rather than commit an empty change.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  pickTopic,
  callModel,
  validateDraft,
  checkSources,
  buildMarkdown,
  DEFAULT_MODEL,
} from '../studio/src/pipeline.js';
// Same rule as the dashboard's auto-approve and as ingest.mjs. One
// definition of "needs a human", imported in all three places.
import { holdWarnings } from '../studio/src/index.js';
import {
  readQueue,
  writeQueue,
  publishedTitles,
  buildRows,
  DRAFTS_DIR,
  REVIEW_DIR,
} from './queue.mjs';

const SITE_URL = 'https://qivy.in';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  if (v === undefined || v.startsWith('--')) throw new Error(`${name} needs a value`);
  return v;
};
const count = Number(flag('--count', '1'));
const dryRun = args.includes('--dry-run');
if (!Number.isInteger(count) || count < 1) throw new Error('--count must be a positive integer');

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

const main = async () => {
  const queueFile = await readQueue();
  const { titles, untitled } = await publishedTitles();
  for (const f of untitled) {
    // Not fatal, but worth saying: an article whose title cannot be read is
    // an article the duplicate check is blind to.
    console.log(`  NOTE     no readable title in ${f}; it cannot be deduped against`);
  }
  const rows = buildRows(titles, queueFile.queue);

  console.log(
    `${queueFile.queue.length} topic(s) queued, ${titles.length} published, drafting up to ${count}` +
      `${dryRun ? ' (dry run)' : ''}\n`,
  );

  const written = [];
  const failed = [];

  for (let i = 0; i < count; i += 1) {
    const picked = pickTopic(rows);
    if (!picked.ok) {
      console.log(`  STOP     ${picked.reason}`);
      break;
    }
    const topic = picked.topic.topic;

    try {
      const { content, usedModel } = await callModel({
        apiKey,
        model: DEFAULT_MODEL,
        topic,
        category: picked.topic.category,
        existingTitles: picked.existingTitles,
        siteUrl: SITE_URL,
      });

      const draft = validateDraft(content, {
        category: picked.topic.category,
        topicSimilarity: picked.similarity,
      });

      const checked = await checkSources(draft.sources);
      if (checked.allDead) {
        throw new Error(`every source is dead: ${checked.dead.join('; ')}`);
      }

      const markdown = buildMarkdown(draft, {
        category: picked.topic.category,
        // Today: promote.mjs sets the real date when it publishes, and a
        // future date here would make a draft look scheduled when it is not.
        publishDate: new Date().toISOString().slice(0, 10),
      });

      const hold = holdWarnings(draft.warnings, checked);
      const dir = hold.length ? REVIEW_DIR : DRAFTS_DIR;

      if (!dryRun) {
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, `${draft.slug}.md`), markdown);
      }

      console.log(
        `  ${hold.length ? 'REVIEW ' : 'DRAFTED'}  ${draft.slug}.md  (${draft.words} words, ${
          usedModel || DEFAULT_MODEL
        })`,
      );
      for (const w of draft.warnings) console.log(`           warning: ${w}`);
      for (const w of checked.warnings) console.log(`           warning: ${w}`);

      written.push(draft.slug);
      // Mark it taken in the working copy so the next pick in this run scores
      // against it and cannot choose a near-duplicate of what we just wrote.
      const row = rows.find((r) => r.topic === topic && r.status === 'idea');
      row.status = 'drafted';
      row.title = draft.title;
    } catch (err) {
      console.log(`  FAILED   ${topic}\n           ${err.message}`);
      failed.push({ topic, reason: err.message });
      // Taken either way: retrying a topic that just failed would spend the
      // next slot on the same failure.
      const row = rows.find((r) => r.topic === topic && r.status === 'idea');
      row.status = 'rejected';
    }
  }

  if (!dryRun) {
    // Only topics still marked 'idea' stay queued. Drafted and rejected both
    // leave: a rejected topic can be re-added by hand, which is a decision
    // worth making rather than a loop to fall into.
    const stillQueued = new Set(
      rows.filter((r) => r.status === 'idea').map((r) => r.topic),
    );
    queueFile.queue = queueFile.queue.filter((q) => stillQueued.has(q.topic));
    await writeQueue(queueFile);
  }

  console.log(
    `\n${written.length} drafted, ${failed.length} failed, ${
      rows.filter((r) => r.status === 'idea').length
    } left in the queue.`,
  );

  if (!written.length) {
    console.error('\nNothing was drafted. Failing the run so this is visible.');
    process.exitCode = 1;
  }
};

await main();
