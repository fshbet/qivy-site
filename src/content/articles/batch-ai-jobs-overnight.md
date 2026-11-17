---
title: 'Batch a hundred small AI jobs overnight for a fraction of the price'
summary: 'Learn how to queue up many small AI tasks in one file, run them overnight through a batch API, and download all the answers together—usually cheaper than sending them one by one.'
category: ai
publishDate: 2026-11-17
seoTitle: 'Batch AI jobs overnight for less'
metaDescription: 'Queue up to a hundred small AI jobs in one batch file, run them overnight, and collect the answers together for less than individual requests.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/batch'
  - 'https://platform.openai.com/docs/api-reference/batches/create'
  - 'https://platform.openai.com/docs/api-reference/files/create'
  - 'https://platform.openai.com/docs/api-reference/batches/retrieve'
tags:
  - 'ai'
  - 'batch-processing'
  - 'openai'
  - 'automation'
  - 'llm'
---
Sending one hundred small AI jobs one by one means waiting for each answer before you start the next. A batch API—an interface that accepts many requests at once—lets you upload all the jobs at once, let them run overnight, and download the answers in a single file. This usually costs less than sending the same requests individually. Check your provider's pricing page for current rates before you start.

## Send a mailbag, not a hundred letters
A batch API is like posting one hundred letters in a single mailbag instead of making one hundred separate trips to the post box. You hand over a file of jobs, the provider processes them when it has capacity, and you collect the results later. Because the work is not happening in real time, providers often charge less for it.

Reference: [OpenAI Batch API guide](https://platform.openai.com/docs/guides/batch)

## Make a jobs file
Create a text file with one job per line. Each line must be valid JSON. This format is called JSONL, which means every line is one complete JSON object. Every line needs a model, a list of messages, and a custom_id. The custom_id is your label for that job, so you can match the answer back to the original task when the results arrive.

Save this as jobs.jsonl:

```
{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Extract the total from this invoice"}], "custom_id": "invoice-1"}
{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Extract the total from this invoice"}], "custom_id": "invoice-2"}
```

Add as many lines as you have jobs. One hundred lines means one hundred jobs.

Reference: [OpenAI Batch API guide](https://platform.openai.com/docs/guides/batch)

## Upload the file and start the batch
Set OPENAI_API_KEY to your secret key, then upload the file:

curl https://api.openai.com/v1/files -H "Authorization: Bearer $OPENAI_API_KEY" -F purpose="batch" -F file="@jobs.jsonl"

Copy the file id from the response. It looks like file-abc123. Next, create the batch. Replace file-abc123 with your id:

curl https://api.openai.com/v1/batches -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d '{"input_file_id": "file-abc123", "endpoint": "/v1/chat/completions", "completion_window": "24h"}'

The endpoint tells OpenAI which API to run. The completion_window of 24h means the batch should finish within a day. These field names come from OpenAI's API reference; if you use a different provider, check its docs for the exact names.

Reference: [Create a batch](https://platform.openai.com/docs/api-reference/batches/create)
Reference: [Upload a file](https://platform.openai.com/docs/api-reference/files/create)

## Collect the answers the next day
The provider will process the batch overnight. When it is done, you can download an output file. Each line in that file matches a custom_id from your jobs file, so you know which answer belongs to which job. If one job failed, its line contains an error message instead of an answer.

Reference: [Retrieve a batch](https://platform.openai.com/docs/api-reference/batches/retrieve)

## Expected result
You should see one JSONL file with one answer per job, labelled with your custom_id. Open it in any text editor to check the results, then copy them into your spreadsheet or system.
