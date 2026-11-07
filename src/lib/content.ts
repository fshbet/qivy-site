import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, CATEGORY_META, type Category } from '../content.config';

export type Article = CollectionEntry<'articles'>;
export { CATEGORIES, CATEGORY_META };
export type { Category };

/**
 * Every article that should be publicly visible, newest first.
 *
 * Two exclusions, both deliberate:
 *   - `draft: true`      — work in progress.
 *   - future publishDate — this is how scheduling works. The daily pipeline
 *     can merge a post-dated article and it simply does not appear until a
 *     build runs on or after that date. No scheduler, no cron, no database.
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const now = Date.now();
  const all = await getCollection('articles', ({ data }) => !data.draft);

  return all
    .filter((a) => a.data.publishDate.getTime() <= now)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

/** Published articles in one category, newest first. */
export async function getArticlesByCategory(
  category: Category,
): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all.filter((a) => a.data.category === category);
}

/**
 * The homepage feed — "Today's Tips".
 *
 * Maker is excluded: it is the archive, and CONTENT_STRATEGY.md §3 puts it at
 * 0% homepage emphasis. It stays reachable from the footer and its own hub.
 */
export async function getFeedArticles(limit?: number): Promise<Article[]> {
  const all = await getPublishedArticles();
  const feed = all.filter((a) => a.data.category !== 'maker');
  return typeof limit === 'number' ? feed.slice(0, limit) : feed;
}

/**
 * The spotlight article for a category: the newest one flagged `spotlight`,
 * falling back to the newest in the category.
 *
 * Returns undefined when the category is empty, and callers must handle that
 * by rendering nothing. CONTENT_STRATEGY.md §6.3: an empty section does not
 * render, and never renders filler.
 */
export async function getSpotlight(
  category: Category,
): Promise<Article | undefined> {
  const inCategory = await getArticlesByCategory(category);
  return inCategory.find((a) => a.data.spotlight) ?? inCategory[0];
}

/**
 * Related articles: same category first, then anything sharing a tag.
 * Build-time computation over a small set — no recommendation engine.
 */
export async function getRelated(
  current: Article,
  limit = 3,
): Promise<Article[]> {
  const all = await getPublishedArticles();
  const others = all.filter((a) => a.id !== current.id);
  const tags = new Set(current.data.tags);

  const scored = others.map((a) => {
    const shared = a.data.tags.filter((t) => tags.has(t)).length;
    const sameCategory = a.data.category === current.data.category ? 2 : 0;
    return { article: a, score: shared + sameCategory };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.article.data.publishDate.getTime() -
          a.article.data.publishDate.getTime(),
    )
    .slice(0, limit)
    .map((s) => s.article);
}

/**
 * Previous / next within the same category, by publish date.
 * `prev` is older, `next` is newer — the direction readers expect.
 */
export async function getPrevNext(current: Article): Promise<{
  prev?: Article;
  next?: Article;
}> {
  const inCategory = await getArticlesByCategory(current.data.category);
  const i = inCategory.findIndex((a) => a.id === current.id);
  if (i === -1) return {};
  return { next: inCategory[i - 1], prev: inCategory[i + 1] };
}

/** Reading time in whole minutes, floored at 1. ~220 wpm. */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Word count, used to decide whether an article gets a table of contents. */
export function wordCount(body: string | undefined): number {
  return body ? body.trim().split(/\s+/).length : 0;
}

/** e.g. "7 November 2026" — unambiguous, no US/UK date confusion. */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** ISO date for <time datetime> and structured data. */
export function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * Canonical path for an article. The single place URLs are constructed, so
 * sitemap, RSS, structured data, cards and links can never disagree.
 */
export function articlePath(article: Article): string {
  const { category, subcategory } = article.data;
  return subcategory
    ? `/${category}/${subcategory}/${article.id}/`
    : `/${category}/${article.id}/`;
}

/** Accent colour variable for a category. */
export function categoryAccent(category: Category): string {
  return CATEGORY_META[category].accent;
}
