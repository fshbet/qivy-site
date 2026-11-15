---
title: 'Serve a local AI model behind an API so your scripts stay unchanged'
summary: 'Run an AI model on your own computer and point your existing scripts at it instead of a cloud API.'
category: ai
publishDate: 2026-11-15
seoTitle: 'Serve local AI model behind API - scripts stay unchanged'
metaDescription: 'Run a local AI model behind an API so your existing scripts keep working without rewrites. Practical steps using Ollama.'
verification: researched
sources:
  - 'https://github.com/ollama/ollama/blob/main/docs/api.md'
tags:
  - 'local-ai'
  - 'ollama'
  - 'api'
  - 'automation'
---
Your scripts call a cloud AI API. If that service changes price or goes offline, your automation breaks. You can run a model on your own computer and point the same scripts at it instead.

## Install Ollama
Ollama is a free program that downloads and runs AI models on your own computer. It also starts a local web server. This is known as an API. An API is a way for programs to send and receive data over HTTP. Other scripts can talk to the model.

Download the installer for your computer from ollama.com. On Linux, you can install it with:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Reference: [Ollama API documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)

## Start the model server
Run this command in a terminal:

```bash
ollama serve
```

This keeps Ollama running and opens port 11434. A port is a numbered door that a program uses to listen for requests. Leave this terminal window open.

Open another terminal and download a model. A model is the file that holds the AI's trained knowledge.

```bash
ollama pull llama3
```

Replace `llama3` with any model from the Ollama library if you prefer.

Reference: [Ollama API documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)

## Call the model from your script
Your script already sends an HTTP request, which is a message sent over the web to ask for something. Change the address it calls to `http://localhost:11434/api/chat`. `localhost` means your own computer.

Send JSON, which is plain text that programs can read easily. The request needs `model` and `messages`. `messages` is a list where each item has a `role`, such as `user`, and `content`, which is the text you want the model to read.

Here is a curl command you can paste to test it:

```bash
curl http://localhost:11434/api/chat -H "Content-Type: application/json" -d '{
  "model": "llama3",
  "messages": [{"role": "user", "content": "Say hello in one sentence"}]
}'
```

`-H` adds a header, which is extra information sent with the request. `-d` sends the data.

Reference: [Ollama API documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)

## Expected result
The server sends back JSON. Look for the `message.content` field, which contains the model's answer. If you see a reply, your local API is working.

Your scripts can now call `http://localhost:11434/api/chat` instead of a cloud endpoint. The logic of sending a prompt and reading the answer stays the same.
