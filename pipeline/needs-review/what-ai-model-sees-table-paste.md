---
title: 'What an AI model actually sees when you paste a table into it'
summary: 'An AI model reads a pasted table as text tokens, not rows and columns—use Markdown or CSV so it keeps the grid straight.'
category: ai
publishDate: 2026-11-16
seoTitle: 'What an AI model sees when you paste a table'
metaDescription: 'AI models read tables as text tokens, not visual grids. Learn how to paste tables as Markdown or CSV so the model keeps rows and columns aligned.'
verification: researched
sources:
  - 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them'
tags:
  - 'ai'
  - 'prompting'
  - 'llm'
  - 'tables'
---
When you paste a table into an AI chat, the model does not see a spreadsheet. It sees a long string of characters. If you copy from Excel or a website, hidden formatting can scramble the layout and the model may read the wrong cell.

## It reads text, not a grid
An AI model reads text in chunks called tokens. Tokens are pieces of words or symbols, not whole sentences. Your table becomes a sequence of these tokens. Row breaks become line breaks. Column breaks become spaces, tabs, or pipe characters (|).

It is like giving someone directions as a list instead of showing them a map. The information is still there, but the shape is gone.

Reference: [What are tokens and how to count them](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)

## Paste the table as Markdown text
Help the model keep rows and columns straight by pasting the table as Markdown. Markdown is a plain-text way to add formatting, and the pipe character (|) marks the edge of each column.

1. Copy the table from your source.
2. Paste it into the chat as a Markdown table:
   ```
   | Item | Price | In stock |
   |------|-------|----------|
   | Tea  | ₹40   | Yes      |
   | Coffee | ₹60 | No       |
   ```
3. Ask about columns by name, for example "What is the price of coffee?" rather than "What is in the second column?"

If your data is in Excel, save it as CSV first and paste the comma-separated text. CSV means comma-separated values: plain text where commas divide columns.

## What breaks a table for the model
Merged cells cause trouble. When two cells are joined, the model sees one block of text and cannot tell which column it belongs to. Spaces alone also fail. You may line up columns with spaces in the chat box, but the model does not see fixed-width columns. It sees variable-width tokens.

A screenshot of a table is worse unless the model has vision. Even then, it must turn the picture into text using optical character recognition, which can miss rows.

Reference: [What are tokens and how to count them](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)

## Expected result
After you paste a pipe-delimited table, the model should answer row-specific questions correctly. If you ask "which row has the highest price?", it should point to the right row instead of mixing up cells.

Paste tables as text, not pictures. Use pipes or commas so the model can see where each cell ends.
