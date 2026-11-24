---
title: 'Write alt text for a hundred images in one pass'
summary: 'Use a vision AI model and a short script to generate alt text for an entire folder of images at once, then save the results to a CSV file.'
category: ai
publishDate: 2026-11-24
seoTitle: 'Batch write alt text for 100 images with AI'
metaDescription: 'Generate alt text for a folder of images in one pass using a vision model and a simple Python script. Saves results to CSV.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/vision'
  - 'https://platform.openai.com/docs/quickstart'
  - 'https://platform.openai.com/docs/api-reference/chat/create'
tags:
  - 'ai'
  - 'alt-text'
  - 'batch-processing'
  - 'python'
  - 'accessibility'
---
You need alt text for a hundred images. Opening each one in a chat tool and typing a description is too slow. It is like handing a stack of photos to an assistant instead of showing them one at a time. A vision model is an AI that can look at an image and answer questions about it, and a short script can send it a whole folder at once.

## Put all your images in one folder
Create a folder called `images`. Copy the photos you need described into it. The script below handles JPEG, PNG and WEBP files. If your images are in subfolders, move them all into this one folder first.
Reference: [Vision guide](https://platform.openai.com/docs/guides/vision)

## Get an API key
Sign up at platform.openai.com. Create a secret key and copy it. Do not paste it into chat or upload it to GitHub. Store it as an environment variable—a named value your operating system keeps so programs can read it—so the script can read it without you typing it each time.

On Mac or Linux:
export OPENAI_API_KEY="sk-..."

On Windows PowerShell:
$env:OPENAI_API_KEY="sk-..."

Replace sk-... with your actual key. You only need to do this once per session.
Reference: [Quickstart](https://platform.openai.com/docs/quickstart)

## Save and run the script
Save the following code as `make_alt_text.py` in the same folder as your `images` folder. It reads every image, asks the vision model for a short description, and saves the results to `alt-text.csv`.

You will need the `requests` library. Install it with:
pip install requests

```python
import base64
import csv
import os
from pathlib import Path

import requests

API_URL = 'https://api.openai.com/v1/chat/completions'
IMAGE_FOLDER = Path('images')
OUTPUT_FILE = Path('alt-text.csv')

def image_to_base64(path):
    with open(path, 'rb') as file:
        return base64.b64encode(file.read()).decode('utf-8')

def get_alt_text(image_path):
    if image_path.suffix.lower() in ('.jpg', '.jpeg'):
        mime = 'image/jpeg'
    else:
        mime = 'image/png'
    base64_image = image_to_base64(image_path)
    headers = {
        'Authorization': f'Bearer {os.environ["OPENAI_API_KEY"]}',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': 'gpt-4o',
        'messages': [
            {
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': 'Write concise alt text for this image. Describe only what is visible. Return one sentence only.'},
                    {'type': 'image_url', 'image_url': {'url': f'data:{mime};base64,{base64_image}'}},
                ],
            }
        ],
        'max_tokens': 200,
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    return data['choices'][0]['message']['content'].strip()

def main():
    results = []
    for path in sorted(IMAGE_FOLDER.iterdir()):
        if path.is_file() and path.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'):
            alt = get_alt_text(path)
            results.append({'file': path.name, 'alt_text': alt})
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['file', 'alt_text'])
        writer.writeheader()
        writer.writerows(results)

if __name__ == '__main__':
    main()
```

Base64 turns the image file into text so it can travel inside the API message. Run the script with:
python make_alt_text.py

If `python` is not recognised, try `python3`.
Reference: [Chat completions API reference](https://platform.openai.com/docs/api-reference/chat/create)

## What you should see
When the script finishes, open `alt-text.csv`. It has two columns: `file` and `alt_text`. Each row matches one image. It is a plain-text file that opens in Excel or Google Sheets. Copy the `alt_text` column into your content management system, spreadsheet, or website templates.

## Check cost before you run a big batch
Vision models charge for each image they process. Check your provider's pricing page before you upload a large folder, and start with ten images to confirm the output looks right. If you get a rate-limit error, wait a minute and run the script again.
