---
title: 'Split one long video into clips at fixed timestamps'
summary: 'Use ffmpeg to cut a video into separate clips at exact start and end times without guessing in an editor.'
category: automation
publishDate: 2026-11-24
seoTitle: 'Split video into clips at fixed timestamps with ffmpeg'
metaDescription: 'Learn how to split one long video into multiple clips at exact timestamps using ffmpeg, with copy-paste commands and expected results.'
verification: researched
sources:
  - 'https://ffmpeg.org/download.html'
  - 'https://ffmpeg.org/ffmpeg.html#Main-options'
tags:
  - 'video'
  - 'ffmpeg'
  - 'automation'
  - 'clip-editing'
---
You have one long video file and need several shorter clips, each starting and ending at an exact time. Scrubbing through a timeline in an editor is slow, and it is easy to cut a few seconds too early or too late. You can split the file precisely from the command line instead.

## Install ffmpeg
ffmpeg is a free command-line tool for handling audio and video files. Download it from the official site and install it for your operating system. On Ubuntu or Debian, use your package manager. Once installed, open a terminal or command prompt.

Reference: [FFmpeg download page](https://ffmpeg.org/download.html)

## Note the start and end times
Write down the exact moments you want, in hours, minutes and seconds. FFmpeg accepts them as HH:MM:SS. For example, if you want a clip from one minute thirty seconds into the video to four minutes forty-five seconds, your start time is 00:01:30 and your end time is 00:04:45.

Reference: [FFmpeg main options](https://ffmpeg.org/ffmpeg.html#Main-options)

## Cut one clip
Run this command, replacing the file names and times with your own:

ffmpeg -i long-video.mp4 -ss 00:01:30 -to 00:04:45 -c copy clip-one.mp4

Here is what each part does:
- `-i long-video.mp4` is your input file.
- `-ss 00:01:30` tells ffmpeg where to start.
- `-to 00:04:45` tells ffmpeg where to stop.
- `-c copy` copies the video and audio without re-encoding them. This is fast and keeps quality the same, but the cut may land on the nearest keyframe rather than the exact second. A keyframe is a frame that stores a full image, so many tools snap cuts to these points.
- `clip-one.mp4` is the new file ffmpeg creates.

If you need the cut to be frame-accurate, drop `-c copy` and let ffmpeg re-encode the video:

ffmpeg -i long-video.mp4 -ss 00:01:30 -to 00:04:45 clip-one-exact.mp4

This takes longer because ffmpeg has to rebuild the video, but the start and end points are precise.

Reference: [FFmpeg main options](https://ffmpeg.org/ffmpeg.html#Main-options)

## Cut several clips
Repeat the command for each time range, giving each output a different file name. If you have many clips, keep a plain text list of the start and end times so you do not mistype a timestamp.

## Expected result
You will have one new MP4 file for each time range you asked for. Play each file to check it starts and ends where you intended.
