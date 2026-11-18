---
title: 'Throttle your own workflow so a free API does not lock you out'
summary: 'Add pauses and error handling to your automation so free APIs keep working instead of blocking you.'
category: automation
publishDate: 2026-11-18
seoTitle: 'Throttle workflow to avoid free API rate limits'
metaDescription: 'Stop free APIs from locking you out by adding delays, handling 429 errors and caching responses in your automation.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/time.html#time.sleep'
  - 'https://httpwg.org/specs/rfc9110.html#status.429'
  - 'https://docs.python.org/3/library/json.html'
tags:
  - 'automation'
  - 'api'
  - 'rate-limiting'
  - 'python'
---
Free APIs usually let you make only a certain number of requests each minute or day. If your automation ignores that limit, the provider locks you out and your workflow stops. Stay under the limit yourself so the API never has to block you.

## Find the limit before you start
Look at the API provider's documentation for a page called rate limits, usage limits or quotas. It will tell you how many calls you can make per minute, per hour or per day. Note the numbers before you write any automation. If you cannot find them, assume one call per second is too fast for a free tier.

## Put a pause between every call
Add a short wait after each request so you never send them faster than the limit allows. In Python, use `time.sleep(seconds)` — it pauses your script for that many seconds. Think of it like waiting your turn at a ticket counter: one person at a time, with a gap between each.

Replace `https://api.example.com/data` with the real API URL.

```python
import time
import urllib.request

url = "https://api.example.com/data"
for i in range(5):
    with urllib.request.urlopen(url) as response:
        print(response.read().decode())
    time.sleep(1)
```
Reference: [time.sleep — Python documentation](https://docs.python.org/3/library/time.html#time.sleep)

## Handle the "too many requests" error
When you go over the limit, the server sends an HTTP 429 Too Many Requests error. It means slow down. Your script should catch this, wait, and try again. Some answers include a `Retry-After` header that tells your script exactly how many seconds to wait.

```python
import time
import urllib.request
from urllib.error import HTTPError

url = "https://api.example.com/data"
try:
    with urllib.request.urlopen(url) as response:
        print(response.read().decode())
except HTTPError as error:
    if error.code == 429:
        wait = int(error.headers.get("Retry-After", "5"))
        print(f"Rate limited. Waiting {wait} seconds.")
        time.sleep(wait)
```
Reference: [429 Too Many Requests — RFC 9110](https://httpwg.org/specs/rfc9110.html#status.429)

## Save answers you have already received
Store successful results in a file or database so you do not call the same endpoint twice. This is like photocopying a page instead of borrowing the same book from the library every time you need it.

```python
import json

with open("cache.json", "w", encoding="utf-8") as file:
    json.dump(data, file)
```
Reference: [json.dump — Python documentation](https://docs.python.org/3/library/json.html)

## Expected result
Your script finishes without stopping. You see responses from the API, not repeated 429 errors. If the API does push back, your script waits and continues instead of crashing.
