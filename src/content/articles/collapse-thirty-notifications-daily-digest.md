---
title: 'Collapse thirty notifications into one daily digest'
summary: 'Get one daily email instead of thirty separate notification pings by labelling messages and running a simple Apps Script each evening.'
category: automation
publishDate: 2026-11-18
seoTitle: 'Collapse Notifications into One Daily Digest'
metaDescription: 'Stop notification overload. Collect thirty alerts into one daily digest email with Google Apps Script and Gmail labels.'
verification: researched
sources:
  - 'https://developers.google.com/apps-script/reference/gmail/gmail-app'
  - 'https://developers.google.com/apps-script/guides/triggers/installable'
tags:
  - 'automation'
  - 'gmail'
  - 'apps-script'
  - 'notifications'
  - 'productivity'
---
Your phone buzzes thirty times a day. A delivery alert. A bank message. A calendar reminder. A chat mention. Each buzz pulls you away from what you are doing. You can silence everything, but then you might miss something important. Instead, collect every notification in one place and read them once a day.

## Label the notifications you want to keep
A label is a tag you stick on an email. It lets you group messages without moving them out of your inbox. A thread is one email conversation, including all replies.

1. Open Gmail.
2. On the left, scroll down to Labels and click Create new label.
3. Name it Digest and click Create.
4. Use Gmail’s filter settings to apply this label to messages from the services you want to summarise.

## Write the digest script
Google Apps Script is Google’s free tool for writing small programs inside Gmail, Sheets and other Google apps. This script looks for every thread with the Digest label, checks which ones arrived today, and sends them to you in one email.

1. Go to script.google.com.
2. Click New project.
3. Delete the starter code and paste this:

```
function sendDailyDigest() {
  var label = GmailApp.getUserLabelByName('Digest');
  if (!label) {
    return;
  }
  var threads = label.getThreads();
  var today = new Date();
  var todayThreads = [];
  for (var i = 0; i < threads.length; i++) {
    var last = threads[i].getLastMessageDate();
    if (last && last.toDateString() === today.toDateString()) {
      todayThreads.push(threads[i]);
    }
  }
  if (todayThreads.length === 0) {
    return;
  }
  var messages = GmailApp.getMessagesForThreads(todayThreads);
  var lines = [];
  for (var i = 0; i < messages.length; i++) {
    for (var j = 0; j < messages[i].length; j++) {
      var msg = messages[i][j];
      lines.push('- ' + msg.getFrom() + ': ' + msg.getSubject());
    }
  }
  var body = lines.join('\n');
  GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Daily digest (' + today.toDateString() + ')', body);
  label.removeFromThreads(todayThreads);
}
```

Reference: [GmailApp](https://developers.google.com/apps-script/reference/gmail/gmail-app)

## Make it run every day
A trigger is an instruction that runs a piece of code automatically when a condition is met, such as a set time of day. Think of it like asking a colleague to collect all the day’s post and hand it to you in one bundle before you leave work.

1. In the Apps Script editor, click the clock icon on the left called Triggers.
2. Click Add Trigger.
3. Choose the function sendDailyDigest.
4. Under event source, choose Time-driven.
5. Under type of time based trigger, choose Day timer.
6. Pick a time, such as 20:00 to 21:00.
7. Click Save.

Reference: [Installable triggers](https://developers.google.com/apps-script/guides/triggers/installable)

## Expected result
At about 8 PM, you receive one email with every notification that arrived that day under the Digest label. Your phone stays quiet during the day. The next morning, the label is empty and ready for tomorrow.
