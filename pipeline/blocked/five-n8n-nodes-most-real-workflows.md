---
title: 'The five n8n nodes that cover most real workflows'
summary: 'Learn the five n8n nodes that handle most everyday automation workflows, with steps for each one.'
category: automation
publishDate: 2026-11-14
seoTitle: 'Five n8n nodes for most workflows'
metaDescription: 'The five n8n nodes that cover most real workflows, with copy-paste steps for Webhook, HTTP Request, Set, If and Code.'
verification: researched
sources:
  - 'https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.webhook/'
  - 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.httprequest/'
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/'
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/'
  - 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/'
tags:
  - 'n8n'
  - 'automation'
  - 'workflow-nodes'
  - 'beginner-automation'
---
You open n8n and face a long list of nodes. A node is a block that does one job. A workflow is a chain of nodes that runs automatically. Most real workflows reuse the same five blocks.

## Webhook — start the workflow when an app sends data
A webhook is a web address that waits for a message from another app. It works like a doorbell that rings when a visitor arrives. Use it to start a workflow when a form is submitted, a payment arrives, or a message is sent.

1. Open your n8n workflow and add a Webhook node.
2. Choose the POST method.
3. Click Save workflow, then copy the webhook URL n8n shows you.
4. Paste that URL into the other app as its destination address.
5. Send a test submission from the other app.

Expected result: The n8n execution list shows a new run. The Webhook node displays the data it received.

Reference: [Webhook node](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.webhook/)

## HTTP Request — send or fetch data from another app
An API is a set of rules that lets one computer program ask another for data. The HTTP Request node talks to that API. It works much like typing a web address into a browser, but automatically.

1. Add an HTTP Request node after your trigger.
2. Set Method to GET to fetch data, or POST to send data.
3. Paste the API endpoint URL.
4. If the app needs a key, add it under Authentication as a header.
5. Run the node.

Expected result: The node returns a JSON object. That is a labelled list of data. Later nodes can read it.

Reference: [HTTP Request node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.httprequest/)

## Set — rename and move data between steps
The Set node picks the pieces of information you need. It gives them new names. Think of it as labelling boxes before you put them in a cupboard.

1. Add a Set node after a node that produced data.
2. Click Add field.
3. In Name, type the new field name.
4. In Value, drag a field from the previous node. Or type an expression. An expression is a small formula that pulls data from an earlier step. For example, type {{ $json.email }}.
5. Save and run.

Expected result: The next node receives only the fields you selected. It receives them under the names you chose.

Reference: [Set node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/)

## If — split the workflow into two paths
The If node asks a true-or-false question. It sends the data down one path or the other. It works like a railway switch.

1. Add an If node after your data step.
2. Choose the field to check.
3. Choose the rule, such as Greater than or Equal to.
4. Enter the value to compare against.
5. Connect different nodes to the True and False outputs.

Expected result: When the condition is met, only the True branch runs. Otherwise, only the False branch runs.

Reference: [If node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/)

## Code — add custom logic when built-in nodes are not enough
The Code node runs a short JavaScript program. JavaScript is a programming language. It can calculate, format, or filter data in ways the ready-made nodes cannot.

1. Add a Code node.
2. Keep Language set to JavaScript.
3. Write a small function that reads $input.item.json. Return the data you want.
4. Save and run.

Expected result: The node outputs the transformed data exactly as your script specifies.

Reference: [Code node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)

## What your finished test should look like
Run the workflow from the other app. You should see one green execution in n8n. Data should move from Webhook through HTTP Request, Set, If, and Code without errors. If any node turns red, open it. Check the field names against the previous node's output.
