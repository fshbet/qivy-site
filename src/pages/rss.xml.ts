import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedArticles, articlePath, CATEGORY_META } from '../lib/content';

/**
 * RSS feed at /rss.xml.
 *
 * This is the site's only real subscribe mechanism right now — the previous
 * newsletter control was a fake alert() with no backend, and is not carried
 * over (REDESIGN_PLAN.md §6.4). So the feed has to actually work.
 *
 * Includes Maker articles: someone subscribed to the feed asked for
 * everything, unlike the homepage, which is weighted away from the archive.
 */
export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();

  return rss({
    title: 'Qivy — Make Technology Work Smarter',
    description:
      'Practical AI, intelligent automation and useful tech tips that save time and make everyday work easier.',
    site: context.site!,
    trailingSlash: true,
    items: articles.map((a) => ({
      title: a.data.title,
      // @astrojs/rss escapes these fields; the summary is plain text anyway.
      description: a.data.summary,
      pubDate: a.data.publishDate,
      link: articlePath(a),
      categories: [CATEGORY_META[a.data.category].label, ...a.data.tags],
    })),
    customData: '<language>en</language>',
  });
}
