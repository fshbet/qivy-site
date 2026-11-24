---
title: 'Archive old files on a schedule instead of deleting them'
summary: 'Learn how to automatically move old files into a dated archive instead of deleting them, using a simple scheduled script.'
category: automation
publishDate: 2026-11-24
seoTitle: 'Archive old files on a schedule instead of deleting them'
metaDescription: 'Schedule automatic file archiving so you keep old data without filling up your disk. Step-by-step using cron, find, and tar.'
verification: researched
sources:
  - 'https://www.gnu.org/software/findutils/manual/html_node/find.html'
  - 'https://www.gnu.org/software/tar/manual/tar.html'
  - 'https://www.gnu.org/software/cron/manual/cron.html'
tags:
  - 'automation'
  - 'file-management'
  - 'cron'
  - 'linux'
  - 'backup'
---
Old files fill up your disk, but deleting them feels risky. You might need that invoice or photo next year. Archiving them on a schedule keeps your computer tidy without throwing anything away.

## Find the files you want to archive

Use the `find` command. It searches a folder for files that match rules you set. Think of it like checking the date on every carton in the fridge and pulling out the ones that are too old.

Run this in your terminal:

```bash
find ~/Downloads -type f -mtime +30
```

This lists every regular file in your Downloads folder that you changed more than 30 days ago. `-mtime +30` means "modified more than 30 days ago".

Reference: [GNU find manual](https://www.gnu.org/software/findutils/manual/html_node/find.html)

## Pack the old files into one archive

Use `tar`. It bundles many files into a single file, like putting loose papers into a labelled box. The `z` option compresses the box so it takes less space.

This command creates an archive with today's date in the name:

```bash
find ~/Downloads -type f -mtime +30 -print0 | tar -czf ~/archives/downloads-$(date +%F).tar.gz --null -T -
```

`$(date +%F)` writes today's date, such as 2026-06-14. The `--null` and `-T -` parts tell tar to read the file list from `find`, which keeps files with spaces in their names safe.

Reference: [GNU tar manual](https://www.gnu.org/software/tar/manual/tar.html)

## Save the script and make it runnable

1. Open a terminal.
2. Create the file: `nano archive-old-files.sh`
3. Paste this script:

```bash
#!/bin/bash
SOURCE="$HOME/Downloads"
DEST="$HOME/archives"
DAYS=30
mkdir -p "$DEST"
ARCHIVE="$DEST/downloads-$(date +%F).tar.gz"
find "$SOURCE" -type f -mtime +$DAYS -print0 | tar -czf "$ARCHIVE" --null -T -
if [ $? -eq 0 ]; then
  find "$SOURCE" -type f -mtime +$DAYS -delete
fi
```

`$?` is the exit code. It tells you whether the last command worked. The script only deletes files after the archive is created successfully.
4. Press Ctrl+O, then Enter to save. Press Ctrl+X to exit.
5. Make the script runnable: `chmod +x archive-old-files.sh`
6. Test it: `./archive-old-files.sh`

## Schedule it to run automatically

Use `cron`. It is a scheduler that runs commands at times you choose, like an alarm clock for your computer. `crontab` is the list of those scheduled jobs.

1. Run `crontab -e`.
2. Choose an editor if asked.
3. Add this line at the bottom:

```
0 3 * * * /home/yourusername/archive-old-files.sh
```

Replace `yourusername` with your actual username. This runs the script every day at 3:00 AM.
4. Save and exit.

Reference: [GNU cron manual](https://www.gnu.org/software/cron/manual/cron.html)

## Expected result

Each night, the script checks your Downloads folder. Files older than 30 days are packed into a dated archive in your `archives` folder, then removed from Downloads. Your Downloads folder stays small, and you can still open the archive if you ever need an old file.

That's it. No more guessing which files are safe to delete.
