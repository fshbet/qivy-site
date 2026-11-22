---
title: 'Get a table out of a PDF and into a spreadsheet'
summary: 'Copy a table from a PDF into Excel or Google Sheets without retyping it, using a free Python tool.'
category: ai
publishDate: 2026-11-22
seoTitle: 'PDF table to spreadsheet'
metaDescription: 'Extract tables from a PDF into a spreadsheet in minutes with a free tool and a short script.'
verification: researched
sources:
  - 'https://pdfplumber.readthedocs.io/en/stable/'
  - 'https://docs.python.org/3/library/csv.html'
tags:
  - 'pdf'
  - 'spreadsheet'
  - 'data-extraction'
  - 'python'
---
PDFs keep tables looking neat on screen, but they do not store them as rows and columns the way a spreadsheet does. Copy and paste often dumps everything into one column. You can pull that table out and into Excel, Google Sheets, or LibreOffice Calc without retyping it.

## Install pdfplumber

You need Python on your computer. pdfplumber is a free library that reads a PDF — a file that looks the same on every device — and finds tables on the page. A library is pre-written code you import so you do not have to build the tool yourself.

Open a terminal or command prompt — the text window where you type commands to your computer — and run:

```
pip install pdfplumber
```

pip is Python's installer for extra code libraries.

Reference: [pdfplumber documentation](https://pdfplumber.readthedocs.io/en/stable/)

## Save a short script

Put your PDF in a folder. Save the following as `get_table.py` in that same folder. Replace `invoice.pdf` with your PDF's file name.

```python
import pdfplumber
import csv

with pdfplumber.open("invoice.pdf") as pdf:
    page = pdf.pages[0]
    table = page.extract_table()

if table:
    with open("output.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(table)
    print("Saved output.csv")
else:
    print("No table found on page 1")
```

`csv` is a file format that stores rows and columns as plain text. Every spreadsheet program can open it.

Reference: [Python csv module documentation](https://docs.python.org/3/library/csv.html)

## Run the script

In the same terminal window, run:

```
python get_table.py
```

If the script prints `Saved output.csv`, open that file in Excel, Google Sheets, or LibreOffice Calc. The table appears as rows and columns.

Expected result: You see the PDF table inside your spreadsheet, ready to sort, filter, or edit. If the script says no table was found, the table is probably on another page. Change `pages[0]` to `pages[1]` for page 2, and run again.

This is like taking a photo of a printed table and having the computer type it into a grid for you, instead of retyping it by hand.
