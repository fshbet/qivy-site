---
title: 'Run a scheduled workflow with no paid services'
summary: 'Set up a free self-hosted n8n workflow that runs on a timer using its built-in Cron node — no cloud subscription needed.'
category: automation
publishDate: 2026-11-14
seoTitle: 'Scheduled workflow with no paid services'
metaDescription: 'Build a repeating automation for free with self-hosted n8n and its built-in Cron node. No paid scheduler required.'
verification: researched
sources:
  - 'https://docs.n8n.io/hosting/installation/docker/'
  - 'https://docs.n8n.io/integrations/builtin/trigger-nodes/cron/'
tags:
  - 'automation'
  - 'n8n'
  - 'cron'
  - 'self-hosted'
---
You want something to happen automatically every day or every week, but paid automation tools charge a monthly fee just for the timer. You can run the same schedule yourself for free.

## What you need

- A computer that stays switched on, such as an old laptop or a Raspberry Pi.
- Docker installed. Docker packs an application and everything it needs into a container, so it runs the same way on any machine.
- Ten minutes.

Reference: [Install n8n with Docker](https://docs.n8n.io/hosting/installation/docker/)

## Install n8n

1. Open a terminal and run:

   docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n

2. This starts n8n in a container and opens it on port 5678 of your computer. A port is like a numbered doorway that lets your browser reach the right program. Your workflows are saved in a volume called n8n_data, so they remain after you stop and restart the container.

3. Open http://localhost:5678 in your browser and follow the setup screens.

Reference: [Install n8n with Docker](https://docs.n8n.io/hosting/installation/docker/)

## Add a timer

1. Open n8n and create a new workflow. A workflow is a series of connected steps that run automatically.
2. Click the plus (+) button and select Cron. A trigger is the part of a workflow that starts it. Cron starts your workflow on a clock schedule instead of waiting for you to press a button. Think of it as an alarm clock for your automation.
3. Set Cron to run every minute for now. Later you can change it to daily, weekly, or a custom time.
4. Add a Set node after Cron. Give it a field called status with the value 'It ran'. This node is just a placeholder so you can see the result when the workflow finishes.

Reference: [Cron node](https://docs.n8n.io/integrations/builtin/trigger-nodes/cron/)

## Turn it on

Click Save, then switch the workflow to Active. Leave the n8n container running.

## Expected result

Within one minute, open the Executions list in n8n. You should see a successful run with the status field showing 'It ran'. If you do, the timer works. Change Cron to your real schedule and add more nodes after it, such as Send Email or Slack, to do useful work automatically.
