---
title: 'RSS-to-newsletter automation — zero-touch weekly publishing with n8n'
summary: 'Zero-touch weekly publishing: an n8n workflow that turns an RSS feed into a formatted newsletter and sends it on a schedule.'
category: automation
publishDate: 2026-04-01
seoTitle: 'RSS to Newsletter Automation with n8n'
metaDescription: 'Zero-touch weekly publishing: an n8n workflow that turns an RSS feed into a formatted newsletter and sends it on a schedule.'
verification: tested
sources: []
tags:
  - n8n
  - rss
  - newsletter
  - workflow
---
The workflow: n8n polls a set of RSS feeds every week, collects new articles, passes them through an AI summary node, formats them into a newsletter HTML template, and sends via Mailchimp or Brevo — all without you touching it. You write the template once. The content selects itself.

## Choosing your RSS sources

Pick 5–10 RSS feeds relevant to your newsletter topic. Most major publications still have RSS — just append `/rss` or `/feed` to the URL. For sites without RSS, tools like RSSHub (self-hostable) can generate feeds from social media, YouTube channels, or Notion pages.

> **Quality over quantity:** Use the IF node in n8n to filter articles by keyword before passing them to AI. Only articles containing your topic keywords get included — this prevents off-topic content from cluttering the newsletter.

## The workflow architecture (7 nodes)

-   **Schedule Trigger:** Every Monday at 7:00 AM
-   **RSS Feed Read (×5):** One node per source, merged into a single array
-   **Filter:** Remove articles older than 7 days
-   **OpenAI (or Ollama local):** Summarise each article title + description into 1 sentence
-   **Code node:** Format items into an HTML newsletter template with your branding
-   **Mailchimp / Brevo:** Create campaign and send to your list
-   **Google Sheets (log):** Write the sent items to a log sheet for reference

## AI summarisation — local vs cloud

Using OpenAI's GPT-4o-mini API costs roughly $0.0001 per article summary — for a 20-article weekly newsletter, that's about ₹0.17 per send. Effectively free. If you prefer to keep data local, swap the OpenAI node for an Ollama node pointing at a local LLM (llama3.2 works well for summarisation).

## Sending via Brevo (formerly Sendinblue) — India's best free tier

Brevo offers 300 emails/day free with no credit card required. For a weekly newsletter with under 2,100 subscribers, you'll never hit the limit. It has a native n8n integration node. Mailchimp's free tier is more limited (500 contacts) and requires more setup for transactional sending.
