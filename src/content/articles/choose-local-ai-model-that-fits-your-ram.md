---
title: 'Choose a local AI model that fits your RAM'
summary: 'Learn how to match a downloaded AI model to your computer’s memory so it runs instead of crashing.'
category: ai
publishDate: 2026-11-14
seoTitle: 'Choose local AI model size for your RAM'
metaDescription: 'Pick a local AI model that fits your computer’s RAM. A practical guide to memory, model size and quantisation without crashing your machine.'
verification: researched
sources:
  - 'https://docs.ollama.com/cli'
  - 'https://ollama.com/library'
tags:
  - 'ai'
  - 'local-llm'
  - 'ram'
  - 'ollama'
---
You download a local AI model, launch it, and your computer freezes or the program quits. The usual cause is simple: the model is larger than the available memory your computer can spare while running it.

## Check how much RAM you have
RAM is your computer’s short-term working space, the space programs use while they are open. Before picking a model, find out how much RAM your computer has and how much is free when you are not running heavy programs.

1. Open your system settings or activity monitor.
2. Look for the memory or RAM section.
3. Note the total and the amount currently free.

Your operating system and your browser will already use several gigabytes, so you cannot give the model every gigabyte you own.

## Match model size to your free memory
A model’s size is usually shown in its name, such as 7B or 70B. The B stands for billion parameters, which are the adjustable values inside the model. More parameters generally mean a more capable model, but also a larger file that needs more RAM.

Quantisation is the process of compressing the model so each parameter uses less space, usually with a small drop in quality. A 4-bit quantised model uses roughly half the memory of an 8-bit one, and far less than a full 16-bit version.

As a rough starting point, leave at least 2 to 4 gigabytes for your operating system and other programs, then choose a model smaller than what remains. If you have 8 gigabytes free, a 7-billion-parameter model at 4-bit quantisation is often a safe first choice; a 70-billion-parameter model will not fit.

Think of your RAM like a car boot and the model like a suitcase. A large suitcase simply will not close in a small boot, no matter how much you want it to.

Reference: [Ollama model library](https://ollama.com/library)

## Try a model and step down if it struggles
1. Open a terminal or command prompt.
2. Run a small model first:
   ollama run phi3:mini
3. If it answers quickly and your computer stays responsive, try a larger model:
   ollama run llama3.2:3b
4. If the computer slows to a crawl or the program crashes, stop and choose a smaller model or a more heavily quantised version.

Expected result: the model starts, replies to your prompt, and your computer remains usable while it runs.

Reference: [Ollama CLI reference](https://docs.ollama.com/cli)

Start smaller than you think you need. You can always move to a larger model later, but a model that does not fit will not run at all.
