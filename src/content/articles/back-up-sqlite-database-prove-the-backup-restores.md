---
title: 'Back up a SQLite database and prove the backup restores'
summary: 'Learn to back up a SQLite database safely and verify that the copy restores with matching data.'
category: automation
publishDate: 2026-11-25
seoTitle: 'Back up SQLite database and verify restore'
metaDescription: 'Step-by-step SQLite backup and restore test using the sqlite3 command line tool. Copy-paste commands and expected results.'
verification: researched
sources:
  - 'https://www.sqlite.org/cli.html'
  - 'https://www.sqlite.org/lang_select.html'
tags:
  - 'sqlite'
  - 'database-backup'
  - 'automation'
---
A SQLite database is a database that lives in a single file on your disk, with no separate server program running. If that file is corrupted or deleted, your data is gone unless you have a backup. Copying the file while a program is writing to it can give you a broken copy, so use the built-in backup command instead.

## Back up the database with the sqlite3 tool
1. Open a terminal or command prompt — the text-based program where you type commands.
2. Change to the folder that contains your database file.
3. Run this command, replacing `mydatabase.db` with your file name:

```
sqlite3 mydatabase.db ".backup mydatabase-backup.db"
```

The `.backup` part is a dot command: an instruction to the sqlite3 program, not an SQL query. It tells SQLite to lock the database, copy it safely, and close it.

Think of it like photocopying a ledger while the office is closed, so no one is half-way through writing a number when you take the picture.

Reference: [Command line shell for SQLite](https://www.sqlite.org/cli.html)

## Check the backup contains your data
Run these commands on the backup file:

```
sqlite3 mydatabase-backup.db ".tables"
sqlite3 mydatabase-backup.db "SELECT count(*) FROM yourtable;"
```

Replace `yourtable` with a real table name from your database. Write down the number it returns.

Reference: [SELECT statement](https://www.sqlite.org/lang_select.html)

## Prove the restore works
1. Copy the backup to a new file:
   - macOS or Linux: `cp mydatabase-backup.db mydatabase-restored.db`
   - Windows: `copy mydatabase-backup.db mydatabase-restored.db`
2. Open the restored file and run the same count query:

```
sqlite3 mydatabase-restored.db "SELECT count(*) FROM yourtable;"
```
3. Compare the number with the one from the backup. If they match, the backup restored correctly.

Reference: [Command line shell for SQLite](https://www.sqlite.org/cli.html)

## Expected result
You should see three files: your original database, the backup, and the restored copy. The row count from the backup and the restored copy should be identical. If the restored file opens and returns the same count, your backup works.
