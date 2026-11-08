# Qivy Studio

The editorial dashboard for qivy.in. A Cloudflare Worker: it drafts an
article every morning, holds it for review, and publishes to the site when
you press the button.

**It replaces the n8n pipeline.** Not because n8n was wrong, but because that
n8n instance runs on a PC at `D:\AI\n8n` behind a Cloudflare Tunnel, so the
06:00 draft silently did not happen whenever the machine was off. This runs
on Cloudflare's own cron and depends on nothing you own being switched on.

```
cron 00:30 UTC (06:00 IST)
   ↓  pick a topic, skip near-duplicates      (D1)
   ↓  draft it                                 (OpenRouter)
   ↓  validate against the editorial rules     — fails loudly, publishes nothing
   ↓  store the draft                          (D1)
        … waits for you …
you press Publish
   ↓  commit the .md to GitHub                 (Contents API)
   ↓  Pages build                              → live on qivy.in
```

There is no email. The queue page is the notification.

---

## What is already done

| | |
|---|---|
| D1 database `qivy-studio` | created — `b6a92c24-9238-4fd1-b778-9e3cbbc02aac` |
| KV namespace `qivy-studio-settings` | created — `e9af20372ba641b692492afc84d9046e` |
| Schema (`topics`, `drafts`, `runs`) | created |
| All 43 ledger rows migrated out of n8n | 25 `published`, 18 `idea` |
| Worker source + deploy workflow | in this repo |
| Logic tests | 18 passing — `node studio/test.mjs` |
| Generated Markdown vs the site's content schema | verified: a generated file builds (37 pages instead of 36) |

Deployed on 2026-11-08, and Cloudflare Access is live on `write.qivy.in`
(team `patient-silence-2588`). **Still to do:** the two API keys in Settings,
step 4 below. Nothing can run until those exist.

---

## Setup

### 1. Cloudflare API token → GitHub secret

Deploys run in GitHub Actions, so you never need wrangler on your machine.

1. <https://dash.cloudflare.com/profile/api-tokens> → **Create Token** →
   **Create Custom Token**.
2. Permissions:
   - Account · **Workers Scripts** · Edit
   - Account · **Workers KV Storage** · Edit
   - Account · **D1** · Edit
   - Zone · **Workers Routes** · Edit — Zone: `qivy.in`
3. Create, copy the token.
4. In GitHub: repo → **Settings → Secrets and variables → Actions → New
   repository secret**. Name it exactly `CLOUDFLARE_API_TOKEN`, paste, save.

### 2. First deploy

Push anything under `studio/`, or run the workflow by hand:

```bash
gh workflow run "Deploy Qivy Studio" --repo fshbet/qivy-site
```

This creates the Worker and the `write.qivy.in` custom domain.

