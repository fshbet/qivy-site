# Qivy — Content Strategy

**Date:** 2026-11-07
**Status:** Proposed, awaiting approval
**Depends on:** `CURRENT_STATE_ANALYSIS.md`

---

## 1. Positioning

**Brand line:** AI | AUTOMATION | SMARTER TECHNOLOGY
**Promise:** *Make technology work smarter.*
**Supporting:** *Practical AI, intelligent automation and useful tech tips that save time and make everyday work easier.*

Qivy is a **practical knowledge platform**, not a technology news portal. The distinction drives every editorial decision below:

| Qivy does | Qivy does not |
|---|---|
| "Here is how to do X, in 5 steps, with the exact settings" | "OpenAI announced Y today" |
| Something the reader can apply in 10 minutes | Opinion pieces on where AI is heading |
| Verified instructions against official docs | Rewrites of other people's articles |
| Says when something is untested | Invents benchmarks or personal experience |

The test for any article: **can the reader do something differently in the next 10 minutes?** If not, it doesn't publish.

### 1.1 Why this is a genuine pivot

The current site is 55% 3D printing with **zero AI content** (`CURRENT_STATE_ANALYSIS.md` §4.2). The target is AI-led. This is not a reskin — it is a change of subject. Two consequences worth stating plainly:

1. **The AI pillar starts empty.** Homepage emphasis of ~50% AI cannot be filled from existing content. It needs new articles from day one, and the homepage must degrade gracefully while the pillar is thin (see §6.3).
2. **Existing readers came for 3D printing.** They are not the target audience. Expect the audience to turn over rather than grow continuously. The Maker archive keeps faith with them without holding the site back.

---

## 2. Audience

| Segment | What they want | What they search |
|---|---|---|
| Practical AI users | Get more out of tools they already pay for | "claude prompt tips", "chatgpt summarize pdf" |
| Productivity-focused professionals | Stop doing a repetitive task | "automate google sheets", "schedule report email" |
| Developers & automation enthusiasts | A specific node, API or config pattern | "n8n webhook node", "python send notification" |
| Local-AI / open-source users | Run models without a subscription | "ollama local model", "run llm offline" |
| Business users | Automate work without a developer | "automate invoice data entry" |
| Beginners | Plain instructions that don't assume context | "what is an api", "how to use n8n" |

**Editorial consequence:** write for the person mid-task with a problem, not the person browsing. Open with the problem, not with context-setting. The beginner segment means no unexplained jargon on first use; the developer segment means the actual command or config must be present, not described.

### 2.1 Geographic focus

**India-first where it is material, globally relevant otherwise.**

- Pricing in **₹** alongside USD where a tool's India pricing differs or where local payment methods matter.
- Note India availability when a tool is region-locked.
- Call out local context where it changes the answer (bandwidth constraints for large model downloads, UPI/GST in automation examples, Indian SaaS alternatives).
- **Do not** localise AI technique content. A prompting technique is not regional; forcing an India angle onto it reads as filler.

---

## 3. Category architecture

Four public categories, weighted deliberately unequally.

| Category | Homepage emphasis | Role |
|---|---|---|
| **AI** | ~50% | Primary identity. What Qivy is known for. |
| **Automation** | ~30% | Second pillar. Already has real content. |
| **Tips & Tricks** | ~15% | Supporting. Broad, searchable, low-effort-to-read. |
| **Tools** | ~5% | Reference/directory. Supports the other three. |
| *Maker (archive)* | 0% on homepage | Legacy. Accessible, linked from footer, not surfaced. |

These are **emphasis targets for homepage real estate and internal linking**, not a publishing quota. A good automation week beating a thin AI week is correct; forcing an AI article to hit a ratio is not.

### 3.1 AI — subtopics
- AI tools and applications
- ChatGPT and other AI assistants
- Claude and coding agents
- Local AI and open-source models (Ollama, llama.cpp, LM Studio)
- Prompt engineering
- AI productivity tips
- Image and video generation

### 3.2 Automation — subtopics
- n8n workflows
- Python automation
- Google Sheets automation
- API integrations
- Browser and desktop automation
- Business process automation
- Self-hosted automation

**Existing reusable content:** `page-auto-n8n-start`, `page-auto-linkedin-auto`, `page-auto-rss-newsletter` move here directly. `page-auto-printer-alerts` is automation taught through a 3D-printing example — keep in Automation, cross-link to Maker.

