---
title: 'Catch duplicate rows before they reach your database'
summary: 'Stop duplicate rows entering your database by checking for them first in your automation workflow.'
category: automation
publishDate: 2026-11-18
seoTitle: 'Catch duplicate rows before they reach your database'
metaDescription: 'Prevent duplicate rows in your database with a check-then-write step in your automation. Practical steps and expected results.'
verification: researched
sources:
  - 'https://www.postgresql.org/docs/current/sql-select.html'
tags:
  - 'automation'
  - 'database'
  - 'workflow'
  - 'data-quality'
---
Your automation copies information from a form, webhook or spreadsheet into a database table. If the same information arrives twice, your automation can insert two identical rows. The database will not stop this unless you tell it to.

## Check before you write
Use a check-then-write pattern. Before your automation inserts a row, ask the database whether that row already exists. Look at the column that should be unique, meaning no two rows should share the same value, such as an email address or order number. A query is a question you ask a database to find information. Your query asks: does a row with this email already exist?

[Everyday comparison: A bouncer checks a guest list before letting someone in. If the name is already on the list, they do not write it down again.]

If the answer is yes, stop the workflow for that row. If the answer is no, continue and insert the row. A row is one record in your table, like a single line in a spreadsheet. A database is an organised collection of information, like a digital filing cabinet.

Reference: [SELECT](https://www.postgresql.org/docs/current/sql-select.html)

## Build the step
1. Open your automation workflow. Add a step that reads from your database before the step that inserts rows.
2. Set the read step to search your table using the column that should be unique, such as an email address or an order number. If you do not have such a column, add one first.
3. Add a condition after the read step. If it returns any rows, stop this run. If it returns nothing, continue to the insert step. Automation is software that moves information between apps without you doing it by hand.
4. Save the workflow. Run it once with new data, then run it again with exactly the same data.

## Expected result
The first run adds the row to your table. The second run adds nothing. Your table stays free of duplicate rows without a separate cleanup job.
