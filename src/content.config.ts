import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * Content schemas for qivy.in.
 *
 * These are not documentation — they are the enforcement point for the
 * editorial rules in CONTENT_STRATEGY.md §4.4. A required field that is
 * missing, or an SEO field that is the wrong length, FAILS THE BUILD.
 * That is deliberate: a daily automated pipeline needs a gate that cannot
 * be forgotten, and CI on the pull request is where it should fire.
 */

export const CATEGORIES = ['ai', 'automation', 'tips', 'maker'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Display metadata per category. Single source of truth for labels + accent. */
export const CATEGORY_META: Record<
  Category,
  { label: string; slug: string; accent: string; blurb: string }
> = {
  ai: {
    label: 'AI',
    slug: 'ai',
    accent: 'var(--accent)',
    blurb:
      'Practical AI tools, assistants, prompting and local models — things you can use today.',
  },
  automation: {
    label: 'Automation',
    slug: 'automation',
    accent: 'var(--accent-2)',
    blurb:
      'n8n workflows, Python scripts, API integrations and self-hosted automation that removes repetitive work.',
  },
  tips: {
    label: 'Tips & Tricks',
    slug: 'tips',
    accent: 'var(--accent-3)',
    blurb:
      'Short, practical fixes for Windows, browsers, editors and the everyday software you already use.',
  },
  maker: {
    label: 'Maker',
    slug: 'maker',
    accent: 'var(--accent-4)',
    blurb:
      "Qivy's earlier focus — 3D printing, filament reference and build notes. Kept because it's still useful.",
  },
};

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z
    .object({
      /** Reader-facing headline. */
      title: z.string().min(10).max(120),

      /** One-line description used on cards and as the article summary. */
      summary: z.string().min(20).max(300),

      category: z.enum(CATEGORIES),

      /**
       * Optional second level, currently only used for the filament
       * knowledge base at /maker/filaments/.
       */
      subcategory: z.literal('filaments').optional(),

      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      /** <title> text. Kept under 60 chars so search results don't truncate. */
      seoTitle: z.string().min(10).max(60),

      /** Meta description. 50-160 chars is the usable range. */
      metaDescription: z.string().min(50).max(160),

      /**
       * CONTENT_STRATEGY.md §4.4 rule 7-8.
       *
       * 'tested'     — a human actually ran this. ONLY a human may set it.
       * 'researched' — verified against documentation, not personally run.
       *                This is the forced default for all generated content.
       *
       * The daily pipeline must never emit 'tested'. An article claiming
       * personal experience that nobody had is a fabrication published under
       * the owner's byline, which is the single highest-risk failure mode in
       * the whole publishing model.
       */
      verification: z.enum(['tested', 'researched']),

      /** Sources consulted. Required for 'researched' — see refine below. */
      sources: z.array(z.string().url()).default([]),

      tags: z.array(z.string().min(2)).min(1).max(8),

      /** Optional hero image, relative to /public or a remote URL. */
      image: z.string().optional(),
      imageAlt: z.string().min(5).optional(),

      /** Hide from the build without deleting the file. */
      draft: z.boolean().default(false),

      /** Feature in the homepage AI / Automation spotlight slot. */
      spotlight: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      // An image with no alt text is an accessibility defect, so the build
      // refuses it rather than shipping it.
      if (data.image && !data.imageAlt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['imageAlt'],
          message: 'imageAlt is required whenever image is set.',
        });
      }

      // 'researched' means "verified against documentation". Without at least
      // one source that claim is unverifiable, which defeats the point.
      if (data.verification === 'researched' && data.sources.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sources'],
          message:
            "verification: 'researched' requires at least one source URL. " +
            'If this was personally tested by a human, set verification to ' +
            "'tested' instead.",
        });
      }

      // Only /maker/ has a subcategory level today.
      if (data.subcategory && data.category !== 'maker') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['subcategory'],
          message: "subcategory is only valid on category 'maker'.",
        });
      }

      if (data.updatedDate && data.updatedDate < data.publishDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['updatedDate'],
          message: 'updatedDate cannot be earlier than publishDate.',
        });
      }
    }),
});

/**
 * Tools directory — a reference list, not an article stream.
 *
 * CONTENT_STRATEGY.md §3.4: no fabricated pricing or capabilities. `pricing`
 * is deliberately a free-text label paired with a REQUIRED `pricingCheckedOn`
 * date, so a stale price is visible as stale rather than quietly wrong. If a
 * price was not confirmed on the vendor's own page, the honest value is
 * 'Check current pricing' and the reader follows the link.
 */
const tools = defineCollection({
  loader: file('./src/content/tools.json'),
  schema: z.object({
    id: z.string(),
    name: z.string().min(2),
    description: z.string().min(20).max(300),
    useCase: z.string().min(10).max(200),
    pricing: z.string().min(2).max(100),
    pricingCheckedOn: z.coerce.date(),
    url: z.string().url(),
    category: z.enum(CATEGORIES),
    featured: z.boolean().default(false),
  }),
});

export const collections = { articles, tools };
