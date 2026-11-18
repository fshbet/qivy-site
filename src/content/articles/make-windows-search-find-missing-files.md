---
title: 'Make Windows Search find the files it keeps missing'
summary: 'Teach Windows Search to index the folders it is skipping so your files show up again.'
category: tips
publishDate: 2026-11-18
seoTitle: 'Fix Windows Search missing files'
metaDescription: 'Rebuild your Windows search index, add missing folders, and restore files that search keeps overlooking.'
verification: researched
sources:
  - 'https://support.microsoft.com/en-us/windows'
tags:
  - 'windows-search'
  - 'indexing'
  - 'windows-troubleshooting'
  - 'file-search'
---
Windows Search only finds files in places it has indexed. An index is a list Windows builds so it can find files quickly, like the index at the back of a book. If your folder is not on that list, or the list is broken, the file will not show up no matter what you type.

## Check which folders Windows is watching
Type "indexing options" in the Start menu and open the result. The window lists every location Windows Search is currently checking. If the folder with your missing files is not there, Windows is not looking in it.
Reference: [Windows help and support](https://support.microsoft.com/en-us/windows)

## Add the missing folders
1. Click Modify.
2. Tick the box next to the drive or folder that contains your missing files.
3. Click OK, then close the window.

Windows begins indexing the new location straight away. A large folder can take some time.
Reference: [Windows help and support](https://support.microsoft.com/en-us/windows)

## Rebuild the index
If the right folders are listed but files still do not appear, the index may be corrupted.
1. Open Indexing Options again.
2. Click Advanced.
3. Under Troubleshooting, click Rebuild.
4. Click OK and wait.

Windows deletes the old index and builds a new one. Search results may be incomplete while it works. That is normal.
Reference: [Windows help and support](https://support.microsoft.com/en-us/windows)

## Make sure file contents are indexed
In the same Advanced window, click the File Types tab. Find the extension of your missing files — the letters after the dot in the file name. Make sure it is set to "Index properties and file contents", not just "Index properties only". The second option tells Windows the file exists but not what is inside it.
Reference: [Windows help and support](https://support.microsoft.com/en-us/windows)

## Expected result
Wait for indexing to finish, then search for a file you know is in one of those folders. It should appear in the results. If you added a large folder, give Windows a few minutes before you search again.
If it still does not appear, the file may be in a location Windows Search does not cover, such as some network drives. Add that folder to the indexed list and try again.
