---
title: 'Stop Windows Update restarting your PC mid-job'
summary: 'Set active hours, pause updates, or use Group Policy so Windows does not restart your machine while you are working.'
category: tips
publishDate: 2026-11-24
seoTitle: 'Stop Windows Update restarting mid-job'
metaDescription: 'Stop Windows Update restarting your PC mid-job with active hours, pause updates, or Group Policy. Practical steps you can use today.'
verification: researched
sources:
  - 'https://learn.microsoft.com/en-us/windows/deployment/update/waas-configure-updates'
  - 'https://learn.microsoft.com/en-us/windows/deployment/update/waas-wu-settings'
tags:
  - 'windows'
  - 'windows-update'
  - 'automation'
  - 'productivity'
---
Windows can restart your computer to finish installing updates. If you are rendering a video, running a backup, or on a video call, that restart closes your work and stops the job. You can stop Windows from restarting while you are using the machine.

## Set active hours so Windows avoids your work time

Active hours are the times you normally use your computer. Windows will not restart automatically during these hours to install updates.

Everyday comparison: it is like telling a courier not to deliver a parcel while you are out.

Steps:
1. Open Settings.
2. Go to Windows Update, then Advanced options.
3. Select Active hours.
4. Choose a start time and an end time. Pick a window that covers your working day.

Reference: [Configure Windows updates](https://learn.microsoft.com/en-us/windows/deployment/update/waas-configure-updates)

## Pause updates while you do important work

Pausing updates stops Windows from downloading and installing new updates for a set time. It does not remove updates already installed.

Steps:
1. Open Settings.
2. Go to Windows Update.
3. Select Pause updates.
4. Choose a date. Windows resumes updates after that date.

Use this when you have a deadline and cannot risk an interruption.

Reference: [Windows Update settings](https://learn.microsoft.com/en-us/windows/deployment/update/waas-wu-settings)

## Use Group Policy to block restarts while anyone is signed in

This option is for Windows Pro, Enterprise, or Education. Windows Home does not include the Group Policy Editor. Group Policy is a tool that lets an administrator change how Windows behaves.

Steps:
1. Press the Windows key + R, type gpedit.msc, and press Enter.
2. Go to Computer Configuration > Administrative Templates > Windows Components > Windows Update.
3. Open No auto-restart with logged on users for automatic updates installations.
4. Select Enabled.
5. Select OK.
6. Open Command Prompt and run this command:

```
gpupdate /force
```

This tells Windows not to restart automatically after updates if someone is logged on. Windows will wait until you restart manually.

Reference: [Windows Update settings](https://learn.microsoft.com/en-us/windows/deployment/update/waas-wu-settings)

## Expected result

During active hours, Windows should not force a restart. With the Group Policy setting enabled, Windows will not restart while a user is signed in. Paused updates stop new updates from installing until the pause date passes. You can still restart manually whenever you choose.
