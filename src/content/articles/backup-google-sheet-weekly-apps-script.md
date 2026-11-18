---
title: 'Back up a Google Sheet every week without thinking about it'
summary: 'Set up a free Google Apps Script that copies your sheet to a Drive folder every week, so you always have an older version to restore.'
category: automation
publishDate: 2026-11-18
seoTitle: 'Back up a Google Sheet every week automatically'
metaDescription: 'Automate weekly Google Sheet backups with Google Apps Script and a time-based trigger. Free setup that runs without you.'
verification: researched
sources:
  - 'https://developers.google.com/apps-script/guides/sheets'
  - 'https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app'
  - 'https://developers.google.com/apps-script/guides/triggers/installable'
tags:
  - 'google-sheets'
  - 'apps-script'
  - 'automation'
  - 'backup'
---
It takes seconds to overwrite or delete the wrong tab in a Google Sheet, and undo history does not last forever. If you only remember to back up when something goes wrong, it is already too late.

You can set up Google Apps Script — a free tool that runs small programs inside Google apps — to copy your sheet to a Drive folder every week. You do not need to remember anything after the first ten minutes.

## Open the script editor
Open your Google Sheet. Open the Extensions menu and choose Apps Script. A new tab opens with a blank code file attached to that spreadsheet.

Reference: [Extend Google Sheets with Apps Script](https://developers.google.com/apps-script/guides/sheets)

## Paste the backup script
Delete any code already in the file and paste this:

```javascript
function weeklySheetBackup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy");
  var backupName = sheet.getName() + " backup " + today;

  var folders = DriveApp.getFoldersByName("Sheet backups");
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder("Sheet backups");
  }

  folder.addFile(sheet.copy(backupName));
}
```

The script looks for a folder called Sheet backups in your Google Drive. If it does not exist, the script makes one. It then copies your spreadsheet, adds today’s date to the name, and puts the copy in that folder.

Reference: [Class SpreadsheetApp](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)

## Save the project
Click the disk icon or press Ctrl+S (Cmd+S on Mac). Give the project a name, such as Weekly sheet backup, and click Save.

## Add a weekly timer
A trigger is a rule that tells Google to run your script on a schedule. Click the clock icon on the left to open Triggers. Click Add Trigger. Choose:

- Choose which function to run: weeklySheetBackup
- Select event source: Time-driven
- Select type of time based timer: Week timer
- Select day of week: pick any day
- Select time of day: pick a time

Click Save.

Reference: [Installable triggers](https://developers.google.com/apps-script/guides/triggers/installable)

## Allow the script to run
The first time the trigger fires, Google will ask you to authorise the script. Choose your Google account, click Advanced, then Go to Weekly sheet backup (unsafe), and click Allow. Google labels it “unsafe” only because the script is new and not verified by Google; it is your own code running in your own account.

## Expected result
Every week, a new file appears in the Sheet backups folder in Google Drive. Each file is a complete copy of your spreadsheet as it looked at that time. To restore, open any backup, click File, then Make a copy.