**It will deploy but refuse every request until step 3 is done.** That is
deliberate — see [Why it fails closed](#why-it-fails-closed).

Prefer a different hostname? Change `pattern` in `wrangler.toml`.
`studio.qivy.in` is taken by FunFacts Studio, which is why this is `write.`.

### 3. Cloudflare Access

1. Cloudflare dashboard → **Zero Trust → Access → Applications → Add an
   application → Self-hosted**.
2. Application domain: `write.qivy.in`.
3. Add a policy: **Allow**, include **Emails** → your address. (One-time PIN
   needs no identity provider.)
4. Save, then open the application → **Overview** and copy the
   **Application Audience (AUD) Tag**.
5. Your team domain is in **Zero Trust → Settings → Custom Pages**, shaped
   like `yourteam.cloudflareaccess.com`.
6. Put both into `studio/wrangler.toml`:

   ```toml
   ACCESS_TEAM_DOMAIN = "yourteam.cloudflareaccess.com"
   ACCESS_AUD = "the-long-hex-aud-tag"
   ```

7. Commit and push. The redeploy picks them up.

### Credential expiry

| Credential | Set | Expires |
|---|---|---|
| GitHub PAT `qivy-studio-publish` | 2026-11-08 | **2027-02-06** (90 days, GitHub's cap for this repo) |
| Cloudflare `CLOUDFLARE_API_TOKEN` | 2026-11-07 | never |
| OpenRouter key | 2026-11-08 | never |

When the PAT expires, **Publish** starts returning a GitHub `401` and nothing
else changes — drafting keeps working, so the queue fills while nothing ships.
Regenerate it and paste the new value into Settings. Nothing else records this
date.

### 4. Keys, in the page

Open <https://write.qivy.in> → **Settings**.

- **OpenRouter API key** — from <https://openrouter.ai/keys>.
  Both keys currently on the n8n instance return `401 User not found`, so
  make a fresh one.
- **Model** — defaults to `google/gemma-4-31b-it:free`. Free. One call a day
  is far below OpenRouter's free daily cap. Any id from
  `openrouter.ai/api/v1/models` works; free ones end in `:free`.

  Whatever you set is the *primary*. If it errors, OpenRouter falls through
  `FALLBACK_MODELS` in `pipeline.js` — currently NVIDIA, then XingChen, then
  OpenRouter's auto-router. They are deliberately on different upstream
  providers: a `429` means the primary's shared free pool is busy, and
  another model from the same vendor would queue behind the same wall. The
  draft page records which model actually answered.
- **GitHub token** — fine-grained PAT, **Contents: read and write** on
  `fshbet/qivy-site` only. Used solely when you press Publish.

Keys are written to KV and never rendered back into the page — the form shows
only whether a key is set and its last four characters.

### 5. Try it

**Generate a draft now** on the queue page. Then open the draft, read it
against its cited sources, edit the file in the textarea, and **Publish**.

---

## Why it fails closed

This app can spend money and commit to a public repository, so it refuses to
serve at all until Access is configured. There are two locks:

1. `workers_dev = false` in `wrangler.toml`. Cloudflare Access protects a
   *hostname*; it does nothing for the `*.workers.dev` URL. Leaving that on
   would publish an unauthenticated copy of this dashboard.
2. `src/access.js` verifies the Access JWT signature against your team's
   public keys, and checks `aud`, `iss` and `exp`. A forged or borrowed
   header does not get in, and a token for one of your *other* Access apps
   does not either.

If `ACCESS_TEAM_DOMAIN` or `ACCESS_AUD` is empty, every request gets a 503
explaining why. An unconfigured gate is an open door.

---

## The honesty guarantees, unchanged from n8n

- `verification` is hard-coded to `researched` in `buildMarkdown()`. There is
  no parameter to change it. The pipeline physically cannot claim an article
  was personally tested — that would be a fabricated claim of first-hand
  experience under your byline.
- A draft with **no source URL throws**. "Researched" without a source is
  unverifiable.
- First-person language (`I tested`, `in my experience`) is detected and
  shown as a warning on the draft page for you to rewrite.
- Word count, metaDescription length and slug are checked against the site's
  content schema *before* the draft is stored, so a failure surfaces here
  rather than as a red build after you publish.

**A weak model cannot publish a bad article.** If it cannot hold the output
contract the validator throws, the run is recorded as failed, and no draft
appears. The worst case is a quiet day.

---

## Costs

Everything here is on a free tier at this volume.

| | |
|---|---|
| Worker requests | 1 cron/day + your page views — free tier is 100k/day |
| D1 | a few hundred rows |
| KV | three keys |
| OpenRouter | `:free` model, one call/day |
| GitHub Actions | free on public repos |

---

## Tests

```bash
node studio/test.mjs
```

18 checks over duplicate detection, the validator and Markdown generation.
No framework.

What they do **not** cover: the Access JWT path, D1/KV bindings, the
OpenRouter call and the GitHub commit. Those need a live environment, and
none of them has run yet — the first real draft will be the first proof.

To re-check the schema contract after changing `buildMarkdown()`:

```bash
node studio/test.mjs --emit | sed -n '/^---$/,$p' > src/content/articles/__probe.md && npm run build; rm src/content/articles/__probe.md
```

The build must report one more page than usual.

---

## The old n8n workflow

`Qivy — Daily Content Pipeline` (`rzIuwCIMlbw1qiGm`) is still on the instance
and still **inactive**, so it does nothing. It is left in place as a fallback
until Studio has produced a few articles. Archive it when you are happy.

`n8n/` in this repo is its source of record and documents the same editorial
rules. Delete both once Studio is proven.
