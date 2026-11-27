---
title: 'Use an AI model to find gaps in your notes'
summary: 'Paste your notes into an AI chat and use a prompt to spot missing topics, unanswered questions, and unclear actions before you need them.'
category: ai
publishDate: 2026-11-27
seoTitle: 'Find gaps in your notes with an AI model'
metaDescription: 'Use an AI model to read your notes and list what is missing: unexplained topics, unanswered questions, and actions without an owner.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/chat-completions'
tags:
  - 'ai'
  - 'notes'
  - 'prompting'
---
You have notes from a meeting, a course, or a project. They look finished until you try to act on them and realise something is missing. An AI model (a computer program that has read large amounts of text and can spot patterns) can read your notes and list the gaps before you need them.

## Paste your notes into a chat
1. Open any AI chat you already use, such as Claude, ChatGPT or Gemini.
2. Copy all of your notes and paste them into the message box.
3. Add the prompt below after your notes.
4. Send the message.

The model reads your notes and looks for missing pieces. It works best when you paste everything at once, rather than asking about one paragraph at a time.

Reference: [Chat completions](https://platform.openai.com/docs/guides/chat-completions)

## Use this gap-finding prompt
Copy the text inside the box and paste it after your notes:

```
Read these notes like an editor looking for what is missing.
List:
1. Topics mentioned but never explained.
2. Questions raised but not answered.
3. Actions or decisions with no owner or due date.
4. Anything a newcomer would need to know but cannot find here.

For each gap, quote the exact line from my notes that hints at it, then suggest one sentence to fill it.

Notes:
[PASTE YOUR NOTES HERE]
```

Think of this like asking a friend to read your essay and circle anything confusing.

Reference: [Chat completions](https://platform.openai.com/docs/guides/chat-completions)

## Turn the list into actions
1. Read each gap the model found.
2. Decide if it matters for your project.
3. Fill the ones that do. Ignore the rest.

You do not have to fix every gap. Some notes are meant to be short.

## Expected result
You should see a numbered list of gaps. Each gap includes a quote from your own notes and a short suggestion to fill it. If the model only praises your notes or gives a vague summary, paste the prompt again.
