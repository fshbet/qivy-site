---
title: 'Post one note to three places at once'
summary: 'Send the same note to several apps at the same time instead of copying it by hand.'
category: automation
publishDate: 2026-11-27
seoTitle: 'Post one note to three apps at once'
metaDescription: 'Send one note to multiple destinations at once using an n8n workflow, with steps and expected results.'
verification: researched
sources:
  - 'https://docs.n8n.io/workflows/'
tags:
  - 'automation'
  - 'n8n'
  - 'multi-post'
---
You write one note and want it in your notebook, your expense sheet, and your team chat. Copying it three times takes time, and you will forget one destination.

## What you need
Use n8n. It is an automation tool that moves information between apps without you writing code. A workflow is the list of steps. A node is one step, such as "create a page". The trigger is the event that starts the workflow.
Think of the workflow as labelled boxes joined by string. You put the note in the first box, and the same note comes out of three other boxes.
You can run n8n on your own computer or use n8n's hosted service.
Reference: [Workflows](https://docs.n8n.io/workflows/)

## Build the fan-out
1. Open n8n and add a Manual Trigger node. This gives you a button to click and a box to type your note.
2. Add a node for each destination. Notion, Google Sheets, and Slack work well. Connect each node directly to the Manual Trigger. Do not connect the destinations to each other.
3. In each destination node, open the message or page body field. Choose the note text from the trigger so the same words go to all three places.
4. Save the workflow.
Reference: [Workflows](https://docs.n8n.io/workflows/)

## Run it
Click Execute Workflow. Type your note and run it. The text goes to all three destinations at the same time.

## Expected result
You should see one new item in each app, all containing the same note. You typed it only once. If a destination stays empty, check that its node is connected to the trigger and that you saved.
