---
title: 'VS Code settings worth changing on day one'
summary: 'Five VS Code settings you can change in ten minutes to make code easier to read and safer to save.'
category: tips
publishDate: 2026-11-14
seoTitle: 'VS Code settings worth changing on day one'
metaDescription: 'Change font size, auto-save, word wrap and rulers in VS Code so your code is easier to read and your work is safer.'
verification: researched
sources:
  - 'https://code.visualstudio.com/docs/getstarted/settings'
tags:
  - 'vscode'
  - 'settings'
  - 'editor'
  - 'productivity'
---
VS Code opens with settings that work for most people, but they are not always the best for you. Small changes to text size, saving and line wrapping take under ten minutes and save you squinting or losing work.

## Open your settings file

Press Ctrl+Shift+P (Windows or Linux) or Cmd+Shift+P (Mac) to open the Command Palette, which is the search box for every command in VS Code. Type Preferences: Open User Settings (JSON) and press Enter. A file called settings.json opens. This is where VS Code keeps your personal preferences. Each line sets one preference, such as font size or auto-save behaviour.

Reference: [Settings](https://code.visualstudio.com/docs/getstarted/settings)

## Make the text easier to read

Add editor.fontSize to settings.json and set it to 16 or 18. The default is often 14, which can be small on a high-resolution screen.

"editor.fontSize": 16

This is like choosing large text on your phone so you do not have to hold it close to your face.

Expected result: Code in the editor appears bigger as soon as you save the file.

Reference: [Settings](https://code.visualstudio.com/docs/getstarted/settings)

## Save your work without thinking

Add files.autoSave and set it to afterDelay. This means VS Code writes your changes to disk after you stop typing for a short time. You will not lose edits if the computer loses power.

"files.autoSave": "afterDelay",
"files.autoSaveDelay": 1000

Think of it like a car that puts on the handbrake the moment you stop, so you never forget to do it yourself.

Expected result: After you pause typing for one second, close VS Code and reopen it. Your latest changes are still there.

Reference: [Settings](https://code.visualstudio.com/docs/getstarted/settings)

## Stop long lines disappearing off the right

Add editor.wordWrap and set it to on. Long lines move to the next line inside the window instead of running past the edge.

"editor.wordWrap": "on"

It works like a newspaper column instead of a long receipt that keeps going off the right side of the page.

Expected result: Long lines wrap inside the editor window and you do not need to scroll sideways to read them.

Reference: [Settings](https://code.visualstudio.com/docs/getstarted/settings)

## Add a guide line for line length

Add editor.rulers. It draws a thin vertical line at a character count, which helps you keep lines short enough to read easily.

"editor.rulers": [80, 120]

This is like the margin line in a school exercise book.

Expected result: One or two thin grey lines appear down the editor at the character positions you chose.

Reference: [Settings](https://code.visualstudio.com/docs/getstarted/settings)

Save settings.json and close it. Changes apply immediately. To undo any change, delete the line you added and save again.
