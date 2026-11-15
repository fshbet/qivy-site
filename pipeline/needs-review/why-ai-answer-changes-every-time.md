---
title: 'Why an AI gives a different answer to the same question'
summary: 'AI answers vary because of randomness in word selection; here is how to make them more consistent in ten minutes.'
category: ai
publishDate: 2026-11-15
seoTitle: 'Why AI answers change and how to make them consistent'
metaDescription: 'Why an AI gives different answers to the same question, and how to lower randomness using temperature and seed settings.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/api-reference/chat/create'
tags:
  - 'ai'
  - 'llm'
  - 'prompting'
  - 'consistency'
---
You ask an AI the same question twice. It gives two different answers. That does not mean the AI is broken. It usually means the model is designed to choose words at random.

## Why the answer changes
Most AI chat models pick the next word one at a time. They build a list of likely words and choose one. A setting called temperature controls how random that choice is. High temperature makes the model pick less likely words more often. Low temperature makes it stick to the most likely word.

Think of it like a restaurant menu. At high temperature, the waiter suggests a different special each time you ask. At low temperature, they always recommend the same dish.

Different apps also use different default settings, so the same question can behave differently on two websites.

Reference: [OpenAI API reference — chat completions](https://platform.openai.com/docs/api-reference/chat/create)

## Make the answer more stable
You can reduce the randomness in ten minutes.

1. Look for a setting called temperature, creativity, or randomness in your AI app.
2. Set it low, close to zero. Zero often means the model always picks the most likely word.
3. If you are using the API (a way for one computer program to talk to another), set a seed value too. A seed is a starting number that helps the computer make the same choices each time.
4. Start a new, empty chat. Old messages in the same thread can change the answer because the model reads the whole conversation as context.

Some apps do not show temperature. If yours does not, try asking for a short answer in a fixed format, such as a numbered list.

## Expected result
With temperature near zero, the same prompt should return the same or nearly the same answer every time. At high temperature, it will still vary.

Reference: [OpenAI API reference — temperature and seed](https://platform.openai.com/docs/api-reference/chat/create)

The variation is a setting, not a fault.
