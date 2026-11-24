---
title: 'Keep private details out of an AI prompt without losing the context'
summary: 'Swap real names, emails and numbers for placeholders before you paste text into an AI, then put them back in the answer.'
category: ai
publishDate: 2026-11-24
seoTitle: 'Hide private details in AI prompts'
metaDescription: 'Keep names and order numbers out of your AI prompts while still getting useful answers. Swap real details for placeholders, then restore them.'
verification: researched
sources:
  - 'https://openai.com/policies/privacy-policy'
tags:
  - 'ai'
  - 'prompting'
  - 'privacy'
  - 'data-security'
---
You need help rewriting an email, summarising a support ticket or drafting a reply. The message contains a customer’s name, phone number or order number. Pasting it straight into the chat sends those private details to the company that runs the AI. You can keep the context the AI needs while hiding the private bits.

## Replace private details with placeholders before you paste

A prompt is the message you send to an AI. A placeholder is a fake label that stands in for real information, like [NAME] or [ORDER NUMBER]. Think of it like addressing an envelope to "the occupant" instead of writing a name on the outside.

1. Copy the message you want help with into a text editor.
2. Find every private detail: names, email addresses, phone numbers, addresses, order numbers and account numbers.
3. Replace each one with a clear placeholder in square brackets.
4. Paste the placeholder version into the AI and ask for the help you need.
5. Copy the AI’s answer and swap the placeholders back for the real details before you send or save anything.

Example:

Before:
Hi Sarah, I am writing about order 7742-PL and the charge on card ending 4829.

After:
Hi [NAME], I am writing about order [ORDER NUMBER] and the charge on card ending [CARD NUMBER].

The AI still sees that this is a complaint about a late delivery, so it can suggest a polite reply. It never sees Sarah’s name or the card number.

Expected result
The AI returns a draft using the same placeholders. You replace [NAME] with Sarah and so on. The final message contains the real details, but the AI prompt never did.

## Put the real details back only after you have the answer

Never paste the restored version back into the same chat. Once the real details are inside the conversation, treat that chat as containing private data. Save the final version outside the chat, then start a fresh conversation next time.

Reference: [OpenAI privacy policy](https://openai.com/policies/privacy-policy)
