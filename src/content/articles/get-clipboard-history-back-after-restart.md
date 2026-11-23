---
title: 'Get your clipboard history back after a restart'
summary: 'Windows clears most clipboard history when you restart, so use CopyQ, a free clipboard manager that saves your history to disk.'
category: tips
publishDate: 2026-11-23
seoTitle: 'Get clipboard history back after restart'
metaDescription: 'Windows clipboard history disappears after restart. Learn how to keep copied items using CopyQ, a free clipboard manager that saves to disk.'
verification: researched
sources:
  - 'https://github.com/hluk/CopyQ/releases'
  - 'https://copyq.readthedocs.io/en/latest/'
tags:
  - 'clipboard'
  - 'windows'
  - 'copyq'
  - 'productivity'
---
You copy something, restart your computer, and press Win+V. The list is empty. Windows does not save most clipboard history — a list of recent copies — to disk, so a restart wipes it. To keep items after restart, use a clipboard manager, a program that saves your history to a file.

## Install CopyQ
CopyQ is a free clipboard manager for Windows, macOS and Linux.

1. Go to https://github.com/hluk/CopyQ/releases
2. Download the installer for your computer.
3. Run the installer, then open CopyQ.

## Copy as normal
Press Ctrl+C or right-click and select Copy as you usually do. CopyQ keeps a list of your copied items. Open the list and select any item to paste it again.

## How CopyQ keeps history after restart
Many clipboard tools keep history in your computer's short-term memory. CopyQ writes copied items to a database file on your hard drive. Because the file stays on the disk, the list is still there after you restart.

Comparison: It is like saving a document instead of leaving it open in a window. Switching off the computer does not delete a saved file.

Reference: [CopyQ documentation](https://copyq.readthedocs.io/en/latest/)

## Restart your computer
Restart your computer. When it comes back on, open CopyQ from the system tray — the small icons near the clock on the taskbar.

## Expected result
Open CopyQ after restart. You see a list of items you copied before restarting. Select any item and press Ctrl+V to paste it again. If you do not see CopyQ, look for its icon in the hidden icons area of the taskbar.
