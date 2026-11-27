---
title: 'Watch a log file and alert when a line matches'
summary: 'Use tail and grep to follow a log file and print only the lines that contain a word you choose.'
category: automation
publishDate: 2026-11-27
seoTitle: 'Watch a log file and alert on matching lines'
metaDescription: 'Learn how to watch a log file and get told the moment a line matches a word or phrase, using tail and grep on Linux or macOS, or PowerShell on Windows.'
verification: researched
sources:
  - 'https://www.gnu.org/software/coreutils/manual/html_node/tail-invocation.html'
  - 'https://www.gnu.org/software/grep/manual/grep.html'
  - 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-content'
  - 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-string'
tags:
  - 'automation'
  - 'logs'
  - 'command-line'
  - 'tail'
  - 'grep'
---
You have a log file that grows line by line. You want to know the moment a certain word appears, without staring at the screen or reopening the file again and again.

## Follow a file as it grows

The `tail` command shows the end of a file. With the `-f` flag (a flag is an option that changes how a command runs), it keeps watching the file and prints new lines as they are added. This is called following. It is like waiting by a letterbox for new mail instead of checking the box every few minutes.

Open a terminal and run:

```bash
tail -f /var/log/syslog
```

Leave it running. New lines appear at the bottom as the file grows.

Reference: [tail invocation](https://www.gnu.org/software/coreutils/manual/html_node/tail-invocation.html)

## Keep only the lines that match

The `grep` command prints only lines that contain a word or phrase you choose. This is called filtering. The `|` symbol is a pipe: it sends the output of one command into the next.

Run:

```bash
tail -f /var/log/syslog | grep 'error'
```

Replace `/var/log/syslog` with the path to your log file. Replace `'error'` with the word you want to watch for.

Reference: [grep invocation](https://www.gnu.org/software/grep/manual/grep.html)

## Expected result

As soon as a line containing your word is written to the log, it appears in your terminal. Lines without the word stay hidden.

## Stop watching

Press `Ctrl` + `C` to stop following the file and return to the command prompt.

## On Windows

PowerShell works the same way. `Get-Content -Wait` follows a file, and `Select-String` keeps only matching lines:

```powershell
Get-Content 'C:\logs\app.log' -Wait | Select-String 'error'
```

Replace the path and the word with your own.

Reference: [Get-Content](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-content)
Reference: [Select-String](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-string)

Expected result in PowerShell is the same: matching lines appear as they are written.
