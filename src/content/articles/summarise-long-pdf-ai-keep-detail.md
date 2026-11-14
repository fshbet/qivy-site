---
title: 'Summarise a long PDF with AI without losing the detail that matters'
summary: 'Break a long PDF into chunks, summarise each part with a fixed template, and reassemble it so no key number, date or action item gets lost.'
category: ai
publishDate: 2026-11-14
seoTitle: 'Summarise long PDF with AI without losing detail'
metaDescription: 'Learn how to summarise a long PDF with AI while keeping the numbers, dates and decisions that matter. A step-by-step method you can start in ten minutes.'
verification: researched
sources:
  - 'https://platform.claude.com/docs/en/build-with-claude/context-windows'
tags:
  - 'ai'
  - 'pdf'
  - 'summarisation'
  - 'productivity'
---
A long PDF often comes back from AI as a short paragraph that misses the numbers, dates and decisions you actually need. If you paste the whole document in one go, the model may lose track of details anywhere in it. The fix is to summarise in parts and reassemble.

## Why a single summary loses detail
An AI model can only hold so much text at once. This limit is called the context window — think of it as the size of a whiteboard the AI can write on before it has to rub something off. The bigger the document, the more crowded that whiteboard gets, and the less reliably the model recalls any single detail on it.

Reference: [Context windows — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/context-windows)

## Step 1: Get the text out of the PDF
If your AI tool accepts PDF uploads, upload the file directly. Otherwise, open the PDF, select all the text, copy it and paste it into a plain text file. Do not retype it by hand.

This is like photocopying pages so you can work on the copy instead of the original book.

## Step 2: Split the document into sections
Break the text into chunks of about ten pages each. Number the chunks. If the document already has clear parts — introduction, findings, budget — split along those lines instead.

This is like labelling boxes before moving house so you know which room each box belongs to.

## Step 3: Summarise each section with the same template
Paste one chunk into the AI and use the same instructions every time. A prompt is simply the message you type into the AI tool.

Use this template:

Summarise this section. Keep:
- Key facts and numbers
- Dates and deadlines
- Decisions made or proposed
- Action items and who owns them
- Anything the writer says is important

Write one short paragraph per bullet. Do not add outside information.

This is like giving someone the same form to fill in for every page so nothing gets forgotten.

Repeat this for every chunk. Because you use the same template each time, the AI learns the shape you want and is less likely to drop a detail.

## Step 4: Combine the section summaries
Paste all your section summaries back into the AI and ask it to merge them into one document. Tell it to keep every number, date and action item. Then spot-check three details against the original PDF — one figure, one date and one name.

If the merged summary looks too long, ask the AI to shorten it while keeping the bullets above. Do not ask it to rewrite from scratch.

## Expected result
You should get a summary that reads like a short briefing note, not a blurb. Every important number, date and action item from the original should still be there, and you should be able to find each one in the source PDF within a minute.
