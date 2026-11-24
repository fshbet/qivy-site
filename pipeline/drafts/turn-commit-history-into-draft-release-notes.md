---
title: 'Turn your commit history into draft release notes'
summary: 'Pull your Git commit log and ask an AI to turn it into readable release notes in minutes.'
category: ai
publishDate: 2026-11-24
seoTitle: 'Create release notes from commit history with AI'
metaDescription: 'Generate draft release notes from your Git commit history using a simple terminal command and an AI chat.'
verification: researched
sources:
  - 'https://git-scm.com/docs/git-log'
tags:
  - 'git'
  - 'ai'
  - 'release-notes'
---
You need release notes before a launch, but your commit history is a list of short, technical messages. You can pull that list from Git and ask an AI to turn it into a draft anyone can read.

## List the commits since your last release

Open your terminal (the window where you type commands) in the project folder. Run:

git log v1.0.0..HEAD --oneline --no-merges

Replace v1.0.0 with your last release tag. A tag is a label you attach to a specific release. If you do not use tags, run:

git log --since="2 weeks ago" --oneline --no-merges

A commit is a saved snapshot of your code with a message attached. HEAD means the latest version on your current branch. The range v1.0.0..HEAD means "everything after that tag up to now". --oneline shows each commit as one short line. --no-merges leaves out merge commits, which usually just say "Merge branch" and add noise.

Think of it like asking for every page in a diary since a certain date, then ripping out the pages that only say "continued from previous page".

Expected result: a list of short lines, each starting with a code and a message.

a1b2c3d Fix login timeout on slow networks
e4f5g6h Add dark mode toggle

Reference: [git-log documentation](https://git-scm.com/docs/git-log)

## Paste the list into an AI chat

Copy the output. Paste it into any AI chat tool you already use, with this prompt:

Turn these commit messages into draft release notes. Group them into Features, Fixes, and Other changes. Use plain language. Do not invent anything that is not in the list. Keep it short enough to read in under a minute.

An AI chat is a conversation with a large language model, which is a program that predicts likely next words based on patterns it learned during training.

Expected result: a short draft with headings and bullet points that you can tidy up.

## Check the draft before you publish

Read the AI output against the commit list. Remove anything the AI guessed. Add human context, such as "customers will notice faster logins" or "no action needed if you use the mobile app".

Save the draft in your release notes file or paste it into your release platform.

Expected result: a draft release notes file you can send to a teammate or publish with your next release.
