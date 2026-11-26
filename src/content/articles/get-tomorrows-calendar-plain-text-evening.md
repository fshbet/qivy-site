---
title: 'Get tomorrow''s calendar as plain text every evening'
summary: 'Set up a free Google Apps Script that emails you tomorrow''s calendar as plain text every evening.'
category: automation
publishDate: 2026-11-26
seoTitle: 'Get tomorrow''s calendar as plain text every evening'
metaDescription: 'Get tomorrow’s Google Calendar appointments as plain text in your inbox every evening with a free Google Apps Script trigger.'
verification: researched
sources:
  - 'https://developers.google.com/apps-script'
  - 'https://developers.google.com/apps-script/reference/calendar/calendar-app'
  - 'https://developers.google.com/apps-script/reference/mail/mail-app'
  - 'https://developers.google.com/apps-script/guides/triggers/installable'
tags:
  - 'automation'
  - 'google-calendar'
  - 'google-apps-script'
  - 'daily-digest'
---
You wake up unsure what is on tomorrow. You want a simple list of appointments in your inbox each evening, with no apps to open and no formatting to strip.

## What you need

- A Google account.
- Google Calendar with at least one event.
- Ten minutes.

## Open the script editor

1. Go to script.google.com.
2. Click New project.
3. Delete any code already in the editor.

Reference: [Apps Script](https://developers.google.com/apps-script)

## Paste the script

Copy this into the editor:

```javascript
function sendTomorrowsCalendar() {
  var calendar = CalendarApp.getDefaultCalendar();
  var today = new Date();
  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  var start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
  var end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);
  var events = calendar.getEvents(start, end);
  var lines = [];
  lines.push("Calendar for " + tomorrow.toDateString());
  if (events.length === 0) {
    lines.push("No events.");
  } else {
    events.forEach(function(event) {
      var time = event.getStartTime().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      lines.push(time + " — " + event.getTitle());
    });
  }
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Tomorrow's calendar", lines.join("\n"));
}
```

A script is a small program that runs inside Google's servers. This one reads your default calendar — the main calendar linked to your Google account — finds everything between midnight and 11:59 pm tomorrow, then emails it to you as plain text. Plain text means no bold, colours or links.

Reference: [CalendarApp](https://developers.google.com/apps-script/reference/calendar/calendar-app)
Reference: [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)

## Set it to run every evening

1. Click the clock icon (Triggers) on the left.
2. Click Add Trigger.
3. Choose sendTomorrowsCalendar.
4. Choose Time-driven.
5. Choose Hour timer and pick an evening slot, such as 7 pm to 8 pm.
6. Pick your time zone.
7. Click Save.

A trigger is an alarm that tells Google's servers to run your script without you opening it. It works like a repeating alarm on your phone.

Reference: [Installable triggers](https://developers.google.com/apps-script/guides/triggers/installable)

## Run it once to check

1. Click Run at the top of the editor.
2. Allow the permission requests when they appear.
3. Open your email. You should see a message titled "Tomorrow's calendar".

## Expected result

Every evening around your chosen time, an email arrives with tomorrow's appointments listed line by line. If nothing is booked, it says "No events." You can forward it, print it or paste it into a notes app.

Keep the project. You can edit the hour or turn the trigger off from the same Triggers page.
