---
title: 'Use a cheap model for the boring half of an expensive job'
summary: 'Split an AI job in two: let a cheap model tidy up while a capable model handles the hard thinking.'
category: ai
publishDate: 2026-11-23
seoTitle: 'Cheap model for boring AI tasks'
metaDescription: 'Split your AI job so a cheap model handles formatting while a capable model does the hard thinking. Practical steps you can try in ten minutes.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/models'
tags:
  - 'ai'
  - 'llm'
  - 'prompting'
  - 'cost-saving'
---
You pay the same high price whether the AI solves a hard problem or merely tidies up a list. Split the job in two. Use the capable model for the hard thinking, and a cheap model for the boring formatting.

## Pick a task with two clear parts
Choose a job that needs thinking, then tidying. For example, turning messy meeting notes into a clean summary with action items (tasks someone must do after the meeting). The thinking part is deciding what matters. The boring part is putting it into a table and fixing spelling.

Comparison: it is like asking a senior editor to rewrite a chapter, then a proofreader to fix commas.

Reference: [Choose a model](https://platform.openai.com/docs/models)

## Ask the capable model to do the thinking only
Open your AI tool. Start a new chat with the model your provider describes as capable or advanced. This is the model meant for hard reasoning, which means working through a problem step by step. Paste your messy notes. Use a prompt like this. A prompt is the instructions you type into the AI.

```
Read these meeting notes. List the decisions made and the action items, with the person responsible for each. Do not add anything that is not in the notes.
```

Copy the model's answer.

Reference: [Choose a model](https://platform.openai.com/docs/models)

## Ask the cheap model to format it
Start a new chat with your provider's cheap, fast model. This model costs less to run because it is smaller and simpler. Paste the answer from the previous step. Use a prompt like this:

```
Turn this into a Markdown table with columns for Decision, Action and Owner. Fix spelling. Do not invent facts or change the meaning.
```

Markdown is a plain-text way to format documents. A Markdown table uses symbols like | and - to make rows and columns.

Copy the final table.

Reference: [Choose a model](https://platform.openai.com/docs/models)

## Expected result
You get a tidy table of decisions and owners. The expensive model was used only for the part that needed judgment. The cheap model handled the formatting.

Use the expensive model for judgment. Use the cheap model for tidying.
