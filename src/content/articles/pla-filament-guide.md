---
title: 'PLA Filament: The Complete Guide (2026)'
summary: 'PLA filament reference: properties, print temperatures, bed adhesion, when it fails, and how it compares to other materials.'
category: maker
subcategory: filaments
publishDate: 2026-05-01
seoTitle: 'PLA Filament — The Complete Guide'
metaDescription: 'PLA filament reference: properties, print temperatures, bed adhesion, when it fails, and how it compares to other materials.'
verification: researched
sources:
  - 'https://help.prusa3d.com/article/pla_2062'
tags:
  - pla
  - filament
  - beginner
  - reference
---
PLA (Polylactic Acid) is the default starting material for 3D printing — and for good reason. Derived from fermented plant starch (corn, sugarcane, cassava), it melts cleanly, sticks to most beds without adhesives, and produces almost no toxic fumes. Over 70% of hobbyist prints worldwide are PLA or a PLA variant.

This guide covers everything: the chemistry, variants, exact print settings, failure modes, brand comparisons, and India-specific sourcing.

<svg viewBox="0 0 700 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PLA material properties overview showing easy print difficulty, 50 MPa tensile strength, 60°C heat deflection, and minimal warping"><rect width="700" height="160" fill="#FAFAF9"></rect><rect x="0" y="0" width="700" height="160" fill="url(#pla-grad)"></rect><defs><linearGradient id="pla-grad" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDF0EB"></stop><stop offset="100%" stop-color="#F4F3F0"></stop></linearGradient></defs><text x="28" y="48" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#A0A09B" letter-spacing="1">PLA FILAMENT — KEY PROPERTIES</text> <circle cx="84" cy="105" r="38" fill="#fff" stroke="#F4A988" stroke-width="2.5"></circle><circle cx="84" cy="105" r="26" fill="#FDF0EB" stroke="#D85A30" stroke-width="1.5"></circle><circle cx="84" cy="105" r="10" fill="#D85A30" opacity=".3"></circle><circle cx="84" cy="105" r="4" fill="#D85A30"></circle><path d="M122 105 C140 88, 155 122, 170 105 C185 88, 200 122, 215 105" stroke="#D85A30" stroke-width="2.5" fill="none" stroke-linecap="round"></path><rect x="240" y="58" width="90" height="64" rx="8" fill="#fff" stroke="#E8E7E3" stroke-width="1"></rect><text x="285" y="86" font-family="Inter,sans-serif" font-size="22" font-weight="800" fill="#1A9068" text-anchor="middle">Easy</text> <text x="285" y="104" font-family="Inter,sans-serif" font-size="10" fill="#A0A09B" text-anchor="middle" font-weight="500">PRINT DIFFICULTY</text> <text x="285" y="116" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67" text-anchor="middle">1/5 — ideal for beginners</text> <rect x="345" y="58" width="90" height="64" rx="8" fill="#fff" stroke="#E8E7E3" stroke-width="1"></rect><text x="390" y="86" font-family="Inter,sans-serif" font-size="22" font-weight="800" fill="#111110" text-anchor="middle">50 MPa</text> <text x="390" y="104" font-family="Inter,sans-serif" font-size="10" fill="#A0A09B" text-anchor="middle" font-weight="500">TENSILE STRENGTH</text> <text x="390" y="116" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67" text-anchor="middle">Good for non-structural use</text> <rect x="450" y="58" width="90" height="64" rx="8" fill="#fff" stroke="#E8E7E3" stroke-width="1"></rect><text x="495" y="86" font-family="Inter,sans-serif" font-size="22" font-weight="800" fill="#E6A020" text-anchor="middle">60°C</text> <text x="495" y="104" font-family="Inter,sans-serif" font-size="10" fill="#A0A09B" text-anchor="middle" font-weight="500">HEAT DEFLECTION</text> <text x="495" y="116" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67" text-anchor="middle">Indoor use only</text> <rect x="555" y="58" width="90" height="64" rx="8" fill="#fff" stroke="#E8E7E3" stroke-width="1"></rect><text x="600" y="86" font-family="Inter,sans-serif" font-size="22" font-weight="800" fill="#1A9068" text-anchor="middle">Low</text> <text x="600" y="104" font-family="Inter,sans-serif" font-size="10" fill="#A0A09B" text-anchor="middle" font-weight="500">WARP RISK</text> <text x="600" y="116" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67" text-anchor="middle">No enclosure needed</text></svg>

