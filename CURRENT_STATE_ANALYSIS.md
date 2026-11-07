# Qivy — Current State Analysis

**Date:** 2026-11-07
**Audited:** `github.com/fshbet/qivy-site` @ `main` (last push 2026-10-13), live `https://qivy.in/`, the connected n8n instance, and the local folder `E:\AI\GITHUB\Website`.
**Method:** repository tree via GitHub API, byte-comparison of the live page against the repo file, HTTP header and DNS inspection, static read of `index.html`, n8n instance listing.

Every statement below is marked **Verified** (observed directly) or **Not verified** (could not be checked from here).

---

## 1. Headline finding

The brief assumes Qivy is a Ghost CMS blog with n8n publishing workflows, a working newsletter, article URLs with accrued SEO value, and Cloudflare in front. **None of that exists in the repository or on the live site.**

What actually ships is **one 338 KB static `index.html`** containing 29 screens toggled by a JavaScript class switch, served directly by GitHub Pages. Ghost, n8n, Plausible and Mailchimp appear only as *prose inside a "tools I use" card* — they are editorial copy describing an intended stack, not integrations.

This does not block the redesign. It changes it from *"migrate and preserve an existing CMS-backed site"* to *"build the publishing platform that the current site describes but does not have."* The scope is larger than the brief assumes in the architecture, and considerably smaller in the migration.

---

## 2. Repository

**Verified.** Complete tree of `fshbet/qivy-site` @ `main`:

| Path | Size | Notes |
|---|---|---|
| `index.html` | 338,261 B | The entire website |
| `CNAME` | 7 B | `qivy.in` |
| `Tools/local.md` | 0 B | Empty file |
| `Tools/sisense-visualization-studio-gemini-pack_Gemini.zip` | 107,950 B | Unrelated to the site |
| `Tools/sisense-visualization-studio-gemini-pack_Gemini_1.zip` | 127,911 B | Near-duplicate of the above |

That is the whole repository — 5 files.

**Absent (verified):** `package.json`, lockfile, any build config, any framework, `.github/workflows` (no CI), test files, linter/formatter config, `.env` or `.env.example`, `robots.txt`, `sitemap.xml`, RSS feed, `README`, `LICENSE`, any n8n workflow JSON, any Ghost theme or API client, any image asset.

**Commit history (verified):** 9 commits total, 2026-05-03 → 2026-10-13. Messages are `Add files via upload`, `Update index.html`, `Create CNAME`, `Create local.md`, and one stray `Update print statement from 'Hello' to 'Goodbye'`. The pattern is whole-file uploads through the GitHub web UI, not a development workflow. Branches: `main` only.

### 2.1 The two zip files

`Tools/*.zip` are Sisense visualization packs — 236 KB with no relationship to qivy.in. They are served publicly at `https://qivy.in/Tools/...`. **Recommendation:** remove from the web root. Not done; awaiting confirmation that they are not deliberately published there.

---

## 3. Hosting and delivery

| Property | Value | Status |
|---|---|---|
| Host | GitHub Pages, `build_type: legacy`, source `main` / root | Verified |
| Custom domain | `qivy.in` via `CNAME` | Verified |
| HTTPS | Enforced; cert covers `qivy.in` + `www.qivy.in`, expires 2026-12-22 (auto-renews) | Verified |
| DNS | `qivy.in` → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` — GitHub Pages anycast | Verified |
| Cloudflare | **Not in the request path.** Headers show `Server: GitHub.com` and `Via: 1.1 varnish`; no `cf-ray`, no `cf-cache-status` | Verified |
| Cache | `Cache-Control: max-age=600` (GitHub default) | Verified |
| 404 page | None (`custom_404: false`) | Verified |

**Correction to the brief:** there is no Cloudflare configuration to preserve. The domain resolves straight to GitHub Pages. Whether the *registrar or DNS zone* is held at Cloudflare is **not verified** — I can see where the records point, not who hosts the zone. If the zone is at Cloudflare, proxying could be enabled later as a deliberate choice; it is not a current dependency.

---

## 4. The live page

**Verified:** the live page is byte-identical to the repo file (MD5 `4291f4f398bfc26ebee1398516689814` on both). No build step, no drift.

### 4.1 Architecture

A single HTML document with inline `<style>` and inline `<script>`. Navigation is:

```js
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+id);
  if(pg){pg.classList.add('active');window.scrollTo(0,0)}
  …
}
```

**There is no `pushState`, no `replaceState`, no `location.hash`, and no `onhashchange` anywhere in the file** (verified: zero matches).

Consequences, all verified:

- **All 29 screens live at the single URL `https://qivy.in/`.** There is not one article URL on the site.
- No article can be linked to, shared, or bookmarked.
- No article can be indexed separately. Google sees one page.
- The back button does not navigate between screens.
- **There are therefore zero article URLs or slugs to preserve, and no per-article SEO equity at risk.** The brief's instruction to "maintain existing article URLs wherever possible" and "preserve article slugs, existing SEO value" has no object — the thing it protects was never built. This removes the single biggest risk from the redesign: new URLs cannot regress rankings that were never possible.
- Every visitor downloads all 338 KB — ~24 articles — to read one.

