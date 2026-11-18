---
title: 'Turn a messy webhook payload into one clean record'
summary: 'Transform inconsistent webhook data into a single flat record before saving it to a spreadsheet or database.'
category: automation
publishDate: 2026-11-18
seoTitle: 'Turn a messy webhook payload into one clean record'
metaDescription: 'Learn how to flatten inconsistent webhook JSON into a single clean record using n8n, then send it to a spreadsheet or database.'
verification: researched
sources:
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/'
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/'
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/'
tags:
  - 'webhook'
  - 'n8n'
  - 'automation'
  - 'data-cleaning'
---
A webhook often arrives as a nested, inconsistent block of data. One app sends customer_email, another sends email inside a user object. If you save that straight to a spreadsheet or database, you get empty cells and broken columns. You need to flatten it into one clean record before it goes anywhere.

## Catch the payload with a webhook node
Add a Webhook node to your workflow. Copy the URL it shows you and paste it into the sending app. The node waits for an HTTP request (a message sent over the web) and holds the payload (the block of data the app sends). Think of it as a labelled inbox tray: anything posted to that URL lands inside the node for you to inspect.
Reference: [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

## Look at exactly what arrived
Open the most recent execution in n8n. Click the Webhook node and study its JSON output (plain text that stores data as labelled pairs, like a form). Write down the exact field names you need, including any nesting. Copy capitalisation and spelling exactly - guessing will produce empty fields.

## Flatten the payload with a Code node
Add a Code node after the webhook. Use it to turn the messy input into one flat object (a record where every field sits at the top level, not buried inside another object). Paste this JavaScript:

```javascript
const raw = $input.first().json;
const clean = {
  event_type: raw.event_type || raw.type || 'unknown',
  email: raw.customer_email || raw.user?.email || raw.email || '',
  amount: Number(raw.amount) || 0,
  received_at: raw.received_at || raw.timestamp || new Date().toISOString()
};
return [{ json: clean }];
```

raw.user?.email uses optional chaining: it reads the email inside user only if user exists, otherwise it moves on without an error. The Code node returns a list, and n8n treats each item in that list as one record, so returning one item gives you one clean record.
Reference: [Code node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)

## Send the clean record onward
Connect the Code node to your destination - a Google Sheet row, a database insert, or an HTTP Request node (a step that calls another web address). Map each clean field to the same column or field every time. Because the Code node always emits the same keys, your destination receives a consistent shape no matter how messy the original payload was.
Reference: [Set node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/)

## Expected result
When the webhook fires, the next node receives one flat object with exactly these keys: event_type, email, amount, received_at. No nested arrays. No missing columns. If you append to Google Sheets, each call adds one row and every value lands in the same column.

You now have a stable record regardless of how the sending app formats its data.
