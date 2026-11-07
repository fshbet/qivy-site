# Qivy — Daily Content Pipeline (n8n)

**Workflow:** [Qivy — Daily Content Pipeline](https://n8n.qivy.in/workflow/rzIuwCIMlbw1qiGm) (`rzIuwCIMlbw1qiGm`)
**Instance:** `n8n.qivy.in`
**Data table:** `Qivy Content Ledger` (`nt4YIGvd4r5gNydo`)
**Status:** created and validated. **Not activated. Never executed successfully.** Three blockers, all verified against the live instance — see [Before the first run](#before-the-first-run).

### Does this publish an article every day?

**Not today, and not without you.** Three separate things stand between this workflow and a daily article:

1. **It is inactive.** `active: false`. The 06:00 schedule does not fire.
2. **It has no GitHub credential**, so even a manual run would fail at the branch-creation step.
3. **By design, it never publishes.** It drafts and opens a pull request, then stops. An article goes live only when a human merges that PR — which triggers the site build.

So the realistic cadence once it is wired up is **one draft per day, and one published article per day only if you review and merge one per day.** The schedule automates the writing, not the deciding. That gate is deliberate: the model cannot verify its own instructions, and an unreviewed article carries your name.

Source of record: [`qivy-daily-content.workflow.ts`](./qivy-daily-content.workflow.ts). Edit there and re-apply rather than only editing in the n8n UI, so the pipeline stays reviewable alongside the site.

---

## What it does

```
Daily 06:00
   ↓
Read content ledger            (Data Table — every row)
   ↓
Pick topic + duplicate check   (Code — Jaccard similarity)
   ↓
Research and draft article     (AI Agent + OpenRouter — free model)
   ↓
Generate thumbnail             (disabled by default)
   ↓
Validate draft + build Markdown (Code — enforces the editorial rules)
   ↓
Get main branch SHA → Create draft branch → Commit file → Open PULL REQUEST
   ↓
Mark topic as in-review        (Data Table)
   ↓
Notify admin                   (Gmail)
```

**The pull request is the approval gate and the editorial dashboard.** The workflow never publishes. Merging a PR publishes the article on the next build; closing it rejects the topic, which stays in the ledger so it is not proposed again.

---

## Before the first run

The workflow is created but **will not run until these three things are done.** All three need a credential or a decision only you can supply. Each one was verified against the live instance on 2026-11-07, not assumed.

### 1. Fix the OpenRouter credential — *required*

**Verified broken.** Both OpenRouter credentials on the instance — `OpenRouter Fshbet` and `OpenRouter soocuteofu` — return `401 User not found` when actually called. This was found by running a throwaway test workflow against each, not by inspection.

1. Go to <https://openrouter.ai/keys> and create a key (or copy an existing working one).
2. In n8n: **Credentials → `OpenRouter Fshbet` → API Key**, paste, **Save**.
3. Press **Test** on the credential. It must come back green before going further — n8n's test only checks the key, so a green result here is the real signal.

The key needs no credit for a `:free` model, but the account balance must not be *negative* — OpenRouter blocks free models on a negative balance.

### 2. Create a GitHub credential — *required*

No GitHub credential exists on the instance, so the four GitHub-facing nodes have an empty placeholder.

1. Create a GitHub personal access token with **`repo`** scope (fine-grained: Contents read/write and Pull requests read/write on `fshbet/qivy-site`).
2. In n8n: **Credentials → New → GitHub API**, paste the token, save.
3. Open the workflow and select that credential on all four nodes:
   - `Get main branch SHA` (HTTP Request — set authentication to *Predefined Credential Type → GitHub API*)
   - `Create draft branch` (same)
   - `Commit article file`
   - `Open pull request`

The two HTTP Request nodes were skipped by n8n's credential auto-assignment and must be set by hand.

### 3. Set the notification recipient — *required*

`Notify admin` has `sendTo: CHANGE_ME@example.com`. Change it to the address that should receive review notifications. It was left as a placeholder deliberately rather than guessing an address.

### 4. Dry run, then activate

It is saved **inactive**, and should stay that way until a manual run has produced a pull request you are happy with. See [Dry run](#dry-run).

Order matters: fix the OpenRouter key first and run once — if the drafting step fails, you learn that without having created a GitHub token yet.

---

## The content ledger

Data table `Qivy Content Ledger`, already seeded with **43 rows**:

- **25 `published`** — every article currently in the repo. These exist so the duplicate check can see them; without this the pipeline would happily re-propose "PLA filament guide" in week one.
- **18 `idea`** — about two weeks of queued topics, weighted roughly 8 AI / 6 automation / 4 tips.

### Columns

| Column | Use |
|---|---|
| `topic` | Canonical topic string — what the duplicate check compares |
| `category` | `ai` / `automation` / `tips` / `maker` |
| `title`, `slug` | Filled in by the pipeline once drafted |
| `status` | `idea` → `in-review` → `published`, or `rejected` |
| `seoTitle`, `metaDescription`, `sources`, `tags` | Filled in by the pipeline |
| `prUrl` | Link to the review PR |
| `image`, `notes` | Optional |
| `createdDate`, `scheduledDate`, `publishedDate` | Optional |

The article **body is deliberately not stored here** — it lives in the pull request and then in the repo. Keeping a second copy in the ledger would only let the two drift apart.

### Adding topics

Add rows with `status = idea`, a `topic`, and a `category`. The pipeline takes the first idea that passes the duplicate check.

---

## Duplicate prevention

Exact-title matching is not enough: *"Write better Claude prompts"* and *"How to improve your Claude prompting"* are the same article. The `Pick topic + duplicate check` node therefore uses **Jaccard similarity** over 4+ character word tokens, comparing each queued idea against every row that is published, drafted, in-review, approved, scheduled **or rejected**.

- Similarity **< 0.5** → the topic is used.
- Similarity **≥ 0.35** → used, but the PR carries a similarity warning.
- **Every** idea ≥ 0.5 → nothing is drafted; the run emits a `blocked` item naming the closest match, so a human decides rather than the pipeline silently publishing a near-duplicate or silently doing nothing.

Rejected topics stay in the ledger precisely so they are not proposed again.

---

## Guardrails

These are enforced in code, not by convention, because a daily pipeline needs a gate nobody has to remember.

| Guardrail | Where | Behaviour |
|---|---|---|
| **`verification` is always `researched`** | `Validate draft + build Markdown` | Hard-coded. The pipeline can never emit `tested`. It has not run anything, so claiming first-hand testing under your byline would be a fabrication. Only a human can set `tested`. |
| **At least one source URL** | same node | The run **fails** with no sources. An article marked "verified against documentation" with no documentation cited is unverifiable. |
| **No first-person experience** | system prompt + same node | The prompt forbids it; the code then regex-scans the draft for `I `, `my `, `in my experience`, `we tested`… and puts a loud warning block in the PR body. |
| **No auto-publish** | workflow shape | There is no publish step. The only path to the live site is a human merging the PR. |
| **Schema compliance** | same node, plus CI | Field lengths mirror `src/content.config.ts`, so a bad draft fails here rather than breaking the site build. CI re-checks on the PR. |
| **Secrets** | n8n credential store | No tokens in the repo or in any frontend file. |

---

## Dry run

Before activating:

1. Complete the three setup steps above.
2. Open the workflow and click **Execute workflow**.
3. Expected: a new branch `draft/<date>-<slug>`, a pull request on `fshbet/qivy-site` titled `Draft: …`, the ledger row flipped to `in-review` with `prUrl` filled, and an email.
4. **Read the PR before merging.** Check the commands and version numbers against the cited docs. This is the step the whole design exists to protect.
5. To discard the test: close the PR and delete the branch, then set the ledger row back to `idea`.

---

## Choosing the model

The `Drafting model` sub-node is an **OpenRouter Chat Model**. That is the whole configuration surface: OpenRouter fronts OpenAI, Anthropic, Google, DeepSeek, Meta and others behind one key, so changing provider is **editing one field**, not editing the workflow.

**Current value: `google/gemma-4-31b-it:free` — zero cost.**

### Why a free model is the right default here

OpenRouter's own docs say free models "have low rate limits ... and are usually not suitable for production use". That warning is about volume. **This pipeline makes one model call per day.** One call a day sits far below the free daily cap on any account tier, so the usual reason to avoid free models does not apply.

Two things to know about the free tier, both from OpenRouter's documentation:

- The cap is a **number of requests per day**, shared across all free models. (The published figure depends on whether you have ever bought credits. Check yours at `GET https://openrouter.ai/api/v1/key` — the `free_model_daily_requests` field.)
- **A negative credit balance blocks free models too.** If free calls start failing with a 402, top the balance back above zero.

### Free options

| Model id | Notes |
|---|---|
| `google/gemma-4-31b-it:free` **(current)** | Known Google instruct family; supports a JSON response format, which this pipeline's strict output contract benefits from. |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | Far larger model, 1M context. Does **not** advertise `response_format` support, so JSON adherence rests on the prompt alone. |
| `google/gemma-4-26b-a4b-it:free` | Smaller sibling of the current pick. |
| `openrouter/free` | OpenRouter's Free Models Router — auto-selects a free model per request. Convenient, but the least predictable, which is a poor match for a strict output contract. |

Full list: <https://openrouter.ai/models?max_price=0>

### Paid options, if free output is not good enough

| Model id | In / Out per 1M tokens | Notes |
|---|---|---|
| `google/gemini-2.5-flash` | $0.30 / $2.50 | Cheapest credible paid option. |
| `deepseek/deepseek-chat` | $0.32 / $0.89 | Cheapest overall. |
| `openai/gpt-4.1` | $2.00 / $8.00 | What the system prompt was originally written against. |
| `anthropic/claude-sonnet-4.5` | $3.00 / $15.00 | Strongest at long-form prose and structure rules. |

At one 300–700 word article per day, even the dearest option here is cents per article. The reason to stay free is that it costs nothing, not that paid is expensive.

**Model ids and prices were read from the OpenRouter API on 2026-11-07** and were correct then. Both change. If an id is rejected, look it up in the live list rather than guessing a name.

### Not verified

**No article has been drafted through any of these models.** Both OpenRouter credentials on this instance return `401 User not found`, so the drafting step has never executed — see [Before the first run](#before-the-first-run). Everything above about model *quality* is reasoning from published specifications, not measurement.

What *is* certain is the failure mode. If a weak model cannot hold the JSON contract, `Validate draft + build Markdown` throws and the run stops. No branch, no pull request, no article. **A weak model produces nothing; it cannot produce a bad article.** That is why trying a free model costs you a failed run at worst.

If runs fail on JSON parsing, the first thing to try is **Options → Response Format → JSON** on the `Drafting model` node, before changing model.

### Using a provider directly instead of OpenRouter

To skip the routing hop, delete the `Drafting model` sub-node and drag in the matching chat model node. Credentials already on this instance:

| Want | Node | Credential present |
|---|---|---|
| OpenAI direct | OpenAI Chat Model | `OpenAI account` |
| Groq | Groq Chat Model | `Groq account` |
| Local, free | Ollama Chat Model | `Ollama account` |

Anthropic and Google have no credential here yet.

Nothing else in the workflow changes — the agent, validator, GitHub steps and ledger are all provider-agnostic.

### Running locally on Ollama

Use the **Ollama Chat Model** with the existing `Ollama account` credential. Free, and nothing leaves your machine.

Honest expectation: a small local model is fine for ideation, slugs and metadata, but weaker at the tightly-structured, well-sourced prose the editorial rules demand. Same failure mode as above — it fails the run rather than publishing something poor.

---

## Costs

- **Drafting** — **₹0 / $0.** One call per day on a `:free` OpenRouter model. Switching to a paid model would be cents per article, not dollars.
- **Thumbnail generation** — the `Generate thumbnail (disabled)` node is **off**. Every run would otherwise be a paid image call, and the site already renders a category-tinted placeholder for articles without an image. It still uses the OpenAI credential directly, not OpenRouter. Enable it only if you want generated thumbnails.
- **GitHub Actions** — free on public repositories.
- **n8n** — your existing self-hosted instance.

---

## Monitoring

The metric worth watching is **approval-queue age**. If drafts sit unreviewed for more than two days, the pipeline is producing faster than it can be governed — slow the schedule down rather than relaxing the gate.

Check open PRs:

```bash
gh pr list --repo fshbet/qivy-site --label "" --state open
```
