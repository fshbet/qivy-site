---
title: 'Resize images to a fixed width before uploading them'
summary: 'Learn to shrink photos to a set width before uploading so they load faster and websites accept them.'
category: automation
publishDate: 2026-11-28
seoTitle: 'Resize images to a fixed width before uploading'
metaDescription: 'Resize images to a fixed width before uploading them. A simple ImageMagick command batch-shrinks photos for faster uploads.'
verification: researched
sources:
  - 'https://imagemagick.org/script/download.php'
  - 'https://imagemagick.org/script/command-line-options.php#resize'
  - 'https://imagemagick.org/script/mogrify.php'
tags:
  - 'image-resize'
  - 'automation'
  - 'imagemagick'
  - 'batch-processing'
---
Large photos straight from a phone can be several megabytes each. They upload slowly, use up your data, and some websites refuse them. Resizing to a fixed width before you upload keeps the quality good enough for the web while making the file smaller.

## Install ImageMagick

ImageMagick is a free program. You control it by typing commands into a terminal, which is the text-only screen where you type instead of clicking icons. Download it for Windows, Mac or Linux from the official site. If you already have it, skip this step.

Reference: [ImageMagick download](https://imagemagick.org/script/download.php)

## Resize a single image

Open a terminal. On Windows, open Command Prompt or PowerShell. On a Mac or Linux computer, open Terminal.

Go to the folder that contains your image. Then type:

`magick holiday.jpg -resize 1200x holiday-small.jpg`

Replace holiday.jpg with your own filename. The 1200x part means make the width 1200 pixels and calculate the height automatically so the shape stays the same. This is called keeping the aspect ratio. It is like asking a photocopier to shrink a poster to fit on A4 paper.

Reference: [Command-line options — resize](https://imagemagick.org/script/command-line-options.php#resize)

## Resize a whole folder at once

If you have many images, resize them together. Create a new folder inside your image folder called resized. Then run:

`mogrify -path resized -resize 1200x *.jpg`

The asterisk means every file ending in .jpg. Your originals are not changed. Smaller copies appear in the resized folder, each no wider than 1200 pixels.

Reference: [mogrify — batch image processing](https://imagemagick.org/script/mogrify.php)

## Expected result

Open the resized folder. You should see copies of your images. Open one and check that it looks right. Its width should be 1200 pixels or less, and its file size should be smaller than the original.

If the terminal says the command is not found, install ImageMagick first. Then try again.

Upload the smaller images instead of the originals.
