---
title: 'Make a scanned PDF searchable with OCRmyPDF'
summary: 'Turn a scanned PDF into a searchable document using the free OCRmyPDF tool so you can find and copy text inside it.'
category: tips
publishDate: 2026-11-19
seoTitle: 'Make a Scanned PDF Searchable - Qivy'
metaDescription: 'Make a scanned PDF searchable by adding a hidden text layer with the free OCRmyPDF tool. Copy-paste steps included.'
verification: researched
sources:
  - 'https://ocrmypdf.readthedocs.io/en/latest/'
tags:
  - 'pdf'
  - 'ocr'
  - 'searchable-pdf'
  - 'productivity'
---
A scanned PDF is a photograph of each page. The computer sees pictures, not words, so you cannot search for a name, highlight a sentence, or copy text. You need OCR (Optical Character Recognition — software that reads letters from images and turns them into real text).

OCRmyPDF is a free tool that adds an invisible text layer underneath the scanned images. The page still looks exactly the same, but the hidden text makes it searchable.

## Add a searchable text layer to your PDF
1. Open your terminal or command prompt.
2. Install OCRmyPDF. On Debian or Ubuntu: `sudo apt install ocrmypdf`. On macOS: `brew install ocrmypdf`. On Windows, follow the installation steps in the documentation.
3. Run the command below. Replace `scanned.pdf` with your file name. Replace `searchable.pdf` with the name you want for the new file.

`ocrmypdf scanned.pdf searchable.pdf`

The tool reads the images, recognises the words, and saves a new PDF with a hidden text layer. A text layer is real text stored beneath the page image, like labels stuck to the back of a photograph.

Reference: [OCRmyPDF documentation](https://ocrmypdf.readthedocs.io/en/latest/)

## Expected result
Open `searchable.pdf`. Press Ctrl+F (Windows or Linux) or Cmd+F (Mac). Type a word you know appears on the page. The highlight jumps to that word. You can also select, copy and paste the text as you would in a normal document.
