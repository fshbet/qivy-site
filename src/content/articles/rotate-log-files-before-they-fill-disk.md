---
title: 'Rotate your own log files before they fill the disk'
summary: 'Stop a single growing log file from filling your disk by rotating, compressing, and archiving old entries automatically.'
category: automation
publishDate: 2026-11-28
seoTitle: 'Rotate log files before they fill your disk'
metaDescription: 'Learn how to rotate your own log files on Linux using logrotate, keep old copies, compress them, and run it automatically with cron.'
verification: researched
sources:
  - 'https://man7.org/linux/man-pages/man8/logrotate.8.html'
  - 'https://man7.org/linux/man-pages/man8/cron.8.html'
tags:
  - 'log-rotation'
  - 'linux'
  - 'automation'
  - 'disk-space'
  - 'cron'
---
Your application writes to a single log file and never stops. That file grows until the disk is full, then your service crashes. Log rotation means closing the current file, starting a new one, and keeping only the recent copies.

## Check that logrotate is installed

Run this command:

```
which logrotate
```

If it prints a path, it is installed. If it prints nothing, install your system's `logrotate` package. On Debian or Ubuntu, that is `sudo apt install logrotate`.

Reference: [logrotate](https://man7.org/linux/man-pages/man8/logrotate.8.html)

## Make a config file for your app log

Create a file in `/etc/logrotate.d/`. Call it something like `yourapp`:

```
sudo nano /etc/logrotate.d/yourapp
```

Paste this, changing `yourapp` and the path to match your app:

```
/home/yourapp/app.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 yourapp yourapp
}
```

Each line is a setting. `daily` means rotate once a day. `rotate 7` keeps seven old copies before deleting the oldest. `compress` squashes old logs to save space. `delaycompress` waits one cycle before compressing, so yesterday's log stays readable. `missingok` skips the file if it does not exist. `notifempty` skips empty files. `create` makes a new empty log after moving the old one aside.

Reference: [logrotate configuration options](https://man7.org/linux/man-pages/man8/logrotate.8.html)

## Test without changing anything

Run this:

```
sudo logrotate -d /etc/logrotate.d/yourapp
```

The `-d` flag means debug mode. It prints what it would do, but does not move or delete any files. Read the output to make sure it sees your log file.

Then run it for real:

```
sudo logrotate /etc/logrotate.d/yourapp
```

Reference: [logrotate debug mode](https://man7.org/linux/man-pages/man8/logrotate.8.html)

## Expected result

After the real run, list the folder:

```
ls -lh /home/yourapp/
```

You should see the original `app.log` renamed to something like `app.log.1`, and a new empty `app.log` ready for fresh entries. Over the next week, old copies stack up to seven, then the oldest is removed. Your disk stops filling up.

## Run it on a schedule

Most systems run `logrotate` once a day through `cron`, a program that starts tasks at set times. Check:

```
ls /etc/cron.daily/
```

You should see `logrotate` listed there. If not, your package manager usually adds it during installation.

Reference: [cron](https://man7.org/linux/man-pages/man8/cron.8.html)
