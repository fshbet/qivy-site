---
title: 'Turn a folder of receipts into one spreadsheet'
summary: 'Use a vision-capable AI to read all your receipt images at once and export them into a single spreadsheet you can total and sort.'
category: automation
publishDate: 2026-11-23
seoTitle: 'Turn receipts into one spreadsheet'
metaDescription: 'Turn a folder of receipt images into one spreadsheet with date, merchant, total and tax for each receipt.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/vision'
tags:
  - 'automation'
  - 'receipts'
  - 'spreadsheet'
  - 'vision-ai'
---
You keep receipts as photos and PDFs, but they live in different places. Adding them up by hand takes time, and it is easy to miss one.

## Gather your receipts in one folder
Make a new folder on your computer. Copy every receipt image or PDF into it. You do not need to rename the files.

## Ask the AI to read the receipts
Open a chat with a vision-capable AI. A vision model can read pictures, just as you would look at a photo someone showed you.

Attach the receipts from your folder. If your chat accepts only a few images at a time, send them in small groups.

Paste this prompt:

Extract the date, merchant, total amount and tax from each receipt. Return one row per receipt as plain text. Use this header row:
Date, Merchant, Total, Tax
Then list one row per receipt, with commas between the fields. Do not add any introduction or explanation. If a detail is missing, leave it blank.

Reference: [Vision capabilities](https://platform.openai.com/docs/guides/vision)

## Save the result as a spreadsheet
Copy the AI's output. Open a plain-text editor such as Notepad or TextEdit. Paste the output. Save the file as receipts.csv.

A CSV is a text file where commas separate the columns. Spreadsheets open these files directly.

Open Excel or Google Sheets. Choose File > Import, then select receipts.csv. Each receipt becomes one row. Each detail becomes its own column, like sticking labels into separate boxes.

## Expected result
You should see a header row — Date, Merchant, Total, Tax — and one row for every receipt. You can now sort the list and add up the Total column.

One folder of images becomes one spreadsheet you can keep.
