# qivy.in

**Make technology work smarter.** Practical AI, intelligent automation and useful tech tips.

A static site built with [Astro](https://astro.build), deployed to GitHub Pages at [qivy.in](https://qivy.in).

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:4321>.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` — **fails** if any article has invalid frontmatter |
| `npm run preview` | Serve the built site locally |
| `npm run check` | Astro/TypeScript check |
| `npm run check:contrast` | Measure every colour pair against WCAG 2.2 AA, both themes |
| `npm run verify` | Full measured check of `dist/` — links, console errors, responsive overflow, SEO metadata, accessibility |
| `npm run og` | Regenerate `public/og-default.png` |
| `npm run migrate` | One-off: re-extract articles from the legacy `index.html` |

`npm run verify` needs a Chromium download once:

```bash
npx playwright install chromium
```

---

## Project structure

```
src/
├── content/
│   ├── articles/*.md      every article, one file each
│   └── tools.json         the Tools directory
├── content.config.ts      schemas — the editorial quality gate
├── layouts/               BaseLayout, ArticleLayout
├── components/            Nav, Footer, ArticleCard, badges, TOC, …
├── pages/
│   ├── index.astro        homepage
│   ├── [category]/        /ai/, /automation/, /tips/, /maker/ + articles
│   ├── maker/filaments/   filament knowledge base
│   ├── tools/, about, privacy, terms, 404
│   └── rss.xml.ts
├── lib/content.ts         article queries, reading time, URL building
└── styles/                tokens.css, global.css

n8n/                       the daily content pipeline (source of record)
scripts/                   contrast check, site verification, OG image, migration
.github/workflows/         build + deploy to GitHub Pages
```

---

## Writing an article

Create `src/content/articles/<slug>.md`. The filename is the URL slug.

```markdown
---
title: 'A clear, searchable title'
summary: 'One sentence shown on cards and under the article heading.'
category: ai                      # ai | automation | tips | maker
publishDate: 2026-11-07
seoTitle: 'Under 60 characters'
metaDescription: 'Between 50 and 160 characters, written for search results.'
verification: researched          # see below
sources:
  - 'https://official-docs-url'
tags:
  - ollama
  - local-ai
---

Open with the problem in a sentence or two. No preamble.

## A section

Numbered steps where there is a sequence, with real commands.

## Expected result

How the reader knows it worked.
```

The URL becomes `/<category>/<slug>/`.

### Required fields

Every field above is **required** and validated at build time. A missing or
out-of-range field fails `npm run build` and fails CI on the pull request —
deliberately, so a daily pipeline cannot quietly ship a page with no meta
description.

Optional: `updatedDate`, `image` + `imageAlt` (alt is required if image is set),
`subcategory: filaments` (Maker only), `draft: true`, `spotlight: true`.

### `verification` — tested vs researched

| Value | Meaning |
|---|---|
| `tested` | A human actually ran this. **Only a human may set it.** |
| `researched` | Verified against documentation, not personally run. Requires at least one source. The forced default for anything the pipeline drafts. |

This badge is shown to readers. It is what makes a partly-automated daily cadence trustworthy instead of suspicious, and it is why the pipeline can never claim first-hand experience under your name.

### Scheduling

Set `publishDate` in the future. The article is excluded from the build until that date; a daily scheduled build publishes it automatically. No scheduler needed.

Set `draft: true` to exclude an article entirely.

---

## Publishing

Publishing is a git merge. There is no CMS.

1. Add or edit a Markdown file on a branch.
2. Open a pull request — CI runs the build, the contrast check and the full site verification.
3. Merge. The deploy workflow builds and publishes to GitHub Pages.

**Pull requests are the editorial dashboard**: draft, review, edit, approve (merge), reject (close), schedule (future `publishDate`), with notifications and a permanent history — all built in, at no cost.

The [daily content pipeline](./n8n/README.md) drafts articles and opens PRs automatically. It never publishes.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). **One manual step is required before the first deploy**: switch the repository's Pages source to GitHub Actions.

---

## Design

- Dark-first, deep navy with an electric indigo accent; one accent per category.
- Light theme via `prefers-color-scheme` plus a toggle.
- Every colour pair measured against WCAG 2.2 AA — `npm run check:contrast`.
- Zero JavaScript by default. Code highlighting happens at build time; the only client-side scripts are the theme toggle, the mobile menu and copy-code.

Change colours in `src/styles/tokens.css`, then re-run the contrast check.

---

## Documentation

| File | Contents |
|---|---|
| [CURRENT_STATE_ANALYSIS.md](./CURRENT_STATE_ANALYSIS.md) | Audit of the previous site |
| [REDESIGN_PLAN.md](./REDESIGN_PLAN.md) | Architecture and decisions |
| [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) | Positioning, categories, editorial rules |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Phase-by-phase checklist |
| [REDESIGN_COMPLETION_REPORT.md](./REDESIGN_COMPLETION_REPORT.md) | What changed, test results, what remains |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy and rollback |
| [n8n/README.md](./n8n/README.md) | Daily content pipeline |
