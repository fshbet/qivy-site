---
title: 'Let an AI assistant use your accounts safely with a read-only key'
summary: 'Give an AI assistant read-only access to your accounts instead of your password, so it can view data but not change or delete anything.'
category: ai
publishDate: 2026-11-17
seoTitle: 'AI assistant read-only key for safe account access'
metaDescription: 'Use a read-only API key to let an AI assistant read your accounts without being able to change or delete your data. Steps and expected result included.'
verification: researched
sources:
  - 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens'
tags:
  - 'ai'
  - 'security'
  - 'api-key'
  - 'read-only'
---
You want an AI assistant to read your code, email, or calendar. Giving it your password or a full-access key lets it change or delete your data. A read-only key lets the assistant look, but not touch.

## Why a read-only key is safer

A password is like a master key. It opens every door, including the safe. An API key is a long string of characters that works like a password for computer programs. A full-access key lets an assistant send emails, delete files, or change settings. A read-only key lets the assistant see data only. Think of a key that opens the front door but not the safe.

Reference: [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

## Create a read-only key

1. Open the settings for the account you want to connect.
2. Find the access tokens or API keys section.
3. Create a new token. Give it a short name and set an expiry date (the date after which the key stops working) if the service offers one.
4. Choose only read or view permissions. Do not tick boxes for write, delete, admin, or manage.
5. Generate the token. Copy it at once. You usually cannot see it again after you close the window.
6. Store it in a password manager. Do not send it in chat or email.

Reference: [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

## Connect the assistant without pasting secrets into chat

1. Open the AI assistant's settings or integrations page (the page where you connect other accounts).
2. Paste the read-only key into the field for that service.
3. Save the connection and start a new conversation.
4. Ask the assistant to read one specific thing, such as a file or a message.
5. Never paste the key into the chat box where other people can read it.

Reference: [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

## Expected result

The assistant can list files, read messages, or summarise documents. It cannot push code, send email, or change account settings. If you ask it to delete something, the request should fail.

Delete the key when you no longer need the connection.
