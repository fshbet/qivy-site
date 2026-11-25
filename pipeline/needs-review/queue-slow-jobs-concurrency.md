---
title: 'Queue slow jobs so they do not all run at the same time'
summary: 'Stop your computer from grinding to a halt by running slow automation jobs in a limited queue instead of all at once.'
category: automation
publishDate: 2026-11-25
seoTitle: 'Queue slow jobs so they do not all run at once'
metaDescription: 'Learn to run slow automation jobs in a queue so only a few run at the same time and your system stays responsive.'
verification: researched
sources:
  - 'https://www.gnu.org/software/parallel/man.html'
tags:
  - 'automation'
  - 'concurrency'
  - 'job-queue'
  - 'shell'
---
If you start ten slow automation jobs at the same time, your computer can grind to a halt or an online service can block you. Running them one by one is safe but slow. A queue lets you choose how many run together, while the rest wait their turn.

## What a queue does
A queue is a waiting line for work. You give it a list of jobs. It starts only as many as you allow, and starts the next one as soon as a slot frees up.

It works like a supermarket checkout: three tills are open, and everyone else waits in line instead of crowding the counter.

Reference: [GNU Parallel manual](https://www.gnu.org/software/parallel/man.html)

## Put your jobs in a text file
Create a file called `jobs.txt`. Put one command on each line. Each line can be any command you would normally type into the terminal, the text-only panel where you run commands.

```
python scrape_site.py page1
python scrape_site.py page2
python scrape_site.py page3
```

## Limit how many run at once
Install GNU Parallel if you do not have it. Then run:

```
cat jobs.txt | parallel -j 3
```

The `-j` part is a flag, which is a switch you add to a command to change its behaviour. It sets the maximum number of jobs to run at the same time. `-j 3` means never more than three at once. If you are not sure what number to use, start with 2 or 3. As soon as one job finishes, the next line from the file starts.

Reference: [GNU Parallel manual](https://www.gnu.org/software/parallel/man.html)

## Expected result
You will see output from up to three jobs at a time. When one job ends, another starts. When the file is empty, the command finishes and you return to your prompt. Your computer stays responsive because not every job runs together.

Reference: [GNU Parallel manual](https://www.gnu.org/software/parallel/man.html)
