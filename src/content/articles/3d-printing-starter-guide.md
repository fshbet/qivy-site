---
title: 'Complete 3D printing starter guide — everything I wish I knew'
summary: 'A complete 3D printing starter guide: choosing a printer, understanding filament, learning the slicer, your first prints, and fixing failures.'
category: maker
publishDate: 2026-04-01
seoTitle: '3D Printing Starter Guide for Beginners'
metaDescription: 'A complete 3D printing starter guide: choosing a printer, understanding filament, learning the slicer, your first prints, and fixing failures.'
verification: tested
sources: []
tags:
  - 3d-printing
  - beginner
  - guide
  - filament
---
When I started 3D printing I wasted two weeks on the wrong information — forum posts from 2019, YouTube videos for printers I didn't own, and advice that assumed I already knew what I was doing. This guide is what I wish had existed.

## Step 1 — Pick the right printer

For 99% of beginners, the choice comes down to three printers:

-   **Bambu Lab A1 Mini (₹28k)** — best out-of-box experience, almost no setup. My recommendation if budget allows.
-   **Creality Ender 3 V3 SE (₹12k)** — budget option, requires more tinkering, great for learning how the machine works.
-   **Bambu Lab P1S (₹65k)** — enclosed, handles more materials, for serious makers.

Don't buy a resin printer as your first machine. The workflow is more complex and the post-processing involves chemicals. Start with FDM (filament).

## Step 2 — Understand filament

You'll mostly use two materials to start:

-   **PLA** — easiest to print, works great for most things, not heat resistant. Start here.
-   **PETG** — stronger, slightly heat resistant, a little trickier. Use for functional parts.

Avoid ABS, ASA, and Nylon until you have 50+ hours of printing experience. They require enclosures and careful dialling-in.

## Step 3 — Learn the slicer

A slicer converts your 3D model into print instructions. The main ones are **Bambu Studio** (if you have a Bambu printer), **Orca Slicer** (free, works with any printer), and **Cura** (popular, lots of community presets).

The most important settings to understand early:

-   **Layer height** — 0.2 mm is the standard. Lower = smoother but slower. Start at 0.2 mm.
-   **Infill percentage** — how solid the inside is. 15% for decorative, 25–40% for functional parts.
-   **Supports** — auto-generated structures for overhangs. Enable only when needed.
-   **Bed adhesion** — brim or raft to stop corners lifting. Use a 5 mm brim on large flat parts.

## Step 4 — Your first 5 prints

1.  **Benchy** — the classic test boat. Everyone starts here. Tells you if your settings are dialled in.
2.  **Calibration cube** — 20×20×20 mm cube. Check dimensions with calipers.
3.  **Phone stand** — practical, tests overhangs, something you'll actually use.
4.  **Cable clip** — small, fast, immediately useful on your desk.
5.  **Something you designed** — even a simple box. Fusion 360 has a free version. Start simple.

> **Where to find free models:** Printables.com (best for quality), Thingiverse (largest library), MakerWorld (Bambu's platform, good curation).

## Step 5 — When things go wrong

Every printer fails eventually. The most common issues and quick fixes:

-   **First layer not sticking** → re-level the bed, clean with IPA, increase bed temp by 5°C
-   **Stringing** → increase retraction, reduce travel temperature, increase travel speed
-   **Layer shifting** → reduce print speed, check belt tension
-   **Under-extrusion** → increase flow rate, check for partial clog, increase temp by 5°C

The **Printables troubleshooting guide** and the Bambu Lab Wiki are both excellent resources once you know what symptom you're dealing with.
