---
title: '5 slicer settings that fixed my print quality overnight'
summary: 'Five slicer settings — retraction, seam position, support interface, infill overlap and perimeter speed — that visibly improve 3D print quality.'
category: maker
publishDate: 2026-03-01
seoTitle: '5 Slicer Settings That Fix Print Quality'
metaDescription: 'Five slicer settings — retraction, seam position, support interface, infill overlap and perimeter speed — that visibly improve 3D print quality.'
verification: tested
sources: []
tags:
  - slicer
  - 3d-printing
  - print-quality
  - tips
---
After 50+ hours of printing with mediocre results, I spent a weekend systematically testing slicer settings. These are the 5 changes that made the biggest difference — each one with the exact values I use.

🧵

Retraction

Fixes stringing
PLA: 0.5mm
PETG: 0.8mm

Impact: HIGH

🔲

Seam

Hides layer marks
Set: Aligned
or Rear

Impact: MED

🏗️

Support Interface

Easier removal
0.1mm layer
Z gap: 0.2mm

Impact: MED

🔗

Infill Overlap

Stronger parts
15% → 25%
No downside

Impact: HIGH

🐌

Outer Speed

Better surface
60% of main
speed

Impact: HIGH

## 1\. Retraction distance and speed

Stringing is almost always a retraction problem. The filament doesn't pull back far enough or fast enough when the nozzle travels between parts, leaving thin plastic threads behind.

-   **PLA:** 0.5 mm retraction, 35 mm/s speed
-   **PETG:** 0.8 mm retraction, 30 mm/s speed

## 2\. Seam position

The seam is where each layer starts and ends — it leaves a small mark. By default, slicers choose the seam location automatically, which scatters marks randomly. Change it to **Aligned** or **Rear** to hide the seam on the back of the model.

## 3\. Support interface layers

Default supports are hard to remove and leave rough patches. Add interface layers (the top 2–3 layers of the support) in a different material or with different settings to make supports break away cleanly.

-   **Interface layer height:** 0.1 mm
-   **Interface pattern:** Grid
-   **Z distance above support:** 0.2 mm

## 4\. Infill overlap

Increasing infill overlap from the default 15% to 25% improved layer bonding on every print I tested. The part feels measurably stiffer under the same load. No downside — do this on everything.

## 5\. External perimeter speed

Slowing down just the outer walls (perimeters) while keeping infill fast gives you better surface finish without adding much total print time. I run outer walls at 60% of the main print speed.

> **One setting to change first:** If you only do one thing, fix retraction. It solves stringing, improves surface finish, and makes almost every print look better immediately.
