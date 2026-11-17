---
title: 'File a Gmail attachment to Google Drive automatically'
summary: 'Save Gmail attachments to Google Drive automatically with a simple Apps Script and a time-based trigger.'
category: automation
publishDate: 2026-11-17
seoTitle: 'File Gmail attachments to Google Drive automatically'
metaDescription: 'Set up a Google Apps Script that saves Gmail attachments to Drive when they arrive. No coding experience needed.'
verification: researched
sources:
  - 'https://developers.google.com/apps-script'
  - 'https://developers.google.com/apps-script/reference/gmail/gmail-app'
  - 'https://developers.google.com/apps-script/reference/drive/drive-app'
  - 'https://developers.google.com/apps-script/guides/services/authorization'
  - 'https://developers.google.com/apps-script/guides/triggers/installable'
tags:
  - 'gmail'
  - 'google-drive'
  - 'apps-script'
  - 'automation'
---
Your inbox is not a filing cabinet. When someone emails you a PDF or spreadsheet, you probably open the message, download the file, then upload it to Google Drive. That is three steps every time. You can make Gmail and Drive do it for you.

## What you need before you start

- A Gmail account.
- A Google Drive folder where the files should go.
- Ten minutes.
- No coding experience.

## Find your Drive folder ID

Open drive.google.com in your browser. Open the folder you want to use. Look at the web address in your browser's address bar. It looks like this:

https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz

Copy the part after `/folders/`. That is the folder ID. It tells Apps Script exactly which folder to use.

## Open the Apps Script editor

Apps Script is Google's tool for writing small scripts that work with Gmail, Drive and other Google apps.

1. Go to script.google.com.
2. Click New project.
3. Delete any code already in the editor.

Reference: [Apps Script overview](https://developers.google.com/apps-script)

## Paste the script

Copy this into the editor:

```javascript
function saveAttachments() {
  var folder = DriveApp.getFolderById('PASTE_FOLDER_ID_HERE');
  var threads = GmailApp.search('has:attachment -label:filed');

  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var attachments = messages[j].getAttachments();
      for (var k = 0; k < attachments.length; k++) {
        folder.createFile(attachments[k]);
      }
    }
    threads[i].addLabel(GmailApp.getUserLabelByName('filed'));
  }
}
```

Replace `PASTE_FOLDER_ID_HERE` with the folder ID you copied, including the single quotes around it.

Click the disk icon to save. Name the project something like "File Gmail attachments".

This script searches for emails with attachments that do not already have the label "filed". It saves each attachment to your Drive folder, then adds the label so it does not save the same file twice.

Reference: [GmailApp service](https://developers.google.com/apps-script/reference/gmail/gmail-app)
Reference: [DriveApp service](https://developers.google.com/apps-script/reference/drive/drive-app)

## Run it once to allow access

Click Run. The first time, Google will ask you to allow the script to read your Gmail and save files to Drive. Click Allow. This is a one-time step.

Reference: [Authorisation for Apps Script](https://developers.google.com/apps-script/guides/services/authorization)

## Make it run automatically

You do not want to open this editor every day. Set a trigger.

1. Click the clock icon (Triggers) in the left sidebar.
2. Click Add Trigger.
3. Choose the function `saveAttachments`.
4. Choose Time-driven, then Hour timer and pick every hour.
5. Click Save.

A trigger is a rule that runs your script on a schedule, so you never have to start it by hand.

Reference: [Installable triggers](https://developers.google.com/apps-script/guides/triggers/installable)

## Expected result

When a new email with an attachment arrives, the script saves the file to your Drive folder within the hour. The email keeps the label "filed", so the script ignores it next time. Open your Drive folder to check.

## If nothing appears

Check that the folder ID is correct and inside single quotes. Check that you clicked Allow when Google asked for permission. Open the Editor and click Runs to see if the script ran and whether it showed an error.
