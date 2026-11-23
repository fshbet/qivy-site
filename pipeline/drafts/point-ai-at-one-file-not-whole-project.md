---
title: 'Point an AI coding assistant at one file, not the whole project'
summary: 'Give your AI coding assistant just the file you are editing instead of your whole project so its answers stay focused and it does not touch files you did not ask about.'
category: ai
publishDate: 2026-11-23
seoTitle: 'Point an AI coding assistant at one file'
metaDescription: 'Point your AI coding assistant at a single file instead of an entire project. Keep answers focused, cut noise, and avoid edits to files you did not ask for.'
verification: researched
sources:
  - 'https://aider.chat/docs/usage.html'
tags:
  - 'ai'
  - 'coding-assistant'
  - 'aider'
  - 'context-window'
---
Giving an AI coding assistant your whole project is like handing someone the blueprints for every room in the house when you only need a tap fixed. It fills the model’s context window — the amount of text it can look at at once — with files it does not need. That makes answers slower and more likely to touch files you did not ask about.

Point it at one file instead.

## Start the assistant with one file
Aider is an AI coding assistant — a program that writes or changes code when you type a request. You run it in your terminal, which is the text-only app where you type commands to run programs.

1. Open your terminal.
2. Type `aider` followed by the path to the file you want to change.

   ```bash
   aider src/app.py
   ```

3. Ask your question, or ask it to make a change.

**Expected result**
Aider starts with `src/app.py` visible to the model. Your next request is answered using that file as context, and the rest of your project is ignored.

Reference: [Using aider](https://aider.chat/docs/usage.html)

## Add another file only when you need it
If the file you are editing imports code from somewhere else, the assistant may ask for that second file. Do not add the whole project. Add just the missing file:

```bash
aider src/app.py src/utils.py
```

Then ask again.

**Expected result**
The assistant can see both files, but still ignores everything else in the folder.

Reference: [Using aider](https://aider.chat/docs/usage.html)

Keep the context small. One file is usually enough to start, and you can always add another.
