---
title: 'Type a block of boilerplate text with two keystrokes'
summary: 'Set up a text shortcut so a few keystrokes insert a full block of standard text, such as your address or email sign-off.'
category: tips
publishDate: 2026-11-22
seoTitle: 'Type boilerplate text with two keystrokes'
metaDescription: 'Learn how to create a text hotstring on Windows so a short code instantly expands into a full block of boilerplate text.'
verification: researched
sources:
  - 'https://www.autohotkey.com/docs/Hotstrings.htm'
  - 'https://www.autohotkey.com/docs/'
tags:
  - 'text-expansion'
  - 'autohotkey'
  - 'windows'
  - 'productivity'
---
You type the same address, sign-off or standard reply over and over. Each repetition wastes time and risks a typo.

## What a hotstring does

A hotstring is a short code that expands into a longer block of text. You type the code, and your computer swaps it for the full text. It works like a school shortcut where you write 'w/' and everyone knows it means 'with'.

Reference: [Hotstrings](https://www.autohotkey.com/docs/Hotstrings.htm)

## Install AutoHotkey

AutoHotkey is a free Windows tool that runs hotstrings. Download the installer from the AutoHotkey website and run it. Pick the option to install AutoHotkey v1.1, because the example below uses that format. When installation finishes, look for an H icon in your system tray — the area near the clock where background programs hide.

Reference: [AutoHotkey documentation](https://www.autohotkey.com/docs/)

## Write your first hotstring

1. Open Notepad.
2. Paste these lines into a new file:

```
#Requires AutoHotkey v1.1

; Type addr to insert your address block
::addr::
(
123 Example Street
Your City, India 110001
Phone: Your phone number
)
```

3. Save the file as `boilerplate.ahk`. In the Save as type list, choose All files so Notepad does not add .txt to the name.
4. Double-click `boilerplate.ahk`. The H icon in your system tray will show that the script is running. A script is a small file your computer follows line by line.

Reference: [Hotstrings](https://www.autohotkey.com/docs/Hotstrings.htm)

## Expected result

Type `addr` then press Space anywhere — in a browser, an email or a document — and it instantly becomes your full address block. If nothing appears, right-click the H icon and choose Reload this script.

You can add more hotstrings to the same file. Each one turns a short code into a standard block of text.
