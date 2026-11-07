---
title: 'PETG Filament: Complete Guide for Functional Parts'
summary: 'PETG filament reference: why glycol modification matters, print settings, stringing fixes, chemical resistance and PLA comparison.'
category: maker
subcategory: filaments
publishDate: 2026-05-01
seoTitle: 'PETG Filament Guide for Functional Parts'
metaDescription: 'PETG filament reference: why glycol modification matters, print settings, stringing fixes, chemical resistance and PLA comparison.'
verification: tested
sources: []
tags:
  - petg
  - filament
  - functional-parts
  - reference
---
PETG (Polyethylene Terephthalate Glycol-modified) sits in the sweet spot between easy-printing PLA and demanding engineering materials. The glycol modification — adding ethylene glycol during PET polymerisation — prevents crystallisation, giving you a clear-printable, impact-resistant, chemical-resistant filament that doesn't require an enclosure. It's the natural second filament for anyone who has mastered PLA.

## Why glycol matters

Standard PET (the material in water bottles) is too crystalline and brittle in filament form. The glycol modification disrupts the crystalline structure, increasing toughness and clarity while lowering the processing temperature to a printable 230–250°C range. The result prints more like PLA than ABS but has significantly better functional properties than either for many applications.

| PLA | PETG |
| --- | --- |
| 55–60°C heat resistance | 70–80°C heat resistance |
| Low warp · easy bed adhesion | Sticks hard to smooth PEI — use textured |
| Very easy to print · fast speeds | Medium difficulty · lower speeds |
| Brittle — low impact resistance | Tough — 2–3× better impact |
| Biodegrades over time | Long-term UV & chemical stable |
| ₹500–750/kg India | ₹700–1,000/kg India |

## Where PETG wins over PLA

-   **Heat resistance:** HDT of 70–80°C vs PLA's 55–60°C. Still not for car dashboards, but handles summer window ledges in most Indian climates.
-   **Impact resistance:** PETG absorbs impact energy 2–3× better than standard PLA — critical for parts that get dropped or loaded cyclically.
-   **Chemical resistance:** Resists most dilute acids, alkalis, and common solvents. Good for tool holders, chemical storage prints, and water-handling components.
-   **Layer adhesion:** PETG bonds between layers extremely well — often better inter-layer strength than PLA on the same printer.
-   **Moisture resistance:** Printed PETG parts resist water absorption better than PLA. Food containers and outdoor enclosures benefit from this.

## The stringing problem — and the fix

PETG's major printing challenge is stringing. Its low melt viscosity at printing temperature means the filament oozes between travel moves, leaving thin whisker-like strings. The fix is retraction tuning — but PETG tolerates less retraction than PLA before grinding or jamming, especially on Bowden setups.

> **Proven PETG retraction settings (Bambu A1 Mini, direct drive):** 0.8 mm retraction distance · 30 mm/s retraction speed · 200 mm/s travel speed · wipe on retract: enabled. These eliminate 90% of stringing on stock Bambu profiles.

## Print settings

| Parameter | Value | Notes |
| --- | --- | --- |
| Nozzle temp | 230–250°C | Start at 240°C, adjust for stringing |
| Bed temp | 70–85°C | 80°C recommended for adhesion |
| Print speed | 60–120 mm/s | Slower outer perimeters for finish |
| Retraction (direct) | 0.6–1.0 mm | Less is more — over-retraction causes jams |
| Retraction (Bowden) | 3–5 mm | Stringing worse on Bowden — use direct drive |
| Cooling fan | 30–60% | Too much cooling reduces layer adhesion |
| Brim | Optional | Add 5 mm brim for large flat parts |
| Nozzle type | Brass | Hardened for glass-filled PETG variants |

## PETG for India's climate

PETG's 70–80°C HDT makes it viable for many semi-outdoor Indian applications where PLA would fail. Electrical enclosures in workshops, bracket mounts on building exteriors in shade, automotive interior parts (away from direct sun), and outdoor cable management all benefit from PETG over PLA. However PETG is more hygroscopic than PLA — during Chennai or Mumbai monsoon season, open spools absorb enough moisture within 48–72 hours to cause audible popping, bubbles, and rough surfaces.

### Material ratings

Print difficulty

Medium

Tensile strength

~50 MPa

Heat resistance

Medium (75°C HDT)

UV resistance

Good

Moisture sensitivity

Medium

Impact resistance

Very Good

Chemical resistance

Good

## Top PETG brands in India

**eSUN PETG** is the go-to recommendation for India — widely available, ₹700–900/kg, consistent quality. **Polymaker PolyLite PETG** runs slightly cleaner with less stringing out of the box. **Bambu Lab PETG-HF** (High Flow) is the best option for Bambu printer owners running above 100 mm/s. Avoid no-brand PETG from marketplace sellers — dimensional inconsistency at sub-₹500/kg prices leads to mid-print clogs.

**Pros**

- ✓Better heat resistance than PLA
- ✓Excellent impact toughness
- ✓Good UV and chemical resistance
- ✓No enclosure required
- ✓Bonds very well between layers

**Cons**

- ✗Strings badly without careful tuning
- ✗Absorbs moisture — needs sealed storage
- ✗Sticks aggressively to smooth PEI beds
- ✗Harder to post-process than PLA or ABS
- ✗Challenging on Bowden setups

Related articles

→ PLA vs PETG: which to choose → ABS & ASA for harder engineering needs → Storing PETG in India's humidity → Build log: PETG cable rack project