PLA at a glance — the easiest FDM material with good tensile strength but limited heat resistance. Ideal for indoor prototypes and decorative prints.

## Why PLA dominates hobbyist printing

PLA's glass transition temperature is ~60°C — low enough that it softens at moderate heat but high enough for most indoor use cases. Its low melt viscosity means it extrudes predictably, doesn't string badly with basic retraction tuning, and bonds well layer-to-layer even at high speeds. For Bambu Lab users running 200+ mm/s, PLA is the material that actually performs at speed.

## PLA variants — what's actually different

-   **Standard PLA** — baseline. Good for prototypes and display pieces. Slightly brittle.
-   **PLA+** — toughened with impact modifiers (often rubber-phase additives). ~20–40% better layer adhesion, less brittle. Print temp slightly higher (200–230°C). eSUN PLA+ is the benchmark for this category.
-   **Silk PLA** — contains wax-like additives creating a high-sheen finish. Weaker than standard PLA — not for structural parts. Looks exceptional on display models.
-   **Matte PLA** — chalk-like surface hides layer lines better than glossy PLA. Good for cosplay, figurines.
-   **High-Speed PLA** — engineered for 300–600 mm/s printing on CoreXY machines. Bambu Hyper PLA and Polymaker PolyLite HS are leaders here. Requires higher flow rates and slightly higher temps (220–240°C).
-   **PLA-CF** — PLA with chopped carbon fibre. Stiffer, lower weight, matte black finish. Needs hardened steel nozzle. Prusament PLA Carbon Fibre and Bambu Lab PLA-CF are well-regarded options.

- **Standard PLA** (190–215°C) — Baseline quality. Best for prototypes & decorative prints.
- **PLA+** (200–230°C) — Toughened — 30% less brittle. The everyday upgrade.
- **Silk PLA** (200–220°C) — High-sheen mirror finish. Display models only — weaker.
- **Matte PLA** (200–220°C) — Hides layer lines. Great for cosplay & figurines.
- **HS PLA** (220–240°C) — 300–600 mm/s. CoreXY only — Bambu Hyper PLA.

## Print settings

| Parameter | Standard PLA | PLA+ | Silk PLA | High-Speed PLA |
| --- | --- | --- | --- | --- |
| Nozzle temp | 190–215°C | 200–230°C | 200–220°C | 220–240°C |
| Bed temp | 50–60°C | 55–65°C | 55–65°C | 55–65°C |
| Print speed | Up to 200 mm/s | Up to 200 mm/s | Up to 150 mm/s | 300–600 mm/s |
| Retraction (direct) | 0.5–1.0 mm | 0.5–1.0 mm | 1.0–2.0 mm | 0.5–1.0 mm |
| Cooling fan | 100% | 80–100% | 80–100% | 100% |
| Nozzle type | Brass | Brass | Brass | Brass / Hardened |

Nozzle temperature range — PLA vs common materials

<svg viewBox="0 0 640 90" xmlns="http://www.w3.org/2000/svg" aria-label="Temperature scale comparing PLA 190-220°C against PETG 230-250°C, ABS 230-250°C, and Nylon 240-280°C"><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#81D4FA"></stop><stop offset="30%" stop-color="#AED581"></stop><stop offset="55%" stop-color="#FFD54F"></stop><stop offset="78%" stop-color="#FF8A65"></stop><stop offset="100%" stop-color="#EF5350"></stop></linearGradient></defs><text x="48" y="12" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" font-weight="600">160°C</text> <text x="168" y="12" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" font-weight="600">200°C</text> <text x="296" y="12" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" font-weight="600">240°C</text> <text x="424" y="12" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" font-weight="600">280°C</text> <text x="546" y="12" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" font-weight="600">320°C</text> <rect x="48" y="18" width="560" height="8" rx="4" fill="url(#tg)" opacity=".35"></rect><rect x="108" y="30" width="96" height="14" rx="4" fill="#D85A30" opacity=".85"></rect><text x="156" y="41" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">PLA 190–220°C</text> <rect x="220" y="48" width="96" height="14" rx="4" fill="#1A9068" opacity=".85"></rect><text x="268" y="59" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">PETG 230–250°C</text> <rect x="220" y="30" width="96" height="14" rx="4" fill="#E6A020" opacity=".85"></rect><text x="268" y="41" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">ABS 230–250°C</text> <rect x="296" y="48" width="128" height="14" rx="4" fill="#6C63D4" opacity=".85"></rect><text x="360" y="59" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">Nylon 240–280°C</text> <rect x="392" y="30" width="128" height="14" rx="4" fill="#4A5568" opacity=".75"></rect><text x="456" y="41" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">PC 260–310°C</text> <line x1="156" y1="28" x2="156" y2="20" stroke="#D85A30" stroke-width="1.5" stroke-dasharray="2,2"></line><text x="156" y="79" font-family="Inter,sans-serif" font-size="9" fill="#D85A30" font-weight="600" text-anchor="middle">PLA: lowest temp = easiest to print, least energy</text></svg>

