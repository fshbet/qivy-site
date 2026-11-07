---
title: 'Printing a cable management wall rack — settings, failures, final result'
summary: 'A 3D printed cable management wall rack from design to final part, including the warping and stringing failures along the way and the fixes.'
category: maker
publishDate: 2026-05-01
seoTitle: 'Cable Management Wall Rack — Build Log'
metaDescription: 'A 3D printed cable management wall rack from design to final part, including the warping and stringing failures along the way and the fixes.'
verification: tested
sources: []
tags:
  - 3d-printing
  - build-log
  - petg
  - troubleshooting
---
My desk cable situation was out of control. Three monitors, a NAS, a Raspberry Pi, and a 3D printer all fighting for power strips. I designed a simple wall-mounted cable management rack in Fusion 360 and printed it in PETG. Here's exactly how it went — including the two prints that failed.

## The design

I kept the design simple: a 200 mm wide back plate with 6 cable routing slots and two keyhole mounts for M5 wall screws. The whole thing was modelled in about 40 minutes in Fusion 360. STL download is linked at the bottom.

## Material choice — why PETG?

PLA would have worked fine indoors, but I wanted something that wouldn't creep under load or warp in summer heat (Chennai gets warm). PETG hits a sweet spot — stronger than PLA, easier to print than ABS, and available everywhere.

## Attempt 1 — warped corners

First print failed at layer 12. The corners lifted off the bed and the back plate came out banana-shaped. Cause: the bed was at 60°C (PLA default) instead of 75°C for PETG. I also skipped the brim, which was a mistake on a large flat part.

## Attempt 2 — stringing everywhere

Fixed the bed temp. Added a 5 mm brim. But now the print had heavy stringing between the cable slot towers. This is the PETG retraction issue I mentioned in the Bambu review — default profiles aren't tuned for it.

## Attempt 3 — success

With the corrected settings below, the third print came out clean. Total print time: 47 minutes. The result sits flush on the wall and holds 8 cables without flex.

| Setting | Value |
| --- | --- |
| Material | eSUN PETG — Solid Black |
| Nozzle temp | 235°C |
| Bed temp | 80°C |
| Layer height | 0.2 mm |
| Print speed | 150 mm/s |
| Retraction | 0.8 mm at 30 mm/s |
| Brim | 5 mm, 3 loops |
| Infill | 25% gyroid |
| Total print time | 47 minutes |

Build log — 3 attempts to a clean print

<svg viewBox="0 0 560 80" xmlns="http://www.w3.org/2000/svg" aria-label="Timeline of three print attempts: attempt 1 failed with warped corners, attempt 2 failed with stringing, attempt 3 succeeded in 47 minutes"><line x1="80" y1="36" x2="480" y2="36" stroke="#E8E7E3" stroke-width="2"></line><circle cx="80" cy="36" r="20" fill="#FFF5F5" stroke="#E53E3E" stroke-width="2"></circle><text x="80" y="33" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#E53E3E" text-anchor="middle">✗</text> <text x="80" y="44" font-family="Inter,sans-serif" font-size="8.5" fill="#E53E3E" text-anchor="middle">Fail</text> <text x="80" y="65" font-family="Inter,sans-serif" font-size="9.5" font-weight="600" fill="#111110" text-anchor="middle">Attempt 1</text> <text x="80" y="76" font-family="Inter,sans-serif" font-size="8.5" fill="#6B6B67" text-anchor="middle">Warped corners</text> <text x="80" y="10" font-family="Inter,sans-serif" font-size="8" fill="#6B6B67" text-anchor="middle">Bed 60°C · no brim</text> <polygon points="168,33 180,36 168,39" fill="#E8E7E3"></polygon><circle cx="200" cy="36" r="20" fill="#FFFBEB" stroke="#E6A020" stroke-width="2"></circle><text x="200" y="33" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#E6A020" text-anchor="middle">~</text> <text x="200" y="44" font-family="Inter,sans-serif" font-size="8.5" fill="#E6A020" text-anchor="middle">Fail</text> <text x="200" y="65" font-family="Inter,sans-serif" font-size="9.5" font-weight="600" fill="#111110" text-anchor="middle">Attempt 2</text> <text x="200" y="76" font-family="Inter,sans-serif" font-size="8.5" fill="#6B6B67" text-anchor="middle">Stringing between towers</text> <text x="200" y="10" font-family="Inter,sans-serif" font-size="8" fill="#6B6B67" text-anchor="middle">Bed 80°C · retraction wrong</text> <polygon points="288,33 300,36 288,39" fill="#E8E7E3"></polygon><circle cx="320" cy="36" r="20" fill="#F0FFF4" stroke="#1A9068" stroke-width="2.5"></circle><text x="320" y="33" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#1A9068" text-anchor="middle">✓</text> <text x="320" y="44" font-family="Inter,sans-serif" font-size="8.5" fill="#1A9068" text-anchor="middle">Clean</text> <text x="320" y="65" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#1A9068" text-anchor="middle">Attempt 3 ★</text> <text x="320" y="76" font-family="Inter,sans-serif" font-size="8.5" fill="#1A9068" text-anchor="middle">47 min · wall-mounted</text> <text x="320" y="10" font-family="Inter,sans-serif" font-size="8" fill="#1A9068" text-anchor="middle">0.8mm retract · 5mm brim · 80°C</text> <rect x="400" y="16" width="145" height="42" rx="8" fill="#F0FFF4" stroke="#1A9068" stroke-width="1.5"></rect><text x="472" y="30" font-family="Inter,sans-serif" font-size="9" fill="#1A9068" font-weight="600" text-anchor="middle">FINAL RESULT</text> <text x="472" y="42" font-family="Inter,sans-serif" font-size="9" fill="#111110" text-anchor="middle">47 min · 8 cables · 3 weeks</text> <text x="472" y="53" font-family="Inter,sans-serif" font-size="8.5" fill="#1A9068" text-anchor="middle">no flex · no creep ✓</text></svg>

> **Key lesson:** Always add a brim on large flat PETG parts. The 5 minutes it adds to print time saves you from a failed 45-minute print.

## Result

The rack has been on the wall for 3 weeks now. No flex, no creep, no issues. The keyhole mounts make it easy to remove — I've taken it down twice to re-route cables and it pops back on in seconds.

**STL download:** free, link in the WhatsApp channel (join below).
