# Qivy — Redesign Plan

**Date:** 2026-11-07
**Status:** Proposed, awaiting approval
**Depends on:** `CURRENT_STATE_ANALYSIS.md`, `CONTENT_STRATEGY.md`

---

## 1. What the redesign actually is

The brief frames this as *redesign an existing Ghost + n8n publication*. The audit found a single 338 KB static HTML file with no CMS, no workflows, no newsletter backend and no SEO (`CURRENT_STATE_ANALYSIS.md` §1, §5). So the work is:

| Brief assumed | Actual work |
|---|---|
| Preserve Ghost integration | **Build** a content layer (§3) |
| Reuse existing n8n workflows | **Build** the daily pipeline (§7) |
| Reuse existing newsletter | **Build** or remove the fake control (§6.4) |
| Preserve article URLs/slugs | **Create** URLs — none exist (§4) |
| Preserve Cloudflare config | No Cloudflare in the path; nothing to preserve |
| Redesign the look | **Palette rotation** — the design system is sound (§5) |

Two things get easier (no URL migration risk, design tokens reusable) and two get harder (the content layer and the pipeline are new build, not modification).

---

## 2. Design goals, in priority order

1. **Give every article a URL.** The site's 24 articles are currently unlinkable and unindexable. Nothing else in this plan matters as much.
2. **Make AI the identity** without deleting the Maker content that earned the domain its history.
3. **Make the daily engine safe** — human approval, duplicate checks, no fabricated experience.
4. **Keep it cheap and boring.** No new recurring cost, no new ops surface, unless a requirement genuinely forces it.
5. **Ship nothing that deceives.** The fake subscribe button does not survive.

---

## 3. Architecture decision — the fork

This is the one decision that changes everything downstream, and it rests on a question only you can answer: **does a Ghost instance actually exist?**

### Option A — Static site generator, Markdown in the repo ✅ **Recommended**

**Astro** + Markdown content files + GitHub Pages. Publishing is a git commit.

```
qivy-site/
├── src/
│   ├── content/
│   │   ├── ai/*.md
│   │   ├── automation/*.md
│   │   ├── tips/*.md
│   │   ├── tools/*.md          (or data/tools.json)
│   │   └── maker/*.md          (16 migrated articles)
│   ├── layouts/   ArticleLayout, CategoryLayout, BaseLayout
│   ├── components/ ArticleCard, Nav, Footer, Newsletter, TOC, CodeBlock
│   └── pages/     index, ai, automation, tips, tools, about, maker, 404
├── public/        images, robots.txt
└── astro.config.mjs
```

| | |
|---|---|
| **Cost** | ₹0. GitHub Pages stays, `qivy.in` stays, HTTPS stays. |
| **URLs** | Real static paths: `/ai/better-claude-prompts/`. Perfectly indexable. |
| **SEO** | Astro's official `sitemap` and `rss` integrations; metadata per page from frontmatter. |
| **Performance** | Zero JS shipped by default. Each article is its own small page — a reader downloads one article, not all 24. |
| **Quality enforcement** | Content-collection schemas make frontmatter **validated at build time**. An article missing `seoTitle`, `metaDescription` or `verification` fails the build. This is how `CONTENT_STRATEGY.md` §4.4 stops being a guideline and becomes a gate. |
| **Secrets** | None in the repo. Nothing to leak. |
| **Editorial dashboard** | **GitHub Pull Requests** — see §3.1. |
| **Trade-off** | Writing is Markdown + git, not a WYSIWYG admin. For a solo operator already working in this toolchain, that is a feature; for a non-technical editor it is not. |

### Option A.1 — the editorial dashboard, for free

The brief asks for "a simple editorial dashboard where you can see daily generated articles, approve, edit, reject and schedule them."

**A GitHub Pull Request already is that dashboard:**