### 4.2 Content inventory

29 `.page` screens. Three pillars are declared in `showPillar()`: `maker`, `data`, `auto` — and `maker` maps to `home`, i.e. **3D printing is currently the homepage.**

**Pillar: Maker / 3D printing — 16 screens (55%)**
- `page-home` — homepage, 3D-printing led
- `page-bambu-review` — Bambu Lab A1 Mini after 3 months
- `page-cable-rack` — Cable management wall rack build
- `page-starter-guide` — Complete 3D printing starter guide
- `page-filament-compare` — eSUN PLA+ vs Bambu PLA
- `page-slicer-settings` — 5 slicer settings that fixed print quality
- `page-filaments` — "3D Filament Knowledge Base" hub
- `page-fil-{pla, petg, tpu, abs, nylon, esun, prusament, polymaker, india, best-pla, storage}` — 11 filament reference pages

**Pillar: Data — 5 screens (17%)**
- `page-data` — pillar hub, "Dashboards, pipelines —"
- `page-data-powerbi-intro` — Power BI in 2026 for solo operators
- `page-data-sheets-dashboard` — Google Sheet → live ops dashboard
- `page-data-python-pandas` — Python + Pandas for non-coders
- `page-data-looker-studio` — Looker Studio

**Pillar: Automation — 5 screens (17%)**
- `page-auto` — pillar hub, "Workflows that run"
- `page-auto-n8n-start` — n8n beginner guide, first workflow in 30 min
- `page-auto-linkedin-auto` — LinkedIn automation
- `page-auto-printer-alerts` — Printer alerts
- `page-auto-rss-newsletter` — RSS → newsletter

**Site pages — 3 screens**
- `page-tools` — "Tools I actually use"
- `page-about` — "About qivy.in", states the three pillars

**Relevant to the new positioning:** there is no AI pillar at all. Not one article on AI tools, prompting, local models, or AI-assisted work. The brief asks for AI at ~50% homepage emphasis; the current site is at 0%. The Automation pillar, by contrast, already exists with real n8n content and is directly reusable.

### 4.3 Current brand and design

**Verified** from the design tokens in `:root`:

- Positioning: **"Build systems that run without you"** (`<title>`), with "From dashboards to automation —" as the homepage H1.
- Dark-first. Surfaces `#0a0a0c` / `#111114` / `#18181c`.
- Accent: **coral `#E8795B`**, with secondary purple `#8B84E0` and teal `#2AAD84`.
- Text `#f0f0f3` / `#a0a0b0` / `#6b6b80`.
- Type: **Inter** (300–800) + **JetBrains Mono** (400–700), from Google Fonts.
- Icons: **Lucide**, from `unpkg.com/lucide@latest` — an unpinned CDN dependency.
- A coherent token set already exists: radius, shadow and colour scales are defined properly.

The existing design is competent and already dark-first. The brief's requested direction — deep navy/charcoal with electric blue or violet accents — is a **palette rotation away from coral**, not a rebuild. The purple `#8B84E0` already in the token set is a usable starting point for the violet accent.

### 4.4 SEO — current state

**Verified.** The document contains exactly two meta tags:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Absent: `meta description`, canonical, Open Graph, Twitter/X cards, JSON-LD / structured data, `robots.txt` (404), `sitemap.xml` (404), RSS (404), `hreflang`, per-page titles (one `<title>` for all 29 screens), and `alt` text on decorative SVGs.

