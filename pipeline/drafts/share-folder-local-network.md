---
title: 'Share a folder between two computers on your local network'
summary: 'Copy files between two computers on the same Wi-Fi network without a USB stick, email, or cloud upload.'
category: tips
publishDate: 2026-11-28
seoTitle: 'Share folder between computers on local network'
metaDescription: 'Share a folder between two computers on your own network using built-in tools. Copy files over Wi-Fi in minutes.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/http.server.html'
tags:
  - 'local-network'
  - 'file-sharing'
  - 'home-network'
  - 'python'
---
You need to move files from one computer to another. Both machines are on the same Wi-Fi, but you do not have a USB stick handy. You can share the folder directly over your home network.

## Connect both computers to the same network
1. Connect both computers to the same router, or to the same Wi-Fi network.
2. If one uses Wi-Fi and the other uses a cable plugged into the same router, that still works.

## Find your computer's local address
1. On the computer that holds the folder, open the command prompt or terminal. This is the text box where you type instructions to the computer.
2. Look for your local IP address.
3. On Windows, type `ipconfig` and press Enter. On any computer, look in your network settings for an address starting with `192.168.` or `10.0.`. Write it down.

## Share the folder
1. In the terminal or command prompt, go to the folder you want to share. Example: `cd Documents`
2. Type `python -m http.server 8000` and press Enter. On some Macs, type `python3 -m http.server 8000` instead.
3. Leave this window open. This starts a tiny web server, which means it lets other devices on your network see the files in that folder through a web browser.

Reference: [http.server module](https://docs.python.org/3/library/http.server.html)

## Open the folder on the second computer
1. Open a web browser on the second computer.
2. In the address bar, type `http://`, then the IP address you wrote down, then `:8000`. Example: `http://192.168.1.45:8000`
3. Press Enter. You will see a list of files. Click any file to download it.

## Copy files the other way too
To send files back, repeat the steps on the second computer. Share one of its folders, then open its address from the first computer's browser.

## Expected result
The browser on the second computer shows the files from the first computer's folder, and you can download them. If you repeat the steps the other way, files can move in both directions.

If Python is not installed, install it from the Microsoft Store on Windows or from python.org. Most Macs already have it.
