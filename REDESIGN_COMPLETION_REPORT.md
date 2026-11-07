# Qivy — Redesign Completion Report

**Date:** 2026-11-07
**Branch:** `redesign-ai-first` (not merged, not deployed)
**Live site:** unchanged — still serving the previous single-file `index.html`

Checks marked ✅ were **run**, with the command and result recorded. Anything not run is marked **not verified** and listed in §8. No check is reported as passing on the basis of inspection alone.

---

## 1. Summary

Qivy has gone from **one 338 KB HTML file holding 29 screens at a single URL** to a static Astro site with **36 pages, 25 individual article URLs, full SEO metadata, a feed, a sitemap, and zero accessibility violations in both light and dark themes**.

The AI-first repositioning is in place, the 3D printing content is preserved in full under a Maker archive, and a daily content pipeline exists in n8n that drafts articles and opens pull requests for review — it cannot publish on its own.

The single biggest change is not visual: **24 articles that search engines could not index now have their own addresses.**

---

## 2. What changed

### 2.1 Architecture

| | Before | After |
|---|---|---|
| Build | None — hand-edited HTML uploaded via the GitHub web UI | Astro 7.4.7, static output |
| Articles | 29 `<div class="page">` toggled by a JS class switch | 25 Markdown files with build-validated frontmatter |
| URLs | **All 29 screens at `https://qivy.in/`** | `/ai/<slug>/`, `/automation/<slug>/`, `/tips/<slug>/`, `/maker/<slug>/`, `/maker/filaments/<slug>/` |
| Payload | 343 KB on every visit, all articles always | Homepage 40 KB, article 33 KB, 23 KB shared CSS |
| JavaScript | Inline router + Lucide from an unpinned CDN | **0 JS files shipped**; three small inline scripts (theme, menu, copy-code) |
| CI | None | Build + contrast + full site verification on every PR |
| Dependencies | None (no `package.json`) | Pinned, lockfile committed, **0 vulnerabilities** |

### 2.2 Brand and design

- Repositioned to **"Make Technology Work Smarter."** — AI | Automation | Smarter Technology.
- Palette rotated from coral `#E8795B` to deep navy `#0B0F1A` with **electric indigo `#8B9BFF`**. One accent per category: AI indigo, Automation violet, Tips teal, Maker coral (a deliberate nod to the previous brand, so the archive still feels like where it came from).
- Kept Inter + JetBrains Mono; the old token structure was sound and carried over.
- Light theme added on the same tokens, with a toggle and no flash of the wrong theme.
- Lucide replaced by inlined SVGs — the unpinned `lucide@latest` CDN dependency is gone.

### 2.3 Navigation and pages

`Home · AI · Automation · Tips & Tricks · Tools · About`, flat, no dropdowns. Maker in the footer.

New pages: homepage, 4 category hubs, filament KB hub, Tools directory, About, Privacy, Terms, 404, plus 25 article pages.

Homepage sections as briefed: Hero · Core categories · Today's Tips · AI Spotlight · Automation Spotlight · Useful Tools · Follow · Footer. Sections with no content **do not render** — there are no placeholder cards.

### 2.4 Article experience

Breadcrumbs, category badge, verification badge, title, summary, publish/updated dates, reading time, optional hero image, table of contents (600+ words), build-time syntax highlighting, copy-code with accessible status announcements, a Sources block, share links, prev/next, related articles.

### 2.5 SEO — from nothing to complete

The old site had exactly two meta tags (`charset`, `viewport`).

Now on every page: unique title, unique meta description, absolute canonical, Open Graph, Twitter/X cards, `Article` + `BreadcrumbList` JSON-LD, `sitemap-index.xml`, `robots.txt`, `rss.xml`, a generated 1200×630 PNG social image, image alt text, semantic headings.

### 2.6 Content

All 24 legacy articles migrated, plus one new seed AI article. Reclassified:

| Destination | Count | From |
|---|---|---|
| Maker archive | 5 | 3D printing reviews, builds, guides |
| Maker → filaments KB | 11 | The filament knowledge base |
| Automation | 4 | n8n and Python workflow articles |
| Tips & Tricks | 4 | Power BI, Sheets, Pandas, Looker Studio |
| AI | 1 | New — Ollama local models |

### 2.7 Daily content pipeline

