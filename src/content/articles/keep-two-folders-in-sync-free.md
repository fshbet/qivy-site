---
title: 'Keep two folders in sync without paying for a sync service'
summary: 'Use free software to copy files between two folders on different devices as soon as they change.'
category: automation
publishDate: 2026-11-24
seoTitle: 'Sync two folders for free without a cloud service'
metaDescription: 'Keep two folders in sync across devices without paying for a cloud sync service. Free, step-by-step guide using Syncthing.'
verification: researched
sources:
  - 'https://docs.syncthing.net/'
tags:
  - 'sync'
  - 'folders'
  - 'automation'
  - 'syncthing'
  - 'free-software'
---
You have files on two computers, and you want the same files in both places. Copying them by hand takes time, and paid cloud services charge a monthly fee.

## Use Syncthing to copy files between your own devices
Syncthing is free, open-source software that keeps folders the same on two or more devices. The devices talk directly to each other. People call this peer-to-peer. There is no central company storing your files, and no subscription.

Comparison: it works like two neighbours who photocopy each other's new letters the moment they arrive.

Reference: [Introduction to Syncthing](https://docs.syncthing.net/)

## Install Syncthing on each device
1. Go to the Syncthing website and download the installer for your operating system.
2. Install it on both devices that hold the folders you want to sync.
3. Start Syncthing. It opens a page in your web browser called the web interface. This is a webpage you use to control the program, and it is where you choose folders and devices.

Reference: [Installing Syncthing](https://docs.syncthing.net/)

## Add the folder you want to synchronise
1. On the first device, add the folder you want to share.
2. Copy that device's ID. This is a long string of letters and numbers that identifies your installation.
3. On the second device, add the same folder and enter the first device's ID.
4. Accept the connection request on both devices.
5. Choose Send & Receive for the folder. This means changes copy in both directions, not just one.

Reference: [Getting started with Syncthing](https://docs.syncthing.net/)

## Expected result
Create a new file in the synced folder on either device. Within a short time, the same file appears in the synced folder on the other device. If you edit a file, the updated version replaces the old one on both sides.

Keep Syncthing running in the background. It watches for changes and copies them automatically. You do not need to run a command every day.
