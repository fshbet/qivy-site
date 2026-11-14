/**
 * Turn what Claude wrote into validated drafts.
 *
 * Claude runs in the workflow step before this one and writes one JSON file
 * per article into pipeline/inbox/. This script puts each one through
 * `validateDraft` and `checkSources` -- the identical functions the
 * OpenRouter path and the Cloudflare dashboard use -- and only then writes a
 * draft. So "Claude wrote it" buys no exemption from the editorial rules:
 * the length limits, the first-person check, the unfenced-tag check and the
 * dead-source check all still apply, and they are the versions with 95 tests
 * behind them.
 *
 *   node pipeline/ingest.mjs
 *   node pipeline/ingest.mjs --dry-run
 *
 * Each inbox file must be the JSON object SYSTEM_PROMPT describes, plus one
 * extra key, `topic`, naming the queue entry it was written for -- that is
 * how the queue knows what to drop.
 *
 * Exit code is 0 when at least one article survived, 1 when the inbox was
 * empty or nothing in it was usable. The workflow reads that to decide
 * whether to fall back to OpenRouter.
 */
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDraft, checkSources, buildMarkdown } from '../studio/src/pipeline.js';
// The same rule the Cloudflare dashboard uses to decide whether a draft may
// publish unattended. Imported rather than restated: two definitions of
// "needs a human" would eventually disagree, and the disagreement would show
// up as a fabricated claim on the live site.
import { holdWarnings } from '../studio/src/index.js';
import {
  readQueue,
  writeQueue,
  DRAFTS_DIR,
  REVIEW_DIR,
  PUBLISHED_DIR,
  CATEGORIES,
} from './queue.mjs';

const INBOX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'inbox');
const dryRun = process.argv.includes('--dry-run');

const main = async () => {
  let files = [];
  try {
    files = (await readdir(INBOX)).filter((f) => f.endsWith('.json')).sort();
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  if (!files.length) {
    console.error('Nothing in pipeline/inbox/. Claude wrote no articles.');
    process.exitCode = 1;
    return;
  }

  const queueFile = await readQueue();
  const queued = new Map(queueFile.queue.map((q) => [q.topic, q.category]));
  // promote.mjs refuses a slug that is already published -- rightly, since
  // committing it would rewrite a page readers have seen. But it refuses
  // AFTER this script has dropped the topic from the queue, so the topic was
  // spent on an article nobody would ever read. Catching the collision here
  // leaves the topic queued for a different angle tomorrow.
  const publishedSlugs = new Set(
    (await readdir(PUBLISHED_DIR).catch(() => []))
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, '')),
  );
  console.log(`${files.length} file(s) in the inbox${dryRun ? ' (dry run)' : ''}\n`);

  const done = [];
  const rejected = [];
  const seenSlugs = new Map();

  for (const file of files) {
    const where = path.join(INBOX, file);
    try {
      const raw = JSON.parse(await readFile(where, 'utf8'));

      // The topic has to be one we actually asked for. Without this, a
      // hallucinated topic would be drafted and the queue would never shrink,
      // so the same slot would be rewritten every single day.
      if (typeof raw.topic !== 'string' || !queued.has(raw.topic)) {
        throw new Error(
          `"topic" is not a queued topic: ${JSON.stringify(raw.topic)}`,
        );
      }
      const category = queued.get(raw.topic);
      if (!CATEGORIES.includes(category)) throw new Error(`unknown category ${category}`);

      // validateDraft wants the raw model output, so it is handed the same
      // JSON shape it would get from OpenRouter. `topic` is not part of that
      // shape and is dropped here rather than being allowed to confuse it.
      const { topic, ...article } = raw;
      const draft = validateDraft(JSON.stringify(article), {
        category,
        // Claude picked the topic against the published titles itself, so
        // there is no pickTopic score to pass on. 0 means "nothing measured",
        // not "measured and clean": check.mjs covers the queue-vs-queue case
        // and validateDraft still warns on anything it can see in the text.
        topicSimilarity: 0,
      });

      if (publishedSlugs.has(draft.slug)) {
        throw new Error(`${draft.slug}.md is already published; leaving the topic queued`);
      }
      // Two inbox files can land on one slug, and the second would overwrite
      // the first in drafts/ -- two topics spent, one article.
      if (seenSlugs.has(draft.slug)) {
        throw new Error(`${draft.slug}.md was already written by ${seenSlugs.get(draft.slug)}`);
      }

      const checked = await checkSources(draft.sources);
      if (checked.allDead) throw new Error(`every source is dead: ${checked.dead.join('; ')}`);

      const markdown = buildMarkdown(draft, {
        category,
        // promote.mjs sets the real publish date. Today here keeps a draft
        // from looking scheduled when it is only waiting.
        publishDate: new Date().toISOString().slice(0, 10),
      });

      // A warning sends the draft to needs-review/, which promote.mjs does
      // not read. A redirect note or one unverified source does not: those
      // are notes, not judgements. Same split as auto-approve on the
      // dashboard, because it is literally the same function.
      const hold = holdWarnings(draft.warnings, checked);
      const dir = hold.length ? REVIEW_DIR : DRAFTS_DIR;

      if (!dryRun) {
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, `${draft.slug}.md`), markdown);
        await unlink(where);
      }

      console.log(
        `  ${hold.length ? 'REVIEW ' : 'DRAFTED'}  ${draft.slug}.md  (${draft.words} words)  <- ${topic}`,
      );
      for (const w of [...draft.warnings, ...checked.warnings]) {
        console.log(`           warning: ${w}`);
      }
      if (hold.length) console.log(`           held in pipeline/needs-review/ for you to read`);
      seenSlugs.set(draft.slug, file);
      done.push(topic);
    } catch (err) {
      // Left in the inbox on purpose: a rejected file is evidence, and the
      // run log alone is gone in a week.
      console.log(`  REJECT   ${file}\n           ${err.message.split('\n')[0]}`);
      rejected.push(file);
    }
  }

  if (!dryRun && done.length) {
    const used = new Set(done);
    queueFile.queue = queueFile.queue.filter((q) => !used.has(q.topic));
    await writeQueue(queueFile);
  }

  console.log(
    `\n${done.length} drafted, ${rejected.length} rejected, ${queueFile.queue.length} left in the queue.`,
  );

  if (!done.length) {
    console.error('Nothing in the inbox was usable.');
    process.exitCode = 1;
  }
};

await main();
