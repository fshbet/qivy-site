---
title: 'Get consistent structured output from an LLM'
summary: 'Stop fighting the chatbot, tell it exactly what shape to return, and switch on JSON mode.'
category: ai
publishDate: 2026-11-14
seoTitle: 'Consistent structured output from an LLM'
metaDescription: 'Get valid JSON from an LLM without the chatter. Use system messages, JSON mode, and clear field names.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/api-reference/chat/create'
  - 'https://platform.openai.com/docs/guides/structured-outputs'
tags:
  - 'ai'
  - 'llm'
  - 'structured-output'
  - 'prompting'
---
An LLM is the AI behind a chatbot. Ask it for JSON and it often replies with a friendly greeting, wraps the answer in markdown, or leaves out a field you need. You spend more time cleaning the text than using it. Tell the model exactly what shape to return, and switch off the extra chat.

## Use a system message to stop the chatter
A system message is an instruction at the start of a conversation that shapes how the model behaves. It works like a form with labelled boxes: you tell the person to fill only those boxes and nothing else.

Steps:
1. Start the chat with this system message: Return only valid JSON. No markdown. No introduction. No text before or after the JSON.
2. In your user message, name the fields you need. Example: give me the customer name, order number, and total as JSON.
3. Keep unrelated questions out of this turn.

Reference: [Chat completions API reference](https://platform.openai.com/docs/api-reference/chat/create)

## Turn on JSON mode
JSON is plain text that looks like labelled boxes and lists. Programs can read it easily. JSON mode is a provider setting that forces the model to emit valid JSON instead of free-flowing text. It does not choose your field names; you still ask for those in the prompt.

Steps:
1. Add this to your API request — the message your program sends to the AI service: "response_format": { "type": "json_object" }
2. Keep the system message from the section above.
3. Say which fields are required and which can be empty.

Reference: [Structured outputs](https://platform.openai.com/docs/guides/structured-outputs)

## Expected result
The model replies with only JSON, starting with `{` and ending with `}`. Your code can read it directly without stripping markdown or fixing missing fields. If it still adds chatter, check that you set the system message before your user message in the same request.
