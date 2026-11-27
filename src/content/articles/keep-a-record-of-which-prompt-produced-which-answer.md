---
title: 'Keep a record of which prompt produced which answer'
summary: 'A simple way to log every AI prompt and its answer so you can find and reuse what worked.'
category: ai
publishDate: 2026-11-27
seoTitle: 'Log AI prompts and answers'
metaDescription: 'Keep a simple record of which AI prompt produced which answer so you can find good results again. Works in ten minutes.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/csv.html'
  - 'https://docs.python.org/3/library/datetime.html'
tags:
  - 'ai'
  - 'prompt-logging'
  - 'productivity'
---
You paste a prompt into an AI tool, get a useful answer, then close the tab. Weeks later you need the same result but cannot remember exactly what you asked or which model produced it. A short log fixes that.

AI models change over time. The same prompt can give a different answer next month, or on a different model. Without a log, you cannot tell which wording worked and which did not.

## What to write down

Each time you get an answer worth keeping, record five things: the date and time, the model name, the exact prompt, the full answer, and whether it worked. A prompt is simply the message you type into an AI tool.

## Save it with a few lines of Python

You do not need to install anything new if your computer already has Python. Save this code as log_prompt.py:

```python
import csv
from datetime import datetime

model = input("Model name: ")
prompt = input("Your prompt: ")
answer = input("Paste the AI answer: ")
result = input("Did it work? (yes/no): ")

with open("prompts.csv", "a", newline="") as file:
    writer = csv.writer(file)
    writer.writerow([datetime.now().isoformat(), model, prompt, answer, result])
```

Run it with: `python log_prompt.py` (use `python3` if that is what your computer expects).

The script opens prompts.csv and adds one row at the end. Append means add to the end without deleting what is already there. The csv module is part of Python's standard library, which means it comes with Python and handles commas inside your text safely. The datetime module adds an exact timestamp, which is the date and time the answer was saved. CSV is a plain text format where each line is a row and commas separate the columns.

Reference: [csv — CSV File Reading and Writing](https://docs.python.org/3/library/csv.html)
Reference: [datetime — Basic date and time types](https://docs.python.org/3/library/datetime.html)

## Expected result

After you run the script and paste one answer, open prompts.csv in a spreadsheet or text editor. You should see one row with today's date and time, the model name, your prompt, the answer, and your note. Next time you need that result, search the file for a keyword from the prompt.
