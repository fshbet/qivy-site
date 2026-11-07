#!/usr/bin/env node
/**
 * WCAG 2.2 contrast check for the Qivy palette.
 *
 * Run: node scripts/check-contrast.mjs
 * Exits non-zero if any pair that must pass does not, so it can gate CI.
 *
 * Why this exists: REDESIGN_PLAN.md §5.1 commits to measuring every
 * text/background pair rather than asserting it passes. This is that
 * measurement, kept runnable so a palette change re-checks itself.
 */

const srgb = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};

const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const toRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3 ? h.split('').map((c) => c + c).join('') : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/**
 * Flatten a translucent colour over an opaque one.
 *
 * Needed because the category badges put accent-coloured text on an
 * accent-tinted background (`--accent-soft` etc.), and the EFFECTIVE
 * background is the composite — not the page background. Checking the text
 * against the page background alone passes while the real rendering fails,
 * which is exactly the gap axe-core caught on the Maker badge.
 */
const over = (fg, alpha, bg) => {
  const [r1, g1, b1] = toRgb(fg);
  const [r2, g2, b2] = toRgb(bg);
  return hex([
    r1 * alpha + r2 * (1 - alpha),
    g1 * alpha + g2 * (1 - alpha),
    b1 * alpha + b2 * (1 - alpha),
  ]);
};

// ── The palette under test ────────────────────────────────────────────────
const C = {
  bg: '#0B0F1A',
  bg2: '#111726',
  bg3: '#1A2234',
  text: '#F2F4F8',
  text2: '#A7B0C4',
  text3: '#8A93A8',
  accent: '#8B9BFF', // AI
  accent2: '#A99FF0', // Automation
  accent3: '#3FC79B', // Tips
  accent4: '#F09478', // Maker (archive — a nod to the previous brand coral)
};

/**
 * level: 'body' needs 4.5:1, 'large' needs 3:1 (>=24px, or >=18.66px bold),
 * 'ui' needs 3:1 (non-text: borders, focus rings, icons).
 */
// Light theme. Dark is the identity, but a shipped light theme has to meet the
// same bar — otherwise it is a liability rather than a courtesy.
const L = {
  bg: '#FBFCFE',
  bg2: '#F2F5FA',
  bg3: '#E7ECF4',
  text: '#0D1320',
  text2: '#495468',
  text3: '#5A6478',
  accent: '#3F4FCC',
  accent2: '#5C4FBE',
  accent3: '#147156',
  accent4: '#A2492A',
};

const PAIRS = [
  ['text on bg', C.text, C.bg, 'body'],
  ['text on bg2', C.text, C.bg2, 'body'],
  ['text on bg3', C.text, C.bg3, 'body'],
  ['text2 on bg', C.text2, C.bg, 'body'],
  ['text2 on bg2', C.text2, C.bg2, 'body'],
  ['text2 on bg3', C.text2, C.bg3, 'body'],
  ['text3 on bg', C.text3, C.bg, 'body'],
  ['text3 on bg2', C.text3, C.bg2, 'body'],
  ['accent on bg', C.accent, C.bg, 'body'],
  ['accent on bg2', C.accent, C.bg2, 'body'],
  ['accent2 on bg', C.accent2, C.bg, 'body'],
  ['accent2 on bg2', C.accent2, C.bg2, 'body'],
  ['accent3 on bg', C.accent3, C.bg, 'body'],
  ['accent3 on bg2', C.accent3, C.bg2, 'body'],
  ['accent4 on bg', C.accent4, C.bg, 'body'],
  ['accent4 on bg2', C.accent4, C.bg2, 'body'],
  ['bg on accent (button)', C.bg, C.accent, 'body'],
  ['focus ring on bg', C.accent, C.bg, 'ui'],

  ['light: text on bg', L.text, L.bg, 'body'],
  ['light: text on bg2', L.text, L.bg2, 'body'],
  ['light: text on bg3', L.text, L.bg3, 'body'],
  ['light: text2 on bg', L.text2, L.bg, 'body'],
  ['light: text2 on bg2', L.text2, L.bg2, 'body'],
  ['light: text3 on bg', L.text3, L.bg, 'body'],
  ['light: text3 on bg2', L.text3, L.bg2, 'body'],
  ['light: accent on bg', L.accent, L.bg, 'body'],
  ['light: accent on bg2', L.accent, L.bg2, 'body'],
  ['light: accent2 on bg', L.accent2, L.bg, 'body'],
  ['light: accent3 on bg', L.accent3, L.bg, 'body'],
  ['light: accent4 on bg', L.accent4, L.bg, 'body'],
  ['light: bg on accent (btn)', L.bg, L.accent, 'body'],
  ['light: focus ring on bg', L.accent, L.bg, 'ui'],

  // Category badges: accent text on an accent tint over the page background.
  // These are the pairs that actually render, and the ones axe checks.
  ['badge ai (dark)', C.accent, over(C.accent, 0.12, C.bg), 'body'],
  ['badge automation (dark)', C.accent2, over(C.accent2, 0.12, C.bg), 'body'],
  ['badge tips (dark)', C.accent3, over(C.accent3, 0.12, C.bg), 'body'],
  ['badge maker (dark)', C.accent4, over(C.accent4, 0.12, C.bg), 'body'],
  ['badge ai on bg2 (dark)', C.accent, over(C.accent, 0.12, C.bg2), 'body'],
  ['badge maker on bg2 (dark)', C.accent4, over(C.accent4, 0.12, C.bg2), 'body'],

  ['light: badge ai', L.accent, over(L.accent, 0.1, L.bg), 'body'],
  ['light: badge automation', L.accent2, over(L.accent2, 0.1, L.bg), 'body'],
  ['light: badge tips', L.accent3, over(L.accent3, 0.1, L.bg), 'body'],
  ['light: badge maker', L.accent4, over(L.accent4, 0.1, L.bg), 'body'],
  ['light: badge ai on bg2', L.accent, over(L.accent, 0.1, L.bg2), 'body'],
  ['light: badge maker on bg2', L.accent4, over(L.accent4, 0.1, L.bg2), 'body'],
];

const NEED = { body: 4.5, large: 3, ui: 3 };

let failed = 0;
console.log('\nWCAG 2.2 contrast — Qivy dark palette\n');
console.log('  pair                        ratio   need   result');
console.log('  ' + '─'.repeat(54));

for (const [name, fg, bg, level] of PAIRS) {
  const r = ratio(fg, bg);
  const need = NEED[level];
  const pass = r >= need;
  if (!pass) failed++;
  console.log(
    `  ${name.padEnd(26)} ${r.toFixed(2).padStart(5)}  ${String(need).padStart(4)}   ${
      pass ? 'PASS' : 'FAIL'
    }`,
  );
}

console.log('');
if (failed) {
  console.error(`${failed} pair(s) below the WCAG 2.2 AA threshold.\n`);
  process.exit(1);
}
console.log('All pairs meet WCAG 2.2 AA.\n');
