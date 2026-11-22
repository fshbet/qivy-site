---
title: 'Stop a scheduled job from running twice at once'
summary: 'Use a file lock in crontab so a scheduled job skips its next start if the previous run is still active.'
category: automation
publishDate: 2026-11-22
seoTitle: 'Stop scheduled job running twice at once'
metaDescription: 'Prevent overlapping cron jobs with flock. Add a file lock to your crontab so the next run skips if the previous one is still active.'
verification: researched
sources:
  - 'https://man7.org/linux/man-pages/man5/crontab.5.html'
  - 'https://man7.org/linux/man-pages/man1/flock.1.html'
tags:
  - 'cron'
  - 'automation'
  - 'linux'
  - 'flock'
  - 'scheduled-tasks'
---
A scheduled job that takes longer than its gap between runs can start a second copy while the first is still active. Two copies writing to the same file or database at once can duplicate work or corrupt data. A file lock stops the next run from starting until the previous one finishes.

## Why scheduled jobs overlap
Cron is the system that starts commands automatically at fixed times. It does not check whether the last run is still going. If a job is booked every ten minutes and takes twenty, the second start begins while the first is still working.

A lock file works like a locked bathroom door. If someone is inside, the next person cannot enter; they just go away.

Reference: [crontab(5) — tables for driving cron](https://man7.org/linux/man-pages/man5/crontab.5.html)

## Add a lock to your crontab
Use `flock`, a command that puts a lock on a file. The `-n` flag means non-blocking: if the lock is already held, `flock` gives up immediately instead of waiting.

Open your crontab, the file that stores your scheduled commands:

`crontab -e`

Find your job line. It might look like this:

`* * * * * /home/you/backup.sh`

Change it to wrap the command in flock:

`* * * * * flock -n /tmp/backup.lock /home/you/backup.sh`

`/tmp/backup.lock` is an empty file used as a "do not disturb" sign. `flock` creates it if it does not exist. If the first run is still active, the lock exists and the second start exits without running your script.

Reference: [flock(1) — manage file locks from shell scripts](https://man7.org/linux/man-pages/man1/flock.1.html)

## What happens when the lock is held
The next scheduled start sees the lock, does nothing, and finishes straight away. Your normal schedule stays the same; only the overlapping attempt is skipped. When the first run ends, it releases the lock, so the next scheduled time runs normally.

Reference: [flock(1) — manage file locks from shell scripts](https://man7.org/linux/man-pages/man1/flock.1.html)

## Check that only one copy runs
1. Start your job manually in one terminal: `/home/you/backup.sh`
2. Leave it running.
3. Open another terminal and run: `ps aux | grep backup.sh`
4. Start a second attempt in a third terminal: `flock -n /tmp/backup.lock /home/you/backup.sh` then run `echo $?`

Expected result: The first copy remains in `ps`. The second attempt exits with code `1` because it could not take the lock. On the next scheduled run, cron behaves the same way: if the job is active, the new start does nothing.
