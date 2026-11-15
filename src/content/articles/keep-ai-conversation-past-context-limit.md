---
title: 'Keep an AI conversation going past its memory limit'
summary: 'Learn how to summarise, pin key facts, and restart a chat so an AI assistant does not forget the start of a long conversation.'
category: ai
publishDate: 2026-11-15
seoTitle: 'AI context limit long conversation'
metaDescription: 'Keep a long AI conversation on track by summarising regularly, pinning standing rules, and restarting with a brief.'
verification: researched
sources:
  - 'https://platform.openai.com/docs'
tags:
  - 'ai'
  - 'prompting'
  - 'llm'
  - 'context-window'
---
An AI assistant can only remember a fixed amount of text at once. That limit is called its context window, which is just a fancy name for short-term memory. Once your chat passes it, the model starts forgetting the beginning of the conversation.

## Summarise before the memory fills up
When the chat gets long, ask the model to write down what has been decided so far. Then start a new chat and paste that summary as your first message. This gives the model a fresh short-term memory that still contains the important parts.

Steps:
1. Ask the model: "Summarise everything we have agreed so far, including facts, file names, and next steps."
2. Copy the summary.
3. Start a new chat.
4. Paste the summary as your first message, then ask the model to continue from there.

It works like copying your school notes onto a fresh page before you run out of space.

Reference: [Context window](https://platform.openai.com/docs)

## Pin the rules that never change
Many assistants let you set standing instructions that apply at the start of every chat. These are called system instructions or custom instructions. Use them for facts that should never leave the conversation, such as your role, the project name, or your preferred tone.

Steps:
1. Open your assistant's settings.
2. Look for "System instructions" or "Custom instructions".
3. Enter the facts that stay the same in every chat.
4. Save the setting.

Reference: [System instructions](https://platform.openai.com/docs)

## Keep a running brief outside the chat
Keep a plain text file with one line per important decision: what was decided, why, and what comes next. When you start a new chat, paste the whole file as your first message. The model can then rebuild the thread without scrolling through hundreds of old messages.

## Expected result
After pasting the summary or running brief into a new chat, the model should answer as if it remembers the earlier conversation. It should not ask you to repeat decisions you already made. If it does, paste the summary again and ask it to continue.
