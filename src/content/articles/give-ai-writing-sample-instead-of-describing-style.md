---
title: 'Give an AI a writing sample instead of describing your style'
summary: 'Paste a sample of your own writing into an AI instead of describing your style so it copies your tone and structure accurately.'
category: ai
publishDate: 2026-11-22
seoTitle: 'Use a writing sample to set an AI''s style'
metaDescription: 'Stop describing your writing style to an AI. Paste a sample and let the model copy your tone, phrasing and structure.'
verification: researched
sources:
  - 'https://docs.anthropic.com/claude/docs/prompt-engineering'
tags:
  - 'ai'
  - 'prompting'
  - 'writing-style'
  - 'few-shot-prompting'
---
Most people tell an AI their style with adjectives: friendly, professional, punchy. Models are bad at following those descriptions. They copy an example much better than a list of traits.

## Paste a sample of your writing instead of describing it
Open a new chat. Copy a short piece of something you wrote yourself, such as an email, a blog intro or a LinkedIn post. Paste it at the top of your message. Then add your instruction underneath. This is called few-shot prompting: giving the model examples before asking it to do something new. Think of it like showing a tailor a shirt you already own instead of trying to describe the cut over the phone.

1. Paste your sample.
2. On the next line, write: "Write in the same style as the sample above." Then add your real request, such as drafting a reply or rewriting a paragraph.
3. Send the message.

Reference: [Prompt engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)

## Pick a sample that matches the job
Use one to three paragraphs of your own writing. Choose something in the same format as what you want now. If you are writing a work email, paste a work email you sent. Do not paste a casual text message if you need a formal report. The model copies what it sees, so the sample should look like the finished piece.

Reference: [Prompt engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)

## Expected result
The model should produce text that sounds like you wrote it: similar sentence length, same level of formality, and phrases you actually use. If it sounds generic, paste a different sample or add: "Match the tone and sentence length of the sample above."
