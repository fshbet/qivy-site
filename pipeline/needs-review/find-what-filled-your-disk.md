---
title: 'Find what filled your disk and delete the right things'
summary: 'Use df and du to see which folders are filling your disk, then delete only the files that are safe to remove.'
category: tips
publishDate: 2026-11-22
seoTitle: 'Find what filled your disk and delete the right things'
metaDescription: 'Find large folders with df and du, then delete safe files to free disk space on Linux, macOS or Windows with WSL.'
verification: researched
sources:
  - 'https://www.gnu.org/software/coreutils/manual/html_node/df-invocation.html'
  - 'https://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html'
  - 'https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html'
tags:
  - 'disk-space'
  - 'command-line'
  - 'free-up-space'
  - 'system-maintenance'
---
Your disk is full. New files will not save. Programs fail to start. Before you delete anything, you need to find out what is using the space.

## See how full your disk is
Open a terminal (the app where you type commands instead of clicking). On Linux or macOS, open the default terminal. On Windows, use WSL or Git Bash. Type:
`df -h`
`df` reports file system disk space usage. It lists each disk partition (a section of your disk treated as a separate drive) and shows used and available space. The `h` flag (a short option that changes how a command works) makes the sizes easy to read.
Reference: [df invocation](https://www.gnu.org/software/coreutils/manual/html_node/df-invocation.html)

Look at the Use column. If it is above 90 percent, clear some space.

## Find the folders using the most space
Go to your home folder (your personal folder for documents and downloads). Run:
`du -sh * | sort -hr`
`du` estimates file space usage. The `s` flag summarises each folder. The `h` flag shows sizes in megabytes and gigabytes. `sort -hr` puts the biggest folders at the top.
Reference: [du invocation](https://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html)

## Drill down into the biggest folder
Move into the largest folder shown, then run the same command again:
`cd Downloads`
`du -sh * | sort -hr`
Keep going until you find the files responsible. Common culprits are old downloads, browser caches (temporary files that help pages load faster), old virtual machine images (files that run another operating system inside your computer), and folders named `node_modules` (code libraries for JavaScript projects).
Reference: [du invocation](https://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html)

## Delete only what is safe
If you are unsure about a folder, move it to a new folder called `to-delete`. Use the computer normally for a week. If nothing breaks, delete it.
To remove a folder and everything inside it:
`rm -ri old-folder`
`rm` removes files or folders. The `r` flag removes folders and their contents. The `i` flag asks before each deletion, so you do not remove something by mistake.
Never delete folders inside `Windows`, `System32`, `Library`, or `usr` unless you know exactly what they are.
Reference: [rm invocation](https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html)

## Expected result
Run `df -h` again. The Use percentage should be lower. You should see several gigabytes of free space. If the disk is still full, look for hidden folders (folders that do not appear in a normal file list) with:
`du -sh .* | sort -hr`

You now know which folders to empty and which to leave alone.