## Performance properties

### Material ratings

Print difficulty

Very Easy

Tensile strength

~50 MPa

Heat resistance

Poor (60°C HDT)

UV resistance

Poor

Moisture sensitivity

Low–Medium

Layer adhesion

Good

Warp tendency

Minimal

## Common failures and fixes

| Problem | Likely cause | Fix |
| --- | --- | --- |
| Stringing | Temp too high / retraction too low | Drop nozzle temp 5°C, increase retraction 0.2 mm |
| Layer delamination | Temp too low / speed too high | Increase temp 5°C or reduce speed 20% |
| First layer not sticking | Bed too cool or dirty | Clean with IPA, increase bed temp to 60°C, use glue stick on smooth PEI |
| Brittle prints | Wet filament / too-cool temp | Dry at 45–50°C for 4–6 hrs, increase nozzle temp 5°C |
| Blobs / zits | Pressure advance not set | Calibrate pressure advance / linear advance in slicer |

## Best PLA brands — global & India

**Prusament PLA** (Czech Republic) remains the benchmark — ±0.02 mm tolerance with publicly verifiable batch data. **Polymaker PolyLite PLA** is the best mid-range option with near-premium consistency. **eSUN PLA+** is the value champion available on Amazon India for ₹600–750/kg. **Bambu Lab Basic PLA** is the best choice for Bambu printer users given the RFID integration and pre-tuned profiles.

## India availability & pricing (May 2026)

| Brand | Type | Price/kg (₹) | Where to buy |
| --- | --- | --- | --- |
| eSUN PLA+ | PLA+ | 600–750 | Amazon India, local resellers |
| SUNLU PLA | Standard | 500–650 | Amazon India |
| Polymaker PolyLite | PLA | 900–1,100 | Amazon India, ThinkRobotics |
| Bambu Lab Basic PLA | PLA / HS PLA | 1,400–1,800 | Bambu Lab India, Amazon |
| Prusament PLA | PLA | 1,800–2,400 | Import, select resellers |

PLA price per kg — India market (May 2026)

