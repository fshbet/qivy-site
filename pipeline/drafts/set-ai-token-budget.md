---
title: 'Set a token budget for a job and stay inside it'
summary: 'Learn how to use max_tokens to prevent AI models from generating overly long responses that waste money and time.'
category: ai
publishDate: 2026-11-26
seoTitle: 'How to set an AI token budget (max_tokens)'
metaDescription: 'Stop AI models from rambling. Use max_tokens to control response length and keep your API costs predictable.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_tokens'
tags:
  - 'ai-api'
  - 'cost-optimization'
  - 'llm-settings'
---
Large Language Models (LLMs) can sometimes ramble or loop the same phrase, consuming more tokens than necessary. Because you pay for every token—the small chunks of text the AI processes—an unrestrained model can quickly drain your budget.

To prevent this, you must set a hard limit on the response length using the `max_tokens` parameter. This acts like a pre-paid voucher for a single request; once the AI hits that number, it stops writing immediately, even if it is mid-sentence.

## Set the max_tokens parameter

When you send a request to an AI API, you include a set of configuration parameters alongside your prompt. The `max_tokens` setting tells the model the absolute maximum number of tokens it is allowed to generate for that specific response.

If you are using a Python script with the OpenAI library, add the parameter to your chat completion call like this:

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role": "user", "content": "Write a short summary of the French Revolution." }],
  max_tokens=100
)

print(response.choices[0].message.content)
```

Reference: [Chat Create - max_tokens](https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_tokens)

## Calculate your budget

Tokens are not the same as words. A rough rule of thumb is that 1,000 tokens equals about 750 words. 

Think of tokens like Lego bricks. A short word might be one brick, while a long, complex word is made of three or four bricks. To set your budget, decide the maximum word count you are willing to pay for and multiply it by 1.3. For example, if you want a maximum of 200 words, set `max_tokens` to 260.

## Handle cut-off responses

When a model hits the token limit, it does not warn you; it simply stops. This results in a "truncated" response, which is like a book ending mid-page.

To check if this happened, look at the `finish_reason` field in the API response. 

1. If `finish_reason` is `stop`, the AI finished its thought naturally.
2. If `finish_reason` is `length`, the AI was cut off because it hit your `max_tokens` limit.

If you see `length` too often, increase your budget slightly or rewrite your prompt to ask for a more concise answer.

## Expected result

After applying `max_tokens`, your AI responses will never exceed the limit you set. You will see a decrease in unexpected costs on your API billing dashboard and your application will handle responses with more predictable timing.
