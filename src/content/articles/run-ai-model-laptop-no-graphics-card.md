---
title: 'Run an AI model on a laptop without a graphics card'
summary: 'Run a small AI model on your laptop using only the processor it already has — no graphics card required.'
category: ai
publishDate: 2026-11-16
seoTitle: 'Run local AI on a laptop with no graphics card'
metaDescription: 'Run a small AI model on your laptop using only its main processor. Step-by-step setup with Ollama, no graphics card required.'
verification: researched
sources:
  - 'https://ollama.com/download'
  - 'https://github.com/ollama/ollama'
  - 'https://ollama.com/library'
tags:
  - 'local-ai'
  - 'ollama'
  - 'cpu-only'
  - 'laptop'
---
You do not need a dedicated graphics card to run an AI model on your laptop. The main processor inside most laptops can run a small model using only its CPU. Answers will come more slowly than on a machine with a graphics card, but the model will work.

## Install Ollama on your laptop

Ollama is free software that downloads and runs AI models on your own computer. If your laptop has no graphics card, Ollama uses the central processor (CPU), which is the main chip that runs your laptop.

1. Go to the Ollama download page and get the installer for Windows, macOS or Linux.
2. Open the installer and follow the prompts. On Windows this adds an Ollama icon to your system tray; on macOS it places Ollama in your Applications folder.
3. Open a terminal or command prompt. This is the text-only window where you type commands to your computer.

Reference: [Ollama download](https://ollama.com/download)

## Choose and run a small model

Pick a model with a small file size so it fits in your laptop's RAM. RAM is the memory your computer uses while programs are open. A three-billion-parameter model is usually a good starting point. Parameters are the internal patterns the model learned during training; fewer parameters need less memory.

Run this command:

`ollama run phi3:mini`

Ollama downloads the model the first time, then opens a chat prompt in your terminal. Type a question and press Enter. To finish, type /bye and press Enter.

Reference: [Ollama GitHub](https://github.com/ollama/ollama)

## Expected result

You should see text appear word by word in your terminal after you ask a question. No graphics card is required. The first reply may take longer while Ollama loads the model into memory; later answers are quicker.

## If answers feel slow, choose an even smaller model

On a laptop without a graphics card, speed depends on your processor, not on a graphics chip. If answers arrive too slowly, stop Ollama and run a smaller model, such as one with one or two billion parameters. Smaller models know less and may make more mistakes, but they answer faster and use less RAM.

You can see available models and their sizes on the Ollama model library before you download them.

Reference: [Ollama model library](https://ollama.com/library)
