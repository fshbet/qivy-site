---
title: 'Work out what a prompt costs before you run it a thousand times'
summary: 'Count the tokens in your prompt, check the model price, and multiply to know the cost before you send it at scale.'
category: ai
publishDate: 2026-11-15
seoTitle: 'Estimate AI prompt cost before running at scale'
metaDescription: 'Work out what a prompt costs before you run it a thousand times by counting tokens and checking official pricing.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/overview'
  - 'https://openai.com/api/pricing/'
tags:
  - 'ai'
  - 'prompt-cost'
  - 'tokens'
  - 'llm'
---
Sending the same prompt to an AI a thousand times can cost more than you expect. Providers charge by the token, not by the message, so a short prompt can still be expensive at scale.

## Count the tokens in your prompt
A token is a chunk of text that an AI model reads. It can be a whole word, part of a word, or a single piece of punctuation. You pay for input tokens, which are the words and symbols in your prompt.

Use OpenAI’s free tokenizer to count them. Paste your prompt into the box and read the number it returns. Or run this Python snippet if you have Python installed:

```
pip install tiktoken
python3 -c "import tiktoken; enc = tiktoken.get_encoding('cl100k_base'); print(len(enc.encode('YOUR PROMPT HERE')))"
```

Replace `YOUR PROMPT HERE` with your actual prompt, keeping the quotes. The number that prints is your input token count.

It works like checking the price of one brick before you order a thousand for a wall.

Reference: [OpenAI platform docs](https://platform.openai.com/docs/overview)

## Find the price for your model
Each model has its own price. It is usually quoted per million input tokens. Some providers also charge differently for input and output tokens. You only need the input price for this check.

Open your provider’s pricing page and find the row for your model. Note the price per million input tokens. Do not guess the price from memory or from a third-party site.

Reference: [OpenAI API pricing](https://openai.com/api/pricing/)

## Multiply to get the total cost
Use this formula:

cost = (prompt tokens × number of runs × price per million tokens) ÷ 1,000,000

Substitute the token count from the previous step, the number of times you plan to run the prompt, and the price per million input tokens from the pricing page. The result is your estimated cost in the provider’s currency.

Prices change between models and providers, so always use the current figure from the official page.

## Expected result
You will have a single number in your currency. If it is below your budget, you can run the prompt at scale. If it is higher than you want, shorten the prompt, switch to a cheaper model, or reduce the number of runs. Do this check once, before you send the first thousand requests.
