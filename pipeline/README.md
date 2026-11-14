# The article pipeline

Claude drafts the articles, GitHub publishes five a day, and none of it needs
your PC switched on. The queue, the drafts and the published files all live in
this repository, so there is no database to keep in step with it.

```
.github/workflows/articles.yml   01:00 UTC daily (06:30 IST)
   ↓  check.mjs      refuse a broken queue before spending a model call
   ↓  Claude         reads PROMPT.md, writes JSON into inbox/
   ↓  ingest.mjs     validates each one, writes drafts/ or needs-review/
   ↓  draft.mjs      ONLY if Claude produced nothing — OpenRouter fallback
   ↓  promote.mjs    up to 5 clean drafts → src/content/articles/
   ↓  git commit     → Pages build → live on qivy.in
```

## What you have to do once

The GitHub App, then two secrets. A token on its own is not enough — the first
run of this workflow failed with *"Claude Code is not installed on this
repository"*, because the action authenticates as the Claude GitHub App and
the token only says who it is acting for.

**1. The app and the token together.** From a terminal in this repository,
signed in to Claude Code and with `gh auth login` done:

```bash
claude
```

Then type `/install-github-app`. It installs the app, stores
`CLAUDE_CODE_OAUTH_TOKEN` as a repository secret for you, and offers to add
workflow files — **choose "Skip for now"** for that last part, since
`articles.yml` already exists and you do not want it overwritten. Needs repo
admin, and the token is tied to whoever runs it, so it has to be you.

The manual route is <https://github.com/apps/claude> to install the app, then
`claude setup-token` and paste the result into **Settings → Secrets and
variables → Actions**. `gh secret set CLAUDE_CODE_OAUTH_TOKEN` prompts for the
value instead of putting it in your shell history.

**2. `OPENROUTER_API_KEY`** — the fallback writer, the same key the Studio
dashboard uses. From <https://openrouter.ai/keys>. Without it, a run where
Claude fails produces nothing at all.

One thing to know about the schedule: GitHub runs scheduled workflows only
from the default branch, and on a **public** repository it disables the
schedule after 60 days with no repository activity. This one commits daily, so
that clock never runs down — but it is why a long quiet spell would stop it.

## The directories

| Directory | What is in it | Published automatically? |
|---|---|---|
| `inbox/` | Raw JSON from Claude, before validation | No — deleted on success, kept on rejection as evidence |
| `drafts/` | Validated, clean, waiting for its turn | **Yes**, 5 a day |
| `needs-review/` | Validated but carrying a warning | **No.** Only you publish these |
| `blocked/` | Refused at the gate — a dead link, raw HTML | No |

`needs-review/` is the important one. A draft lands there when
`holdWarnings` says it needs a person: first-person language (a fabricated
claim of experience under your byline), a near-duplicate, an unfenced tag that
eats its own example, a length outside the house rules, or sources where not
one could be verified. `promote.mjs` never reads that directory, which is the
entire mechanism — a schedule cannot publish those, only you can.

A redirect note, or one unverified source among several, does **not** hold a
draft. Those are notes, not judgements. That line is drawn by `holdWarnings`
in `studio/src/index.js`, imported here rather than restated, so the rule
cannot drift between the two systems.

## Running it by hand

```bash
node pipeline/check.mjs                      # queue sanity, no network
node pipeline/ingest.mjs --dry-run           # validate inbox/, change nothing
node pipeline/promote.mjs --dry-run          # decide, print, change nothing
node pipeline/promote.mjs --limit 2          # publish two
OPENROUTER_API_KEY=... node pipeline/draft.mjs --count 1
```

Every script takes `--dry-run`. Use it: `promote.mjs` moves files and rewrites
`publishDate`, and that is not a thing to discover by accident.

## Why the gates are imported, not rewritten

`validateDraft`, `checkSources`, `publishedLinks`, `dangerousHtml`,
`buildMarkdown` and `holdWarnings` all come from `studio/`. They are the same
functions the Cloudflare dashboard runs, with 95 tests behind them, and
re-implementing them here would have produced a second set of publishing
rules free to disagree with the first. "Claude wrote it" buys no exemption:
every article goes through the identical validator the free model's output
does.

## What happened to the Cloudflare Worker

It is still deployed and still works — the dashboard at `write.qivy.in`
reviews and publishes the drafts already in D1, and its Generate button still
drafts one on demand.

Its **cron is off** (`crons = []` in `studio/wrangler.toml`). That is required,
not tidiness: `topics.json` was copied out of D1, so both systems hold the
same topics, and leaving the cron on would have had each of them drafting the
same topic on the same day with neither aware of the other.

## Topics

`topics.json` is the queue; the front of the array is next up. Dedup history
is **not** mirrored here — it is read from `src/content/articles/*.md`, which
cannot drift out of step with what is actually published.

`check.mjs` warns when there is under three days of runway. At 10 a day, 55
topics is five days. Topping it up is the one part of this nobody has
automated, and it is the part that stops the whole thing when it runs out.
