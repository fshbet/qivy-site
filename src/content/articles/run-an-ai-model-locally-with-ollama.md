---
title: 'Run an AI model locally with Ollama — install to first answer'
summary: 'Install Ollama, pull a model and get your first local answer in about ten minutes — no account, no API key, no per-token cost, and nothing leaving your machine.'
category: ai
publishDate: 2026-11-07
seoTitle: 'Run an AI Model Locally with Ollama'
metaDescription: 'Install Ollama, pull a model and run a local AI model offline. Covers the commands, the local API on port 11434, and how much RAM you need.'
verification: researched
sources:
  - 'https://docs.ollama.com/quickstart'
  - 'https://docs.ollama.com/api'
  - 'https://github.com/ollama/ollama'
tags:
  - ollama
  - local-ai
  - open-source
  - privacy
spotlight: true
---

Cloud AI is convenient until one of three things bites: you are working with
data you would rather not upload, you are watching a per-token bill, or you
have no connection. A local model solves all three — and the setup is far less
work than it used to be.

Ollama is the shortest path. It handles downloading, quantisation and serving,
so getting a model running is two commands.

## 1. Install Ollama

Download the installer for your platform from
[ollama.com](https://ollama.com) — macOS, Windows and Linux are all supported.
On Linux you can install from the shell instead:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Check it is on your PATH:

```bash
ollama --version
```

## 2. Pull and run a model

One command does both — it downloads the model if you don't already have it,
then drops you into a chat prompt:

```bash
ollama run llama3.2
```

The first run downloads several gigabytes, so it takes a few minutes. Every run
after that starts in seconds.

To download without starting a chat, use `pull` instead:

```bash
ollama pull llama3.2
ollama list
```

`ollama list` shows what you have locally, with sizes — useful when you start
collecting models and your disk starts complaining.

## 3. Pick a size that fits your RAM

This is where most first attempts go wrong. A model has to fit in memory, and
picking one that doesn't gives you something that technically runs but is too
slow to use.

The rough guide, for 4-bit quantised models:

| Model size | Approximate RAM | Realistic use |
|---|---|---|
| 1–3B | 8 GB | Summarising, simple rewriting, classification |
| 7–8B | 16 GB | General chat, drafting, light code help |
| 13–14B | 32 GB | Better reasoning, longer context |
| 70B | 64 GB+ | Comfortably needs a dedicated GPU |

Start with a 7–8B model on a 16 GB machine. If output is too slow, drop to a
3B. A model that fits and answers in two seconds beats a bigger one that takes
a minute.

## 4. Use it from your own code

Once Ollama is running, it serves a local HTTP API on port `11434`. This is
the part that makes it genuinely useful — anything that can make an HTTP
request can use it.

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Summarise this in one sentence: ",
  "stream": false
}'
```

For multi-turn conversations use `/api/chat`, which takes a `messages` array
rather than a single prompt:

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    { "role": "user", "content": "Explain webhooks in two sentences." }
  ],
  "stream": false
}'
```

Set `"stream": false` to get one complete JSON response. Leave it at the
default and you get a stream of partial JSON objects instead, which is what
you want for a UI that types out the answer but a nuisance for a script.

## Expected result

`ollama run llama3.2` gives you an interactive prompt that answers without a
network connection, and `curl` against `localhost:11434` returns JSON you can
pipe into anything. No API key exists, because there is no service to
authenticate against — the model is running on your own hardware.

Type `/bye` to leave the chat prompt.

## Where this is worth it

Local models are a clear win for summarising private documents, classifying
or tagging large batches of text where per-token cost would add up, and
offline drafting. They are still behind the best hosted models on hard
reasoning and long-context work — so the practical setup is both: local for
the bulk and the sensitive material, hosted for the genuinely difficult asks.

If you want to automate something on top of this, the same `localhost:11434`
endpoint works as an HTTP step in a workflow tool — see
[the n8n beginner guide](/automation/n8n-beginner-guide-first-workflow/) for
the wiring.
