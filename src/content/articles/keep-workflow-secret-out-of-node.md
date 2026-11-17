---
title: 'Keep your workflow secret out of the node'
summary: 'Store API keys and passwords in n8n Credentials instead of pasting them into nodes, so exports and backups never leak them.'
category: automation
publishDate: 2026-11-17
seoTitle: 'Keep workflow secrets out of automation nodes'
metaDescription: 'Keep API keys and passwords out of your automation nodes by storing them in n8n Credentials. Safe sharing, exporting, and rotation in under ten minutes.'
verification: researched
sources:
  - 'https://docs.n8n.io/credentials/'
tags:
  - 'n8n'
  - 'automation'
  - 'credentials'
  - 'secrets'
---
Pasting an API key or password directly into an automation node means anyone who can open the workflow can read the secret. That same key also ends up in every export, backup, and copy of the workflow. Store it separately instead.

## Put the secret in a credential, not in the node
A credential is a stored password, API key, or token that the automation tool keeps apart from your workflow. An API key is a secret code that lets one program talk to another. In n8n, selecting a credential inside a node lets the node use the value when it runs, without embedding the value in the workflow file. It works like giving a courier a key card instead of writing your house key on the parcel.

Open the Credentials page in n8n.
Create a new credential and give it a name.
Pick the type that matches your service, such as API Key.
Paste the secret value into the form and save.
Open the node that needs the secret, such as the HTTP Request node.
Choose your saved credential in the authentication settings instead of pasting the key into a field.

Reference: [n8n credentials](https://docs.n8n.io/credentials/)

## Change the key in one place
If the secret changes, update it once in the credential. Every workflow that uses that credential picks up the new value the next time it runs. You do not need to open every node and paste a new key.

Reference: [n8n credentials](https://docs.n8n.io/credentials/)

## Expected result
Run the workflow once. It should connect without an authentication error. Then export the workflow and open the exported file. The secret value should not appear in plain text.

You can now share or back up the workflow without sharing the secret.
