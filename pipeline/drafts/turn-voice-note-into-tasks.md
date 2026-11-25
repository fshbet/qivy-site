---
title: 'Turn a long voice note into a list of tasks'
summary: 'Turn spoken recordings into an actionable task list using transcription and a simple AI prompt.'
category: ai
publishDate: 2026-11-25
seoTitle: 'Turn a voice note into a task list'
metaDescription: 'Learn how to transcribe a long voice note and use an AI prompt to extract tasks, owners and deadlines into one list.'
verification: researched
sources:
  - 'https://platform.openai.com/docs/guides/speech-to-text'
  - 'https://platform.openai.com/docs/guides/prompt-engineering'
tags:
  - 'voice-notes'
  - 'ai'
  - 'productivity'
  - 'transcription'
---
You finish a long voice note and realise it contains half a dozen jobs you promised to do. Listening to it again to find them wastes time. You need the tasks out, in one list, without rewriting everything by hand.

## Turn your voice note into text
A transcript is a written version of what was said aloud. Most phones can make one from a voice note, or you can use Whisper, an open-source tool that turns speech into text.

1. Open the voice note on your phone or computer.
2. Use the built-in transcript button if your phone has one. Otherwise, upload the audio file to a Whisper-based service or app.
3. Copy the full text to your clipboard.

Reference: [Speech-to-text guide](https://platform.openai.com/docs/guides/speech-to-text)

## Turn the transcript into a task list
A prompt is the instruction you type into an AI chatbot. Paste this one, then paste your transcript below it:

Read this transcript and pull out every task, action item or promise. Ignore general chat. For each task, show:
- what needs to be done
- who is responsible, if it is mentioned
- any deadline or date

Return a simple bulleted list.

Then paste the transcript and send the message.

Reference: [Prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering)

## Check the list against the recording
AI can miss tasks or invent ones that were never mentioned. Read each bullet and compare it to the transcript. Delete anything that is not a real task. Add anything the AI left out.

1. Open your task app or notes file.
2. Type or paste the corrected bullets.
3. Add due dates where the transcript mentioned them.

## Expected result
You will have one short list of tasks, each with an owner and a date where one was spoken. You can act on it without listening to the voice note again.

That is it. The next time a long voice note lands, turn it into text first, then let the AI sort the tasks from the chat.
