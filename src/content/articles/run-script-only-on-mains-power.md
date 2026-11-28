---
title: 'Run a script only while your laptop is on mains power'
summary: 'Use Windows Task Scheduler to start your script only when the laptop is plugged into the wall, so heavy jobs never drain the battery.'
category: automation
publishDate: 2026-11-28
seoTitle: 'Run script only on mains power Windows Task Scheduler'
metaDescription: 'Schedule your script to run only when your laptop is plugged into mains power using Windows Task Scheduler. Protects battery life and stops interrupted jobs.'
verification: researched
sources:
  - 'https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page'
tags:
  - 'automation'
  - 'windows'
  - 'task-scheduler'
  - 'laptop'
  - 'power'
---
Some scripts do heavy work — backups, large downloads, or video encoding — and can drain a laptop battery or fail halfway if the power cable comes out. You want them to run only when the laptop is plugged into the wall.

## What you need
- A Windows laptop
- A script that already works (a batch file, PowerShell script, or Python script)
- Task Scheduler, the Windows tool that starts programs automatically on a schedule or event

## Set the task to run only on AC power
1. Open Task Scheduler. In the Actions panel, choose Create Task.
2. On the General tab, type a name for the task.
3. On the Triggers tab, click New and choose when the task should start, such as daily or at log on.
4. On the Actions tab, click New. Keep Action set to Start a program. Browse to your script, or to python.exe or powershell.exe, and put the script path in the arguments box if needed.
5. On the Conditions tab, check Start the task only if the computer is on AC power. AC power means the laptop is plugged into mains electricity, not running on its battery. You can also check Stop if the computer switches to battery power to end the task if you unplug it.
6. Click OK. Type your Windows password if asked.

## Expected result
While the laptop is on battery, Task Scheduler will not start the task. Once you plug into mains power, the next trigger starts your script. If you enabled the stop option, unplugging ends a running task.

Reference: [Task Scheduler start page](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)
