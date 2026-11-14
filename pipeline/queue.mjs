/**
 * The drafting queue, and the list of what has already been written.
 *
 * Its own module so `check.mjs` can test it. The two scripts that use it are
 * entry points -- importing one of those runs it -- so anything worth a test
 * has to live here.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const QUEUE_FILE = path.join(HERE, 'topics.json');
export const DRAFTS_DIR = path.join(HERE, 'drafts');
// Drafts that a person has to read before anyone else does. `promote.mjs`
// never looks in here, which is the whole mechanism: a draft carrying a
// fabricated-experience claim cannot be published by a schedule, only by you.
export const REVIEW_DIR = path.join(HERE, 'needs-review');
export const BLOCKED_DIR = path.join(HERE, 'blocked');
export const PUBLISHED_DIR = path.join(HERE, '..', 'src', 'content', 'articles');

export const CATEGORIES = ['ai', 'automation', 'tips', 'maker'];

export async function readQueue() {
  const parsed = JSON.parse(await readFile(QUEUE_FILE, 'utf8'));
  if (!Array.isArray(parsed.queue)) throw new Error('topics.json has no queue array');
  for (const q of parsed.queue) {
    if (!q || typeof q.topic !== 'string' || !q.topic.trim()) {
      throw new Error(`queue entry with no topic: ${JSON.stringify(q)}`);
    }
    if (!CATEGORIES.includes(q.category)) {
      throw new Error(`queue entry "${q.topic}" has unknown category ${JSON.stringify(q.category)}`);
    }
  }
  return parsed;
}

export async function writeQueue(parsed) {
  await writeFile(QUEUE_FILE, `${JSON.stringify(parsed, null, 2)}\n`);
}

/** Title of one article file, or null when the frontmatter has none. */
export function titleOf(markdown) {
  // buildMarkdown writes `title: '…'` and escapes an apostrophe by doubling
  // it, so that escape has to be undone here or every title containing one
  // would score wrong against a new topic.
  const single = markdown.match(/^title:\s*'(.*)'[ \t]*$/m);
  if (single) return single[1].replace(/''/g, "'");
  const double = markdown.match(/^title:\s*"(.*)"[ \t]*$/m);
  if (double) return double[1];
  const bare = markdown.match(/^title:[ \t]+([^'"\n][^\n]*?)[ \t]*$/m);
  return bare ? bare[1] : null;
}

/**
 * Every published article's title.
 *
 * Read from the files rather than mirrored in topics.json, because a mirror
 * can drift and this cannot. It matters: this list is the whole of what stops
 * the drafter writing an article the site already has.
 */
export async function publishedTitles(dir = PUBLISHED_DIR) {
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const titled = [];
  const untitled = [];
  for (const f of files.sort()) {
    const t = titleOf(await readFile(path.join(dir, f), 'utf8'));
    if (t) titled.push(t);
    else untitled.push(f);
  }
  return { titles: titled, untitled };
}

/** The row shape `pickTopic` wants: published articles to score against, ideas to pick from. */
export function buildRows(titles, queue) {
  return [
    ...titles.map((t) => ({ topic: t, title: t, status: 'published' })),
    ...queue.map((q) => ({ ...q, status: 'idea' })),
  ];
}
