---
title: 'Merge every new invoice into one PDF each month'
summary: 'A small Python script joins all new invoices in a folder into one monthly PDF and archives the originals.'
category: automation
publishDate: 2026-11-26
seoTitle: 'Merge monthly invoices into one PDF'
metaDescription: 'Automate monthly invoice merging with a Python script that combines new PDFs into one file and archives the originals.'
verification: researched
sources:
  - 'https://pypdf.readthedocs.io/en/stable/'
  - 'https://docs.python.org/3/library/pathlib.html'
  - 'https://www.gnu.org/software/cron/manual/cron.html'
  - 'https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page'
tags:
  - 'automation'
  - 'pdf'
  - 'python'
  - 'invoices'
---
Invoices arrive as separate PDF files all month. Your accountant wants one file per month. Stapling them together by hand takes longer than it should.

## What the script does
It looks in your `invoices` folder, joins every PDF it finds into one file named by the current month, then moves the originals into a `done` subfolder. If you run it more than once in the same month, it adds the new invoices to the existing monthly file instead of replacing it.

Think of the script like a tray that collects letters through the month and staples them into one packet on the last day.

Reference: [pypdf documentation](https://pypdf.readthedocs.io/en/stable/)

## Install the merger tool
Open a terminal or command prompt and run:

```bash
pip install pypdf
```

`pypdf` is a library, which means a pack of ready-made code that handles PDF pages so you do not have to write that part yourself.

## Save the script
Copy this into a file named `merge_invoices.py` in your Documents folder.

```python
from pathlib import Path
from datetime import date
import shutil
from pypdf import PdfWriter

INBOX = Path.home() / "Documents" / "invoices"
OUT = Path.home() / "Documents" / "merged-invoices"
DONE = INBOX / "done"

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    DONE.mkdir(parents=True, exist_ok=True)

    today = date.today()
    output_name = f"{today:%Y-%m}-invoices.pdf"
    output_path = OUT / output_name

    writer = PdfWriter()

    if output_path.exists():
        writer.append(str(output_path))

    pdfs = sorted(INBOX.glob("*.pdf"))
    for pdf in pdfs:
        writer.append(str(pdf))

    if not pdfs and not output_path.exists():
        print("Nothing to merge.")
        return

    with open(output_path, "wb") as f:
        writer.write(f)

    for pdf in pdfs:
        shutil.move(str(pdf), str(DONE / pdf.name))

    print(f"Merged {len(pdfs)} invoices into {output_name}")

if __name__ == "__main__":
    main()
```

`Path` is Python's way of handling folder paths. `PdfWriter` joins pages together. `shutil.move` relocates files after they are merged.

Reference: [pathlib documentation](https://docs.python.org/3/library/pathlib.html)

## Run it
In the same terminal, run:

```bash
python merge_invoices.py
```

You will see a line saying how many invoices were merged. Open your `merged-invoices` folder to find `2024-06-invoices.pdf`; the month will match today's date.

## Expected result
One PDF appears in `merged-invoices` with every invoice from the current month. The originals disappear from `invoices` and are stored in `invoices/done`. Run the script again whenever new invoices arrive.

## Schedule it on Linux or macOS
Open `crontab -e` and add a line such as:

```cron
0 9 * * 1 /usr/bin/python3 /home/yourname/Documents/merge_invoices.py
```

This runs the script every Monday at 9 a.m. `cron` is the built-in scheduler on Linux and macOS.

Reference: [GNU cron manual](https://www.gnu.org/software/cron/manual/cron.html)

## Schedule it on Windows
Open Task Scheduler and create a basic task that runs `python.exe` with the script path as an argument. Choose a weekly or monthly trigger.

Reference: [Task Scheduler documentation](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)
