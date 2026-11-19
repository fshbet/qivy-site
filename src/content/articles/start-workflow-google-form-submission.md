---
title: 'Start a workflow when someone submits a Google Form'
summary: 'Automatically start a workflow the moment someone submits your Google Form, using a built-in script and trigger.'
category: automation
publishDate: 2026-11-19
seoTitle: 'Start a workflow on Google Form submission'
metaDescription: 'Run an Apps Script automatically on every Google Form submission. Step-by-step setup with triggers, email notification, and official docs references.'
verification: researched
sources:
  - 'https://developers.google.com/apps-script/guides/triggers/installable'
  - 'https://developers.google.com/apps-script/reference/forms/form-response'
  - 'https://developers.google.com/apps-script/guides/services/quotas'
tags:
  - 'google-forms'
  - 'apps-script'
  - 'automation'
  - 'workflow'
---
When someone submits your Google Form, the response waits in a spreadsheet until you open it. You can make the form start work automatically the moment it arrives.

## Set up a script that runs after each submission

Google Apps Script is a scripting tool built into Google Workspace. It lets you attach a function to your form so it runs every time someone submits it. The details of the submission arrive in an event object — a bundle of information such as who answered and when.

Think of a trigger like a doorbell: the visitor presses it, and the bell rings in your house. Your script is the bell.

The letter e in the code stands for the event object. It carries the submission details.

Steps:
1. Open your Google Form.
2. Open the script editor attached to the form.
3. Replace the code in Code.gs with:

```javascript
function emailMeOnSubmit(e) {
  const response = e.response;
  const respondentEmail = response.getRespondentEmail();
  const timestamp = response.getTimestamp();
  MailApp.sendEmail({
    to: "you@example.com",
    subject: "New form submission",
    body: "New submission at " + timestamp + " from " + respondentEmail
  });
}
```

4. Change you@example.com to your email address.
5. Click the clock icon on the left side of the Apps Script page, then click Add Trigger.
6. Choose emailMeOnSubmit as the function. Set the event source to "From form" and the event type to "On form submit". Save.
7. Authorise the script when Google asks. This means giving it permission to read your form responses and send email on your behalf.

Reference: [Installable triggers in Apps Script](https://developers.google.com/apps-script/guides/triggers/installable)
Reference: [FormResponse class](https://developers.google.com/apps-script/reference/forms/form-response)

## Test it

Open the form in a private browsing window, fill it out, and submit it. You should receive the email shortly afterwards. If nothing arrives, check the Executions page in Apps Script to see whether the function ran and whether it showed an error.

## Things to know

The trigger is tied to your Google account. If you share the form with others, they do not automatically get the trigger or the emails. The script uses your sending allowance, so very high volumes may be slowed down. You can edit the script later to add more steps, such as saving the answer to a sheet or pinging a chat app. Check the official quotas page if you expect many responses.

Reference: [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)
