---
title: 'Automate file renaming and sorting with Python'
summary: 'Move messy downloads into labelled folders and give files tidy names with a short Python script you can run in ten minutes.'
category: automation
publishDate: 2026-11-14
seoTitle: 'Automate file renaming and sorting with Python'
metaDescription: 'Rename and sort files automatically into folders using a short Python script. Step-by-step guide with copy-paste code.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/pathlib.html'
  - 'https://docs.python.org/3/library/pathlib.html#pathlib.Path.replace'
  - 'https://docs.python.org/3/library/pathlib.html#pathlib.Path'
tags:
  - 'automation'
  - 'python'
  - 'file-management'
---
Your Downloads folder probably holds files with names like IMG_0442.JPG and invoice_final_v2.PDF. Sorting them by hand is slow and boring. You can rename and move them automatically with a short Python script — a small text file with step-by-step instructions for your computer.

## What the script does
It looks at every file in a folder. It checks the file extension — the letters after the dot, such as .pdf or .jpg. It creates a folder named after that extension. It moves the file into that folder. It also cleans the filename: it removes spaces and uses lowercase letters. If two files would get the same name, it adds a number so nothing is lost.

Think of it as putting loose papers into labelled drawers, then rewriting each label in neat handwriting.

Reference: [pathlib — filesystem paths](https://docs.python.org/3/library/pathlib.html)

## Copy and save the script
Open a plain-text editor. On Windows, use Notepad. On a Mac, use TextEdit in plain-text mode. Paste this:

```python
from pathlib import Path

folder = Path.home() / "Downloads"

for file in folder.iterdir():
    if not file.is_file():
        continue

    clean_name = file.stem.lower().replace(" ", "_") + file.suffix
    ext = file.suffix.lstrip(".").lower() or "misc"

    target_dir = folder / ext
    target_dir.mkdir(exist_ok=True)

    target = target_dir / clean_name

    counter = 1
    while target.exists():
        target = target_dir / f"{file.stem.lower().replace(' ', '_')}_{counter}{file.suffix}"
        counter += 1

    file.replace(target)
```

Save the file as sort_files.py. You can save it inside your Downloads folder. If you save it somewhere else, edit the line `folder = Path.home() / "Downloads"` so it points to the folder you want to tidy.

Reference: [pathlib.Path.replace](https://docs.python.org/3/library/pathlib.html#pathlib.Path.replace)

## Run the script
Open a terminal or command prompt — a text-based way to give your computer commands. Type:

python sort_files.py

If your computer says python is not found, type python3 instead.

Wait a few seconds. Then open your Downloads folder.

## Change the folder (optional)
The script sorts your Downloads folder by default. To sort another folder, replace `Path.home() / "Downloads"` with the full path to that folder. On Windows, use forward slashes, like `Path("C:/Users/yourname/Documents")`. On Mac or Linux, use `Path("/home/yourname/Documents")`.

Reference: [pathlib.Path](https://docs.python.org/3/library/pathlib.html#pathlib.Path)

## Expected result
You will see new folders such as pdf, jpg, and misc. Files will sit inside the folder that matches their type. Names will be lowercase with underscores instead of spaces. Run the script again whenever the folder gets messy. It will not break if the folders already exist.
