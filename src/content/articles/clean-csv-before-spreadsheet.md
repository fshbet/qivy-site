---
title: 'Clean a CSV before it ever reaches your spreadsheet'
summary: 'Clean up blank rows, messy spacing, and hidden characters in a CSV file with a short script before you open it in a spreadsheet.'
category: automation
publishDate: 2026-11-24
seoTitle: 'Clean CSV files before they reach your spreadsheet'
metaDescription: 'Fix blank rows, padded cells, and hidden characters in a CSV file with a short Python script before you open it in Excel or Google Sheets.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/csv.html'
tags:
  - 'csv'
  - 'automation'
  - 'python'
  - 'data-cleaning'
---
A CSV (comma-separated values) file is a plain text file where each line is a row and commas separate the cells. It often arrives with blank rows, padded cells, or hidden characters at the start. If you open it straight in Excel or Google Sheets, the spreadsheet can guess wrong and mangle dates, drop leading zeros, or shift columns. Clean the file first, then open it.

## Open the file in a text editor first

Open the CSV in Notepad, TextEdit, or VS Code instead of Excel. You want to see the raw commas and quotes, not the spreadsheet's guess at what each column means. Excel and Google Sheets try to be helpful. They might turn a postcode into a number or drop a zero from the start of a phone number. Looking at the raw file lets you spot these problems before they happen.

## Save the cleaning script

Copy this into a file named clean_csv.py:

```python
import csv
import sys

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, newline='', encoding='utf-8-sig') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    for row in reader:
        if not row or all(cell.strip() == '' for cell in row):
            continue
        cleaned = [cell.strip() for cell in row]
        writer.writerow(cleaned)
```

This uses Python's built-in csv module. It reads every row, skips completely blank ones, and removes spaces from the start and end of each cell. The `utf-8-sig` encoding ignores an invisible marker called a byte order mark (BOM). Some Windows programs add this marker to the start of a file. Because the script treats everything as text, leading zeros in codes or phone numbers stay intact.

Reference: [csv — CSV File Reading and Writing](https://docs.python.org/3/library/csv.html)

## Run it from your terminal

Open your terminal or command prompt. Run:

```
python clean_csv.py messy.csv clean.csv
```

Replace `messy.csv` with your file name. The script creates `clean.csv` in the same folder. It does not change your original file, so you can run it again if something looks wrong. If `python` is not recognised, try `python3`. On Windows, check that Python is installed by typing `python --version`.

## Expected result

Open `clean.csv` in Excel or Google Sheets. You should see the same columns in the same order. Empty rows are gone. Cells no longer start or end with spaces. If you had a column of IDs like `00123`, the zeros are still there.

Cleaning before you open the file means the spreadsheet never gets a chance to guess wrong.
