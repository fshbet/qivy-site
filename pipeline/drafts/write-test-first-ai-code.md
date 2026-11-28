---
title: 'Write the test first and let the AI write the code'
summary: 'Write a failing test before you ask an AI to write code, so you know exactly when it is finished.'
category: ai
publishDate: 2026-11-28
seoTitle: 'Write the test first and let AI write the code'
metaDescription: 'Write a failing test first, then ask your AI coding assistant to make it pass. A practical test-first workflow for AI-generated code.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/unittest.html'
tags:
  - 'ai'
  - 'coding'
  - 'testing'
  - 'python'
---
You ask an AI to write a function, it guesses what you want, and you spend more time fixing its mistakes than you would have spent writing it yourself. Writing the test first gives the AI a target and gives you a way to check its work.

## Write one test before you write any code

A test is a small program that checks your code does what you say it should. Decide one tiny behaviour first. For example, a function that takes a bill amount and returns the total with a 10 per cent service charge added.

Create a file called `test_bill.py`:

```python
import unittest
from bill import add_service_charge

class TestBill(unittest.TestCase):
    def test_adds_ten_percent(self):
        self.assertEqual(add_service_charge(100), 110)

if __name__ == "__main__":
    unittest.main()
```

Run it:

```bash
python test_bill.py
```

It should fail because `bill.py` does not exist yet.

This is like writing the answer key before you mark the exam.

Reference: [unittest — Unit testing framework](https://docs.python.org/3/library/unittest.html)

## Ask the AI to make the test pass

Copy the test file and the error message. Paste them into your AI coding assistant and say:

"Write only the code needed to make this test pass. Do not add anything else."

An AI coding assistant is a tool that writes or changes code when you describe what you want. It will create `bill.py` with the `add_service_charge` function.

Do not ask it to explain how it works yet. You only want code that passes the test.

## Run the test again

Run `python test_bill.py` again. If it passes, the AI did what you asked. If it fails, copy the new error and paste it back to the assistant with the words "Fix this so the test passes." Repeat until the test passes.

Only now should you tidy the code. This tidying without changing what it does is called refactoring.

## Expected result

You should see `OK` or `Ran 1 test` and no failure messages. The test tells you the code is finished, so you do not have to guess.
