---
title: 'Run a smaller AI model: quantisation explained in numbers'
summary: 'Quantisation shrinks the numbers inside an AI model so it fits in your RAM, and you can run one yourself in ten minutes.'
category: ai
publishDate: 2026-11-16
seoTitle: 'Quantisation explained: run smaller AI models locally'
metaDescription: 'Quantisation shrinks the numbers inside an AI model so it fits in your RAM. See the maths and run a quantised model yourself.'
verification: researched
sources:
  - 'https://github.com/ggerganov/llama.cpp/blob/master/docs/README.md'
  - 'https://github.com/ollama/ollama/blob/main/docs/README.md'
tags:
  - 'ai'
  - 'quantisation'
  - 'local-ai'
  - 'llm'
---
Your AI model is a list of numbers. A large model holds billions of them, so it needs more memory than most laptops or phones have. Quantisation stores those numbers with less detail, so the model fits in your machine and still replies to your prompts.

## The numbers your machine stores

A model's parameters are the numbers it learns during training. At full 16-bit precision, each number uses 16 binary digits, or two bytes of memory. A seven-billion-parameter model therefore needs about 14 gigabytes just to hold its weights — those are the same parameters — before any memory is left for actually running it.

At 4-bit quantisation, each number uses four binary digits, or half a byte. The same seven-billion-parameter model needs about 3.5 gigabytes. The model is smaller because each number is rounded, like writing a price to the nearest pound instead of recording every penny.

Reference: [GGUF quantisation in llama.cpp](https://github.com/ggerganov/llama.cpp/blob/master/docs/README.md)

## Pick a model that fits your RAM

RAM is the memory your computer uses while it is working. Check how much you have. On Linux, run `free -h`. On macOS, open Activity Monitor and look at Memory. On Windows, open Task Manager and choose Performance.

Subtract about two gigabytes for your operating system and other apps. The rest is what the model can use. If you have eight gigabytes free, a quantised seven-billion-parameter model at 4-bit will fit, while the full 16-bit version will not.

Look for model files ending in `.gguf`. GGUF is a file format that stores a quantised model. Names such as `Q4_K_M` mean four-bit quantisation and are a good starting point. `Q8_0` uses eight bits and is larger but closer to the original.

Reference: [GGUF quantisation in llama.cpp](https://github.com/ggerganov/llama.cpp/blob/master/docs/README.md)

## Download and run a quantised model

Install Ollama from the official site if you do not have it. Then open a terminal and run:

1. `ollama pull llama3.2:1b`
2. `ollama run llama3.2:1b`

Ollama serves popular models in quantised forms so they run on ordinary hardware. Type a question and press Enter.

Reference: [Ollama command line reference](https://github.com/ollama/ollama/blob/main/docs/README.md)

Expected result

The terminal prints the model's reply. Type `/bye` to exit. If the model answers without crashing, your computer has enough memory for the quantised version.

Keep the smallest model that answers well enough. If replies are too vague, try a larger quantisation such as Q8_0 or a bigger model, as long as it still fits in your RAM.
