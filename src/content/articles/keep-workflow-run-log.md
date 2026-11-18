---
title: 'Keep a log of every workflow run so you can prove it happened'
summary: 'See exactly when your automation ran, what it processed, and whether it succeeded — using built-in execution history instead of guessing.'
category: automation
publishDate: 2026-11-18
seoTitle: 'Workflow execution log - prove automation ran'
metaDescription: 'Check your workflow''s run history to see start times, status, and input/output data for every step. Practical automation logging.'
verification: researched
sources:
  - 'https://docs.n8n.io/workflows/'
tags:
  - 'automation'
  - 'logging'
  - 'n8n'
  - 'workflows'
---
You run an automation, but later no one can tell whether it actually worked. Without a record, you are guessing whether a file was moved, a message was sent, or a record was updated. Use your workflow tool's execution history to see what happened and when.

## Open the execution list

A workflow is a series of steps that run automatically. Each time it runs, n8n creates an execution, which is a record of that single run.

1. Open your workflow in n8n.
2. Click Executions in the sidebar.
3. Look at the list. Every row shows when the run started, whether it succeeded or failed, and how long it took.

Think of an execution like a receipt from a shop: it shows what happened, when, and whether it worked.

Reference: [Workflows](https://docs.n8n.io/workflows/)

## Inspect one run step by step

A node is one step inside a workflow, such as 'Get rows from Google Sheets' or 'Send email'. For each execution, you can see the input and output data for every node. Input data is what went into the step. Output data is what came out.

1. Click the newest execution in the list.
2. Click a node in the workflow graph.
3. Read the input and output panels. If the output is empty when you expected a result, that step did not do what you thought.

Reference: [Workflows](https://docs.n8n.io/workflows/)

## Keep proof after n8n clears old runs

n8n may remove old executions after a set time, depending on how you run it. If you need proof for weeks or months, save a summary somewhere you control.

1. Add a Set node to the end of your workflow. A Set node lets you choose which information to keep.
2. Add fields for the time of the run and the result you want to prove, such as 'File moved' or 'Message sent'.
3. Connect the Set node to a destination you can read later, such as a new row in a Google Sheet.
4. Save the workflow and run it once.

Reference: [Workflows](https://docs.n8n.io/workflows/)

## Expected result

After a run, the Executions list shows a new row. Opening that row shows the exact data each node received and sent. If you added the Set node, your destination sheet or file has a new row with the run's proof.
