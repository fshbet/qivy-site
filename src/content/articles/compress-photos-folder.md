---
title: 'Compress every photo in a folder without ruining them'
summary: 'Batch-shrink JPEG photos with ImageMagick so they take up less space while keeping your originals safe.'
category: automation
publishDate: 2026-11-22
seoTitle: 'Compress photos in a folder without losing quality'
metaDescription: 'Batch-shrink every JPEG in a folder using ImageMagick. Keep your originals safe and check the results yourself.'
verification: researched
sources:
  - 'https://imagemagick.org/script/download.php'
  - 'https://imagemagick.org/script/mogrify.php'
tags:
  - 'images'
  - 'automation'
  - 'imagemagick'
  - 'batch'
---
Photos eat up disk space and are slow to send. The photos pile up on your phone and laptop, but emailing them takes forever and backups fill up quickly. Opening each one in an editor to shrink it is tedious, and compressing them all by hand is easy to get wrong. You can shrink every photo in a folder at once while keeping the originals untouched.

## Install ImageMagick
ImageMagick is a free program that edits images from the command line, which is a text-only way to control your computer.

1. Download ImageMagick for Windows, Mac or Linux from the official site.
2. Run the installer and follow the prompts.
3. Open a terminal in the folder with your photos. On Windows, type `cmd` in the folder address bar and press Enter. On a Mac, right-click the folder and choose New Terminal at Folder.

Reference: [Download ImageMagick](https://imagemagick.org/script/download.php)

## Protect your originals first
You cannot undo compression, so work on a copy and leave the originals alone.

1. Copy the whole folder and name the copy `photos-original`.
2. Keep that copy somewhere you will not delete it by accident.

## Run the batch command
Batch means doing the same thing to many files at once. In the terminal, type this:

```bash
magick mogrify -path compressed -quality 85 *.jpg
```

Press Enter. The command looks at every file ending in `.jpg`, shrinks it, and saves the result into a new folder called `compressed`. The number after `-quality` controls how much detail to keep. Higher numbers keep more detail but make bigger files. If your computer does not recognise `magick mogrify`, try just `mogrify` instead.

Reference: [mogrify](https://imagemagick.org/script/mogrify.php)

## Check the results
Open the `compressed` folder and look at a few photos next to the originals. Check that the file size is smaller. If they look good, move the compressed set to your phone or cloud storage. If they look too soft, run the command again with a higher quality number.

Expected result
A new folder called `compressed` appears next to your originals. The files inside are smaller, your original photos are still there unchanged, and you did not have to open them one by one.
