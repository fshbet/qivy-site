---
title: 'Find the single clause that changed between two contracts'
summary: 'Paste two contract versions into an AI chat and ask it to show only the clause that differs, so you can spot the edit in minutes.'
category: ai
publishDate: 2026-11-25
seoTitle: 'Find the changed clause between two contracts with AI'
metaDescription: 'Spot the exact contract clause that changed by comparing two versions in an AI chat. Paste both texts and ask for before-and-after quotes.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides'
  - 'https://ai.google.dev/gemini-api/docs'
tags:
  - 'ai'
  - 'contracts'
  - 'document-comparison'
---
You have two versions of the same contract. One sentence changed somewhere, and you need to find it. Reading both documents line by line is slow, and it is easy to miss a single word that alters your obligations.

## Copy the text from both contracts
Open each contract. If it is a PDF, highlight the text and copy it. Paste the older version into an AI chat. Label it "Old contract". Paste the newer version below it. Label it "New contract".

If the contract is a scanned image, you cannot copy the text. You need OCR first (software that turns pictures of words into real text). Then copy the result.

## Ask the AI to compare clause by clause
A clause is a numbered section of a contract that covers one topic, such as payment or termination. Send this prompt:

Compare these two contracts clause by clause. Find every clause that changed, even by one word. For each changed clause, show the clause heading, the old text exactly as written, and the new text exactly as written. Do not summarise. Ignore changes to spacing or formatting.

Paste both contract texts after the instructions.

The word "exactly" asks the AI to quote (copy word for word) rather than paraphrase (rewrite in its own words).

Reference: [Prompting guide](https://platform.openai.com/docs/guides)

## Check the model can read both contracts at once
A context window is the most text a model can read in one go, like the size of a desk where you spread out papers. If your contracts are long, they may not fit. Check your model's documentation for its input limit. If they are too long, compare one section at a time instead.

Reference: [Gemini API documentation](https://ai.google.dev/gemini-api/docs)

## Expected result
The AI returns a short list. Often it is just one clause. It should look like this:

Clause 7.2 – Termination
Old: "Either party may terminate with thirty days' notice."
New: "Either party may terminate with sixty days' notice."

Open the original contracts and read that clause to confirm the AI did not miss anything or invent a change.

## Keep the evidence
Save the AI's answer and your manual check. If the other side later claims nothing changed, you have the old text and the new text side by side.
