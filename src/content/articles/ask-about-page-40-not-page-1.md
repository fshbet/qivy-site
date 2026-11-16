---
title: 'Ask about page 40, not page 1: point your AI at the right part of a long document'
summary: 'When you attach a long document, tell the AI exactly which page to read so it answers from page 40 instead of guessing from page 1.'
category: ai
publishDate: 2026-11-16
seoTitle: 'Ask about page 40 of an attached document not page 1'
metaDescription: 'Get an AI to read page 40 of your attached document instead of answering from page 1. Practical steps and expected result.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/assistants/tools/file-search'
tags:
  - 'ai'
  - 'prompting'
  - 'pdf'
  - 'documents'
---
You attach a 60-page PDF and ask about a rule on page 40. The AI answers confidently, but it is describing page 1. With long documents, AI models pay most attention to the start of the text and guess the rest.

## Name the page in your question

1. Attach the PDF or document to your chat.
2. Type your question and include the page number. Example: 'On page 40, what does the document say about late fees?'
3. Add a short quote from nearby text so the AI has an anchor. Example: 'Look at the paragraph that starts with Payment is due within on page 40.'
4. Ask the AI to quote the exact line before it answers. Asking it to show its working is called chain-of-thought prompting.

## If it still reads page 1

Copy the text from page 40 and paste it into the chat. Then ask your question about that pasted text. This bypasses the document and gives the AI only the part you care about.

It is like pointing to a single page in a report instead of handing someone the whole file and hoping they find it.

## Some tools search the document for you

Some chat tools can search attached documents instead of reading them from page 1. OpenAI calls this file search. It looks through the file for the words you mention rather than relying on the model's memory of the start.

Reference: [File search tool](https://platform.openai.com/docs/assistants/tools/file-search)

## Expected result

The AI replies with a sentence from page 40 and answers from that page. Check the quote against your document. If the words match, it read the right page.