### 3.3 Tips & Tricks — subtopics
- Windows tips
- Browser productivity
- Developer shortcuts
- AI usage tips
- Useful software features
- Troubleshooting
- Everyday technology solutions

**Existing reusable content:** the Data pillar lands mostly here — `page-data-sheets-dashboard`, `page-data-python-pandas` are practical tutorials. `page-data-powerbi-intro` and `page-data-looker-studio` are tool-led and fit Tools.

### 3.4 Tools — structure
A directory, not an article stream. Each entry:

- Name
- One-line description
- Main use case
- Free / paid status — **only where verified**, with the date checked
- Official website link

**Hard rule:** no fabricated pricing, no fabricated capabilities, no invented limits. If a plan's price isn't confirmed from the vendor's own page on the day of writing, the field says *"check current pricing"* and links out. Pricing rots fast and wrong pricing is the fastest way to lose trust.

### 3.5 Maker — the archive

Per your instruction: **the 3D printing content stays and stays public.** It represents real content and SEO investment. It stops being the first thing visitors see.

- Lives at `/maker/` with its own hub page.
- Linked from the footer, not the primary navigation.
- 16 screens move across, including the 11-page filament knowledge base.
- The filament knowledge base is the most reference-like, most linkable material on the site — it keeps its own hub at `/maker/filaments/`.
- Carries a short standing note: *"Qivy's earlier focus. Kept because it's still useful."*
- **Not deleted, not noindexed, not thinned.** Archive means de-emphasised, not hidden.

---

## 4. Article format

### 4.1 Length

| Type | Words | When |
|---|---|---|
| Quick tip | 150–300 | One setting, one shortcut, one command |
| **Standard (default)** | **300–700** | Most articles |
| Tutorial | 700–1,500 | Genuinely multi-step; only when the subject requires it |

Length is an outcome, not a target. Padding a 200-word tip to 700 words to look substantial is the exact failure mode this strategy exists to prevent.

### 4.2 Required structure

Every article:

1. **Clear, searchable title** — phrased as the thing the reader would type
2. **Short problem statement** — 1–3 sentences, no preamble
3. **The practical solution**
4. **Numbered steps** where there is a sequence
5. **Code or configuration** where relevant, copy-pasteable and complete
6. **Screenshot or illustration** where it saves a paragraph
7. **Expected result** — how the reader knows it worked
8. **Short conclusion** — one or two sentences, or none
9. **2–4 relevant internal links**
10. **SEO title + meta description**

### 4.3 Banned patterns

- "In today's fast-paced world…" and every variant
- Restating the title as the first sentence
- "In conclusion, as we have seen…"
- Explaining what AI is before an AI tip
- Hedged non-answers ("it depends on your use case") without then giving a recommendation
- Listicles padded to a round number
- A "Frequently Asked Questions" block invented to add length

### 4.4 Quality rules — non-negotiable

These are the rules that make daily automation safe. They are enforced at the approval gate, not suggested.

1. **Never publish fabricated facts or unsupported claims.**
2. **Verify technical instructions before publishing.** Commands, flags, node names, menu paths and version numbers get checked against official documentation.
3. **Prefer official documentation and reliable sources.** Link them.
4. **Never rewrite another site's article.**
5. **No duplicate or near-duplicate articles.** Enforced mechanically — see §5.3.
6. **Never present outdated information as current.** Date version-sensitive claims.
7. **Never invent personal experience, product testing, or performance results.** The current site's voice is first-person and experiential ("what I actually think", "my actual usage"). **An automated pipeline must not write in that voice.** This is the single highest-risk failure in the whole plan: a generated article claiming "I tested this for 3 months" is a fabrication published under your name.
8. **Distinguish tested from researched.** Every article carries one of two badges:
   - **Tested** — the author ran it. Only a human can set this.
   - **Researched** — verified against documentation, not personally run. **This is the default for all generated content.**

Rule 7 and rule 8 together are what let a daily engine run without damaging credibility. They are not optional.

---

## 5. Daily publishing model

One useful article per day. Not news, not filler, not long generic blogs.

### 5.1 Weekly mix

