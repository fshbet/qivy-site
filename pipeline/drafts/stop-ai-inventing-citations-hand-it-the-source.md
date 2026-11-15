---
title: 'Stop an AI model inventing citations by handing it the source'
summary: 'Paste the source text into your AI chat and ask for quotes only from it, so the model cannot invent page numbers or links.'
category: ai
publishDate: 2026-11-15
seoTitle: 'Stop AI inventing citations by handing it the source'
metaDescription: 'Hand the AI the source text and ask it to quote only from that text, so it stops inventing page numbers and links.'
verification: researched
sources:
  - 'https://docs.anthropic.com/claude/docs/system-prompts'
tags:
  - 'ai'
  - 'prompting'
  - 'citations'
  - 'hallucination'
---
An AI model often invents page numbers, article titles and web links when you ask it to cite its sources. It sounds confident, but the citation does not exist. You can stop this by pasting the source text into the chat and telling the model to answer only from it.

## Paste the source text into the message

Open the article, report or webpage you want the model to use. Copy the relevant paragraphs and paste them at the top of your chat message. Then type your question underneath.

Think of this like handing someone a labelled box of papers and asking them to answer only from inside that box. The model cannot invent a page number if it can only see the text you gave it.

A prompt (the message you send to the model) works best when the source comes first and the question comes second.

Reference: [System prompts](https://docs.anthropic.com/claude/docs/system-prompts)

## Tell the model to ignore outside knowledge

Add a rule after the pasted text. Say: "Answer using only the text above. Do not use outside knowledge. If the answer is not in the text, say so."

This stops the model from filling gaps with invented facts. When a model invents something that sounds true, people call it hallucinating. Giving it a closed set of text reduces that risk.

Reference: [System prompts](https://docs.anthropic.com/claude/docs/system-prompts)

## Ask for real quotes, not made-up links

Ask the model to quote the exact sentence and name the paragraph or section it came from. For example: "Quote the sentence and give the paragraph number."

A citation (a pointer to where the information came from, like a page number in a book) is only useful if you can check it. A real quote from the text you pasted is checkable. A made-up URL is not.

## Expected result

The model answers from the text you pasted. Its citations point to real quotes in that text. If the information is missing, it should say it cannot find it, rather than inventing a source.

## Check the citation before you use it

Click the link or open the paragraph the model quotes. Confirm the words match exactly. If they do not, treat the answer as unverified.

The model can still misquote or miss context, so you must verify.
