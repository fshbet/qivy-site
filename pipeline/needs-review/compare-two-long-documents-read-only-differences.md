---
title: 'Compare two long documents and read only the differences'
summary: 'Use the diff command to compare two text files and see only what changed, instead of reading both documents from start to finish.'
category: ai
publishDate: 2026-11-28
seoTitle: 'Compare two documents and see only the differences'
metaDescription: 'Compare two long documents and read only the differences using the diff command. Works on macOS, Linux, and Windows with Git or WSL.'
verification: researched
sources:
  - 'https://www.gnu.org/software/diffutils/manual/diffutils.html#Invoking-diff'
tags:
  - 'ai'
  - 'diff'
  - 'productivity'
  - 'command-line'
---
You open two long documents and try to spot what changed. Your eyes skip over lines, and by the end you are not sure if you missed an edit. A diff tool compares the files and shows only the lines that are different, so you do not have to read the parts that stayed the same.

## What diff does
`diff` is a program you run by typing commands into a terminal. It compares two text files line by line. It prints only the lines that changed, plus a little context around them. Think of it like a teacher marking only the wrong answers on a page instead of rewriting the whole essay.
Reference: [GNU Diffutils manual — Invoking diff](https://www.gnu.org/software/diffutils/manual/diffutils.html#Invoking-diff)

## Get the files ready
Save both documents as plain text files in the same folder. If your documents are Word files or PDFs, export or save them as .txt first. Name them clearly, such as `contract-v1.txt` and `contract-v2.txt`.

## Run a basic comparison
Open a terminal. On macOS or Linux, open Terminal. On Windows, use Git Bash or WSL. Type:

```bash
diff contract-v1.txt contract-v2.txt
```

Lines that exist only in the first file are shown with a less-than sign. Lines that exist only in the second file are shown with a greater-than sign. The numbers at the start, such as `5c5`, tell you which line numbers changed.
Reference: [GNU Diffutils manual — Invoking diff](https://www.gnu.org/software/diffutils/manual/diffutils.html#Invoking-diff)

## Read changes more easily
Add the `-u` flag for unified format. It marks removed lines with `-` and added lines with `+`, and keeps a few unchanged lines around each change so you can see where it happened.

```bash
diff -u contract-v1.txt contract-v2.txt
```
Reference: [GNU Diffutils manual — Invoking diff](https://www.gnu.org/software/diffutils/manual/diffutils.html#Invoking-diff)

## Ignore spacing and blank lines
If the only difference is an extra space or a blank line, use `-w` to ignore all whitespace. Whitespace means spaces, tabs and blank lines.

```bash
diff -w contract-v1.txt contract-v2.txt
```
Reference: [GNU Diffutils manual — Invoking diff](https://www.gnu.org/software/diffutils/manual/diffutils.html#Invoking-diff)

## Expected result
The terminal prints only the changed sections. Everything identical between the two documents stays hidden. If nothing prints, the files are identical.
