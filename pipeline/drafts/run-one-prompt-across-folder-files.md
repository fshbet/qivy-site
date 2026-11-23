---
title: 'Run one prompt across a whole folder of files'
summary: 'Send the same AI prompt to every text file in a folder automatically, without opening them one by one.'
category: ai
publishDate: 2026-11-23
seoTitle: 'Run one prompt across a whole folder of files'
metaDescription: 'Automate one AI prompt across every file in a folder using a short Python script and the OpenAI API.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/pathlib.html'
  - 'https://platform.openai.com/docs/quickstart'
  - 'https://platform.openai.com/docs/api-reference/authentication'
  - 'https://platform.openai.com/docs/api-reference/chat'
tags:
  - 'ai'
  - 'automation'
  - 'python'
  - 'batch-processing'
---
Opening the same prompt once for every file in a folder is slow. If you have twenty text files, you copy and paste twenty times. This article shows how to send one prompt to every file automatically.

## Gather your files
1. Create a folder called `input`.
2. Copy the text files you want to process into it.
3. Create an empty folder called `output` next to it.

The script reads each file from `input`, sends it to the AI, and saves the answer in `output`.

Reference: [Python pathlib documentation](https://docs.python.org/3/library/pathlib.html)

## Install the library
1. Open a terminal or command prompt.
2. Run this command:

`pip install openai`

This installs the OpenAI Python library, which lets your script send messages to the AI service.

Reference: [OpenAI quickstart](https://platform.openai.com/docs/quickstart)

## Store your API key
An API key is a secret password that lets your code talk to the AI service. An environment variable is a stored value your computer remembers for programs. Save the key as an environment variable so you do not paste it into the script.

1. On macOS or Linux, run:

`export OPENAI_API_KEY="your-key-here"`

2. On Windows PowerShell, run:

`$env:OPENAI_API_KEY="your-key-here"`

Replace `your-key-here` with your actual key.

Reference: [OpenAI API authentication](https://platform.openai.com/docs/api-reference/authentication)

## Write the script
1. Save this code as `batch_prompt.py` in the folder that contains `input` and `output`.

```python
import os
from pathlib import Path
from openai import OpenAI

client = OpenAI()

prompt = "Summarise this file in three bullet points:"
input_folder = Path("input")
output_folder = Path("output")
output_folder.mkdir(exist_ok=True)

for file_path in input_folder.glob("*.txt"):
    text = file_path.read_text(encoding="utf-8")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt + "\n\n" + text}
        ],
    )
    answer = response.choices[0].message.content
    (output_folder / file_path.name).write_text(answer, encoding="utf-8")
```

2. Edit the text after `prompt =` if you want a different instruction.

A loop repeats the same action for each file in a list. UTF-8 is a way computers store text so accents and symbols appear correctly. It is like giving one assistant a stack of letters and asking the same question about each letter.

Reference: [OpenAI chat completions documentation](https://platform.openai.com/docs/api-reference/chat)

## Run it
1. Run this command:

`python batch_prompt.py`

Expected result:
A new set of files appears inside `output`. Each file matches one file in `input` and contains the AI's answer to your prompt.
