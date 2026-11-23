---
title: 'Fill a PDF form from a row in a spreadsheet'
summary: 'Use Python to read a spreadsheet row and fill in a matching PDF form, creating one file per row.'
category: automation
publishDate: 2026-11-23
seoTitle: 'Fill a PDF form from a spreadsheet row'
metaDescription: 'Fill a PDF form from a row in a spreadsheet using Python, pandas and pypdf. One filled PDF per row, no manual typing.'
verification: researched
sources:
  - 'https://pypdf.readthedocs.io/en/latest/'
  - 'https://pandas.pydata.org/docs/'
tags:
  - 'automation'
  - 'pdf'
  - 'python'
  - 'spreadsheet'
---
You have a spreadsheet with names, invoice numbers, or attendance details. You need a separate filled-in PDF form for every row. Typing each one by hand is slow and easy to get wrong.

## What you need

You need a PDF that already contains fillable form fields. These are the boxes you can click and type into, such as Name, Date, or Amount. This is often called an AcroForm. If your PDF is just a flat page with no boxes, this method will not work.

You also need Python installed on your computer, and a spreadsheet saved as CSV or Excel.

## Install the tools

Open a terminal or command prompt and run:

```bash
pip install pandas pypdf openpyxl
```

`pandas` reads the spreadsheet. `pypdf` reads and writes PDF forms. `openpyxl` lets pandas open Excel files.

Reference: [pypdf documentation](https://pypdf.readthedocs.io/en/latest/)

## Read one row from your spreadsheet

Save this as `fill_one.py`:

```python
import pandas as pd

df = pd.read_csv("data.csv")
row = df.iloc[0]
form_data = row.to_dict()
print(form_data)
```

Change `"data.csv"` to your file name. `iloc[0]` means "give me the first row of data". `to_dict()` turns that row into a labelled list of pairs, like a contact card where every piece of information has a name.

Think of the spreadsheet row as a completed paper form. The dictionary is the same information copied onto sticky notes, with each note labelled to match a box in the PDF.

Reference: [pandas documentation](https://pandas.pydata.org/docs/)

## Fill the PDF form

Save this as `fill_pdf.py`:

```python
import pandas as pd
from pypdf import PdfReader, PdfWriter

df = pd.read_csv("data.csv")
row = df.iloc[0]
form_data = row.to_dict()

reader = PdfReader("template.pdf")
writer = PdfWriter()
writer.append_pages_from_reader(reader)

writer.update_page_form_field_values(writer.pages[0], form_data)

with open("filled_form.pdf", "wb") as output_file:
    writer.write(output_file)
```

This copies the pages from your template PDF, matches each sticky-note label to a form field with the same name, and writes the result to a new file.

Reference: [pypdf documentation](https://pypdf.readthedocs.io/en/latest/)

## Fill every row in the spreadsheet

Change the script to loop through the file:

```python
import pandas as pd
from pypdf import PdfReader, PdfWriter

df = pd.read_csv("data.csv")
reader = PdfReader("template.pdf")

for index, row in df.iterrows():
    form_data = row.to_dict()
    writer = PdfWriter()
    writer.append_pages_from_reader(reader)
    writer.update_page_form_field_values(writer.pages[0], form_data)
    with open(f"filled_{index}.pdf", "wb") as output_file:
        writer.write(output_file)
```

`iterrows` walks through the spreadsheet one row at a time, so you get one finished PDF per row. It is like photocopying a blank form once for every name on your list.

Reference: [pypdf documentation](https://pypdf.readthedocs.io/en/latest/)

## Expected result

After you run the script, a new PDF appears for every spreadsheet row. Open it and the boxes should contain the data from that row. If a box is empty, check that the column header in your spreadsheet matches the field name in the PDF exactly, including capitalisation and spaces.

## Things to check before you run it

- The field names in the PDF must match your spreadsheet column headers. If the PDF field is called `Full Name` but your column is called `name`, nothing will appear in that box.
- This works on fillable PDF forms, not on ordinary PDFs where the text is just printed on the page.
