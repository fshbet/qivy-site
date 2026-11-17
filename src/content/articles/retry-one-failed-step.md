---
title: 'Retry one failed step without re-running the whole workflow'
summary: 'Fix and re-run only the step that failed in an n8n workflow, so the steps that already worked do not run again.'
category: automation
publishDate: 2026-11-17
seoTitle: 'Retry one failed workflow step without starting over'
metaDescription: 'Learn how to re-run only the failed step in your n8n automation instead of repeating the whole workflow.'
verification: researched
sources:
  - 'https://docs.n8n.io/workflows/'
tags:
  - 'n8n'
  - 'automation'
  - 'workflows'
  - 'error-handling'
---
A workflow breaks at step six. Steps one to five already ran. You fix the problem, but running the whole workflow again repeats steps that already sent messages or updated records. That wastes time and can create duplicates. It is like burning the sauce on step six of a recipe and having to chop all the vegetables again.

## Find the step that failed
n8n runs a workflow as a series of nodes. A node is one step, such as "send an email" or "add a row to a sheet". Each run of the workflow is called an execution. n8n saves what every node received and sent during that execution.

Open the failed execution. Click the node marked with an error. Open the Input panel and copy the data shown there.

Reference: [Workflows](https://docs.n8n.io/workflows/)

## Test the fix on just that node
Make a new, empty workflow. Add the same type of node that failed. Paste the copied input into that node. It now receives exactly what the failed step received. Run this small workflow.

If it works, the node itself is fine. The problem was the data or a temporary error.

## Apply the fix and continue
Go back to the original workflow. Open the failed node and enter the corrected data.

Before you run anything, check the steps that came before. Ask: is it safe to run this step again? A step is safe to repeat if doing it twice gives the same result as doing it once. Think of a light switch: flicking it on ten times leaves the light in the same state as flicking it once. Sending an email or taking a payment is not safe to repeat.

If the earlier steps are safe, run the whole workflow. If they are not safe, do not run the whole workflow. Fix the data by hand, or move the risky node into its own workflow so you can run it alone next time.

## Expected result
The failed node finishes with the corrected data. The earlier nodes do not run again. You avoid duplicate messages, duplicate rows, and wasted time.
