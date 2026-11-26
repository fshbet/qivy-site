---
title: 'Have a model name its assumptions before it answers'
summary: 'Ask your AI to list its assumptions before answering so you can spot wrong premises and correct them.'
category: ai
publishDate: 2026-11-26
seoTitle: 'Ask an AI to state its assumptions before answering'
metaDescription: 'A simple prompting trick: make the AI list what it assumes before it gives an answer, so you can fix wrong assumptions before they shape the reply.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/prompt-engineering'
tags:
  - 'ai'
  - 'prompting'
  - 'llm'
---
An AI answer (from an artificial intelligence program) is only as good as the ideas it starts from. If the model (the AI program) guesses wrong about your situation, its reply can lead you astray. Asking it to name those guesses first lets you fix them before you act.

## Make the model list assumptions first

Before it answers, ask the model to write down what it assumes about your question (the ideas it is taking for granted). It is like asking someone giving you directions to say where they think you are starting from before they describe the route.

Reference: [Prompt engineering](https://platform.openai.com/docs/guides/prompt-engineering)

## Use this prompt template

A prompt is the message you send to an AI. Copy and paste this into your chat:

Before you answer, list the assumptions you are making about my question. Be specific about what you think I mean, what context you are missing, and any rules you are assuming. Then answer based on those assumptions.

Here is my question: [paste your question]

1. Open your AI chat.
2. Paste the template above.
3. Replace [paste your question] with your actual question.
4. Send the message.

## Expected result

The model should start its reply with a bulleted list of assumptions. Read that list before the answer. If any assumption is wrong, correct it in a new message and ask again. For example, if it assumes you bought an item in a shop when you bought it online, say so.

Two minutes of checking assumptions can save you from acting on bad advice.
