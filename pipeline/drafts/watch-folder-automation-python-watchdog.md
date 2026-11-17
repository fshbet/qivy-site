---
title: 'Watch a folder and act the moment a file lands in it'
summary: 'Learn how to use the Watchdog library in Python to trigger scripts automatically when new files are added to a directory.'
category: automation
publishDate: 2026-11-17
seoTitle: 'Automate Actions When New Files Land in a Folder'
metaDescription: 'Use Python and Watchdog to monitor folders in real-time and trigger scripts automatically when new files arrive.'
verification: researched
sources:
  - 'https://readthedocs.org/projects/watchdog/'
tags:
  - 'python'
  - 'automation'
  - 'watchdog'
  - 'file-management'
---
Manually checking a folder for new files is a waste of time. You can instead tell your computer to wake up a script the second a file arrives, which is like having a digital receptionist who handles your mail the moment it hits the desk.

## Install the Watchdog library

Python does not monitor folders by default. You need a library called Watchdog. This is a package of pre-written code that lets Python listen to operating system events, which are signals the computer sends when a file is created, deleted, or moved.

Run this command in your terminal:

```bash
pip install watchdog
```

Reference: [Installation](https://readthedocs.org/projects/watchdog/en/latest/)

## Create the folder monitor script

To make this work, you must define two things: what to do when a file arrives and which folder to watch. 

Copy this code into a file named `monitor.py`. Replace `'/path/to/your/folder'` with the actual path to the folder you want to watch.

```python
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            print(f"New file detected: {event.src_path}")
            # Put your automation logic here
            # Example: call another script or move the file

if __name__ == "__main__":
    path = '/path/to/your/folder'  # Update this path
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=False)
    observer.start()
    print(f"Watching folder: {path}")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
```

Reference: [Usage Guide](https://readthedocs.org/projects/watchdog/en/latest/)

## Run and test the automation

1. Open your terminal or command prompt.
2. Run the script using `python monitor.py`.
3. Keep the terminal window open.
4. Open the folder you are watching in your file explorer.
5. Drag and drop a new file into that folder.

## Expected result

The moment the file lands in the folder, your terminal will print: `New file detected: /path/to/your/folder/filename.ext`.

## Customising the trigger

In the code above, `on_created` only triggers when a file is first made. If you want to trigger an action when a file is modified or moved into the folder, you can add these methods to the `MyHandler` class:

- `on_modified`: Triggers when the content of an existing file changes.
- `on_moved`: Triggers when a file is renamed or moved from another folder.

Reference: [API Documentation](https://readthedocs.org/projects/watchdog/en/latest/)
