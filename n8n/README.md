# Qivy — Daily Content Pipeline (n8n)

**Workflow:** [Qivy — Daily Content Pipeline](https://n8n.qivy.in/workflow/rzIuwCIMlbw1qiGm) (`rzIuwCIMlbw1qiGm`)
**Instance:** `n8n.qivy.in`
**Data table:** `Qivy Content Ledger` (`nt4YIGvd4r5gNydo`)
**Status:** created and validated. **Not activated, no GitHub credential, never executed.**

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
Research and draft article     (AI Agent + OpenRouter — any model)
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

The workflow is created but **will not run correctly until these three things are done.** All three need credentials or decisions that only you can supply.

### 1. Create a GitHub credential — *required*

No GitHub credential exists on the instance, so the four GitHub-facing nodes have an empty placeholder.

1. Create a GitHub personal access token with **`repo`** scope (fine-grained: Contents read/write and Pull requests read/write on `fshbet/qivy-site`).
2. In n8n: **Credentials → New → GitHub API**, paste the token, save.
3. Open the workflow and select that credential on all four nodes:
   - `Get main branch SHA` (HTTP Request — set authentication to *Predefined Credential Type → GitHub API*)
   - `Create draft branch` (same)
   - `Commit article file`
   - `Open pull request`

The two HTTP Request nodes were skipped by n8n's credential auto-assignment and must be set by hand.

### 2. Set the notification recipient — *required*

`Notify admin` has `sendTo: CHANGE_ME@example.com`. Change it to the address that should receive review notifications. It was left as a placeholder deliberately rather than guessing an address.

### 3. Activate the workflow

It is saved **inactive**. Run it manually a few times first (see [Dry run](#dry-run)), then activate when you are happy with the output.

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

Current value: `openai/gpt-4.1` — the exact model the prompt was written against. Only the route to it changed.

### Switching provider

Open **Drafting model** and change `model` to any id from <https://openrouter.ai/api/v1/models>.

| Model id | In / Out per 1M tokens | Notes |
|---|---|---|
| `openai/gpt-4.1` | $2.00 / $8.00 | Current. What the prompt was tuned against. |
| `anthropic/claude-sonnet-4.5` | $3.00 / $15.00 | Strongest at long-form prose and following the structure rules. |
| `google/gemini-2.5-flash` | $0.30 / $2.50 | Cheapest credible option for this job. |
| `deepseek/deepseek-chat` | $0.32 / $0.89 | Cheapest overall. |
| `openai/gpt-4.1-mini` | $0.40 / $1.60 | Same family, lower cost. |

Model ids and prices were read from the OpenRouter API on **2026-11-07** and are accurate as of that date. Prices change; re-check before budgeting on them. Model availability also changes — if an id is rejected, look it up in the list above rather than guessing at a name.

**Not verified:** no article has been drafted through any of these models yet. The pipeline has never run end to end, because it has no GitHub credential. Output quality per model is therefore an expectation, not a measurement.

### Using a provider directly instead of OpenRouter

OpenRouter adds a routing hop. To go direct, delete the `Drafting model` sub-node and drag in the matching chat model node. Credentials that already exist on this instance:

| Want | Node to use | Credential already present |
|---|---|---|
| OpenAI direct | OpenAI Chat Model | `OpenAI account` |
| Groq | Groq Chat Model | `Groq account` |
| Local, free | Ollama Chat Model | `Ollama account` |

Anthropic and Google have no credential on this instance yet; add one first if you want those direct rather than through OpenRouter.

Nothing else in the workflow changes — the agent, the validator, the GitHub steps and the ledger are all provider-agnostic.

### Running locally on Ollama

To draft at no API cost, use the **Ollama Chat Model** with the existing `Ollama account` credential.

Honest expectation: a small local model is fine for ideation, slugs and metadata, but weaker at the tightly-structured, well-sourced prose the editorial rules demand — and the validator is strict, so a weak model will fail the run rather than publish something poor. The practical split is cloud for drafting, local for the mechanical steps.

---

## Costs

- **Drafting** — one call per day through OpenRouter. A 300–700 word article with this system prompt is a small request; at `openai/gpt-4.1` prices that is cents per article, not dollars. Exact cost is not measured, because no run has happened yet.
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
