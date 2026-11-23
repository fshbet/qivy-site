---
title: 'Email yourself a weekly summary of what your scripts did'
summary: 'Set up a weekly email that lists what your scripts did, using a simple log file and Python.'
category: automation
publishDate: 2026-11-23
seoTitle: 'Email yourself a weekly script summary'
metaDescription: 'Send yourself a weekly email summarising what your scripts did, using a shared log file and a short Python script.'
verification: researched
sources:
  - 'https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files'
  - 'https://docs.python.org/3/library/smtplib.html'
tags:
  - 'automation'
  - 'email'
  - 'python'
  - 'scripting'
---
Your scripts run while you sleep, but they rarely tell you what they did. If one fails, you might not find out until days later. A weekly email summary fixes that by listing everything that ran and whether it worked.

## Keep a running list of what your scripts did
Ask every script to write one line to a shared text file when it finishes. This is called appending: adding to the end of a file without erasing what is already there. Think of it like a school diary, where each script notes down what it did before it stops.

Steps:
1. Open the script you want to track.
2. At the very end, add code that opens a file called script_log.txt and writes one sentence about what the script did.
3. Save and run the script once to make sure the file appears.

Reference: [Reading and writing files](https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files)

## Write a short script that emails that list
Use Python's smtplib library. It lets a program send email using SMTP (Simple Mail Transfer Protocol, the standard way email moves between computers). Your weekly script reads script_log.txt and sends it to your inbox.

Steps:
1. Save the following code as weekly_email.py.
2. Replace smtp.example.com with your email provider's outgoing server.
3. Replace the email addresses and password with your own.

```python
import smtplib

with open("script_log.txt") as f:
    body = f.read()

message = "Subject: Weekly script summary\n\n" + body

with smtplib.SMTP("smtp.example.com", 587) as server:
    server.starttls()
    server.login("you@example.com", "your-password")
    server.sendmail("you@example.com", "you@example.com", message)
```

Never store your main email password in a script. Use an app password or an environment variable instead.

Reference: [smtplib — SMTP protocol client](https://docs.python.org/3/library/smtplib.html)

## Schedule it to run once a week
Tell your computer to run weekly_email.py automatically, for example every Monday morning. On Linux or macOS this is usually handled by cron, a time-based scheduler. On Windows, use Task Scheduler. The important part is that it runs without you starting it.

Steps:
1. Open your system's task scheduler.
2. Create a new task that runs weekly_email.py.
3. Set it to repeat every week on the day and time you choose.

## Expected result
On Monday morning you should receive an email with lines such as:

Backed up photos on Monday.
Renamed invoice files on Tuesday.
Checked for updates on Wednesday.

If the email arrives empty, you know your scripts did not run that week.
