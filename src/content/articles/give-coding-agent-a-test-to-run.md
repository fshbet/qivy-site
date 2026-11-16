---
title: 'Give your coding agent a test to run so it knows when to stop'
summary: 'Tell your AI coding agent to make one failing test pass, then stop — so you always know when the work is finished.'
category: ai
publishDate: 2026-11-16
seoTitle: 'Coding agent: use a test to know when to stop'
metaDescription: 'Give your coding agent one test to pass. When it goes green, the task is done and the agent stops editing.'
verification: researched
sources:
  - 'https://docs.python.org/3/library/unittest.html'
  - 'https://docs.python.org/3/library/unittest.html#command-line-interface'
tags:
  - 'ai'
  - 'coding-agent'
  - 'testing'
  - 'automation'
---
An AI coding agent is a tool that can edit your files and run commands for you. It can keep changing your code after the feature already works. It might rename variables, split functions, or add features you did not ask for. Without a finish line, you do not know when to tell it to stop.

## Pick one small behaviour

Choose one thing the code must do. For example, a function that adds up the prices in a shopping cart and returns the total. Do not ask for a whole shop, a database, and a login screen. Ask for one result.

It is like telling a courier to deliver one parcel to one address, not "drive around until something looks done."

## Write a test that fails today

Create a small file that checks that one behaviour. In Python, use the built-in unittest library. unittest is a tool that runs small checks and reports whether each one passed or failed. Save this as `test_cart.py`:

```python
import unittest
from cart import total

class TestCartTotal(unittest.TestCase):
    def test_adds_three_prices(self):
        self.assertEqual(total([10, 20, 30]), 60)

if __name__ == "__main__":
    unittest.main()
```

The file imports `cart`, which does not exist yet, so running it will fail. That failure is your starting line.

Reference: [unittest — Unit testing framework](https://docs.python.org/3/library/unittest.html)

## Tell the agent to run the test and stop

Open your coding agent. Paste the test file. Say this:

Make the test in test_cart.py pass. Edit only cart.py. Run python -m unittest after every change. Stop when the test passes. Do not add anything else.

The agent edits cart.py, runs the command, and reads the result. If the test fails, it changes the code and runs it again. If it passes, it stops.

Reference: [unittest command-line interface](https://docs.python.org/3/library/unittest.html#command-line-interface)

## Expected result

The agent reports that the test passed. It does not offer to build a checkout page or refactor your project. The job is done because the test you defined is green.

The test is your finish line. When it passes, the agent knows it is finished—and so do you.