| Day | Category | Type |
|---|---|---|
| Mon | AI | Tip or technique |
| Tue | Automation | Workflow or script |
| Wed | AI | Tool or feature |
| Thu | Tips & Tricks | Software/productivity |
| Fri | Automation | Practical workflow |
| Sat | AI | Demonstration or walkthrough |
| Sun | AI / Tools | Tool spotlight or lighter tip |

≈ 4 AI, 2 Automation, 1 Tips per week — matching the ~50/30/15 emphasis. Treat as a default rota, not a contract; a strong topic wins over the slot.

### 5.2 Topic seeds

Starter examples, by category. These are illustrative, not a queue — the real queue needs to be built and tracked (§5.3).

**AI**
- Writing better prompts in Claude — the three changes that matter most
- Reusable instructions to stop repeating yourself every session
- Running a model locally with Ollama — from install to first answer
- Summarising a long PDF without losing the detail that matters
- AI features people pay for and never use
- Getting consistent output format instead of fighting it every time

**Automation**
- Updating a Google Sheet from n8n on a schedule
- Sending a notification from Python in 15 lines
- A scheduled workflow with no paid services
- Connecting two apps with a webhook when neither has an integration
- Automating repetitive file renaming and sorting
- The five n8n nodes that cover most real workflows

**Tips & Tricks**
- Windows shortcuts that actually save time
- Browser features that replace an extension
- VS Code settings worth changing on day one
- Free tools that replace paid ones
- Fixing the three most common "it just stopped working" problems

### 5.3 Duplicate prevention

Required, because a daily generator will otherwise re-cover its own ground within weeks.

A content ledger with one row per article:

| Field | Purpose |
|---|---|
| Topic | Canonical topic string |
| Category | AI / Automation / Tips / Tools / Maker |
| Article title | |
| Article slug | URL |
| Content | Body |
| Source references | Links verified during research |
| SEO title | |
| Meta description | |
| Image | Thumbnail path |
| Status | `idea` → `drafted` → `in-review` → `approved` → `scheduled` → `published` → `rejected` |
| Created date | |
| Scheduled date | |
| Published date | |
| Verification | `tested` / `researched` |

The generator **must** check proposed topics against every existing row — published and rejected — before drafting. A rejected topic stays in the ledger precisely so it is not proposed again.

Matching on exact title is insufficient; "Write better Claude prompts" and "How to improve your Claude prompting" are the same article. Needs slug comparison plus a similarity check on the topic string, with near-matches surfaced to the human rather than auto-rejected.

### 5.4 The approval gate

```
Schedule → pick topic → check ledger for duplicates → research &
verify sources → draft to Qivy guidelines → generate thumbnail →
SEO metadata + tags → SAVE AS DRAFT → notify admin
                                           ↓
                              human reviews, edits, approves
                                           ↓
                                       publish
```

**Nothing publishes without human approval.** Auto-publish stays off unless you explicitly enable it as a separate, deliberate configuration — and §4.4 rule 7 is the reason. Automated content published unreviewed under a first-person byline is how a knowledge platform loses its credibility in one bad article.

Verified constraint on this: **no content generation or publishing workflow currently exists** in the reachable n8n instance — it holds 2 unrelated workflows (`CURRENT_STATE_ANALYSIS.md` §5). This pipeline is new build, not a modification.

### 5.5 Local AI option

Support **Ollama** as an alternative to cloud providers for drafting, per the brief's cost constraint. Realistic assessment: a locally-run small model is adequate for topic ideation, slug generation, and metadata; it is weaker at the verified, well-structured prose the quality rules demand. Recommend cloud for drafting, local for the mechanical steps, and keep the provider swappable rather than hardcoded.

---

## 6. Homepage content model

### 6.1 Emphasis

| Area | Share |
|---|---|
| AI | 50% |
| Automation | 30% |
| Tips & Tricks | 15% |
| Other technology | 5% |

Expressed as homepage real estate and internal linking weight — not a publishing quota.

### 6.2 Sections

- **Hero** — "Make Technology Work Smarter." CTAs: *Explore AI* (primary), *Discover Automation* (secondary). Visual must read as AI/automation, not 3D printing.
- **Core categories** — AI, Automation, Tips & Tricks, with the subtopics from §3.
- **Today's Tips** — prominent, card-based, newest first. Each card: image, category, title, one-line description, reading time, publication date, read link.
- **AI Spotlight** — one tool, feature or technique. Concise and actionable.
- **Automation Spotlight** — one workflow as problem → solution → expected result.
- **Useful Tools** — selected entries per §3.4 rules.
- **Newsletter** — "Stay Ahead. Work Smarter." / *"Get practical AI tips, automation ideas and useful technology tricks delivered regularly."*
- **Footer** — About, AI, Automation, Tips & Tricks, Tools, **Maker archive**, Contact, Privacy, Terms, social.

