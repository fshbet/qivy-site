---
title: 'ABS & ASA Filament: Engineering-Grade Complete Guide'
summary: 'ABS and ASA filament reference: enclosure requirements, warping control, acetone smoothing, UV stability and print settings.'
category: maker
subcategory: filaments
publishDate: 2026-05-01
seoTitle: 'ABS & ASA Filament — Engineering Guide'
metaDescription: 'ABS and ASA filament reference: enclosure requirements, warping control, acetone smoothing, UV stability and print settings.'
verification: researched
sources:
  - 'https://help.prusa3d.com/article/abs_2058'
  - 'https://help.prusa3d.com/article/asa_1809'
tags:
  - abs
  - asa
  - filament
  - engineering
---
ABS (Acrylonitrile Butadiene Styrene) was the dominant engineering filament before PLA democratised the hobby. It remains relevant for its acetone vapour smoothing capability, higher heat resistance (~100°C HDT), and familiar material properties used in mass-produced consumer goods. ASA (Acrylonitrile Styrene Acrylate) is ABS's outdoor successor — identical processing parameters but with dramatically improved UV stability.

## ABS vs ASA: which to choose

| Property | ABS | ASA |
| --- | --- | --- |
| Heat resistance (HDT) | ~95–100°C | ~95–100°C |
| UV resistance | Poor — yellows and degrades | Excellent — outdoor rated |
| Impact resistance | Good | Good (slightly better than ABS) |
| Acetone smoothing | Yes — works perfectly | Partial — less effective |
| Warp tendency | High | High (slightly worse than ABS) |
| Fume generation | Significant — styrene | Reduced vs ABS |
| Price | ₹700–1,100/kg | ₹900–1,400/kg |
| Best for | Indoor engineering + acetone finish | Outdoor, automotive, UV-exposed |

| ABS | ASA |
| --- | --- |
| 95–100°C heat resistance | 95–100°C heat resistance |
| Acetone smoothing ✓ | Acetone smoothing (partial only) |
| Poor UV — yellows outdoors | Excellent UV — outdoor rated |
| Styrene fumes — needs ventilation | Fewer fumes than ABS |
| ₹700–1,100/kg India | ₹900–1,400/kg India |
| Best: indoor engineering, display models | Best: outdoor, automotive, UV-exposed |

## The enclosure requirement — non-negotiable

ABS and ASA warp due to rapid cooling — the outer layers of a print shrink faster than the inner layers, causing corners to lift and layers to crack (delamination). An enclosure maintains ambient temperature at 40–50°C, slowing the cooling rate and eliminating warping. Attempting ABS without an enclosure results in failed prints 70–80% of the time on parts larger than 50 mm.

Why enclosures prevent ABS warping — thermal differential explained

