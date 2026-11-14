---
title: 'Use an AI coding agent on an existing codebase without breaking it'
summary: 'Commit your work, make one small change at a time, and review every diff before you accept it.'
category: ai
publishDate: 2026-11-14
seoTitle: 'AI coding agent existing codebase safety'
metaDescription: 'How to use an AI coding agent on an existing codebase without breaking it: commit first, work in small steps, review diffs, and test before moving on.'
verification: researched
sources:
  - 'https://git-scm.com/docs/git-commit'
  - 'https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/chat-with-copilot/chat-in-ide'
  - 'https://git-scm.com/docs/git-diff'
  - 'https://git-scm.com/docs/git-restore'
tags:
  - 'ai'
  - 'coding-agent'
  - 'git'
  - 'code-safety'
---
An AI coding agent is a program that writes or edits code for you, and it can change files across your whole project in seconds. That speed helps, but it can also break code that works today. Use these steps to try its changes without losing anything.

## Commit everything before you start
A commit is a save point in Git, the tool that tracks changes to your code. If the agent breaks something, you can go back to this exact moment.
1. Open your terminal inside the project folder.
2. Run `git status` to see which files have changes.
3. Run `git add .` to stage all current work.
4. Run `git commit -m "Save point before AI agent changes"`.
Reference: [git commit](https://git-scm.com/docs/git-commit)

## Ask for one small change at a time
Give the agent a single task, like fixing one function. Do not ask it to redesign the whole app at once. It is like asking a builder to repair one tap instead of rewiring the house.
1. Open your AI coding agent chat.
2. Point it to one file or folder.
3. Ask for one change, for example: "Add a null check to the login function. Do not change anything else."
4. Wait for the agent to show proposed edits.
Reference: [Asking GitHub Copilot questions in your IDE](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/chat-with-copilot/chat-in-ide)

## Review the diff before you accept
A diff shows what will be added (+) and removed (-). Treat it like checking a proofread essay before you hand it in.
1. Open the diff view your agent displays.
2. Read every file listed.
3. Reject any change in a file you did not ask about.
4. Accept only the edits you understand.
Reference: [git diff](https://git-scm.com/docs/git-diff)

## Run your tests after every change
Tests check that the code still works. It is like turning on the lights after rewiring a room.
1. Find your test command, such as `npm test`, `pytest`, or `go test`.
2. Run it after accepting the agent's change.
3. If a test fails, undo the agent's edit with `git restore .`.
4. Commit again only when tests pass.
Reference: [git restore](https://git-scm.com/docs/git-restore)

## Expected result
You should see a clean list of commits, only the files you asked about changed, passing tests, and a single command that undoes anything the agent broke.
