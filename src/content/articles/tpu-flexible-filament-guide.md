---
title: 'TPU & Flexible Filaments: Complete Guide'
summary: 'TPU and flexible filament reference: Shore hardness ratings, direct drive vs bowden, print speeds and retraction settings.'
category: maker
subcategory: filaments
publishDate: 2026-05-01
seoTitle: 'TPU & Flexible Filaments — Complete Guide'
metaDescription: 'TPU and flexible filament reference: Shore hardness ratings, direct drive vs bowden, print speeds and retraction settings.'
verification: tested
sources: []
tags:
  - tpu
  - flexible
  - filament
  - reference
---
TPU (Thermoplastic Polyurethane) is the most widely used flexible filament — the material behind 3D-printed phone cases, shoe soles, RC car tyres, and flexible gaskets. Understanding Shore hardness and direct vs Bowden printing is essential before buying a spool.

## Shore hardness — what the numbers mean

Shore A hardness measures rubber-like flexibility. Higher number = stiffer. Common TPU grades for 3D printing:

60A

GEL-SOFT

Wearables
Medical

85A

SOFT RUBBER

Phone cases
Soft grips

95A ★

MOST COMMON

RC tyres
Gaskets · Mounts

98A

SEMI-RIGID

Hinges
Straps · Clips

Shore D

RIGID

Hard plastics
(ABS, PETG)

| Shore Rating | Feel | Common use | Printability |
| --- | --- | --- | --- |
| 85A | Very soft — like a rubber band | Phone cases, soft grips | Hard — Bowden struggles |
| 95A | Firm rubber — like a shoe sole | RC tyres, gaskets, mounts | Medium — direct drive preferred |
| 98A | Semi-rigid — like a credit card edge | Functional hinges, straps | Easier — Bowden possible with care |
| TPE (softer) | Gel-like | Wearables, medical prototypes | Very hard — direct drive only |

## Direct drive vs Bowden — why it matters for TPU

Bowden setups (Ender 3, older Creality machines) have a long PTFE tube between the extruder and hotend. Flexible filament can buckle inside this tube, causing inconsistent extrusion or total jams. The only workarounds are: (1) print extremely slowly (20–25 mm/s), (2) upgrade to a direct drive extruder, or (3) use 98A or harder TPU which is stiff enough to push through. Bambu Lab's A1, P1S, and X1C all use direct drive and handle TPU 95A well.

## AMS / multi-material compatibility

TPU and Bambu's AMS Lite do not get along — the AMS Lite cannot reliably push flexible filament through its feeding mechanism. Print TPU directly from the external spool holder, bypassing the AMS entirely. Bambu's full AMS (X1C version) handles 95A TPU with the textured/flexible filament mode enabled but still risks jams with anything softer than 95A.

## Print settings

| Parameter | TPU 95A | TPU 85A | Notes |
| --- | --- | --- | --- |
| Nozzle temp | 220–235°C | 215–230°C | Softer grades print cooler |
| Bed temp | 25–50°C | 25–40°C | TPU sticks without bed heat |
| Print speed | 25–45 mm/s | 15–25 mm/s | Slow is the single most important setting |
| Retraction | 0 mm (direct) | 0 mm (direct) | Disable retraction — buckling risk |
| Cooling | 50–80% | 50–80% | Moderate cooling |
| Infill | 15–40% | 10–25% | Lower infill = more flex |

> **Most common TPU mistake:** Running retraction. Even 0.5 mm retraction with TPU 95A causes the flexible filament to buckle inside the extruder, resulting in clogs and under-extrusion. Disable retraction entirely and use Z-hop (0.2 mm) to reduce stringing instead.

Direct Drive vs Bowden — why TPU needs direct drive