| Need | GitHub PR |
|---|---|
| See generated articles | Open PRs list |
| Read the draft | Rendered Markdown in the diff |
| Edit | Edit the file in the PR, web or mobile |
| Approve | Merge |
| Reject | Close (and the ledger keeps the topic so it isn't re-proposed) |
| Schedule | Merge with a future `publishDate`; the build excludes future dates |
| Notifications | Built in — email, mobile app |
| Audit trail | Git history, permanently |
| Cost | ₹0 |

Building a bespoke dashboard would mean a database, auth, hosting and a UI — for capability that already exists, on infrastructure already in use. **Recommendation: use PRs. Revisit only if a non-technical editor joins.**

### Option B — Ghost

Correct **only if Ghost already exists** with an API key, or you want its newsletter/members features enough to pay and operate it.

- Ghost Pro, or self-hosted (then: a server, Node, MySQL, backups, upgrades, TLS).
- Real admin UI, native newsletter and paid memberships, clean Content API.
- Hosting moves off GitHub Pages; `qivy.in` DNS repoints.
- Real recurring cost and a real ops surface — directly against the brief's own "avoid unnecessary paid dependencies / avoid unnecessary infrastructure changes."

**This is a cost and operations decision, not a technical one — so it is yours.** My read: unless Ghost is already running and paid for, or the native newsletter/memberships are a near-term requirement, Option A delivers the same reader-facing outcome for ₹0.

### Option C — keep the single file, add hash routing

Cheapest possible. Rejected: `#/ai/foo` URLs index poorly, every reader still downloads all 338 KB, and it does not scale to a daily cadence. Kept here only to record that it was considered.

### Why Astro over Eleventy or Next.js

- **vs Eleventy:** Astro's content collections give schema-validated frontmatter, which is what enforces the quality rules at build time. Worth the slightly heavier toolchain.
- **vs Next.js:** Next brings a React runtime and SSR concepts this site has no use for. Astro ships zero JS by default — correct for a content site.
- Both ship static output to GitHub Pages identically, so this is reversible.

---

## 4. Information architecture

### 4.1 Navigation

`Home · AI · Automation · Tips & Tricks · Tools · About`

Flat, five items plus Home. **No dropdowns** — with four content categories there is nothing a dropdown would improve, and it costs mobile usability. Maker lives in the footer.

### 4.2 URL scheme

| Page | URL |
|---|---|
| Home | `/` |
| Category hub | `/ai/`, `/automation/`, `/tips/`, `/tools/` |
| Article | `/ai/<slug>/` |
| About | `/about/` |
| Maker hub | `/maker/` |
| Filament KB | `/maker/filaments/`, `/maker/filaments/<slug>/` |
| Feeds | `/rss.xml`, `/sitemap-index.xml`, `/robots.txt` |
| 404 | `/404.html` |

Lowercase, hyphenated, trailing slash, no dates in paths (so an article can be updated without its URL going stale).

**Redirects: none needed.** Every current screen sits at `https://qivy.in/` with no distinct URL, so there is no inbound link to preserve (`CURRENT_STATE_ANALYSIS.md` §4.1). All new URLs are additive; `/` keeps working.

---

## 5. Design system

The existing tokens are well structured (`CURRENT_STATE_ANALYSIS.md` §4.3). This is a **palette rotation, not a rebuild** — keep the scales, repoint the hues.

### 5.1 Palette

Brief asks for deep navy/charcoal with electric blue or violet accents. The current token set already carries a usable violet.

| Token | Current | Proposed | Note |
|---|---|---|---|
| `--bg` | `#0a0a0c` | `#0B0F1A` | Deep navy rather than near-black |
| `--bg-2` | `#111114` | `#111726` | |
| `--bg-3` | `#18181c` | `#1A2234` | |
| `--accent` | `#E8795B` coral | `#6D7BFF` electric indigo | Primary — AI |
| `--accent-2` | `#8B84E0` | `#8B84E0` violet | **Kept** — Automation |
| `--accent-3` | `#2AAD84` | `#2AAD84` teal | **Kept** — Tips |
| `--text` | `#f0f0f3` | `#F2F4F8` | |
| `--text-2` | `#a0a0b0` | `#9AA3B8` | |

One accent per category gives the "clear category differentiation" the brief asks for, using two hues already in the system.

**Contrast must be measured, not assumed.** Every text/background pair gets checked against WCAG 2.2 AA (4.5:1 body, 3:1 large text) before sign-off. `--text-3` at `#6b6b80` on `#111114` is the pair I most expect to fail; it will be adjusted if it does. No contrast claim will appear in the completion report without a measured number.

### 5.2 Type and icons

- **Keep Inter + JetBrains Mono.** They fit the direction; changing them is churn. Self-host subsets or add `font-display: swap` to remove the render-blocking Google Fonts request.
- **Pin Lucide** to a version and import only the icons used, replacing the unpinned `lucide@latest` CDN script (supply-chain risk, §4.5 of the analysis).

### 5.3 Light/dark

Dark stays the default identity. Light mode via `prefers-color-scheme` plus a toggle, built on the same tokens. Honest note: a light theme doubles the contrast-checking surface — if it slips, it slips, and dark-only ships.

---

## 6. Article experience

Per article: breadcrumbs, category badge, title, summary, published + updated dates, reading time, **verification badge** (`Tested` / `Researched` — `CONTENT_STRATEGY.md` §4.4), featured image, table of contents for longer pieces, syntax-highlighted code with a copy button, related articles, prev/next, share links, newsletter block.

Implementation notes:
- **Syntax highlighting at build time** (Astro's built-in Shiki) — no client-side highlighter, no JS cost.
- **Copy-code** is the only interactive element on an article page; a few lines of vanilla JS, no library.
- **TOC** generated from headings at build time, shown only above a word threshold.
- **Related articles** by shared category + tags, computed at build. No recommendation engine.
- Reading time computed at build from word count.
- No popups, no interstitials, no scroll-jacking.

### 6.4 Newsletter

The current control is `onclick="alert('Subscribed!')"` with no form and no backend. **It will not be carried over.**

- If you name a provider, the block becomes a real `<form>` posting to it, with validation, error, success and already-subscribed states.
- If not, **the control is removed** and the section replaced with the RSS feed link until a provider exists.

Not negotiable: a button that tells visitors they subscribed when nothing was recorded is the one element on the site that actively deceives, and shipping a "premium redesign" around it would be worse than shipping without a newsletter.

---

## 7. Daily content pipeline

**Nothing exists to reuse** — the reachable n8n instance holds 2 unrelated workflows (`CURRENT_STATE_ANALYSIS.md` §5). This is new build. Target instance is an open question (§10.2).

```
Schedule (daily)
   ↓
Pick topic from the ledger queue
   ↓
Duplicate check against all ledger rows — published AND rejected
   ↓  (near-match → flag to human, do not silently drop)
Research: fetch and record official-doc sources
   ↓
Draft to Qivy editorial guidelines
   ↓  verification = "researched" (never "tested" — §4.4 rule 7)
Generate thumbnail
   ↓
SEO title, meta description, tags, slug
   ↓
Open a PULL REQUEST adding src/content/<category>/<slug>.md
   ↓
Notify admin
   ↓
── HUMAN GATE ──  review → edit → merge (publish) or close (reject)
   ↓
Merge triggers build + deploy
```

**Properties this gets for free by writing to a PR rather than a CMS:**
- Draft state is the PR; no separate draft store.
- Schema validation runs in CI on the PR — a draft missing required frontmatter fails before you read it.
- Approval, edit, reject and audit trail are GitHub's, not code we maintain.
- No API keys in the site, no secrets in the repo. The workflow holds a scoped GitHub token in n8n's credential store.

**The ledger** (fields in `CONTENT_STRATEGY.md` §5.3) can be an n8n Data Table — it is already available in the instance, so it needs no new database.

**Guardrails, non-negotiable:**
- `verification: researched` is forced for all generated content. Only a human may set `tested`.
- No first-person experiential claims. The generator is prompted against it and the gate checks for it.
- Auto-publish stays **off**. Enabling it is a separate, explicit decision.
- Credentials in n8n's credential store or environment variables — never in the repo, never in frontend code.
- Ollama supported as a provider for the mechanical steps (slug, metadata, ideation); cloud recommended for drafting (`CONTENT_STRATEGY.md` §5.5).

---

## 8. SEO implementation

| Item | Approach |
|---|---|
| Semantic HTML, heading hierarchy | One `h1` per page; no level skips |
| Unique titles + meta descriptions | Required frontmatter, build-validated |
| Canonical URLs | Per page, absolute |
| Open Graph + Twitter/X cards | Per article, with per-article OG image |
| `sitemap.xml` | `@astrojs/sitemap` |
| `robots.txt` | Static, references the sitemap |
| RSS | `@astrojs/rss` at `/rss.xml` |
| `Article` structured data | JSON-LD per article |
| `BreadcrumbList` structured data | JSON-LD per article |
| Internal linking | 2–4 per article, enforced editorially |
| Image `alt` | Required; decorative SVGs get `aria-hidden` |
| Clean URLs | §4.2 |

Performance: Astro image optimization with width/height set to stop layout shift, lazy loading below the fold, self-hosted font subsets, zero-JS default, per-article payloads instead of one 338 KB bundle.

**Core Web Vitals will be measured, not asserted.** No score goes in any report without a run behind it.

Analytics: none currently installed. A privacy-respecting option (Plausible — which the site already claims to use — or Cloudflare Web Analytics, free) is needed before any of §8 of the content strategy can be measured. **Your call, since Plausible is paid.**

---

## 9. Phases

| Phase | Work | Gate |
|---|---|---|
| **1** | Repository & website analysis | ✅ Complete — these four documents |
| **2** | Architecture & planning | ⏸ **Awaiting your approval + §10 answers** |
| **3** | Scaffold Astro, design tokens, base layout, components | Build passes; tokens contrast-checked |
| **4** | Homepage, navigation, category hubs | All routes render; mobile checked |
| **5** | Article template, SEO, feeds, sitemap, structured data | Metadata validated; feeds parse |
| **6** | Migrate 24 articles — Maker archive + reclassification | Every article has a URL and metadata |
| **7** | Daily pipeline in n8n + ledger + PR integration | One end-to-end dry run producing a real draft PR |
| **8** | Testing, performance, accessibility, deployment readiness | Measured results in `REDESIGN_COMPLETION_REPORT.md` |

Phases 3–6 are sequential. Phase 7 is independent of 3–6 once the content schema is fixed in Phase 3.

**Deployment:** Phases 3–7 land on a branch, previewed locally. **Nothing is pushed to `main` — and therefore nothing reaches `qivy.in` — without your explicit authorisation**, since `main` is the live production branch (`CURRENT_STATE_ANALYSIS.md` §3).

---

## 10. Decisions — resolved 2026-11-07

| # | Decision | Answer |
|---|---|---|
| 1 | Content layer | **Option A — Astro + Markdown + GitHub Pages.** No Ghost instance exists. Editorial dashboard = GitHub Pull Requests. ₹0/mo. |
| 2 | n8n instance | **The MCP-reachable instance.** Existing 2 workflows untouched; new `Qivy Daily Content` workflow added. Its Data Tables hold the content ledger. |
| 3 | Newsletter | **Remove the fake control.** Replaced by an RSS link at `/rss.xml` until a provider is chosen. |
| 4 | Seed AI content | **Pipeline drafts, you approve.** All seed articles marked `researched`, never `tested`. |

### Still open — answered as their phase arrives

5. **Analytics** — Plausible (paid), Cloudflare Web Analytics (free), or none? *Default if unanswered: none installed, and §8 of the content strategy stays unmeasurable.*
6. **Migrated article dates** — git commit dates, or month-only? *Default: git commit dates of the commit that introduced each article, recorded as such.*
7. **`Tools/*.zip`** — remove from the web root? *Default: left in place, flagged.*
8. **Local consultancy page** — source for the new About, or abandoned? *Default: not used; About rewritten from the new positioning.*
