---
title: 'Alert yourself when a web page changes'
summary: 'Set up a free Google Apps Script that watches a page and emails you when it changes.'
category: automation
publishDate: 2026-11-23
seoTitle: 'Alert yourself when a web page changes'
metaDescription: 'Monitor any web page for changes and get an email alert automatically, using a free Google Apps Script you can set up in ten minutes.'
verification: researched
sources:
  - 'https://script.google.com'
  - 'https://developers.google.com/apps-script/guides/triggers'
  - 'https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app'
tags:
  - 'automation'
  - 'web-monitoring'
  - 'google-apps-script'
---
You need to know when a web page changes. It might be a job listing, a product restock, or a local council notice. Refreshing it by hand wastes time.

## Set up the monitoring script

1. Open Google Apps Script. It is a free tool that runs small pieces of code linked to your Google Account.
2. Remove any code already in the editor. Paste this in:

```javascript
function checkPage() {
  var url = 'https://example.com';
  var page = UrlFetchApp.fetch(url).getContentText();
  var storage = PropertiesService.getScriptProperties();
  var previous = storage.getProperty('lastPage');
  if (previous && page !== previous) {
    MailApp.sendEmail('you@example.com', 'The page changed', url);
  }
  storage.setProperty('lastPage', page);
}
```

3. Replace `https://example.com` with the web address of the page you want to watch.
4. Replace `you@example.com` with your own email address.
5. Click Save and name the project.

## Run it on a schedule

1. Open the triggers page. In the editor this is the clock icon on the left.
2. Add a trigger for the function `checkPage`.
3. Choose to run it every hour.
4. Save the trigger.
5. Run `checkPage` once by hand. Google will ask for permission to read the page and send email.

Reference: [Installable triggers](https://developers.google.com/apps-script/guides/triggers)

## How it knows the page changed

A script is a list of instructions for the computer. This script fetches the page, which means it downloads the page code. It compares the new code with the copy it saved last time. If they are different, it sends you an email. It stores the old copy in a private notebook called script properties.

Reference: [UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app)

## Expected result

You get an email only when the page has changed since the last check. The first run will not send an email, because there is no earlier copy to compare with. If nothing changed, you get no email. Open the email and click the link to see the new version.

Set it up once and let the script do the checking for you.
