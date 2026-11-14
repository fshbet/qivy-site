---
title: 'Send a notification from Python in fifteen lines'
summary: 'Send a phone notification from Python in about fifteen lines using a free HTTP service, with no account needed.'
category: automation
publishDate: 2026-11-14
seoTitle: 'Send Python notifications in 15 lines'
metaDescription: 'Send a notification from Python in fifteen lines using requests and ntfy. No account needed, and it works in minutes.'
verification: researched
sources:
  - 'https://ntfy.sh/docs/publish/'
tags:
  - 'python'
  - 'notifications'
  - 'automation'
---
Your script runs for ten minutes, but you are in another room. You do not want to keep switching back to check if it has finished. A short message on your phone solves this.

## Pick a topic name
Choose one word or phrase that acts as the address for your notifications. Think of it like the name of a WhatsApp group, but anyone who knows the name can send to it. You do not need to create an account first.

Reference: [Publish messages](https://ntfy.sh/docs/publish/)

## Write the Python script
Save this as `send_notify.py`. It uses the `requests` library, which is a file of ready-made code for sending data over the web.

```python
import requests

topic = "my-python-alerts"
message = "Your Python script has finished."

response = requests.post(
    f"https://ntfy.sh/{topic}",
    data=message.encode("utf-8"),
    headers={"Title": "Python notification"},
)

print(response.status_code)
```

`requests.post` sends an HTTP POST, which means posting data to a web address, like slipping a letter through a letterbox. The topic name goes inside the web address. `headers` lets you add a title, just like the subject line of an email.

You can change `topic` and `message` to anything you like.

Reference: [Publish messages](https://ntfy.sh/docs/publish/)

## Install the library and run it
Open a terminal. If you do not have the `requests` library installed, run:

```bash
pip install requests
```

Then run your script:

```bash
python send_notify.py
```

## Expected result
Your script prints a number like `200`, which means the message was accepted. Open the ntfy app or go to `https://ntfy.sh/my-python-alerts` in your browser, replacing `my-python-alerts` with your topic name. You will see the notification appear.

You can now add these lines to the end of any longer script to tell yourself when it is done.
