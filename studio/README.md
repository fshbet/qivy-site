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
| Schema (`topics`, `drafts`, `runs`) | created — recorded in [schema.sql](schema.sql) |
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
  `FALLBACK_MODELS` in `pipeline.js` — currently NVIDIA, then XingChen. They
  are deliberately on different upstream providers: a `429` means the
  primary's shared free pool is busy, and another model from the same vendor
  would queue behind the same wall. The draft page records which model
  actually answered.

  **The chain can hold three models in total, primary included.** OpenRouter
  rejects a longer `models` array with `HTTP 400`, which breaks every run
  including the cron. `node studio/test.mjs` fails if the list outgrows
  that, so add a fallback only by replacing one.
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
serve at all until Access is configured. There are three locks:

1. `workers_dev = false` in `wrangler.toml`. Cloudflare Access protects a
   *hostname*; it does nothing for the `*.workers.dev` URL. Leaving that on
   would publish an unauthenticated copy of this dashboard.
2. `src/access.js` verifies the Access JWT signature against your team's
   public keys, and checks `aud`, `iss` and `exp`. A forged or borrowed
   header does not get in, and a token for one of your *other* Access apps
   does not either.
3. Every POST must come from this app's own pages. Access authenticates the
   *browser*, not the page a request came from — it attaches your
   `CF_Authorization` cookie to a form on someone else's site just as
   readily as to one of ours. Without an origin check, any page you happened
   to visit while signed in could publish to the repository as you. Anything
   other than `Sec-Fetch-Site: same-origin` gets a 403.

   It reads `Sec-Fetch-Site` rather than `Origin` because `Origin` is not
   reliably there. Measured: under `Referrer-Policy: no-referrer` a
   same-origin form POST arrives with `Origin: null` and no Referer, which
   is how the first version of this check came to refuse the dashboard's own
   Generate button. The policy is `same-origin` now, so the `Origin`
   fallback works for a browser too old to send `Sec-Fetch-Site` — and a
   test holds that policy in place, because tightening it back to
   `no-referrer` would silently kill the fallback again.

If `ACCESS_TEAM_DOMAIN` or `ACCESS_AUD` is empty, every request gets a 503
explaining why. An unconfigured gate is an open door.

### What Publish refuses to commit

Markdown does not escape raw HTML — it hands it to the page. An unfenced
`<script>` in an article is not an example of a script tag, it *is* one, and
it runs for every reader of qivy.in.

So Publish refuses a file containing, outside a code fence: `<script>`,
`<iframe>`, `<object>`, `<embed>`, `<base>`, `<meta>`, `<link>`, `<form>`,
`<style>`, `<svg>`, an inline `on…=` handler, or a `javascript:` link. Fenced
examples are untouched — an article about HTML can still show one.

The drafting step only *warns* about raw tags, because at that point nobody
has decided to publish anything. At the Publish button the warning has
already been read past once, so this one is a refusal rather than a note.

Publish also refuses a file containing **any unreachable link** — not just a
dead entry in `sources`, but a dead link anywhere in the prose, since a reader
clicking one neither knows nor cares which it came from. The page ships
`verification: researched`, and that is a promise the links can be followed.

Two details worth knowing, because they decide what this blocks:

- Links inside code fences are ignored. An article about an API has to be able
  to show `POST https://api.example.com/v1/thing` without the placeholder
  having to resolve. A test holds this, because leaking it would mean the fix
  for a stuck Publish button is to delete the example.
- The check runs against the textarea, not the stored draft. The textarea is
  what gets committed, so fixing the link there is what makes Publish pass.

A site that answers 403 to both HEAD and GET reads as dead here, so a live
page behind strict bot protection can block a publish. The way out is to
replace or drop the link, which is the honest fix anyway — there is no
override flag, deliberately.

### What is not covered

- Article frontmatter is model-written and ends up inside the page's JSON-LD.
  `src/layouts/BaseLayout.astro` escapes `<` as `<` there, and
  `scripts/verify-site.mjs` fails the site build if any JSON-LD block stops
  parsing. Both matter: the first stops the breakout, the second notices if
  a future change reintroduces one.
- Nothing here rate-limits the Generate button. One signed-in person pressing
  it repeatedly can spend your OpenRouter quota; Access decides who that
  person is, and that is the whole access-control story.

---

## The honesty guarantees, unchanged from n8n

- `verification` is hard-coded to `researched` in `buildMarkdown()`. There is
  no parameter to change it. The pipeline physically cannot claim an article
  was personally tested — that would be a fabricated claim of first-hand
  experience under your byline.
- A draft with **no source URL throws**. "Researched" without a source is
  unverifiable.
- **Every cited URL is followed before the draft is stored.** The validator
  can only prove a source is shaped like a URL; a model will cite the right
  vendor on a plausible, dead path. All of them dead throws at drafting time,
  because then there is nothing a reader can check; a 404 among several is a
  warning naming it, and then **a refusal at the Publish button** — see
  "What Publish refuses to commit". A redirect is reported with the canonical
  URL rather than treated as a fault — vendors move docs constantly.
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

77 checks over duplicate detection, the validator, Markdown generation, the
model fallback chain, source checking, the HTML that Publish refuses, the
cross-site origin rule, and the Access gate. No framework.

The Access tests generate a real RS256 key with WebCrypto and serve a real
JWKS from a stubbed fetch, so the whole verification path runs — signature,
`exp`, `aud`, `iss`, unknown key, malformed token. What they cannot prove is
that *Cloudflare's* tokens look the way these do; that is an assumption about
the issuer, held against its published format.

What nothing here covers: the D1 and KV bindings, the OpenRouter call and the
GitHub commit. Those need a live environment. All three have run for real and
two articles are published — but that was observed, not asserted.

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
