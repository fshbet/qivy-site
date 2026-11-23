---
title: 'Ask an AI what it needs before you give it the task'
summary: 'Ask an AI to list what it needs before it starts work, so you avoid vague answers and wasted corrections.'
category: ai
publishDate: 2026-11-23
seoTitle: 'Ask AI what it needs before starting'
metaDescription: 'Before you give an AI a task, ask it what information it needs first. A practical prompting technique for better answers in fewer turns.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/prompting'
tags:
  - 'prompting'
  - 'ai'
  - 'llm'
---
You send an AI a task and get back something vague or wrong. You spend the next few messages fixing mistakes it could have avoided if it had asked you one question first. The fix is to make the model list what it needs before it starts work.

## Why asking first works

A model is the AI program that generates text. A prompt is the message you send it. When you send a prompt with a task, the model guesses the missing background details instead of asking. Those guesses create vague answers or incorrect details. Asking the model to name what it needs turns the start of the job into a checklist you can answer in one message.

Context means the background details the model needs to understand the job. Think of it like asking a builder what measurements they need before they quote for a kitchen. You do not hand over the keys and hope for the best.

Reference: [OpenAI prompting guide](https://platform.openai.com/docs/guides/prompting)

## Step 1: Send a setup message first

Before you paste the real task, send this short message:

> I want you to do a task. Before you start, list the information or context you need from me to do it well. Do not start the task yet. Ask any clarifying questions first.

Replace 'a task' with a one-line description of the job, such as 'write a project update email' or 'review this spreadsheet layout'.

## Step 2: Answer its list

Read the model's reply. It should ask for details such as who the audience is, what tone to use, or what data to include. Supply everything missing in a single message. If something does not apply, say so.

Do not drip-feed details across several messages. One complete answer saves time.

## Step 3: Tell it to begin

Once you have given all the details, send this:

> Here is everything. Go ahead and do the task now.

The model now works with your context instead of its own guesses.

## Expected result

The first reply should be a short list of questions, not a finished draft. The final output should need fewer corrections because it was built on your actual details. If the model starts work anyway, repeat the setup message and tell it explicitly not to begin until you reply.

Try it on your next AI task. The few minutes you spend clarifying upfront usually save far more time than rewriting a wrong answer.
