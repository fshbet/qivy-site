---
title: 'Writing better prompts in Claude — the three changes that matter most'
summary: 'Three small changes to how you write a Claude prompt — labelling the parts, asking for the working, and showing one example — fix most vague answers.'
category: ai
publishDate: 2026-11-08
seoTitle: 'Write better Claude prompts: 3 changes'
metaDescription: 'Three simple changes to your Claude prompts — label the parts, ask for the working, show one example — that fix vague or overlong answers fast.'
verification: researched
sources:
  - 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#structure-prompts-with-xml-tags'
  - 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#leverage-thinking-and-interleaved-thinking-capabilities'
  - 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#use-examples-effectively'
  - 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct'
tags:
  - claude
  - prompt-engineering
  - ai
  - anthropic
  - beginners
---
You ask Claude something and the answer comes back vague, far too long, or simply wrong. Most of the time the model is not the problem. The prompt is.

A prompt is just the message you send. Think of it as giving directions to someone who is very clever but has never been to your house. They will do their best with whatever you tell them. Tell them more clearly and they get there faster.

Three changes make the biggest difference. They take seconds each.

## 1. Put labels around each part of your message

When you paste a question and then a wall of text underneath, Claude has to guess which part is the instruction and which part is the thing to work on. Labels take away the guessing.

A label is a word inside angle brackets. You open with the word, and close with the same word after a slash:

```
<instructions>
Summarise the text below in three bullet points. Add nothing else.
</instructions>

<text>
Paste your article or meeting notes here.
</text>
```

Think of them as labelled boxes. Whatever sits in the instructions box is what to do. Whatever sits in the text box is what to do it to. Claude will not mix the two up, even if your text happens to contain something that looks like an order.

You can name the boxes anything you like. `<email>`, `<notes>`, `<rules>` all work. The only rule is that the opening and closing names match.

Reference: [Structure prompts with XML tags](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#structure-prompts-with-xml-tags)

## 2. Ask it to think before it answers

For anything with more than one step — a sum, a comparison, finding a mistake — ask for the working, not just the answer.

```
Think through this step by step.
First list the facts. Then check whether any of them disagree.
Only then give your final answer.
```

Here is why that helps. A model writes one word at a time, and each word builds on the ones before it. If it blurts out the answer first, the rest of the reply is stuck defending a guess. If it lays out the facts first, the answer gets built on top of them.

It is the same reason a teacher asks you to show your working instead of only the result.

Reference: [Leverage thinking capabilities](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#leverage-thinking-and-interleaved-thinking-capabilities)

## 3. Show one example instead of describing what you want

Describing the shape you want is weak. Showing it is strong.

```
Example
Input:  The call starts at 14:00 and ends at 15:30.
Output: {"start": "14:00", "end": "15:30", "duration_minutes": 90}

Now do the same for:
The workshop begins at 10am and finishes at 12:30pm.
```

One example like that beats three paragraphs of formatting rules, because there is nothing left to interpret. The pattern is sitting right there to copy.

Reference: [Use examples effectively](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#use-examples-effectively)

## Expected result

Use all three and replies get shorter, follow the structure you asked for, and make fewer mistakes on multi-step questions.

The whole thing in three lines:

- Label the parts
- Ask for the working
- Show one example

## If it still goes wrong

Resist adding more rules. Piling on instructions usually makes answers worse, not better. Instead:

- Cut any words that are not doing a job
- Add a second example rather than another explanation
- Say plainly what you **do** want, not only what you do not

Reference: [Be clear and direct](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct)