Created in n8n at `n8n.qivy.in`: **[Qivy — Daily Content Pipeline](https://n8n.qivy.in/workflow/rzIuwCIMlbw1qiGm)** (16 nodes, validated), with the `Qivy Content Ledger` data table seeded with 43 rows (25 published articles + 18 queued topics).

It drafts an article daily and **opens a pull request**. It has no publish step.

---

## 3. What was preserved

- **Every 3D printing article.** Nothing deleted, nothing noindexed, nothing thinned. The 11-page filament knowledge base keeps its own hub at `/maker/filaments/`.
- **The legacy `index.html`**, untouched in the repository — the rollback path.
- **GitHub Pages hosting, the `qivy.in` domain, `CNAME`, DNS and HTTPS.** No new infrastructure, no new recurring cost.
- **The design token structure** and the dark-first direction.
- **The three-pillar model**, re-weighted rather than replaced.
- **`E:\AI\GITHUB\Website`** — your local folder was not modified. Work happened in a fresh clone at `E:\AI\GITHUB\qivy-site`.
- **Existing n8n workflows.** `SMP-1 Ingest and Describe` and `DataViz Enterprise BI — Workflow v4` were not touched.

---

## 4. What was removed

| Removed | Why |
|---|---|
| **The fake newsletter control** | It was `onclick="alert('Subscribed!')"` with no `<form>` and no backend anywhere in the file — it took an address, discarded it, and told the visitor they had subscribed. Replaced by a real RSS link per your decision. |
| **False stack claims on the About/Tools pages** | The site stated "Ghost CMS — Powers qivy.in", that automation "runs on n8n", and that it used Plausible Analytics. None were implemented. The About page now describes what the site actually is. |
| **The client-side router** | Replaced by real URLs. |
| **`lucide@latest` CDN script** | Unpinned third-party script; icons are now inlined. |
| **`/Tools/*.zip` from the published site** | Two Sisense packs unrelated to Qivy. **Still in the repository** — only unpublished, because `/Tools/` collided with the new `/tools/` route on case-insensitive filesystems. See §7.1. |

---

## 5. New features

- Real per-article URLs, sitemap, RSS feed, structured data.
- **Verification badges** — `Tested` (a human ran it) vs `Researched` (verified against cited documentation). Shown to readers; this is what makes a partly-automated cadence honest.
- **Build-time editorial enforcement** — a missing `metaDescription`, an out-of-range `seoTitle`, an image without alt text, or `researched` with no sources **fails the build**.
- **Scheduling with no scheduler** — a future `publishDate` is excluded until a daily build picks it up.
- Light/dark theming, table of contents, copy-code, related articles, prev/next.
- **Three runnable checks kept in the repo**: `check:contrast`, `verify`, and the migration script's own word-count comparison.
- CI that blocks a deploy on build, contrast or verification failure.

---

## 6. Testing — measured results

All run on 2026-11-07 against the production build.

### 6.1 Build ✅

```
npm run build  →  36 pages built in 1.55s, exit 0, no warnings
npm run check  →  0 errors, 0 warnings, 39 hints
npm audit      →  0 vulnerabilities
```

The 39 hints are deprecation notices for Astro's `z` content-schema helper in Astro 7 — informational, not failures. Worth migrating to the newer schema API at some point; it changes nothing today.

### 6.2 Site verification ✅

`node scripts/verify-site.mjs` — serves `dist/` and drives real Chromium:

```
pages checked        36
internal links       550  (all resolved — no 404s)
widths tested        320, 375, 414, 768, 1024, 1440
a11y violations      0
failures             0
```

Covering, per page:

| Check | Result |
|---|---|
| HTTP status | ✅ all 200 |
| Console + page errors | ✅ none |
| Unique `<title>` and meta description | ✅ no duplicates across indexable pages |
| Canonical, og:title, og:image, twitter:card | ✅ present on all 36 |
| JSON-LD parses | ✅ |
| Exactly one `h1`, no skipped heading levels | ✅ |
| Images have `alt` | ✅ |
| `target="_blank"` has `rel="noopener"` | ✅ |
| Horizontal overflow at 6 widths | ✅ none |
| `alert('Subscribed')` anywhere | ✅ absent |

Two real defects were found and fixed during this: heading levels skipping `h1 → h3` on category hubs and `h2 → h4` in two migrated articles.

### 6.3 Accessibility ✅

axe-core (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) on all 36 pages in **both themes** — 72 runs, **0 violations**.

Each theme is checked on its own page load. An earlier version toggled the theme in place and injected axe twice, which produced false positives; that was a bug in the test, not the site, and is fixed.

### 6.4 Colour contrast ✅

`npm run check:contrast` — 32 measured pairs, all ≥ WCAG 2.2 AA:

| Sample | Ratio | Needs |
|---|---|---|
| Body text on background (dark) | 17.38 | 4.5 |
| Muted text on background (dark) | 6.21 | 4.5 |
| AI accent on background (dark) | 7.50 | 4.5 |
| Maker badge on tint (light) | 4.75 | 4.5 |
| Tips badge on tint (light) | 4.76 | 4.5 |

axe caught a gap my own first check had missed: badges render accent text on an accent **tint**, not on the page background. Two light-theme accents measured 4.31 and 4.07 and were darkened. The contrast script now composites translucent backgrounds so it cannot miss this again.

### 6.5 Content migration ✅

`node scripts/migrate-content.mjs` compares source word count against output for every article:

```
planned: 24   written: 24   flagged: 0
```

Largest drift −5%, and every drift is **positive** (slightly more words out than in, from Markdown table pipes). No article lost content. Tables became Markdown tables; the hand-built SVG diagrams were preserved verbatim with their existing aria-labels.

### 6.6 Performance — partially measured

| Measured | Result |
|---|---|
| Old payload | 343,321 bytes, every visit |
| New homepage | 40,791 bytes |
| New article | 33,017 bytes |
| Shared CSS | 23,525 bytes |
| JS files shipped | **0** |

An article page is roughly **1/10th** the old payload, and a reader downloads one article instead of all 24.

**Not verified:** Lighthouse scores and Core Web Vitals (LCP, CLS, INP) — see §8.

---

## 7. Remaining issues and decisions

### 7.1 Needs your decision

1. **Pages source must be switched to GitHub Actions** before anything deploys. Until then the old `index.html` keeps serving. This is a production change and deliberately left to you — see [DEPLOYMENT.md](./DEPLOYMENT.md).
2. **The GitHub credential for the pipeline.** No GitHub credential exists in n8n; the four GitHub-facing nodes have an empty placeholder. The workflow cannot run until you add a token with `repo` scope.
3. **The notification recipient** in `Notify admin` is `CHANGE_ME@example.com`. Left as a placeholder rather than guessing — publishing your personal address was not mine to decide.
4. **Contact details.** About, Privacy and Terms point at `github.com/fshbet`. If you want an email published, say which.
5. **`/Tools/*.zip`** are no longer served (§4). If they need to stay downloadable, they can be republished under `/downloads/`.
6. **Analytics** — none installed, so nothing about readership is measurable yet. Plausible is paid; Cloudflare Web Analytics is free. Your call.
7. **Newsletter provider** — the honest RSS link is in place. Naming a provider turns it into a real form.

### 7.2 Known gaps

- **The AI pillar has one article.** Target emphasis is ~50% of the homepage. The ledger holds 8 queued AI topics; at one article a day the pillar fills over about two weeks. Until then the homepage leans on Automation and Tips. This is the expected cold start, not a defect — but the site will not *look* AI-first on day one.
- **No article images.** Cards and article pages fall back to category-tinted placeholders. Thumbnail generation is wired but disabled to avoid a paid image call per run.
- **Migrated article dates are month-precision.** The originals stated only a month ("Updated May 2026"), so the 1st of that month is used. Inventing exact days would have breached the no-fabrication rule.
- **Astro `z` schema deprecation** (§6.1) — worth migrating eventually.
- **The legacy `index.html` is still in the repo root.** Intentional, as the rollback path. It is not served once Pages switches to Actions.

---

## 8. Not verified

Stated plainly rather than assumed:

| Not run | Why | How to close it |
|---|---|---|
| **Lighthouse / Core Web Vitals** | Needs a throttled run against the deployed site to mean anything | Run Lighthouse on `qivy.in` after deploy |
| **Real Android and iPhone devices** | Only emulated viewports at 6 widths were tested; no physical device | Open the site on a real phone after deploy |
| **Screen-reader pass** | axe catches programmatic failures, not whether the experience makes sense aloud | One pass with NVDA or VoiceOver on the homepage and an article |
| **The pipeline end to end** | Blocked on the GitHub credential (§7.1) | Run it manually once the credential exists; confirm the draft PR has no fabricated experience or invented pricing |
| **The deployed site** | Nothing has been deployed | The post-deploy checklist in DEPLOYMENT.md |
| **Social card rendering** | Tags are present and correct; not submitted to the X/LinkedIn validators | Validate after deploy, when the URL is public |
| **Search Console** | Site not yet submitted | Submit the sitemap after deploy |

---

## 9. Corrections to the brief's premises

Found during the audit and documented in [CURRENT_STATE_ANALYSIS.md](./CURRENT_STATE_ANALYSIS.md):

| The brief assumed | Reality |
|---|---|
| Ghost CMS powers the site | No Ghost anywhere; `qivy.in/ghost/` → 404. The claim was marketing copy in a "tools I use" card. |
| n8n publishing workflows exist to reuse | No content workflow existed. The instance held two unrelated workflows. |
| A newsletter integration exists to reuse | An `alert()`. No form, no backend. |
| Article URLs and SEO value to preserve | No article URL ever existed. Nothing to redirect; no ranking could regress. |
| Cloudflare config to preserve | Not in the request path — DNS points straight at GitHub Pages. |

One ambiguity resolved itself: the n8n instance reachable over MCP **is** `n8n.qivy.in`, so the two candidates in decision #2 were the same instance.

---

## 10. Deployment requirements

1. Switch **Settings → Pages → Source** to **GitHub Actions**. *(Required — nothing deploys until this is done.)*
2. Merge `redesign-ai-first` into `main`.
3. Confirm `dist/CNAME` is present in the build output — it is, via `public/CNAME`.
4. Run the post-deploy checks in [DEPLOYMENT.md](./DEPLOYMENT.md).
5. Submit `https://qivy.in/sitemap-index.xml` to Google Search Console.
6. For the pipeline: add the GitHub credential, set the notification address, dry-run once, then activate.

Rollback is `git revert` of the merge commit, plus setting Pages back to branch-based if needed. The old site returns exactly as it was.
