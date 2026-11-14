# Daily drafting brief

You are writing articles for qivy.in. This file is your whole brief; the
workflow hands you nothing else.

Write **10 articles** this run. If you cannot write ten good ones, write fewer
— a short run is fine and a padded one is not. Nothing you write here is
published without passing the validator in `pipeline/ingest.mjs`, so a draft
that breaks a rule costs that article rather than reaching readers.

## 1. Read the house rules first

`studio/src/pipeline.js` contains a constant named `SYSTEM_PROMPT`. **Read it
and follow it exactly.** It is the editorial standard for this site: reading
level, length limits, the "Reference:" line under every section that explains
how something works, the rule about fencing anything with angle brackets, and
the exact JSON shape to return. It is the same brief the fallback model gets,
so do not improvise a different style.

Two rules from it are worth repeating because breaking them is worse than
writing nothing:

- **Never claim first-hand experience.** You have not run anything. No "I
  tested", no "in my experience", no "when I tried this". Every article is
  published as `verification: researched`, which tells the reader plainly that
  it was checked against documentation and not personally tested. A
  first-person claim makes that line a lie under the owner's byline.
- **Never cite a URL you have not opened.** See step 3.

## 2. Pick your topics

- `pipeline/topics.json` holds the queue. Take topics from the **front** of
  the `queue` array, in order.
- Before writing, read the titles of everything already published in
  `src/content/articles/*.md`. If a queued topic is really the same article as
  one already there, skip it and take the next — say so in your final message
  so the dead topic can be removed.
- Do not invent a topic. A file whose `topic` is not in the queue is rejected
  outright by the next step, so an invented one is wasted work.

## 3. Verify every source by opening it

This matters more than anything else here, and it is the one thing a model
cannot fake:

- **Fetch every URL before you cite it.** Not "this looks like the right
  docs URL" — actually open it.
- Check the page **says what you are citing it for**. A live page that does
  not support the claim is worse than a dead link, because nothing downstream
  can catch it.
- Prefer the **canonical** URL. If the one you tried redirects, cite where it
  landed, not where you started.
- Cite official vendor or project documentation. Never a search result, never
  a site's home page, never an SEO blog repeating the docs.
- If you cannot find a real source for a claim, cut the claim. If that leaves
  the article with nothing, skip the topic and move on.

## 4. Write the files

For each article, write one file to `pipeline/inbox/`:

- Name it `NN-slug.json`, numbered from `01`, e.g. `01-send-a-notification.json`.
- Content is the JSON object `SYSTEM_PROMPT` describes, **plus one extra key**:

```json
{
  "topic": "the exact topic string from topics.json",
  "title": "...",
  "slug": "...",
  "summary": "...",
  "seoTitle": "...",
  "metaDescription": "...",
  "tags": ["..."],
  "sources": ["https://..."],
  "body": "..."
}
```

`topic` must match the queue entry **character for character**. It is how the
queue knows what to remove, and a mismatch means that topic gets rewritten
again tomorrow.

## 5. Do not commit anything

Write files and stop. Do not run git, do not create a branch, do not open a
pull request, do not push. A later step in the same workflow commits whatever
you leave behind, and that step runs the validator first. You should not have
a shell at all — if you find you do, still do not use it for git.

## 6. Finish with a short report

End your run with a few lines saying: how many files you wrote, any topic you
skipped and why, and any source you wanted to cite but could not verify. That
text goes into the workflow run log and is the only record anyone will read.