<svg viewBox="0 0 580 130" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram comparing direct drive extruder with short filament path versus Bowden setup with long PTFE tube where flexible TPU buckles"><rect x="10" y="10" width="255" height="110" rx="10" fill="#F0FFF4" stroke="#1A9068" stroke-width="1.5"></rect><text x="137" y="28" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#1A9068" text-anchor="middle">✓ Direct Drive</text> <rect x="30" y="38" width="44" height="44" rx="6" fill="#1A9068" opacity=".8"></rect><text x="52" y="64" font-family="Inter,sans-serif" font-size="9" fill="#fff" text-anchor="middle" font-weight="600">Motor</text> <line x1="74" y1="60" x2="105" y2="60" stroke="#1A9068" stroke-width="2.5" stroke-linecap="round"></line><polygon points="105,56 113,60 105,64" fill="#1A9068"></polygon><rect x="113" y="43" width="34" height="34" rx="6" fill="#1A9068" opacity=".6"></rect><text x="130" y="64" font-family="Inter,sans-serif" font-size="9" fill="#fff" text-anchor="middle" font-weight="600">HEnd</text> <text x="89" y="52" font-family="Inter,sans-serif" font-size="8" fill="#1A9068" text-anchor="middle">~5mm</text> <text x="30" y="102" font-family="Inter,sans-serif" font-size="9" fill="#1A9068">Short path = no buckling</text> <text x="30" y="114" font-family="Inter,sans-serif" font-size="9" fill="#1A9068">TPU prints reliably at 25–40 mm/s</text> <line x1="52" y1="82" x2="52" y2="95" stroke="#AED581" stroke-width="3" stroke-linecap="round"></line><line x1="130" y1="77" x2="130" y2="90" stroke="#D4E157" stroke-width="3" stroke-linecap="round"></line><rect x="315" y="10" width="255" height="110" rx="10" fill="#FFF5F5" stroke="#E53E3E" stroke-width="1.5"></rect><text x="442" y="28" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#E53E3E" text-anchor="middle">✗ Bowden Setup</text> <rect x="330" y="38" width="44" height="44" rx="6" fill="#E53E3E" opacity=".5"></rect><text x="352" y="64" font-family="Inter,sans-serif" font-size="9" fill="#fff" text-anchor="middle" font-weight="600">Motor</text> <rect x="374" y="55" width="100" height="10" rx="5" fill="#E53E3E" opacity=".25" stroke="#E53E3E" stroke-width="1"></rect><text x="424" y="50" font-family="Inter,sans-serif" font-size="8" fill="#E53E3E" text-anchor="middle">PTFE tube ~300–500mm</text> <path d="M380,60 Q392,53 404,60 Q416,67 428,60 Q440,53 452,60 Q464,67 474,60" stroke="#FF8A65" stroke-width="2.5" fill="none" stroke-linecap="round"></path><rect x="478" y="43" width="34" height="34" rx="6" fill="#E53E3E" opacity=".5"></rect><text x="495" y="64" font-family="Inter,sans-serif" font-size="9" fill="#fff" text-anchor="middle" font-weight="600">HEnd</text> <text x="330" y="102" font-family="Inter,sans-serif" font-size="9" fill="#E53E3E">Long path = TPU buckles &amp; tangles</text> <text x="330" y="114" font-family="Inter,sans-serif" font-size="9" fill="#E53E3E">Clogs, under-extrusion, failed prints</text></svg>

## Top TPU brands

**NinjaFlex 85A** (NinjaTek, USA) is the premium benchmark — extremely consistent, very soft, excellent for wearables. Expensive at ₹3,000–4,000/kg in India. **eSUN TPU 95A** is the practical choice — ₹800–1,100/kg on Amazon India, consistent diameter, clean printing on direct drive. **Polymaker PolyFlex TPU95** is the best mid-range option with excellent reliability on Bambu printers.

## Applications where TPU excels

-   Phone cases and tablet covers
-   RC car and drone landing gear tyres
-   Protective bumpers for electronics
-   Cable strain relief and cord organizers
-   Custom shoe insoles and orthotics prototypes
-   Vibration-dampening machine mounts
-   Waterproof gaskets and seals

**Pros**

- ✓Unique flexibility no rigid material can match
- ✓Excellent impact absorption
- ✓Good UV and abrasion resistance
- ✓No warping — adheres well to most beds

**Cons**

- ✗Very slow print speeds required
- ✗Bowden setups are problematic
- ✗AMS/multi-material incompatible (soft grades)
- ✗Hard to post-process or glue
