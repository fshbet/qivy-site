---
title: 'Ask a model to argue against its own answer'
summary: 'Ask an AI to critique its own answer before you trust it.'
category: ai
publishDate: 2026-11-24
seoTitle: 'Ask a model to argue against its own answer'
metaDescription: 'Make an AI check its own work by asking it to argue against the answer it just gave. Practical steps and expected results.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/prompting'
tags:
  - 'ai'
  - 'prompting'
  - 'self-critique'
---
You ask an AI a question and it gives you a confident answer. That answer can still be wrong, incomplete, or biased toward saying yes. Asking the model to argue against its own answer forces it to look for holes before you trust it.

## Why asking a model to argue against itself works

A language model is an AI that predicts the next word, so it often agrees with its first answer instead of checking it. When you tell it to argue against that answer, you ask it to search for weaknesses, missing costs, or cases where the advice does not apply. This is called self-critique, which means the model reviews its own output for flaws. It is like asking a friend to play devil's advocate after you announce a decision.
Reference: [Prompting strategies](https://platform.openai.com/docs/guides/prompting)

## Step 1: Get the first answer

Ask your question as you normally would. For example:

What are the best ways to save money on electricity at home?

Read the model's reply before moving on.

## Step 2: Ask it to argue against that answer

Send a follow-up message in the same conversation. Example:

Now argue against the answer you just gave. List reasons why those electricity-saving tips might not work, could cost more than they save, or could be wrong for some households. Be harsh.

The model should produce objections and counter-examples rather than repeating its first answer.

## Step 3: Compare both sides

Read the original answer and the counter-argument side by side. Look for risks the first answer ignored. You can then ask:

Based on both answers, what should I actually do?

This gives you a balanced view instead of one confident paragraph.

## Expected result

The model should list limitations, hidden costs, or alternative viewpoints that were missing from the first reply. If it simply defends its original answer, rephrase your follow-up to say: Assume the first answer is wrong and prove it.
