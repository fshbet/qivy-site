---
title: 'Keep your laptop awake only while a long job runs'
summary: 'Stop your laptop from sleeping and interrupting a long backup, render, or download, then let it sleep again when the job finishes.'
category: tips
publishDate: 2026-11-19
seoTitle: 'Keep laptop awake while long job runs'
metaDescription: 'Keep your laptop awake only while a long job runs using built-in commands on Mac and Linux, then let it sleep again. No extra software needed.'
verification: researched
sources:
  - 'https://developer.apple.com/library/archive/documentation/Darwin/Reference/ManPages/man8/caffeinate.8.html'
  - 'https://www.freedesktop.org/software/systemd/man/latest/systemd-inhibit.html'
tags:
  - 'laptop'
  - 'sleep'
  - 'macos'
  - 'linux'
  - 'terminal'
  - 'productivity'
---
Your laptop goes to sleep after a few minutes of inactivity. If you start a long backup, file conversion or download and walk away, the job can stop halfway through. You want the machine to stay awake only until that job finishes, then go back to saving power.

You can also do this without the terminal: open your laptop’s power settings, set “Sleep” to Never, start your job, then change it back when you are done.

## Keep a Mac awake with caffeinate

On a Mac, the quickest way is the built-in `caffeinate` command. It tells macOS not to allow idle sleep — the sleep that happens when you stop touching the keyboard or trackpad.

To run a command and keep the Mac awake until it finishes:

```
caffeinate -i your-command-here
```

Replace `your-command-here` with the program or script you are running. When that program ends, the Mac can sleep again.

If the job is already running, find its process ID (PID — the number the system uses to identify a running program) in Activity Monitor, then run:

```
caffeinate -i -w <PID>
```

Think of `caffeinate` like propping a door open so it cannot close while you carry boxes through.

Reference: [caffeinate(8) — Apple Developer](https://developer.apple.com/library/archive/documentation/Darwin/Reference/ManPages/man8/caffeinate.8.html)

## Keep Linux awake with systemd-inhibit

On Linux, use `systemd-inhibit`. It tells the system not to enter idle sleep while a command is running. It works like hanging a “do not disturb” sign on a hotel room door.

```
systemd-inhibit --what=idle --who="my-long-job" --why="backup running" --mode=block your-command-here
```

`--what=idle` blocks idle sleep. When the command finishes, the block is removed and normal power saving returns.

Reference: [systemd-inhibit — freedesktop.org](https://www.freedesktop.org/software/systemd/man/latest/systemd-inhibit.html)

## Expected result

The computer stays awake while your job runs. Once the job completes, the laptop returns to its normal sleep timer within the usual minutes. If you used `caffeinate` or `systemd-inhibit` with a command, the command’s exit also ends the awake period.
