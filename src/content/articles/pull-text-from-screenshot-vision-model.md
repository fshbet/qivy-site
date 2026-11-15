---
title: 'Pull text out of a screenshot with a vision model'
summary: 'Use a vision model to read a screenshot and copy the text without typing it by hand.'
category: ai
publishDate: 2026-11-15
seoTitle: 'Extract text from screenshots with a vision model'
metaDescription: 'Learn how to pull text out of a screenshot using a vision model, with simple steps and what to expect.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/vision'
tags:
  - 'vision-model'
  - 'ocr'
  - 'screenshot'
  - 'ai'
---
You need the words from a screenshot, but all you have is an image. Typing it out by hand is slow and easy to get wrong. A vision model can read the picture and return the text as plain words you can copy.

## What a vision model does
A vision model is an AI that can look at an image and answer questions about it. Think of it as someone who reads a photo out loud and types what they see. You send it a screenshot and ask it to write down the text.

Reference: [Vision](https://platform.openai.com/docs/guides/vision)

## You do not need separate OCR software
OCR stands for optical character recognition. It is the older way of turning a picture of text into real text. A vision model does the same job inside a chat, and it usually handles mixed layouts such as menus and forms without extra setup.

Reference: [Vision](https://platform.openai.com/docs/guides/vision)

## Get the text out in four steps
1. Open a chat that lets you upload images, such as the website or app for a vision model.
2. Upload your screenshot or paste it into the message box.
3. Type: "Read all the text in this image exactly as it appears. Keep the line breaks and do not add explanations."
4. Copy the reply and paste it where you need it.

Reference: [Vision](https://platform.openai.com/docs/guides/vision)

## Expected result
The model returns the visible text from your screenshot as plain text. You should be able to select and copy it without retyping anything.

## Things to watch for
Small text, handwriting and stylised fonts can be missed or misread. Always check names, numbers and prices before you use them. If the result looks wrong, upload a clearer crop of the image and try again.
