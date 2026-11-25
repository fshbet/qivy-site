---
title: 'Catch a made-up file path before you run the command'
summary: 'Check that a file or folder exists before you paste and run an AI-suggested command.'
category: ai
publishDate: 2026-11-25
seoTitle: 'Check AI-suggested file paths before running commands'
metaDescription: 'Stop failed commands by verifying that AI-suggested file paths actually exist before you run them.'
verification: researched
sources:
  - 'https://www.gnu.org/software/coreutils/manual/html_node/ls-invocation.html'
  - 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/test-path'
tags:
  - 'ai'
  - 'terminal'
  - 'file-path'
  - 'command-line'
  - 'coding-assistant'
---
AI coding assistants can suggest commands that point to files or folders that do not exist on your computer. If you paste and run the command, it fails. Worse, it can create a file in the wrong place or overwrite something you did not mean to touch. Check the path first.

## Check the path in your terminal before you run anything
Open your terminal. The terminal is the text app where you type commands to your computer. Copy the file path from the AI's suggestion. Type `ls -la ` followed by the path in double quotes, then press Enter. For example:

`ls -la "src/data/customers.csv"`

`ls` lists files. If the path is real, you see details such as size and date. If it is made up, you see an error such as "No such file or directory". Only run the AI's command after this check passes.

It is like checking a street address exists before you order a delivery.

Reference: [ls invocation](https://www.gnu.org/software/coreutils/manual/html_node/ls-invocation.html)

## On Windows, use Test-Path instead
Open PowerShell. Type `Test-Path ` followed by the path in double quotes, then press Enter. For example:

`Test-Path "C:\Users\you\project\file.txt"`

It returns `True` if the path exists and `False` if it does not. Fix any `False` result before running the command.

Reference: [Test-Path](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/test-path)

## Expected result
You run the command against a real file or folder. If the path is invented, you correct it or ask the AI to fix it instead of watching an error scroll past.
