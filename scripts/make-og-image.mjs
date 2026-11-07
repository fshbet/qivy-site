#!/usr/bin/env node
/**
 * Generates public/og-default.png — the fallback social preview image.
 *
 * Run: node scripts/make-og-image.mjs
 *
 * Why a PNG and not the SVG directly: X, Facebook, LinkedIn and WhatsApp do
 * not render SVG Open Graph images. Pointing og:image at an .svg produces a
 * blank preview card, which is worse than no image. So the SVG below is the
 * source and the committed PNG is what ships.
 *
 * Uses sharp, which Astro already depends on — no new dependency.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1200;
const H = 630;

// Palette mirrors src/styles/tokens.css. Kept literal because this runs
// outside the Astro build and cannot read CSS custom properties.
const BG = '#0b0f1a';
const BG2 = '#111726';
const TEXT = '#f2f4f8';
const TEXT2 = '#a7b0c4';
const ACCENT = '#8b9bff';
const ACCENT2 = '#a99ff0';
const ACCENT3 = '#3fc79b';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BG}"/>
      <stop offset="1" stop-color="${BG2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.1" r="0.6">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.08" cy="0.95" r="0.5">
      <stop offset="0" stop-color="${ACCENT2}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${ACCENT2}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- Accent rule -->
  <rect x="0" y="0" width="${W}" height="6" fill="${ACCENT}"/>

  <!-- Wordmark -->
  <text x="80" y="150" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="54" font-weight="700" letter-spacing="-2.5" fill="${TEXT}">qivy<tspan fill="${ACCENT}">.</tspan></text>

  <!-- Kicker -->
  <text x="80" y="205" font-family="'JetBrains Mono', Consolas, monospace"
        font-size="20" letter-spacing="4.2" fill="${TEXT2}">AI · AUTOMATION · SMARTER TECH</text>

  <!-- Headline -->
  <text x="80" y="330" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="82" font-weight="700" letter-spacing="-3.6" fill="${TEXT}">Make Technology</text>
  <text x="80" y="420" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="82" font-weight="700" letter-spacing="-3.6" fill="${TEXT}">Work <tspan fill="${ACCENT}">Smarter.</tspan></text>

  <!-- Supporting line -->
  <text x="80" y="492" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="25" fill="${TEXT2}">Practical AI tips, automation workflows and useful tech tricks.</text>

  <!-- Category chips -->
  <g font-family="'JetBrains Mono', Consolas, monospace" font-size="17">
    <rect x="80" y="536" width="92" height="40" rx="20" fill="${ACCENT}" fill-opacity="0.14" stroke="${ACCENT}" stroke-opacity="0.45"/>
    <text x="126" y="562" fill="${ACCENT}" text-anchor="middle">AI</text>

    <rect x="186" y="536" width="196" height="40" rx="20" fill="${ACCENT2}" fill-opacity="0.14" stroke="${ACCENT2}" stroke-opacity="0.45"/>
    <text x="284" y="562" fill="${ACCENT2}" text-anchor="middle">AUTOMATION</text>

    <rect x="396" y="536" width="150" height="40" rx="20" fill="${ACCENT3}" fill-opacity="0.14" stroke="${ACCENT3}" stroke-opacity="0.45"/>
    <text x="471" y="562" fill="${ACCENT3}" text-anchor="middle">TIPS</text>
  </g>

  <!-- Pipeline motif, right side -->
  <g opacity="0.85">
    <rect x="890" y="250" width="232" height="56" rx="10" fill="${BG2}" stroke="${ACCENT}" stroke-opacity="0.5"/>
    <text x="1006" y="285" font-family="'JetBrains Mono', Consolas, monospace" font-size="16"
          fill="${ACCENT}" text-anchor="middle" letter-spacing="2">AI DECIDES</text>

    <path d="M1006 306 L1006 336" stroke="${TEXT2}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 5"/>

    <rect x="890" y="336" width="232" height="56" rx="10" fill="${BG2}" stroke="${ACCENT2}" stroke-opacity="0.5"/>
    <text x="1006" y="371" font-family="'JetBrains Mono', Consolas, monospace" font-size="16"
          fill="${ACCENT2}" text-anchor="middle" letter-spacing="2">IT RUNS</text>

    <path d="M1006 392 L1006 422" stroke="${TEXT2}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 5"/>

    <rect x="890" y="422" width="232" height="56" rx="10" fill="${BG2}" stroke="${ACCENT3}" stroke-opacity="0.5"/>
    <text x="1006" y="457" font-family="'JetBrains Mono', Consolas, monospace" font-size="16"
          fill="${ACCENT3}" text-anchor="middle" letter-spacing="2">TIME BACK</text>
  </g>

  <text x="${W - 80}" y="150" font-family="'JetBrains Mono', Consolas, monospace"
        font-size="18" fill="${TEXT2}" text-anchor="end">qivy.in</text>
</svg>`;

await mkdir('public', { recursive: true });

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og-default.png');

const { width, height } = await sharp("public/og-default.png").metadata();
const { size } = await (await import("node:fs/promises")).stat("public/og-default.png");
console.log(`public/og-default.png written — ${width}x${height}, ${Math.round(size / 1024)} KB`);
