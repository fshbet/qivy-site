---
title: 'Stop an AI model adding a preamble to its answers'
summary: 'Set a system instruction so your AI assistant starts with the answer instead of polite filler.'
category: ai
publishDate: 2026-11-22
seoTitle: 'Stop AI preamble filler in answers'
metaDescription: 'Stop an AI model adding polite preamble filler to every answer so you get the direct answer first.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/chat-completions'
  - 'https://platform.openai.com/docs/api-reference/chat/create'
tags:
  - 'ai'
  - 'prompting'
  - 'llm'
---
Many AI assistants start every answer with "Sure! I can help with that. Here is..." before the actual information. This polite padding wastes time and buries the answer.

## Tell the model to skip the intro
A system prompt is a hidden instruction that tells the AI how to behave, separate from your question. Think of it like telling a receptionist "do not make small talk, just hand me the form" before they pick up the phone.

1. Open your AI tool's settings and look for "System instructions", "System message", "Custom instructions", or "System prompt".
2. Paste this instruction:
   Answer directly. Do not add a preamble, greeting, or conversational filler. Never say "Sure", "Here is", "I'd be happy to help", or similar phrases. Start with the answer itself.
3. Save the instruction and start a new chat so it takes effect.
4. Ask a short test question such as "What is the boiling point of water?"

Expected result: The reply begins with the answer, for example "100 degrees Celsius at sea level." It does not start with "Sure" or "Here is the answer".

Reference: [System message](https://platform.openai.com/docs/guides/chat-completions)

## If you are calling an API
Send the instruction as a `system` message, not only as a `user` message. The model treats `system` messages as standing rules for the whole conversation.

{
  "role": "system",
  "content": "Answer directly. Do not add a preamble, greeting, or conversational filler. Start with the answer itself."
}

Then send your question as a `user` message in the same call.

Reference: [Chat completions API reference](https://platform.openai.com/docs/api-reference/chat/create)

A short, direct answer is usually the most useful one. If the model still adds filler, repeat the instruction in the user message too: "Answer directly. No preamble."