This is effectively zero SEO implementation. Combined with one URL for 24 articles, the site is close to invisible to search for anything but its own name. **This is also the largest single opportunity in the project** — the content exists and is substantial; it simply cannot be found.

### 4.5 Functional defects

| Defect | Evidence | Severity |
|---|---|---|
| **Newsletter is fake.** `<button onclick="alert('Subscribed!')">Subscribe free</button>` beside an unwired `<input type="email">`. No `<form>` element exists anywhere in the file; no `fetch`/XHR call exists anywhere in the file. It takes an address, discards it, and tells the visitor they subscribed. | Verified — 0 `<form>` and 0 `fetch` matches | **High** — misleads visitors; appears 4× across screens |
| No article URLs | §4.1 | **High** |
| No SEO metadata | §4.4 | **High** |
| Unpinned CDN script (`lucide@latest`) | Verified | Medium — supply-chain and breakage risk |
| 338 KB single payload; all articles loaded always | Verified | Medium |
| Google Fonts render-blocking, no `font-display` control | Verified | Low |
| No 404 page | Verified | Low |
| Public zip files in web root | Verified | Low |
| `rel="noopener"` coverage on external links | Not audited | Low |

**Not verified:** runtime console errors, Core Web Vitals / Lighthouse scores, real-device rendering on Android and iOS, and accessibility (contrast ratios, focus order, keyboard traps, screen-reader behaviour). These require running the page in a browser and on devices, which I have not yet done. I will not report them as passing or failing until measured.

---

## 5. Claimed integrations — what is real

The site's "Tools I actually use" and About pages describe a stack. Each was checked:

| Claimed on site | Reality | Status |
|---|---|---|
| "**Ghost CMS** — Powers qivy.in" | No Ghost theme, no Content/Admin API client, no API key, no Handlebars templates, no Ghost reference in any code path. `https://qivy.in/ghost/` → **404**. The string "Ghost" appears twice, both inside the tool-card copy. | **Does not exist** |
| "All my content automation runs on **n8n** at `n8n.qivy.in`" | Mentioned 61× in prose. `https://n8n.qivy.in` appears as an `href` but nothing calls it. No workflow JSON in the repo. The n8n instance reachable via MCP holds **2 workflows — "SMP-1 Ingest and Describe" and "DataViz Enterprise BI — Workflow v4"** — neither is content generation or publishing. | **No publishing workflow exists** |
| "**Plausible Analytics**" | No script tag; no analytics of any kind. One prose mention. | **Not installed** |
| Mailchimp / newsletter | See §4.5 — an `alert()`. | **Not wired** |

**Not verified:** whether a Ghost instance or additional n8n workflows exist outside this repository and outside the n8n instance I can see — for example a Ghost Pro subscription, a self-hosted Ghost elsewhere, or a second n8n instance. I can confirm only that nothing in the repository, nothing on `qivy.in`, and nothing in the reachable n8n instance implements them. **This is the key open question in §8.**

**Correction to the brief:** instructions to "preserve Ghost CMS integration", "preserve existing working n8n workflows", and "reuse the existing newsletter integration" cannot be followed as written — there is nothing to preserve. The equivalent real work is to *build* these, which is a materially different task and the main driver of the plan in `REDESIGN_PLAN.md`.

---

## 6. The local folder `E:\AI\GITHUB\Website`

You expected the site's files here. **It is not a checkout of `qivy-site`** — verified: no `.git` directory, and the content differs fundamentally.

| | `E:\AI\GITHUB\Website\index.html` | `qivy-site/index.html` (production) |
|---|---|---|
| Size | 29,889 B | 338,261 B |
| Title | "Qivy \| Business intelligence, AI and workflow automation" | "qivy.in — Build systems that run without you" |
| Nature | Single-page **consultancy / portfolio** — services, selected work, contact | **Publication** with ~24 articles |
| Accent | Lime `#c4f36b` | Coral `#E8795B` |
| Type | DM Sans / DM Mono / Space Grotesk | Inter / JetBrains Mono |
| Tracked in git | No | Yes |

So there are **two unrelated Qivy identities** on disk: a consultancy pitch (local, untracked, never deployed) and a technical publication (live). The local folder also holds:

