---
title: 'Auto-post to LinkedIn from a Google Sheet — n8n step by step'
summary: 'An n8n workflow that posts to LinkedIn from a Google Sheet on a schedule, step by step, including the credential setup.'
category: automation
publishDate: 2026-05-01
seoTitle: 'Auto-Post to LinkedIn from Google Sheets'
metaDescription: 'An n8n workflow that posts to LinkedIn from a Google Sheet on a schedule, step by step, including the credential setup.'
verification: tested
sources: []
tags:
  - n8n
  - linkedin
  - google-sheets
  - workflow
---
The workflow: you write LinkedIn posts in a Google Sheet (one row = one post). A cron job in n8n runs every morning, picks the next unposted row, publishes it to LinkedIn, and marks it as posted. Write a week's worth of posts on Sunday. The rest happens automatically.

## What you need before starting

-   A working n8n instance (see the n8n beginner guide)
-   A LinkedIn account with API access (LinkedIn Developer Portal → create an app)
-   A Google Sheet with columns: **post\_text**, **scheduled\_date**, **status** (blank = pending, "posted" = done)

> **LinkedIn API note:** LinkedIn's Share API requires your app to have the "Share on LinkedIn" product added. Approval is instant for personal accounts. For company pages, you need the "Marketing Developer Platform" product, which requires a review.

## The 5-node workflow

-   **Node 1 — Schedule Trigger:** Set to run daily at 9:00 AM IST (cron: `0 9 * * *` in UTC+5:30)
-   **Node 2 — Google Sheets (Read):** Read all rows where status is blank
-   **Node 3 — IF:** Check if any rows were returned. If none, stop. If yes, take the first row.
-   **Node 4 — HTTP Request:** POST to LinkedIn Share API with the post text. Use OAuth2 credentials configured in n8n.
-   **Node 5 — Google Sheets (Update):** Mark the row's status column as "posted"

## Handling the LinkedIn rate limit

LinkedIn allows 150 API calls per day per application. For personal post automation, this is far more than needed (1 post/day = 1 API call). The real limit to watch is the undocumented posting frequency limit — LinkedIn can flag accounts that post more than 3–5 times per day as spam. Keep automated posting to once daily for personal profiles.
