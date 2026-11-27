---
title: 'Write one prompt that behaves the same on two AI models'
summary: 'Use the same message on two different AI models and get answers in the same shape, so you can compare them fairly.'
category: ai
publishDate: 2026-11-27
seoTitle: 'Same prompt on two AI models'
metaDescription: 'Write one prompt that forces two different AI models to answer in the same format, so you can compare their answers fairly.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/prompt-engineering'
  - 'https://docs.anthropic.com/claude/docs/prompt-engineering'
tags:
  - 'ai'
  - 'prompting'
  - 'llm'
---
You paste the same message into two AI models and get two different shapes of answer. One gives you a list. The other gives you an essay. An AI model is the program behind the chat. A prompt is the message you type into it. You cannot compare the models properly unless the prompt forces both of them to reply in exactly the same format. Format means the shape of the answer: a list, a table, or plain paragraphs.

## Decide what “the same” means

Pick one answer shape before you write the prompt. For example, both models must reply with three numbered lines. Each line must be under twenty words. There must be no introduction and no conclusion.

This is like giving two cooks the same recipe so both dishes come out the same size.

Reference: [Prompt engineering strategies](https://platform.openai.com/docs/guides/prompt-engineering)

## Write the prompt with fixed labels

Use labelled boxes so each model knows where the instructions end and your text begins. Tell the model to answer only with the labels you set. It must add nothing else.

Copy this exact block:

```
Act as a careful assistant. Read the text between <<TEXT>> and <<END>>.
Answer only with this format:

1. Main point: one sentence.
2. Evidence: quote the exact words from the text.
3. Confidence: high, medium, or low.

Do not write an introduction or a conclusion.

<<TEXT>>
PASTE YOUR TEXT HERE
<<END>>
```

Paste the same block into both chat tools. Do not change a word for either model. If either tool has an “improve my prompt” switch, turn it off. That feature rewrites your message behind the scenes.

Reference: [Claude prompt engineering guide](https://docs.anthropic.com/claude/docs/prompt-engineering)

## Expected result

Both replies should begin with “1. Main point:” and finish after “3. Confidence:”. If one model adds a greeting or extra paragraphs, tighten the line “Answer only with this format” and try again. The outputs will not be identical word for word. They will be the same shape, so you can compare them fairly.
