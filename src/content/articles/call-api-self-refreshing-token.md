---
title: 'Call an API that refreshes its own token'
summary: 'Use an OAuth 2.0 session so your Python script gets a new API token automatically when the old one expires.'
category: automation
publishDate: 2026-11-17
seoTitle: 'Auto-refresh API tokens in Python'
metaDescription: 'Stop manually refreshing API tokens. Use an OAuth 2.0 session in Python so your script gets a new token automatically when the old one expires.'
verification: researched
sources:
  - 'https://oauth.net/2/grant-types/refresh-token/'
  - 'https://requests-oauthlib.readthedocs.io/en/latest/'
tags:
  - 'api'
  - 'automation'
  - 'oauth'
  - 'python'
---
Your script calls an API, but the access token expires after a set time. Once it expires, every request fails until you fetch a new token yourself. You can make the HTTP client handle refreshes automatically so your code keeps running.

## What happens when a token expires
An access token is a short-lived string that proves your app may call the API. A refresh token is a longer-lived string used to get a new access token without asking anyone to log in again. When the server rejects your call with a 401 error, it means your token is no longer valid. OAuth 2.0 is the standard that defines how these tokens are issued and refreshed.

Think of it like a hotel key card that stops working at checkout. The front desk issues a new one when you ask, so you do not have to go down and collect it yourself.

Reference: [OAuth 2.0 Refresh Token Grant](https://oauth.net/2/grant-types/refresh-token/)

## Use a session that refreshes tokens for you
Install the requests-oauthlib library. It wraps Python's requests library and handles OAuth 2.0 token refreshes automatically.

1. Open a terminal and run:
   pip install requests-oauthlib

2. Save your current token details in a file called `token.json`. You get this token from your API provider's OAuth setup. It should look like this:
   ```json
   {
     "access_token": "YOUR_ACCESS_TOKEN",
     "refresh_token": "YOUR_REFRESH_TOKEN",
     "token_type": "Bearer",
     "expires_at": 1700000000
   }
   ```

3. Create a Python file with this code. Replace the placeholder values with your own.

   ```python
   import json
   from requests_oauthlib import OAuth2Session

   TOKEN_URL = "https://your-api.example.com/oauth/token"
   API_URL = "https://your-api.example.com/data"
   CLIENT_ID = "YOUR_CLIENT_ID"
   CLIENT_SECRET = "YOUR_CLIENT_SECRET"

   def save_token(new_token):
       with open("token.json", "w") as f:
           json.dump(new_token, f)

   with open("token.json") as f:
       token = json.load(f)

   session = OAuth2Session(
       client_id=CLIENT_ID,
       token=token,
       auto_refresh_url=TOKEN_URL,
       auto_refresh_kwargs={
           "client_id": CLIENT_ID,
           "client_secret": CLIENT_SECRET,
       },
       token_updater=save_token,
   )

   response = session.get(API_URL)
   print(response.status_code)
   print(response.text)
   ```

4. Run the script:
   python your_script.py

Reference: [requests-oauthlib documentation](https://requests-oauthlib.readthedocs.io/en/latest/)

## Expected result
The script calls your API and prints a successful status code, usually 200, followed by the response body. If the access token in `token.json` has expired, the session silently contacts the token URL, receives a new access token, saves it to `token.json`, and retries your request. You do not write the refresh logic, and you do not see a 401 error.

## Keep the new token safe
The `token.json` file contains secrets. Do not add it to version control. Restrict who can read it on your computer or server.
