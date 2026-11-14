---
title: 'Connect two apps with a webhook when neither has an integration'
summary: 'Use a free automation tool as a middleman to catch one app’s webhook and forward it to the other app’s API when no native integration exists.'
category: automation
publishDate: 2026-11-14
seoTitle: 'Connect two apps with a webhook without a native integration'
metaDescription: 'Connect two apps that lack a native integration by using a webhook middleman that forwards data to the other app’s API.'
verification: researched
sources:
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/'
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/'
tags:
  - 'webhook'
  - 'automation'
  - 'n8n'
  - 'api'
---
App A can send a webhook. That means it posts information to a web address when something happens, like a doorbell that rings when a visitor presses the button. App B has an API endpoint. That is a web address that accepts information and acts on it.

Neither app has a built-in integration for the other. You need a middleman: a service that sits between them and passes messages.

n8n is a free automation tool that can act as this middleman. It receives webhooks and forwards them using its HTTP Request node.

Reference: [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

## Create the webhook URL

1. Open n8n and start a new workflow.
2. Add a Webhook node.
3. Choose POST as the method.
4. Copy the URL that n8n displays. This is the address App A will call.

Reference: [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

## Tell App A where to send its data

Open App A’s settings. Look for Webhooks, Outgoing webhooks, or Integrations. Add a new webhook. Paste the n8n URL. Choose the event that should trigger it, such as a new order or a form submission. Save the settings.

## Forward the data to App B

1. Add an HTTP Request node to the same workflow.
2. Connect it after the Webhook node.
3. Enter App B’s API endpoint URL.
4. Set the method to POST.
5. Send the incoming webhook data as the request body.
6. Save and activate the workflow.

Reference: [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

## Expected result

Trigger the event in App A. Open App B and check that the data arrived, such as a new row, message, or record. If it appears, the connection works.
