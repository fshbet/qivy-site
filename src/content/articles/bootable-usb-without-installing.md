---
title: 'Make a bootable USB stick without installing anything'
summary: 'Use the tools already on your Linux computer to write an operating system image to a USB stick, with no extra software to download.'
category: tips
publishDate: 2026-11-25
seoTitle: 'Bootable USB stick without installing anything'
metaDescription: 'Make a bootable USB stick using built-in tools on Linux. No extra software required.'
verification: researched
sources:
  - 'https://man7.org/linux/man-pages/man8/lsblk.8.html'
  - 'https://www.gnu.org/software/coreutils/manual/html_node/dd-invocation.html'
tags:
  - 'bootable-usb'
  - 'linux'
  - 'usb-stick'
  - 'dd'
---
You need to start a computer from a USB stick, perhaps to install an operating system or run a rescue tool. You do not want to download and install a separate program just for this one job.

Your computer already has what you need. You need a USB stick (also called a flash drive), an ISO file (one file that holds everything from an installation disc, like a digital DVD), and ten minutes. This guide uses Linux.

## Find your USB stick's device name

1. Plug in the USB stick.
2. Open a terminal (the screen where you type commands).
3. Run:

   lsblk

This lists every drive attached to your computer. Each drive has a device name, such as /dev/sda or /dev/sdb. Your computer's main drive is usually /dev/sda. Choose the entry whose size matches your USB stick — for example, an 8 GB stick shows as about 8 GB. Write down its device name, such as /dev/sdb.

Reference: [lsblk — list block devices](https://man7.org/linux/man-pages/man8/lsblk.8.html)

## Write the image to the USB stick

1. Unmount the stick's partition so it is not in use:

   sudo umount /dev/sdX1

Replace `/dev/sdX1` with your device name and partition number, such as `/dev/sdb1`. If it says it is not mounted, that is fine.

2. Copy the ISO file byte for byte to the whole stick:

   sudo dd if=~/Downloads/image.iso of=/dev/sdX bs=4M status=progress oflag=sync && sync

Replace `~/Downloads/image.iso` with the path to your ISO file. Replace `/dev/sdX` with your device name, such as `/dev/sdb`. Do not add a partition number — write to `/dev/sdb`, not `/dev/sdb1`.

`if` means input file (the ISO). `of` means output file (the USB stick). `bs=4M` sets the chunk size to 4 megabytes. `status=progress` shows a progress bar. `oflag=sync` and the final `sync` make sure everything is written before you unplug.

This erases everything on the USB stick without asking. Double check the device name before you press Enter. Picking the wrong drive can wipe your computer's main disk.

Reference: [dd invocation — GNU coreutils](https://www.gnu.org/software/coreutils/manual/html_node/dd-invocation.html)

## Expected result

The command runs, shows progress, then returns to a blank prompt. Unplug the USB stick. It is now bootable: you can start a computer from it instead of the normal hard drive. Plug it into another computer and restart; that computer should offer to boot from the USB stick.
