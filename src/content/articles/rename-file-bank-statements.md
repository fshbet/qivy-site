---
title: 'Rename and file bank statements as they arrive'
summary: 'A small Python script saves new bank statements from your email, renames them, and files them into folders so you never sort them by hand.'
category: automation
publishDate: 2026-11-27
seoTitle: 'Automate bank statement filing with Python'
metaDescription: 'Use a short Python script to download bank statements from your email, rename them, and save them in dated folders automatically.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/imaplib.html'
  - 'https://docs.python.org/3/library/email.html'
  - 'https://docs.python.org/3/library/pathlib.html'
tags:
  - 'automation'
  - 'python'
  - 'email'
  - 'bank-statements'
---
Bank statements often arrive with names like statement.pdf or attachment_04.pdf. They sit in your inbox or Downloads folder until you have time to rename them and move them to the right folder. A short Python script can do that job as soon as each statement lands.

## What the script does
It connects to your email using IMAP, which lets a program read messages stored on a mail server. It looks for new messages from your bank, saves any PDF attachment, and files the file into a folder on your computer. Think of it like giving the script a key to your mailbox so it can collect letters for you.
Reference: [imaplib — IMAP4 protocol client](https://docs.python.org/3/library/imaplib.html)

## What you need before you start
You need Python installed on your computer and an email account that allows IMAP access. You also need an app password, which is a special password for programs instead of your normal login password. Ask your email provider how to create one. Finally, note the email address your bank sends statements from.

## Copy and save the script
Save this as `file_statements.py`:

```python
import imaplib
import email
from pathlib import Path

IMAP_SERVER = "imap.example.com"
EMAIL_ADDRESS = "you@example.com"
APP_PASSWORD = "your-app-password"
BANK_SENDER = "your-bank@yourbank.com"
DESTINATION = Path.home() / "Documents" / "Bank Statements"

mail = imaplib.IMAP4_SSL(IMAP_SERVER)
mail.login(EMAIL_ADDRESS, APP_PASSWORD)
mail.select("inbox")

status, messages = mail.search(None, "(UNSEEN)")
if not messages[0]:
    print("No new statements.")
    mail.logout()
    raise SystemExit

for num in messages[0].split():
    status, data = mail.fetch(num.decode(), "(RFC822)")
    raw_email = data[0][1]
    msg = email.message_from_bytes(raw_email)

    sender = msg.get("From", "")
    if BANK_SENDER not in sender:
        continue

    for part in msg.walk():
        if part.get_content_maintype() == "multipart":
            continue
        if part.get("Content-Disposition") is None:
            continue
        filename = part.get_filename()
        if not filename:
            continue

        DESTINATION.mkdir(parents=True, exist_ok=True)
        filepath = DESTINATION / filename
        with open(filepath, "wb") as f:
            f.write(part.get_payload(decode=True))
        print(f"Saved: {filepath}")

mail.logout()
```
Reference: [email — An email and MIME handling package](https://docs.python.org/3/library/email.html)

## Edit the parts that belong to you
Replace `imap.example.com` with your email provider's IMAP server. Replace the email address, app password, and bank sender address with your own details.

## Run it
Open a terminal or command prompt, the text-based way to run programs on your computer, and run:

python file_statements.py

The script prints the name of each file it saves.

## Expected result
Each new bank statement PDF appears in your Documents/Bank Statements folder. After the first run, those email messages are marked as read, so running the script again does not save them twice.

Keep it running by starting it once a week, or set your computer to run it on a schedule.