- `archive/index1-legacy.html`, `archive/index1-legacy.html.bak`, `archive/legacy-index-3d-printing.html` — ~87 KB each, older 3D-printing site revisions
- `data-viz-platform.html` (121 KB), `finance-dashboard.html` (64 KB) — demo dashboards referenced by the local consultancy page
- `ai-dashboard-platform/` — a separate project
- `.claude/launch.json` — a `python -m http.server 3456` preview config

**I have changed nothing in that folder.** I cloned production fresh to **`E:\AI\GITHUB\qivy-site`** and will work there, so the live site is the baseline and your local files stay untouched.

**Open question (§8):** the local consultancy page states the AI/BI/automation positioning the brief now wants. It may be a deliberate earlier draft of this exact pivot. Worth deciding whether it feeds the new About/Services content or is abandoned.

---

## 7. What is worth keeping

This is not a blank slate. Reusable as-is or with light work:

1. **The content itself — ~24 written articles.** Specific, first-person, non-generic. The filament knowledge base (11 pages) is genuinely useful reference material. This is the site's real asset and the main thing the redesign must stop hiding.
2. **The Automation pillar.** Already exists with real n8n material. Maps directly onto the brief's second-priority category with no migration work.
3. **The Data pillar.** Power BI, Pandas, Sheets, Looker Studio — fits cleanly under Tools or Tips & Tricks in the new structure.
4. **The design token system.** Colour, radius, shadow and type scales are properly structured. Re-point the accent and the tokens carry over.
5. **Dark-first visual direction.** Already matches the requested direction.
6. **GitHub Pages + `qivy.in` + HTTPS.** Working, free, sufficient for a static site. No reason to change hosting unless Ghost is chosen (§8).
7. **The three-pillar mental model.** Sound structure; the pillars need re-weighting toward AI, not replacing.

---

## 8. Decisions needed before implementation

These change the architecture, so implementation has not started.

1. **Does a Ghost instance exist?** If Ghost is running (Ghost Pro or self-hosted) with an API key, the target is a Ghost-backed site and the editorial dashboard can be Ghost Admin itself. If not, "preserve Ghost" is unbuildable, and the honest options are (a) a static site with Markdown files in the repo — free, fast, no new infrastructure, publishing by git commit, or (b) stand up Ghost — a real recurring cost and an ops surface. These produce different codebases; not a detail to defer.
2. **Which n8n instance should the daily workflow live in?** The one reachable via MCP (2 unrelated workflows), or `n8n.qivy.in` if that is a different instance not visible from here.
3. **Newsletter provider.** The current one is an `alert()`. A real one needs an account and a key. Until then the honest move is to remove the fake control rather than ship it.
4. **Is 3D printing content staying public?** The brief says keep it under a Maker archive, de-emphasised — that is clear and recommended. Confirming because it means the current homepage stops being the 3D printing page.
5. **The local consultancy page** (§6) — source material for the new About/Services, or abandoned?

---

## 9. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Daily AI-generated articles degrade quality and attract a thin-content penalty | High | High | Human approval gate before publish; the brief's own 300–700 word practical format; no auto-publish by default |
| Ghost decision reverses and work is discarded | Medium | High | Resolve §8.1 before Phase 3 |
| Moving 24 articles from one URL to many | Low | Low | No existing URLs to break (§4.1) — unusually safe |
| Daily cadence not sustainable | Medium | Medium | Build the queue so a missed day is invisible; do not promise a cadence in the UI the engine cannot hold |
| New AI/automation content never matches the volume of legacy 3D content | Medium | Medium | Archive, don't delete; weight the homepage by pillar, not by article count |
| Unpinned `lucide@latest` breaks or is compromised | Low | Medium | Pin the version or inline the icons actually used |

---

## 10. Summary

Qivy is a single static HTML file holding ~24 good articles trapped at one URL, with no SEO metadata, a newsletter button that lies to visitors, and a documented stack — Ghost, n8n, Plausible — that exists only as copy. It is dark-first with a sound token system and solid content, hosted free and correctly on GitHub Pages.

The redesign is therefore mostly **additive**: give the articles URLs, give them metadata, re-weight the pillars toward AI, and build the publishing engine the About page already claims. The destructive risks the brief guards against — broken slugs, lost rankings, discarded integrations — are largely absent, because none of it was ever built.
