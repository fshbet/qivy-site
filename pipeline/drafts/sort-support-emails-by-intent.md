---
title: 'Sort support emails by intent using AI'
summary: 'Use a structured prompt to categorise a pile of customer emails by what the user actually wants.'
category: ai
publishDate: 2026-11-27
seoTitle: 'Sort support emails by intent with AI'
metaDescription: 'Learn how to use an AI model to categorise customer support emails into actionable groups using structured prompts.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/prompt-engineering'
tags:
  - 'ai'
  - 'productivity'
  - 'customer-support'
  - 'prompting'
---
Customer support inboxes often contain a mix of genuine bugs, feature requests, and simple questions. Reading every email to decide who should handle it wastes time. You can use an AI model to act as a triage nurse, sorting these emails into categories before you even open them.

## Define your categories

An AI cannot guess your internal business process. You must give it a specific list of labels to use. Think of this like giving a postal worker a set of pigeonholes to sort mail into. If you do not define the labels, the AI will invent its own, making it impossible to filter your results later.

Common categories include:
- **Bug**: Something is broken.
- **Feature Request**: The user wants something new.
- **Billing**: Questions about money or invoices.
- **General Query**: Simple questions about how the product works.
- **Spam**: Marketing or irrelevant mail.

Reference: [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)

## Create a classification prompt

To get a result you can actually use in a spreadsheet or database, you need the AI to return only the label, not a conversational sentence. Use a prompt that enforces a strict format.

Copy and paste this prompt, replacing the bracketed text with your own:

```
Act as a support triage assistant. Your task is to categorise the incoming email based on the user's intent.

Categories:
- Bug: User reports a technical error or something not working as expected.
- Feature Request: User suggests an improvement or a new tool.
- Billing: Questions about payments, plans, or refunds.
- General Query: General questions about how to use the service.
- Spam: Unsolicited sales or irrelevant content.

Constraint: Output ONLY the category name. Do not include any introductory text, explanations, or punctuation.

Email content:
"[Paste email text here]"
```

## Process emails in bulk

If you have a hundred emails, do not paste them one by one. Use a table format to process them in a single batch. This is like giving the AI a list of tasks instead of a single order.

Ask the AI to follow this structure:

```
Categorise the following emails. Return the result as a table with two columns: "Email ID" and "Category".

1. [Email text 1]
2. [Email text 2]
3. [Email text 3]
```

## Expected result

You should receive a clean list or table. If the prompt is followed correctly, the AI will not say "The category for this email is Bug"; it will simply say "Bug". 

This allows you to copy the list directly into a spreadsheet and use the "Filter" tool to handle all billing issues or all bugs at once.
