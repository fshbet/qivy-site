---
title: 'Write a system prompt that works on any AI model'
summary: 'Write a system prompt that keeps its rules, tone, and format when you move it to another AI model.'
category: ai
publishDate: 2026-11-16
seoTitle: 'Write a system prompt that works on any AI model'
metaDescription: 'Keep your AI instructions working when you switch models. Plain-language rules that survive the move, with a test you can run in minutes.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/chat-completions/system-message'
  - 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts'
tags:
  - 'ai'
  - 'system-prompt'
  - 'prompting'
  - 'llm'
---
You move your assistant to a different model and your system prompt stops working. A system prompt is the set of instructions given to an AI model before the conversation starts. Write the prompt so it travels with you instead.

## What a system prompt is
A system prompt is the set of instructions given to an AI model before the conversation starts. It tells the model who to be and how to answer.
Reference: [System message](https://platform.openai.com/docs/guides/chat-completions/system-message)

## Write plain sentences, not model code
Do not use special tags, tokens, or formatting that only one platform understands. Write full sentences in everyday language. If the new model does not recognise your shorthand, it may ignore it or treat it as ordinary text.
Think of it like sticking labels on boxes: anyone can read them, no matter which van is carrying the boxes.
Reference: [System prompts](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts)

## Split role, task, rules, and output into separate blocks
Keep each job in its own section. If the new model forgets one rule, you can see exactly which block to edit. Do not bury instructions inside a long paragraph.
Example:
```
You are a careful editor.
Task: Rewrite the user's text in plain British English.
Rules:
- Do not add facts that were not in the original.
- Keep the meaning the same.
Output: Return only the edited text.
```

## Avoid features that exist in only one model
Do not rely on tool use, thinking modes, or custom stop sequences unless the new model also supports them. If you must use one, test it after the move and have a fallback.
Reference: [System prompts](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts)

## Test on the new model with one real message
Paste the same system prompt into the new model. Send one realistic user message. Check that the tone, length, and format still match your rules. Change only the parts that broke.

## Save the prompt in its own file
Keep the system prompt in a plain text file or notes app. Then you can copy and paste it into any model instead of rewriting it.

## Expected result
The new model follows your constraints without a rebuild: same tone, same length limit, same output shape (the way the answer is laid out). If something changes, you know which block to fix.
