---
title: 'Cut your AI bill by caching the prompt that never changes'
summary: 'Learn how prompt caching lets you store unchanging AI instructions once and reuse them cheaply on every request.'
category: ai
publishDate: 2026-11-15
seoTitle: 'Prompt caching to cut AI API bills'
metaDescription: 'Reduce your AI costs by caching the part of your prompt that stays the same. A practical guide to prompt caching with official documentation links.'
verification: researched
sources:
  - 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching'
  - 'https://ai.google.dev/gemini-api/docs/caching'
tags:
  - 'ai'
  - 'prompt-caching'
  - 'llm'
  - 'api-costs'
---
Every time you send a message to an AI, you pay for every word it reads—even words it has already seen a hundred times. If your prompt includes the same long instructions or reference text with every request, you are paying to re-read them over and over. Prompt caching lets you store that unchanging part once and reuse it cheaply.

## How prompt caching works

Your AI bill is based on tokens. A token is a chunk of text—about a word or part of a word—that the model reads and charges you for. The system prompt is the standing instructions you give the AI, such as its tone, role, or safety rules. In a normal request, you resend those instructions every time.

With prompt caching, you send the stable part once. The provider stores it and gives you back a reference. Later messages point to that stored copy instead of resending it. The provider bills you less for reading a cached copy than for reading fresh text.

Think of it like pinning a recipe to the fridge instead of copying it out before every meal. You write it once; everyone reads it from the same spot.

Reference: [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

## Check if your provider offers it

Not every AI provider has this feature. Anthropic calls it prompt caching. Google Gemini calls it context caching. Before you change any code, check your provider's pricing page: cached reads usually cost less than fresh tokens, but writing to the cache may carry a small one-off fee.

Reference: [Context caching](https://ai.google.dev/gemini-api/docs/caching)

## Do this before your next request

1. Choose the part of your prompt that never changes. Good candidates are system instructions, background documents, or example questions and answers.
2. Mark that block as cacheable. In your provider's API, this is usually a flag on the message block holding your stable text.
3. Send the changing part—such as the user's actual question—as a separate block without the cache flag.
4. Repeat the same cache flag on later requests. The provider looks up the stored copy and charges you the lower cached rate.

The exact field names vary by provider, so copy the syntax from your provider's documentation rather than guessing.

Reference: [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

## Expected result

Your bill should show cached input tokens separate from fresh ones. Over time, the cost per request drops because the AI is reading less new text with every message. Responses should also arrive slightly faster, since the provider skips re-reading the stored part.
