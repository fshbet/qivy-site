---
title: 'Read a stack trace from the bottom up'
summary: 'A stack trace is just a list of where the computer stopped—here is how to read it and tell your AI assistant what to fix.'
category: ai
publishDate: 2026-11-27
seoTitle: 'Read a stack trace in plain language'
metaDescription: 'Learn to read a stack trace from the bottom up, find the broken line, and give your AI assistant enough detail to fix it.'
verification: researched
sources:
  - 'https://docs.python.org/3/tutorial/errors.html'
  - 'https://docs.python.org/3/library/traceback.html'
tags:
  - 'python'
  - 'debugging'
  - 'ai-coding'
  - 'stack-trace'
---
A coding assistant gives you a Python script. You run it, and a long block of text appears instead of an answer. That block is a stack trace: a list of every function call the computer was in the middle of when something went wrong. A function is a named block of code that does one job. You do not need to read all of it.

## What a stack trace is
Think of the computer as someone following a recipe. It starts at step one, then steps aside to do a smaller task, then steps aside again to do an even smaller one. The stack trace is the list of where it stopped, starting with the task it failed at and working back to the start. The last line names the error, such as TypeError or FileNotFoundError, and says what went wrong.
Reference: [Errors and exceptions](https://docs.python.org/3/tutorial/errors.html)

## Read it from the bottom up
1. Start at the final line. This is the error message. It tells you what failed, not where your mistake is.
2. Look at the block just above it. It shows the file name, line number, and function name where the computer stopped.
3. Keep going upward. Each block shows the function that asked the one below it to run.
4. Stop at the first file name that belongs to your project. Lines inside library folders or site-packages, the folder where installed libraries live, are usually not yours to fix.

```
Traceback (most recent call last):
  File 'bot.py', line 12, in <module>
    main()
  File 'bot.py', line 7, in main
    send_message(token)
TypeError: send_message() missing 1 required positional argument: 'token'
```

In this example, the error is on line 7 of bot.py, inside the main function. The computer tried to call send_message without giving it a token.

## Give your assistant only what it needs
Copy the last ten lines of the traceback, including the file name and line number. Paste them into your AI chat and ask it to fix that line. Do not paste your whole codebase unless the assistant asks.

## Expected result
You can point to the exact file and line number instead of saying it broke. Your assistant can suggest a one-line change, and you can verify it by running the script again.

Reference: [traceback — Print or retrieve a stack traceback](https://docs.python.org/3/library/traceback.html)
