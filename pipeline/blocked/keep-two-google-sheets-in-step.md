---
title: 'Keep two Google Sheets in step on a schedule'
summary: 'Copy values from one Google Sheet to another automatically on a timer with Google Apps Script.'
category: automation
publishDate: 2026-11-17
seoTitle: 'Keep two Google Sheets in sync on a schedule'
metaDescription: 'Keep two spreadsheets matching by copying values from one Google Sheet to another on a schedule with Google Apps Script.'
verification: researched
sources:
  - 'https://developers.google.com/apps-script/guides/triggers/installable'
  - 'https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app'
tags:
  - 'google-sheets'
  - 'google-apps-script'
  - 'automation'
  - 'spreadsheets'
---
Two spreadsheets that should match often drift apart because someone forgets to copy the latest rows. You can copy values from one Google Sheet to another on a schedule without opening either file.

## Find the spreadsheet ID
Each spreadsheet has an ID in its web address. Open the source sheet. Look at the URL in your browser. It looks like this:

https://docs.google.com/spreadsheets/d/ABCDEFG1234567890/edit

The ID is the long mix of letters and numbers between /d/ and /edit. Copy it. You will need it in the script.

## Open the script editor
Apps Script is Google's tool for writing small programs that run inside Google Sheets and other Google apps.

1. Open the destination spreadsheet. This is the sheet that will be overwritten with the latest values.
2. Click Extensions, then Apps Script.
3. Delete the starter code in Code.gs.

## Paste the copy script
Paste this into Code.gs:

```javascript
function copyValues() {
  var sourceId = "SOURCE_SPREADSHEET_ID";
  var sourceSheetName = "Sheet1";
  var destId = "DESTINATION_SPREADSHEET_ID";
  var destSheetName = "Sheet1";

  var source = SpreadsheetApp.openById(sourceId).getSheetByName(sourceSheetName);
  var dest = SpreadsheetApp.openById(destId).getSheetByName(destSheetName);

  var values = source.getDataRange().getValues();
  dest.getRange(1, 1, values.length, values[0].length).setValues(values);
}
```

Replace SOURCE_SPREADSHEET_ID and DESTINATION_SPREADSHEET_ID with the IDs you copied. Replace Sheet1 if your sheets have different names. This script reads every cell that contains data from the source sheet and writes it into the destination sheet starting at cell A1. It replaces whatever was there before, so the two sheets match exactly after each run.

Save the project. Give it a name such as SyncSheets.

## Set it to run on a schedule
A trigger is a timer that starts the script automatically.

1. Click the clock icon on the left side of the Apps Script editor. This opens Triggers.
2. Click Add Trigger.
3. Choose copyValues as the function to run.
4. Choose Time-driven as the event source.
5. Choose Hour timer or Day timer, then pick the time.
6. Click Save.

Google will ask you to authorise the script. This means giving it permission to read your source spreadsheet and write to your destination spreadsheet. Review the request and click Allow.

## Expected result
The destination sheet now contains the same values as the source sheet. To test without waiting, click the Run button in the script editor. Open the destination sheet and confirm the data appeared. The next scheduled run will copy any new changes automatically.

This is a one-way copy: changes in the destination sheet are replaced each time the script runs. If you need edits in both sheets to merge, you need a more complex script that compares rows instead of overwriting.

Reference: [Installable triggers in Apps Script](https://developers.google.com/apps-script/guides/triggers/installable)
Reference: [SpreadsheetApp class](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)
