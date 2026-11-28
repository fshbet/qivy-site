---
title: 'Check a backup actually contains what you think it does'
summary: 'List the files inside a backup archive and compare the count with your originals so you know the backup is complete before you need it.'
category: automation
publishDate: 2026-11-28
seoTitle: 'Check a backup contains what you expect'
metaDescription: 'Verify a backup archive contains your files by listing its contents and comparing file counts, without restoring anything.'
verification: researched
sources:
  - 'https://www.gnu.org/software/tar/manual/tar.html'
  - 'https://www.gnu.org/software/coreutils/manual/coreutils.html'
tags:
  - 'backup'
  - 'verification'
  - 'automation'
  - 'tar'
---
A backup that you have never opened is just a guess. You only discover it is missing files when you try to restore them, which is too late. Check the contents now while you still have time to fix it.

## List the files inside the archive without unpacking it
An archive is a single file that holds many other files and folders, like a cardboard moving box. You can look at the manifest instead of unpacking everything.

Run this, replacing the filename with your backup:

```
tar -tzf backup.tar.gz
```

- t tells tar to list contents.
- z means the archive is compressed with gzip.
- f means you are naming a file to read.

If your backup is a plain tar file, drop the z: tar -tf backup.tar

Reference: [GNU tar manual — listing archive contents](https://www.gnu.org/software/tar/manual/tar.html)

## Check that one critical file is inside
You do not need to read the whole list. Search for the file you care about most:

```
tar -tzf backup.tar.gz | grep "family-photos/2024"
```

grep searches text for a pattern you give it. If nothing appears, that file is not in the backup.

Reference: [GNU tar manual — listing archive contents](https://www.gnu.org/software/tar/manual/tar.html)

## Compare the file count with your originals
Count how many files the archive lists:

```
tar -tzf backup.tar.gz | wc -l
```

wc counts lines. Since tar prints one file per line, this is the file count.

Now count the files in the folder you backed up:

```
find /path/to/original-folder -type f | wc -l
```

find lists every file. -type f means only files, not folders.

The two numbers should match. If the archive count is lower, files are missing.

Reference: [GNU Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)

## Expected result
You see your critical file in the search results, and the two file counts match. If either check fails, run the backup again before you delete anything.