<svg viewBox="0 0 580 120" xmlns="http://www.w3.org/2000/svg" aria-label="Side-by-side showing ABS print without enclosure warping at corners versus enclosed printer with stable ambient temperature producing flat base"><rect x="10" y="8" width="255" height="104" rx="10" fill="#FFF5F5" stroke="#E53E3E" stroke-width="1.5"></rect><text x="137" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#E53E3E" text-anchor="middle">✗ No Enclosure (open air)</text> <rect x="40" y="90" width="190" height="8" rx="3" fill="#CBD5E0"></rect><path d="M55,90 Q80,60 110,52 L160,50 Q190,52 215,60 Q235,78 225,90 Z" fill="#E53E3E" opacity=".25" stroke="#E53E3E" stroke-width="1.5"></path><line x1="55" y1="90" x2="42" y2="76" stroke="#E53E3E" stroke-width="2" stroke-dasharray="3,2"></line><line x1="225" y1="90" x2="237" y2="76" stroke="#E53E3E" stroke-width="2" stroke-dasharray="3,2"></line><text x="42" y="72" font-family="Inter,sans-serif" font-size="8" fill="#E53E3E" font-weight="600">warp!</text> <text x="225" y="72" font-family="Inter,sans-serif" font-size="8" fill="#E53E3E" font-weight="600">warp!</text> <text x="137" y="44" font-family="Inter,sans-serif" font-size="8" fill="#E53E3E" text-anchor="middle">Cold ambient air rushes in → outer layers</text> <text x="137" y="54" font-family="Inter,sans-serif" font-size="8" fill="#E53E3E" text-anchor="middle">cool faster than centre → stress → warp</text> <rect x="315" y="8" width="255" height="104" rx="10" fill="#F0FFF4" stroke="#1A9068" stroke-width="1.5"></rect><text x="442" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#1A9068" text-anchor="middle">✓ Enclosed (40–50°C ambient)</text> <rect x="350" y="34" width="185" height="56" rx="4" fill="none" stroke="#1A9068" stroke-width="1" stroke-dasharray="4,3" opacity=".6"></rect><text x="442" y="30" font-family="Inter,sans-serif" font-size="8" fill="#1A9068" text-anchor="middle">Enclosure</text> <rect x="350" y="90" width="185" height="8" rx="3" fill="#CBD5E0"></rect><rect x="370" y="62" width="144" height="28" rx="4" fill="#1A9068" opacity=".3" stroke="#1A9068" stroke-width="1.5"></rect><text x="442" y="80" font-family="Inter,sans-serif" font-size="9" fill="#1A9068" text-anchor="middle" font-weight="600">Flat base ✓</text> <text x="442" y="46" font-family="Inter,sans-serif" font-size="8" fill="#1A9068" text-anchor="middle">Uniform 40–50°C air → even cooling</text> <text x="442" y="56" font-family="Inter,sans-serif" font-size="8" fill="#1A9068" text-anchor="middle">→ no thermal stress → no warping</text></svg>

> **Fumes warning:** ABS releases styrene vapours during printing — a suspected carcinogen. Always print ABS in a ventilated enclosure with an activated carbon filter, or vent exhaust to outdoors. ASA produces fewer styrene fumes but still requires ventilation. Never print ABS in a bedroom or unventilated room.

## Acetone smoothing — ABS's secret advantage

ABS dissolves in acetone. Exposing a printed ABS part to acetone vapour (or brushing on diluted acetone) melts the surface micro-layer, fusing layer lines and creating a smooth, injection-moulded appearance. No other common filament does this cleanly. For display models, cosplay props, or parts requiring a seamless surface without sanding, ABS + acetone smoothing remains unmatched.

## Print settings

| Parameter | ABS | ASA |
| --- | --- | --- |
| Nozzle temp | 230–250°C | 240–260°C |
| Bed temp | 90–110°C | 100–110°C |
| Chamber temp | 40–50°C minimum | 40–50°C minimum |
| Print speed | 40–80 mm/s | 40–80 mm/s |
| Cooling fan | 0–20% | 0–20% |
| Bed surface | PEI + glue stick | PEI + glue stick |
| Nozzle type | Brass | Brass (hardened for CF/GF variants) |

## ASA for India's outdoor climate

ASA was specifically developed for automotive exterior applications where ABS failed due to UV degradation. For 3D printing in India, ASA is the right choice for any outdoor-mounted component — cable enclosures on building exteriors, plant watering timers, outdoor camera mounts, solar charge controller boxes, and balcony fixtures. It handles 100°C short-term and resists monsoon humidity without surface degradation over a 2–3 year horizon.

## Top brands in India

**eSUN ABS+** includes toughening additives that reduce warping versus standard ABS — the best budget ABS option in India at ₹750–900/kg. **Polymaker PolyLite ABS** is more consistent dimensionally. For ASA: **Prusament ASA** (imported) is the quality benchmark. **Bambu Lab ASA** is calibrated for Bambu printers and delivers reliable results on P1S/X1C with their enclosures.

**Pros**

- ✓High heat resistance (~100°C)
- ✓Acetone smoothing possible (ABS)
- ✓Excellent outdoor durability (ASA)
- ✓Good impact resistance

**Cons**

- ✗Enclosure absolutely required
- ✗High warping — difficult to print large parts
- ✗Styrene fumes — ventilation essential
- ✗Not beginner material
