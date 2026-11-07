---
title: 'Python + Pandas for non-coders — clean messy data in 30 minutes'
summary: 'Clean messy spreadsheet data with Python and Pandas in 30 minutes — setup, loading files, fixing columns and exporting the result.'
category: tips
publishDate: 2026-04-01
seoTitle: 'Python + Pandas for Non-Coders'
metaDescription: 'Clean messy spreadsheet data with Python and Pandas in 30 minutes — setup, loading files, fixing columns and exporting the result.'
verification: tested
sources: []
tags:
  - python
  - pandas
  - data-cleaning
  - tutorial
---
You don't need to be a developer to use Python for data work. If you can write Excel formulas, you can learn the 6 Pandas functions that handle 80% of real data cleaning tasks. This guide uses a single realistic example: a messy sales export from an Indian e-commerce platform.

## Setup in 5 minutes

Install Python from python.org (choose 3.11+). Then install Pandas and openpyxl in your terminal:

`pip install pandas openpyxl`

For writing Python, use VS Code (free) or even Google Colab (runs in browser, no install). Colab is the easiest starting point — it has Pandas pre-installed.

> **India tip:** Google Colab is free and requires only a Google account. Go to colab.research.google.com, create a new notebook, and you're running Python in 30 seconds. No local install needed.

## The 6 Pandas functions you actually need

| Function | What it does | Example |
| --- | --- | --- |
| `pd.read_csv()` | Load a CSV file into a dataframe | `df = pd.read_csv('sales.csv')` |
| `df.head()` | Preview first 5 rows | `df.head(10)` for 10 rows |
| `df.describe()` | Summary stats (min, max, mean) | `df['revenue'].describe()` |
| `df.dropna()` | Remove rows with missing values | `df.dropna(subset=['order_id'])` |
| `df.groupby()` | Group and aggregate (like a pivot) | `df.groupby('city')['revenue'].sum()` |
| `df.to_excel()` | Export back to Excel/Sheets | `df.to_excel('clean.xlsx', index=False)` |

## A real cleaning workflow

Here's a typical 10-line script that loads a messy export, cleans it, and saves a clean version:

-   Load: `df = pd.read_csv('orders_export.csv')`
-   Remove blank order IDs: `df = df.dropna(subset=['order_id'])`
-   Standardise city names: `df['city'] = df['city'].str.strip().str.title()`
-   Convert date column: `df['date'] = pd.to_datetime(df['date'], dayfirst=True)`
-   Filter to 2026: `df = df[df['date'].dt.year == 2026]`
-   Export: `df.to_excel('orders_clean.xlsx', index=False)`

That's it. Six lines of real work. The same task in Excel would take 20 manual steps and wouldn't be reproducible next month.
