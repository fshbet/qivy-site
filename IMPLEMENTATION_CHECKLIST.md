# Qivy — Implementation Checklist

**Date:** 2026-11-07
**Status:** Phases 1–8 implemented on branch `redesign-ai-first`. Not merged, not deployed.
**Depends on:** `CURRENT_STATE_ANALYSIS.md`, `REDESIGN_PLAN.md`, `CONTENT_STRATEGY.md`

> **Measured results, what remains, and what was deliberately not verified are
> in [REDESIGN_COMPLETION_REPORT.md](./REDESIGN_COMPLETION_REPORT.md).** That
> report supersedes the tick-boxes below, which are kept as the original plan
> of record.
>
> Summary of the verification run: build 36 pages exit 0 · `astro check` 0
> errors · `npm audit` 0 vulnerabilities · 550 internal links all resolve · no
> horizontal overflow at 6 widths · **0 accessibility violations across both
> themes** · 32 colour pairs all ≥ WCAG 2.2 AA · 24/24 articles migrated with
> no content loss.
>
> Still open: Pages source must be switched to GitHub Actions before anything
> deploys; the pipeline needs a GitHub credential and a notification address;
> Lighthouse, real-device and screen-reader passes are **not verified**.

Legend: `[x]` done · `[ ]` not started · `[!]` blocked on a decision · `[?]` not verified

Assumes **Option A** (Astro + Markdown + GitHub Pages) from `REDESIGN_PLAN.md` §3. If Ghost exists, Phases 3–6 are replaced by Ghost theme work and this checklist is reissued.

---

## Phase 1 — Analysis ✅

- [x] Locate the real repository (`fshbet/qivy-site`; the local `Website` folder is unrelated)
- [x] Clone production to `E:\AI\GITHUB\qivy-site`, leaving local files untouched
- [x] Enumerate the repository tree (5 files)
- [x] Confirm framework, build, CI, dependencies — **none exist**
- [x] Confirm live page is byte-identical to the repo file
- [x] Inspect hosting: GitHub Pages, `main`/root, HTTPS enforced
- [x] Check DNS and Cloudflare — **no Cloudflare in the request path**
- [x] Map the client-side router — **no URLs; all 29 screens at `/`**
- [x] Inventory all 29 screens by pillar
- [x] Extract design tokens, fonts, icon dependency
- [x] Audit SEO — **2 meta tags; no sitemap, robots, canonical, OG, or structured data**
- [x] Verify the Ghost claim — **does not exist**
- [x] Verify the n8n claim — **no publishing workflow; 2 unrelated workflows**
- [x] Verify the newsletter — **`alert()`, no form, no backend**
- [x] Verify analytics — **not installed**
- [x] Identify broken/duplicate/outdated items (zips in web root, unpinned CDN, no 404)
- [x] Write the four Phase 1 documents
- [?] Browser console errors — not run
- [?] Lighthouse / Core Web Vitals baseline — not run
- [?] Real-device checks (Android, iPhone) — not run
- [?] Accessibility baseline (contrast, focus, screen reader) — not run

The four `[?]` items need a browser and devices. They are deliberately unmeasured rather than assumed, and are scheduled in Phase 8.

---

## Phase 2 — Approval ⏸

- [ ] You review the four documents
- [!] **Decision: does a Ghost instance exist?** — blocks everything
- [!] **Decision: which n8n instance hosts the pipeline?** — blocks Phase 7
- [ ] Decision: newsletter provider, or remove the control
- [ ] Decision: who writes the seed AI articles
- [ ] Decision: analytics (Plausible / Cloudflare / none)
- [ ] Decision: migrated article dates (git dates / month-only)
- [ ] Decision: remove `Tools/*.zip` from the web root
- [ ] Decision: local consultancy page — reuse or abandon
- [ ] Explicit approval to begin implementation

---

## Phase 3 — Foundation

- [ ] `npm init`, install Astro, commit the lockfile
- [ ] Pin every dependency; no `latest` ranges
- [ ] `.gitignore` (`node_modules`, `dist`, `.env`)
- [ ] `.env.example` with safe placeholder values only
- [ ] Astro config: `site: 'https://qivy.in'`, static output
- [ ] Working branch — **not `main`**
- [ ] Content collection schemas with **required** fields: `title`, `slug`, `category`, `summary`, `publishDate`, `seoTitle`, `metaDescription`, `verification`, `tags`, `image`, `imageAlt`
- [ ] Confirm a missing required field **fails the build**
- [ ] Design tokens as CSS custom properties (`REDESIGN_PLAN.md` §5.1)
- [ ] **Measure every text/background pair against WCAG 2.2 AA** — record the numbers
- [ ] Adjust any pair that fails (expect `--text-3`)
- [ ] Self-host Inter + JetBrains Mono subsets, or `font-display: swap`
- [ ] Pin Lucide; import only icons used; remove the `@latest` CDN script
- [ ] `BaseLayout` — head metadata, skip link, landmarks
- [ ] Components: `Nav`, `Footer`, `ArticleCard`, `CategoryBadge`, `VerificationBadge`, `Newsletter`, `TOC`, `Breadcrumbs`
- [ ] Keyboard navigation and visible focus on every interactive element
- [ ] `prefers-reduced-motion` respected
- [ ] 404 page
- [ ] `npm run build` passes clean

