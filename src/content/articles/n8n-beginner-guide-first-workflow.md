---
title: 'n8n beginner guide — your first workflow in under 30 minutes'
summary: 'Build your first working n8n workflow in under 30 minutes: install, triggers, nodes, connecting an app and testing the run.'
category: automation
publishDate: 2026-05-01
seoTitle: 'n8n Beginner Guide — First Workflow'
metaDescription: 'Build your first working n8n workflow in under 30 minutes: install, triggers, nodes, connecting an app and testing the run.'
verification: tested
sources: []
tags:
  - n8n
  - beginner
  - workflow
  - automation
---
**n8n** is an open-source workflow automation tool. You build visual workflows — nodes connected by arrows — that trigger on events, transform data, and call APIs. The key difference from Zapier or Make: you can self-host it for free on a ₹500/month VPS, with no per-workflow or per-execution limits.

## n8n vs Zapier — the honest comparison

| Factor | n8n (self-hosted) | Zapier |
| --- | --- | --- |
| Cost | ₹500–1000/month (VPS only) | ₹4,000–16,000/month for serious usage |
| Execution limits | None | Capped by plan (tasks/month) |
| Data privacy | Your data stays on your server | Data passes through Zapier's servers |
| Custom code | Full JavaScript / Python nodes | Limited code steps |
| Setup complexity | Moderate (Docker needed) | Zero — web UI only |
| Integrations | 400+ native + any API via HTTP | 6,000+ pre-built integrations |

> **Who should self-host?** If you run more than 1,000 automations per month, self-hosting n8n pays for itself vs Zapier in the first month. For lower volumes, n8n.cloud (managed, starts at ~$24/month) is a middle ground.

## Installing n8n with Docker

The fastest path to a working n8n instance on a Linux VPS:

-   Get a VPS (DigitalOcean Droplet, Hetzner, or AWS Lightsail — ₹500–1000/month)
-   Install Docker: `curl -fsSL https://get.docker.com | sh`
-   Run n8n: `docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n`
-   Access at `http://your-server-ip:5678`
-   Set up a reverse proxy (Caddy or Nginx) with HTTPS for production use

## Your first workflow: Webhook → Google Sheets

This workflow receives data from any source via HTTP and logs it to a Google Sheet — useful for logging form submissions, webhook events, or API calls.

-   **Node 1 — Webhook:** Add a Webhook node, copy the URL it generates
-   **Node 2 — Set:** Use a Set node to pick the fields you want to log
-   **Node 3 — Google Sheets:** Connect your Google account, select your spreadsheet, set action to "Append row"
-   Activate the workflow, send a test POST to the webhook URL, check your sheet

That's it. Every POST to that webhook URL now creates a new row in your Google Sheet — automatically, forever, at zero cost per execution.
