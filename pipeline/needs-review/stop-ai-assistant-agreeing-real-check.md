---
title: 'Stop your AI assistant from agreeing with everything you say'
summary: 'Make your AI assistant challenge your ideas instead of nodding along.'
category: ai
publishDate: 2026-11-16
seoTitle: 'Stop AI assistant agreeing with you — get a real check'
metaDescription: 'Practical steps to make your AI assistant question your ideas, spot risks, and stop just agreeing with you.'
verification: researched
sources:
  - 'https://docs.anthropic.com/claude/docs/system-prompts'
  - 'https://platform.openai.com/docs/guides/chat'
tags:
  - 'ai'
  - 'prompting'
  - 'critical-thinking'
---
AI assistants are trained to be helpful and polite, so they often nod along even when your idea has holes. You need someone to find the flaws before you act on them.

## Give the assistant a critic role from the start

Open the chat by telling it not to agree just to be polite. A system prompt is an instruction you set at the start of a conversation that guides how the assistant behaves.

Try this:

```
You are a careful critic. Do not agree with me to be polite. Question my assumptions. List weaknesses in my plan. Suggest a better alternative. If my idea is sound, say so only after showing the risks.
```

Paste this as your first message, or save it as a custom instruction if your app offers one. Then describe your idea.

It works like asking a friend to play devil's advocate instead of just nodding.

Reference: [System prompts](https://docs.anthropic.com/claude/docs/system-prompts)

## Ask for the counterargument before the verdict

Before you ask whether your plan is good, ask for the case against it. Say:

"Give me three reasons this might fail. Then tell me what you would change."

This forces the assistant to produce criticism before it can rush to agreement.

Reference: [Chat completions](https://platform.openai.com/docs/guides/chat)

## Start a fresh check instead of continuing the same thread

If you have already debated the idea in the same chat, the assistant may keep agreeing because it remembers what it said earlier. Start a new chat. Paste your idea and say:

"Review this idea as if you have never seen it before. Find logical gaps, missing risks, and anything I am overconfident about. Do not praise it."

Reference: [System prompts](https://docs.anthropic.com/claude/docs/system-prompts)

## Expected result

The assistant should reply with flaws, risks, and a revised version instead of "That sounds like a great idea." If it still praises your plan, repeat the critic instruction and ask again.