### 6.3 The cold-start problem

At launch the AI pillar has **zero articles** while Maker has 16. A homepage weighted 50% AI would render mostly empty.

Recommended handling:
- Write a **seed set of 8–10 AI articles before launch** — roughly 2 weeks of the daily rota, produced and reviewed up front. This is the single biggest prerequisite for the redesign landing well, and it is content work, not code.
- Until the seed set exists, let "Today's Tips" draw from all non-Maker categories, so Automation and Tips fill the space rather than placeholders.
- Never render an empty section with filler cards. If a section has nothing, it does not render.

### 6.4 Newsletter — honesty requirement

The current newsletter control is `onclick="alert('Subscribed!')"` with no backend (`CURRENT_STATE_ANALYSIS.md` §4.5). It collects an address and discards it while claiming success.

**It must not survive the redesign in that form.** Either wire a real provider, or remove the control until one exists. Shipping a redesign that keeps a fake subscribe button is worse than shipping without a newsletter — it is the one element on the page that actively deceives.

---

## 7. Content migration

Per your instruction: **nothing is deleted.**

| Existing | Destination | Action |
|---|---|---|
| 11 filament pages | `/maker/filaments/` | Move, keep as a KB hub |
| `bambu-review`, `cable-rack`, `starter-guide`, `filament-compare`, `slicer-settings` | `/maker/` | Move |
| `page-auto-n8n-start`, `linkedin-auto`, `rss-newsletter` | **Automation** | Reclassify — direct fit |
| `page-auto-printer-alerts` | **Automation** | Reclassify, cross-link to Maker |
| `page-data-sheets-dashboard`, `page-data-python-pandas` | **Tips & Tricks** | Reclassify as practical tutorials |
| `page-data-powerbi-intro`, `page-data-looker-studio` | **Tools** | Reclassify as tool-led |
| `page-tools` | **Tools** | Rebuild to the §3.4 schema |
| `page-about` | **About** | Rewrite for the new positioning |
| `page-home` (3D-led) | — | Replaced by the new homepage |

Each migrated article additionally needs: a real URL, a `title`, a `meta description`, an OG image, a reading time, a verification badge (§4.4 rule 8 — existing first-person articles are legitimately **Tested**, since you wrote them), and 2–4 internal links.

**Redirects:** none required. Every screen currently lives at `https://qivy.in/` with no distinct URL (`CURRENT_STATE_ANALYSIS.md` §4.1), so there is no inbound URL to redirect. The new URLs are purely additive. `https://qivy.in/` itself keeps working as the homepage.

**Dating:** the migrated articles have no publication dates in the current markup. They need dates to render correctly. Inventing specific dates would breach §4.4; use the git commit dates that introduced them, or mark them with a month only, and say which was done.

---

## 8. Measurement

Cannot be measured today — there is no analytics (`CURRENT_STATE_ANALYSIS.md` §5). Installing something privacy-respecting is a prerequisite for any of this.

| Question | Metric |
|---|---|
| Are articles findable? | Indexed pages; impressions in Search Console |
| Is the daily engine holding? | Published/week; approval-queue age |
| Is the content useful? | Time on page; scroll depth on step lists |
| Is AI becoming the identity? | Share of entries landing on AI pages |
| Is the archive still earning? | Maker traffic — expect flat, not zero |

**Leading indicator to watch:** approval-queue age. If drafts sit unreviewed for more than two days, the engine is producing faster than it can be governed, and the right response is to slow generation — not to relax the gate.

---

## 9. Open questions

1. **Seed content** — will you write the 8–10 launch AI articles (§6.3), or should the pipeline draft them for your review first?
2. **Newsletter provider** — which one, or remove the control for now?
3. **Verification badges** — surface **Tested** / **Researched** visibly to readers? Recommended: yes. It is the mechanism that makes a daily automated cadence trustworthy rather than suspicious.
4. **Migrated article dates** — git commit dates, or month-only?
5. **Social links** — the footer calls for them; which accounts?