<svg viewBox="0 0 600 140" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart comparing PLA filament prices in India: eSUN PLA+ ₹675, SUNLU PLA ₹575, Polymaker PolyLite ₹1000, Bambu Basic ₹1600, Prusament ₹2100"><defs><linearGradient id="barg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#D85A30"></stop><stop offset="100%" stop-color="#E6A020"></stop></linearGradient></defs><line x1="120" y1="10" x2="120" y2="110" stroke="#E8E7E3" stroke-width="1"></line><line x1="222" y1="10" x2="222" y2="110" stroke="#E8E7E3" stroke-width="1"></line><line x1="324" y1="10" x2="324" y2="110" stroke="#E8E7E3" stroke-width="1"></line><line x1="426" y1="10" x2="426" y2="110" stroke="#E8E7E3" stroke-width="1"></line><line x1="528" y1="10" x2="528" y2="110" stroke="#E8E7E3" stroke-width="1"></line><text x="120" y="125" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" text-anchor="middle">₹0</text> <text x="222" y="125" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" text-anchor="middle">₹500</text> <text x="324" y="125" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" text-anchor="middle">₹1000</text> <text x="426" y="125" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" text-anchor="middle">₹1500</text> <text x="528" y="125" font-family="Inter,sans-serif" font-size="9" fill="#A0A09B" text-anchor="middle">₹2000</text> <text x="115" y="27" font-family="Inter,sans-serif" font-size="9.5" fill="#6B6B67" text-anchor="end">SUNLU PLA</text> <rect x="120" y="17" width="117" height="14" rx="3" fill="url(#barg)" opacity=".55"></rect><text x="242" y="28" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67">₹575</text> <text x="115" y="47" font-family="Inter,sans-serif" font-size="9.5" fill="#111110" font-weight="600" text-anchor="end">eSUN PLA+</text> <rect x="120" y="37" width="137" height="14" rx="3" fill="url(#barg)" opacity=".8"></rect><text x="262" y="48" font-family="Inter,sans-serif" font-size="9" fill="#D85A30" font-weight="600">₹675 ★ Best value</text> <text x="115" y="67" font-family="Inter,sans-serif" font-size="9.5" fill="#6B6B67" text-anchor="end">Polymaker</text> <rect x="120" y="57" width="204" height="14" rx="3" fill="url(#barg)" opacity=".65"></rect><text x="329" y="68" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67">₹1,000</text> <text x="115" y="87" font-family="Inter,sans-serif" font-size="9.5" fill="#6B6B67" text-anchor="end">Bambu Basic</text> <rect x="120" y="77" width="306" height="14" rx="3" fill="url(#barg)" opacity=".7"></rect><text x="431" y="88" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67">₹1,600</text> <text x="115" y="107" font-family="Inter,sans-serif" font-size="9.5" fill="#6B6B67" text-anchor="end">Prusament</text> <rect x="120" y="97" width="408" height="14" rx="3" fill="#6C63D4" opacity=".6"></rect><text x="533" y="108" font-family="Inter,sans-serif" font-size="9" fill="#6B6B67">₹2,100</text></svg>

> **India tip:** eSUN PLA+ at ₹600–750/kg delivers 80–85% of Prusament's quality at a third of the price. For most hobbyist prints — phone stands, wall mounts, cosplay parts — eSUN is the correct economic choice. Reserve imported premium spools for high-visibility display pieces.

**Pros**

- ✓Easiest material to print — ideal for beginners
- ✓No enclosure needed
- ✓Low warp — no brim needed on most parts
- ✓Bio-derived, lower environmental footprint
- ✓Wide colour and variant range
- ✓High-speed printing capable (HS variants)

**Cons**

- ✗Poor heat resistance — deforms above 60°C
- ✗Brittle compared to PETG or ABS
- ✗Degrades under UV — not for outdoor use
- ✗Absorbs moisture over time (slower than Nylon)
- ✗Not food-safe without food-safe coating

## FAQs

### Is PLA+ worth the extra cost over standard PLA?

Yes, for most use cases. PLA+ typically costs 10–20% more but delivers noticeably better layer adhesion, reduced brittleness, and improved overhang performance. eSUN PLA+ at ₹700/kg is the default recommendation for anyone moving past purely decorative prints.

### Can I print PLA outdoors in India?

No. PLA has a heat deflection temperature of ~55–60°C. Under direct summer sun in Chennai, Mumbai, or Rajasthan, a dashboard or balcony-mounted part can easily reach 70–80°C and permanently deform. Use PETG or ASA for any outdoor or semi-outdoor application in India.

### Does PLA absorb moisture? How to store it in India?

PLA absorbs moisture more slowly than Nylon or PETG, but humid Indian monsoon seasons (80–90% RH) will degrade a spool left open within weeks. Signs: popping sounds during printing, rough surfaces, reduced strength. Store in sealed zip-lock bags or airtight containers with silica gel. Dry at 45–50°C for 4–6 hours if contaminated.

### What nozzle do I need for PLA-CF or filled PLA?

Any PLA with carbon fibre, glass fibre, or abrasive metal powder fillers requires a hardened steel nozzle (e.g., Bambu Lab hardened steel, E3D ObXidian, Bondtech CHT). Brass nozzles will wear out within 200–500 g of abrasive filament. Stainless steel is not sufficient — hardened steel only.

### What's the maximum speed I can print PLA?

Standard PLA: 150–200 mm/s on most printers. High-Speed PLA (Bambu Hyper, Polymaker PolyLite HS): 300–600 mm/s on Bambu A1/P1S/X1C with appropriate hotend flow rates. Quality drops on outer perimeters above 150 mm/s on most printers — run outer walls at 60% of max speed for best appearance.

Related articles

→ PETG: when to upgrade from PLA → Best PLA brands ranked 2026 → eSUN full brand review → Filament storage guide (India)
