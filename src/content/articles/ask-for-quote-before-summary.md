---
title: 'Ask for the quote before the summary so you can check it'
summary: 'Ask an AI to quote the exact source text before it summarises, so you can verify the quote and catch mistakes.'
category: ai
publishDate: 2026-11-22
seoTitle: 'Ask AI for quote before summary to check accuracy'
metaDescription: 'Stop trusting AI summaries blindly. Ask for the exact quote first, then check it against the source before you read the summary.'
verification: researched
sources:
  - 'https://docs.anthropic.com/claude/docs/citations'
tags:
  - 'ai'
  - 'prompting'
  - 'fact-checking'
  - 'hallucination'
---
An AI summary rewrites a document in its own words. That makes it easy for the AI to insert mistakes you will not notice. Asking for the exact quote first lets you check the source before you trust the summary.

## Why a quote is easier to verify than a summary
A summary is an interpretation. A quote is copy-paste. You can search the original text for the exact words the AI gives you. If those words are not there, the AI is hallucinating — stating something false as if it were true.

Think of it like asking someone to copy a sentence from a page before they explain what the page means. The copied sentence proves they actually read it.

Reference: [Citations](https://docs.anthropic.com/claude/docs/citations)

## The exact prompt to use
Send this pattern every time you ask an AI to summarise something:

"Quote the exact sentence from the source that supports each point. Then summarise the text in one paragraph."

If you are asking about one topic, narrow it down:

"Quote the exact sentence about the refund policy. Then summarise what the document says about refunds."

## Steps to check it yourself
1. Paste the source text into the chat, or upload the document.
2. Send the quote-first prompt above.
3. Copy the quoted sentence and search for it in the source text.
4. Read the summary only if the quote matches the source word for word.

## Expected result
The AI returns the original wording inside quotation marks. You find the same words in the source text. If the AI cannot produce a matching quote, treat its summary as unchecked and read the source yourself.