## Phase 4 — Homepage, navigation, categories

- [ ] Nav: Home · AI · Automation · Tips & Tricks · Tools · About — no dropdowns
- [ ] Mobile nav: opens, closes, traps focus, closes on Escape
- [ ] Maker link in the footer
- [ ] Hero — "Make Technology Work Smarter." + both CTAs; visual reads AI/automation, **not 3D printing**
- [ ] Core categories section with subtopics
- [ ] Today's Tips — cards with image, category, title, one-liner, reading time, date, link
- [ ] AI Spotlight
- [ ] Automation Spotlight
- [ ] Useful Tools — **no fabricated pricing**; unverified prices link out instead
- [ ] Newsletter section per the Phase 2 decision
- [ ] Footer — About, 4 categories, Maker, Contact, Privacy, Terms, social
- [ ] **Empty sections do not render** — no placeholder or filler cards
- [ ] Category hub pages ×4
- [ ] Maker hub + filament KB hub
- [ ] Homepage emphasis ≈ 50/30/15/5 by real estate
- [ ] No horizontal scroll at 320, 375, 414, 768, 1024, 1440 px
- [ ] No layout shift from unsized images

## Phase 5 — Article experience and SEO

- [ ] Article layout with all elements from `REDESIGN_PLAN.md` §6
- [ ] Breadcrumbs + `BreadcrumbList` JSON-LD
- [ ] Verification badge rendered (`Tested` / `Researched`)
- [ ] Reading time computed at build
- [ ] TOC above a word threshold, from headings
- [ ] Shiki syntax highlighting at build time
- [ ] Copy-code button — works, and announces success accessibly
- [ ] Related articles by category + tags, computed at build
- [ ] Prev/next navigation
- [ ] Share links (no third-party tracking scripts)
- [ ] One `h1` per page; no heading-level skips
- [ ] Unique `title` + `meta description` per page
- [ ] Absolute canonical per page
- [ ] Open Graph + Twitter/X cards; per-article OG image
- [ ] `Article` JSON-LD
- [ ] `@astrojs/sitemap` → `/sitemap-index.xml`
- [ ] `robots.txt` referencing the sitemap
- [ ] `@astrojs/rss` → `/rss.xml`; validate the feed parses
- [ ] `alt` on every content image; `aria-hidden` on decorative SVGs
- [ ] Lazy-load below-the-fold images; width/height on all
- [ ] Analytics installed per the Phase 2 decision

## Phase 6 — Content migration

**Nothing is deleted.**

- [ ] Extract all 24 articles from `index.html` into Markdown with full frontmatter
- [ ] Verify no article body is lost or truncated in extraction
- [ ] Maker: `bambu-review`, `cable-rack`, `starter-guide`, `filament-compare`, `slicer-settings`
- [ ] Maker: 11 filament pages → `/maker/filaments/`
- [ ] Automation: `n8n-start`, `linkedin-auto`, `rss-newsletter`, `printer-alerts`
- [ ] Tips: `sheets-dashboard`, `python-pandas`
- [ ] Tools: `powerbi-intro`, `looker-studio`
- [ ] Rebuild Tools page to the directory schema
- [ ] Rewrite About for the new positioning — **remove the false Ghost/n8n/Plausible claims**
- [ ] Maker archive note: "Qivy's earlier focus. Kept because it's still useful."
- [ ] Existing first-person articles marked `verification: tested` (you wrote them)
- [ ] Dates applied per the Phase 2 decision; **record which method was used**
- [ ] 2–4 internal links per migrated article
- [ ] Every migrated article has a working URL
- [ ] Maker reachable from the footer but **absent from the homepage**
- [ ] Confirm no article was noindexed or thinned
- [ ] Seed AI articles added per the Phase 2 decision

## Phase 7 — Daily pipeline

