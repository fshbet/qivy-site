---
title: 'Read a spreadsheet with an AI model without sending all of it'
summary: 'Open your spreadsheet locally, keep only the rows you need, and paste that smaller slice into your AI chat.'
category: ai
publishDate: 2026-11-27
seoTitle: 'Read spreadsheet with AI without uploading whole file'
metaDescription: 'Learn to send only part of a spreadsheet to an AI model using Python and pandas, saving time and cost.'
verification: researched
sources:
  - 'https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html'
tags:
  - 'spreadsheet'
  - 'ai'
  - 'python'
  - 'pandas'
---
You paste an entire spreadsheet into an AI chat to ask one question about a single row. The model reads every cell, which uses more of your token limit — the maximum amount of text it can read at once — and can make the answer slower or more expensive. Send only the part you need instead.

## Keep only the rows and columns you need

Open the spreadsheet file on your computer. It can be an Excel file or a CSV — a plain text file that stores rows and columns. Choose which rows matter, such as only rows marked "pending" or only the last ten rows. Choose which columns matter, such as date, customer, and amount. Ignore everything else.

Think of it like handing someone one page from a folder instead of the whole cabinet.

## Print that slice as plain text

Install pandas, a free Python tool for working with tables of data, and openpyxl, which lets pandas read Excel files:

pip install pandas openpyxl

Save this script as `read_slice.py` in the same folder as your spreadsheet:

```python
import pandas as pd

df = pd.read_excel("data.xlsx")
small = df[df["status"] == "pending"][["date", "customer", "amount"]]
print(small.to_string(index=False))
```

Change `"data.xlsx"` to your file name. Change `"status"` to your column name, and change `["date", "customer", "amount"]` to the columns you want to keep.

Run the script:

python read_slice.py

The terminal — the black box where you type commands — prints only the rows and columns you chose, with no extra formatting.

Reference: [Read an Excel file with pandas](https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html)

## Paste the slice into your AI chat

Copy the text from the terminal. Paste it into your AI chat, then ask your question, for example: "Which customer owes the most?" Because you sent only a small slice, the model answers faster and uses less of your limit.

## Expected result

The model answers using only the rows you pasted. It does not see the rest of the spreadsheet, so your file stays on your computer and your prompt stays short.
