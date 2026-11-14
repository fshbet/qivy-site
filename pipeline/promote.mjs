/**
 * Promote finished drafts into the published site, up to a daily cap.
 *
 * This is the gate, and it is deliberately the SAME gate the Studio
 * dashboard uses: `dangerousHtml`, `publishedLinks` and `checkSources` are
 * imported from studio/src/pipeline.js rather than reimplemented here. A
 * second copy of the publishing rules would be free to drift out of step
 * with the first, and the first is the one with 95 tests behind it.
 *
 *   node pipeline/promote.mjs                 promote up to 5
 *   node pipeline/promote.mjs --limit 2       promote up to 2
 *   node pipeline/promote.mjs --dry-run       decide, print, change nothing
 *
 * Exit code is 0 even when a draft is refused: a refusal is the system
 * working, not the run failing. Only an unreadable file or a bad argument is
 * an error. The summary on stdout is the record, and the workflow prints it
 * into the run log.
 */
import { readdir, readFile, writeFile, rename, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { dangerousHtml, publishedLinks, checkSources } from '../studio/src/pipeline.js';
import {
  DRAFTS_DIR as DRAFTS,
  BLOCKED_DIR as BLOCKED,
  PUBLISHED_DIR as PUBLISHED,
} from './queue.mjs';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  if (v === undefined || v.startsWith('--')) throw new Error(`${name} needs a value`);
  return v;
};
const limit = Number(flag('--limit', '5'));
const dryRun = args.includes('--dry-run');
if (!Number.isInteger(limit) || limit < 1) throw new Error(`--limit must be a positive integer`);

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Why this file must not go to the site, or null if it may.
 *
 * Ordered cheapest-first on purpose: the string checks cost nothing, and a
 * draft that fails one of them should not also spend ten seconds of network
 * on link checks it was never going to survive.
 */
async function refusalReason(markdown, slug, alreadyPublished) {
  if (!markdown.trim().startsWith('---')) return 'no --- frontmatter block';
  if (alreadyPublished.has(slug)) {
    // Overwriting a live article with a draft of the same name would be a
    // silent rewrite of something readers may already have seen.
    return `an article named ${slug}.md is already published`;
  }
  const risky = dangerousHtml(markdown);
  if (risky.length) return `${risky.join(' and ')} outside a code fence`;

  const { dead } = await checkSources(publishedLinks(markdown));
  if (dead.length) return `dead link${dead.length > 1 ? 's' : ''}: ${dead.join('; ')}`;
  return null;
}

async function listMarkdown(dir) {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

const main = async () => {
  const drafts = await listMarkdown(DRAFTS);
  const alreadyPublished = new Set(
    (await listMarkdown(PUBLISHED)).map((f) => f.replace(/\.md$/, '')),
  );

  if (!drafts.length) {
    console.log('No drafts waiting. Nothing to promote.');
    return;
  }

  console.log(`${drafts.length} draft(s) waiting, promoting up to ${limit}${dryRun ? ' (dry run)' : ''}\n`);

  let promoted = 0;
  const blocked = [];

  for (const file of drafts) {
    if (promoted >= limit) break;

    const from = path.join(DRAFTS, file);
    const slug = file.replace(/\.md$/, '');
    const markdown = await readFile(from, 'utf8');

    const reason = await refusalReason(markdown, slug, alreadyPublished);
    if (reason) {
      console.log(`  BLOCKED  ${file}\n           ${reason}`);
      blocked.push({ file, reason });
      if (!dryRun) {
        // Out of the way, so tomorrow's run does not spend the same network
        // calls on the same doomed file, and so you can see what needs a
        // human without reading past the healthy ones.
        await mkdir(BLOCKED, { recursive: true });
        await rename(from, path.join(BLOCKED, file));
      }
      continue;
    }

    // Published today, whatever the draft was written on. The site hides
    // future-dated articles, so a stale date here would either publish into
    // the past or not publish at all.
    const dated = markdown.replace(/^publishDate:.*$/m, `publishDate: ${today()}`);
    if (dated === markdown && !/^publishDate:/m.test(markdown)) {
      console.log(`  BLOCKED  ${file}\n           no publishDate line to set`);
      blocked.push({ file, reason: 'no publishDate line' });
      continue;
    }

    console.log(`  PUBLISH  ${file}`);
    if (!dryRun) {
      await writeFile(path.join(PUBLISHED, file), dated);
      await unlink(from);
    }
    promoted += 1;
  }

  const left = drafts.length - promoted - blocked.length;
  console.log(
    `\n${promoted} promoted, ${blocked.length} blocked, ${left} still queued.` +
      (blocked.length ? ` Blocked files are in pipeline/blocked/.` : ''),
  );
};

await main();
