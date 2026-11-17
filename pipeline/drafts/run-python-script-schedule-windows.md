---
title: 'Run a Python script on a schedule on Windows'
summary: 'Use Windows Task Scheduler to run your Python script automatically at a set time, with reliability settings so it keeps running even when you are logged out.'
category: automation
publishDate: 2026-11-17
seoTitle: 'Run Python script on schedule Windows Task Scheduler'
metaDescription: 'Schedule a Python script on Windows using Task Scheduler. Step-by-step setup and reliability settings so it runs even when you are logged out.'
verification: researched
sources:
  - 'https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page'
tags:
  - 'python'
  - 'windows'
  - 'task-scheduler'
  - 'automation'
---
Your Python script works when you start it yourself, but Windows will not run it again unless you tell it to. Task Scheduler is the built-in Windows tool that starts programs automatically at a time you choose. This article shows you how to point it at your script so it runs on a schedule, and how to set it up so it keeps running even when you are not logged in.

## Put your script somewhere it will not move

Save your script in a folder you will not delete or rename, such as `C:\Scripts`. Use an absolute path — the complete address of a file, starting with the drive letter. Task Scheduler starts the script by that path, so moving or renaming the file breaks the task.

Reference: [Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

## Find the full path to Python

Open Command Prompt. Run this command:

`where python`

Copy the full path it prints. This is the location of the Python interpreter, the application that actually runs your Python code. You will paste it into Task Scheduler in the next step.

Reference: [Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

## Create the scheduled task

1. Open the Start menu, type Task Scheduler, and press Enter.
2. In the Actions pane on the right, click Create Basic Task.
3. Type a name and description, then click Next.
4. Choose a trigger — the condition that starts the task — such as Daily. Pick a time and click Next.
5. Choose Start a program and click Next.
6. In Program/script, paste the full path to Python you copied earlier.
7. In Add arguments, paste the full path to your script, such as `C:\Scripts\backup.py`.
8. In Start in, paste the folder that holds your script, such as `C:\Scripts`.
9. Click Finish.

Reference: [Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

## Make the task reliable

Double-click your new task in the Task Scheduler Library. On the General tab, choose Run whether user is logged on or not. This allows the script to run even when no one is signed in to the PC. Tick Run with highest privileges if your script writes to protected folders or needs administrator access.

On the Conditions tab, untick Start the task only if the computer is on AC power if you use a laptop and want the task to run on battery. Tick Wake the computer to run this task if keeping the schedule matters more than saving power.

On the Settings tab, choose to restart the task if it fails. You can also stop the task if it runs longer than you expect, so one slow run does not block the next one.

Reference: [Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

## Test the task

Right-click your task and choose Run. Look at the Last Run Result column in the main pane. A value of 0x0 means the task completed successfully.

Reference: [Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

Expected result

The Next Run Time column shows a future date and time. When you run the task manually, Last Run Result changes to 0x0 and your script performs its normal action, such as creating a file or sending a message.

Your script now runs on Windows on the schedule you set, without you having to start it by hand.