- [ ] Confirm target n8n instance
- [ ] Create the content ledger (n8n Data Table) with all fields from `CONTENT_STRATEGY.md` §5.3
- [ ] Seed the ledger with the 24 existing articles, so they can't be re-proposed
- [ ] Daily schedule trigger
- [ ] Topic selection from the queue
- [ ] **Duplicate check against published AND rejected rows**
- [ ] Slug + topic-similarity matching, not exact-title only
- [ ] Near-matches flagged to a human, never silently dropped
- [ ] Research step recording official-doc source links
- [ ] Draft step using the editorial guidelines
- [ ] **Force `verification: researched`** — generator cannot set `tested`
- [ ] **Block first-person experiential claims** in prompt and at the gate
- [ ] Thumbnail generation
- [ ] SEO title, meta description, tags, slug
- [ ] Open a PR adding the Markdown file
- [ ] CI validates frontmatter on the PR
- [ ] Admin notification
- [ ] Rejection path writes back to the ledger
- [ ] Scheduled publish via future `publishDate` excluded from the build
- [ ] **Auto-publish off**; confirm it cannot fire
- [ ] Credentials in n8n's credential store only — **none in the repo, none in frontend code**
- [ ] `git grep` for leaked keys/tokens before any push
- [ ] Ollama path for the mechanical steps
- [ ] One full end-to-end dry run producing a real reviewable draft PR
- [ ] Confirm the dry-run article contains no fabricated experience or invented pricing

## Phase 8 — Testing and deployment readiness

Record the exact command, exit code and result for each. **Nothing here is reported as passing without a run behind it.**

### Build and code
- [ ] `npm run build` — clean, exit 0
- [ ] Type/static checks
- [ ] Formatter and linter
- [ ] Zero build warnings, or each one explained

### Functional
- [ ] Every page renders
- [ ] Every navigation link resolves — no 404s
- [ ] Every internal article link resolves
- [ ] Every external link resolves and has `rel="noopener noreferrer"`
- [ ] Code blocks highlight; copy button works
- [ ] TOC links jump correctly
- [ ] Related articles and prev/next correct
- [ ] Newsletter: real submit, or control absent (**no `alert()` anywhere** — `git grep` to confirm)
- [ ] 404 page serves

### Responsive — real devices and emulation
- [ ] 320, 375, 414, 768, 1024, 1440 px
- [ ] Android phone (real device)
- [ ] iPhone / Safari (real device)
- [ ] Tablet
- [ ] No horizontal scroll at any width
- [ ] No layout shift on load
- [ ] Nav, hero, cards, images, forms, footer all usable at every width
- [ ] Tap targets ≥ 44 px

### SEO
- [ ] Unique title + meta description on every page
- [ ] Canonical correct on every page
- [ ] OG and Twitter cards render in a validator
- [ ] `Article` and `BreadcrumbList` JSON-LD pass Google's Rich Results Test
- [ ] `/sitemap-index.xml` lists every page, no 404s
- [ ] `/robots.txt` correct
- [ ] `/rss.xml` validates
- [ ] `https://qivy.in/` still serves the homepage

### Accessibility — measured
- [ ] axe or Lighthouse a11y run; **record the score**
- [ ] **Every colour pair measured against WCAG 2.2 AA; record the ratios**
- [ ] Full keyboard pass; visible focus throughout
- [ ] Screen-reader pass on homepage + one article
- [ ] Heading hierarchy valid on every page
- [ ] All images have `alt`; decorative ones hidden
- [ ] Forms have labels and accessible error messages

### Performance — measured
- [ ] Lighthouse on homepage, a category page, an article; **record all scores**
- [ ] LCP, CLS, INP recorded
- [ ] Confirm per-article payload is far below the current 338 KB
- [ ] Images optimised and correctly sized
- [ ] No render-blocking fonts

### Security
- [ ] `git grep` for secrets across the full history before pushing
- [ ] No API key or token in any client-side file
- [ ] `.env` git-ignored; only `.env.example` committed
- [ ] `npm audit`; **record the output**
- [ ] `Tools/*.zip` removed from the web root per the Phase 2 decision
- [ ] Newsletter input validated server-side by the provider

### Deployment
- [ ] Preview the full build locally
- [ ] Confirm `CNAME` is preserved in the build output — **losing it breaks the custom domain**
- [ ] Confirm GitHub Pages source still resolves correctly for the new output
- [ ] **Your explicit authorisation before anything reaches `main`**
- [ ] Post-deploy: `qivy.in` loads, HTTPS valid, homepage + 3 articles + sitemap + RSS checked live
- [ ] Rollback plan recorded (the previous commit is the rollback)

### Reporting
- [ ] `REDESIGN_COMPLETION_REPORT.md` — changed, preserved, removed, new features, automation status, **measured** test results, remaining issues, deployment requirements
- [ ] Every unrun check listed as **not verified**, never as passing
- [ ] `README.md` — setup, build, publishing workflow
- [ ] Deployment and rollback instructions

---

## Standing rules

- `main` is live production. Nothing lands there without explicit authorisation.
- Nothing is deleted from the Maker content.
- No fabricated pricing, capabilities, test results, or personal experience.
- No secrets in the repository or in client-side code.
- No check reported as passing unless it was run; otherwise **not verified**.
- The fake subscribe button does not ship in any form.
- `E:\AI\GITHUB\Website` stays untouched.
