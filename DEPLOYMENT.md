# Deployment

**Target:** GitHub Pages, custom domain `qivy.in`, HTTPS enforced.
**Current live state:** the old single-file `index.html` is still being served from the `main` branch root. Nothing in this redesign has been deployed.

---

## The one manual step

The site currently uses GitHub Pages' **legacy branch** build: it serves files from the root of `main`. The redesign builds to `dist/`, which that mode cannot serve.

So **before the first deploy**, the Pages source must change:

> **Repository → Settings → Pages → Build and deployment → Source → GitHub Actions**

Until that switch is made, `.github/workflows/deploy.yml` will build and pass, but nothing it produces reaches `qivy.in` — the old `index.html` keeps serving. This is deliberately a manual step: it is a production change, and it is yours to make.

### What does not change

- The domain. `CNAME` (`qivy.in`) is in `public/`, so every build emits it to `dist/CNAME`. **Do not delete it** — losing it unsets the custom domain.
- DNS. The A records already point at GitHub Pages anycast (`185.199.108–111.153`). No change.
- HTTPS. The certificate covers `qivy.in` and `www.qivy.in` and renews automatically.
- No Cloudflare is in the request path, and none is introduced.

---

## Deploying

Once the Pages source is set to GitHub Actions, deployment is automatic:

| Trigger | Effect |
|---|---|
| Push to `main` | Build, verify, deploy |
| Daily at 02:30 UTC (08:00 IST) | Rebuild, so future-dated articles go live on their date |
| Manual `workflow_dispatch` | Build and deploy on demand |

The workflow runs, in order: `npm ci` → `npm run build` → `npm run check:contrast` → `npm run verify` → publish. **A failure in any step blocks the deploy.** That is the point — a build that fails schema validation or regresses accessibility should not reach the site.

### First deploy

```bash
git checkout redesign-ai-first
npm ci
npm run build
npm run verify
```

Then open a pull request into `main`, review the diff, and merge. Switch the Pages source either just before or just after merging.

### Checks after it goes live

```bash
curl -sI https://qivy.in/ | head -3
```

- `https://qivy.in/` loads the new homepage
- A few articles resolve: `/ai/run-an-ai-model-locally-with-ollama/`, `/maker/filaments/petg-filament-guide/`
- `https://qivy.in/sitemap-index.xml` and `https://qivy.in/rss.xml` return XML
- `https://qivy.in/robots.txt` returns the sitemap line
- HTTPS valid, no mixed-content warnings
- Submit the sitemap in Google Search Console — the old site had no sitemap and effectively one indexable URL, so this is the step that makes 25 articles findable for the first time

---

## Rollback

The previous commit is the rollback. Nothing is destructive.

**If the new site is live and broken:**

```bash
git revert --no-edit <merge-commit-sha> && git push
```

**To return to the old single-file site entirely**, also set Pages back to *Deploy from a branch → `main` → `/`*. The legacy `index.html` is still in the repository at the root and is untouched by this work, so the old site returns exactly as it was.

---

## What changed about what is served

| URL | Before | After |
|---|---|---|
| `/` | Single 338 KB page holding all 29 screens | New homepage, ~1/10th the payload |
| `/ai/`, `/automation/`, `/tips/`, `/tools/`, `/maker/` | Did not exist | Category hubs |
| `/<category>/<slug>/` | Did not exist — every article was at `/` | 25 individual article URLs |
| `/sitemap-index.xml`, `/rss.xml`, `/robots.txt` | 404 | Served |
| `/404.html` | None | Served |
| `/Tools/*.zip` | Served (236 KB of Sisense packs) | **No longer served** — see below |

### The `Tools/*.zip` files

Two Sisense visualization packs unrelated to the site were publicly served at `/Tools/`. They are **still in the repository** (nothing was deleted) but are no longer published, for a concrete reason: `/Tools/` collided with the new `/tools/` page route on case-insensitive filesystems, and the brief requires Tools in the navigation.

If those files need to stay downloadable, say so and they can be republished under a non-colliding path such as `/downloads/`.

---

## No redirects are needed

Every screen on the old site lived at the single URL `https://qivy.in/` — there was no routing, no hash, no `pushState`. There are therefore no old article URLs to redirect, and no inbound links to break. `/` keeps working as the homepage.

This is unusual and worth stating plainly: the redesign cannot regress search rankings for article URLs, because no article URL ever existed.
