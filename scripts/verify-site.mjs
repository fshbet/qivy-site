#!/usr/bin/env node
/**
 * Measured verification of the built site.
 *
 * Run:  npm run build && node scripts/verify-site.mjs
 *
 * Serves dist/ and checks, with real numbers rather than assertions:
 *   1. Every internal link resolves (no 404s)
 *   2. No console errors or page errors on any page
 *   3. No horizontal overflow at 320 / 375 / 414 / 768 / 1024 / 1440 px
 *   4. Required SEO metadata present and unique, and JSON-LD still parses
 *   5. axe-core accessibility violations
 *   6. Heading hierarchy valid (one h1, no skipped levels)
 *   7. Images have alt, external links have rel=noopener
 *   8. No leftover fake-newsletter alert() anywhere
 *
 * Exits non-zero on any failure, so it can gate CI.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const PORT = 4399;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const WIDTHS = [320, 375, 414, 768, 1024, 1440];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

// ── Static server over dist/ ──────────────────────────────────────────────
function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = decodeURIComponent((req.url || '/').split('?')[0]);
        let file = path.join(DIST, url);
        if (url.endsWith('/')) file = path.join(file, 'index.html');
        else if (!path.extname(file) && existsSync(`${file}.html`))
          file = `${file}.html`;
        else if (!path.extname(file) && existsSync(path.join(file, 'index.html')))
          file = path.join(file, 'index.html');

        const s = await stat(file).catch(() => null);
        if (!s || !s.isFile()) {
          res.writeHead(404, { 'content-type': 'text/html' });
          res.end('404');
          return;
        }
        res.writeHead(200, {
          'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
        });
        res.end(await readFile(file));
      } catch {
        res.writeHead(500);
        res.end('500');
      }
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

// ── Collect every built route ─────────────────────────────────────────────
async function routes(dir = DIST, base = '') {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...(await routes(path.join(dir, e.name), `${base}/${e.name}`)));
    else if (e.name === 'index.html') out.push(`${base}/` || '/');
    else if (e.name === '404.html') out.push('/404.html');
  }
  return out;
}

const fails = [];
const notes = [];
const fail = (page, msg) => fails.push(`${page} — ${msg}`);

// ── Run ───────────────────────────────────────────────────────────────────
const server = await serve();
const browser = await chromium.launch();
const axeSource = await readFile('node_modules/axe-core/axe.min.js', 'utf8');

const all = (await routes()).sort();
console.log(`\nVerifying ${all.length} built pages at ${ORIGIN}\n`);

const titles = new Map();
const descs = new Map();
let totalA11y = 0;
let checkedLinks = 0;

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const route of all) {
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  const resp = await page.goto(ORIGIN + route, { waitUntil: 'networkidle' });
  if (!resp || resp.status() >= 400) {
    fail(route, `HTTP ${resp?.status()}`);
    await page.close();
    continue;
  }

  // 2. Console errors.
  // Google Fonts can fail in a sandboxed run; that is an environment issue,
  // not a site defect, so it is reported as a note instead of a failure.
  for (const e of consoleErrors) {
    if (/fonts\.(googleapis|gstatic)/.test(e)) notes.push(`${route} — font fetch blocked: ${e.slice(0, 80)}`);
    else fail(route, `console error: ${e.slice(0, 160)}`);
  }

  // 4. SEO metadata.
  const seo = await page.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content ?? '',
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
    ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? '',
    ogImage: document.querySelector('meta[property="og:image"]')?.content ?? '',
    twCard: document.querySelector('meta[name="twitter:card"]')?.content ?? '',
    robots: document.querySelector('meta[name="robots"]')?.content ?? '',
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => s.textContent,
    ),
  }));

  const isNoindex = seo.robots.includes('noindex');
  if (!seo.title) fail(route, 'missing <title>');
  if (!seo.desc) fail(route, 'missing meta description');
  if (!seo.canonical) fail(route, 'missing canonical');
  if (!seo.ogTitle) fail(route, 'missing og:title');
  if (!seo.ogImage) fail(route, 'missing og:image');
  if (!seo.twCard) fail(route, 'missing twitter:card');

  // Titles/descriptions must be unique across indexable pages.
  if (!isNoindex) {
    if (titles.has(seo.title)) fail(route, `duplicate <title> (also ${titles.get(seo.title)})`);
    else titles.set(seo.title, route);
    if (descs.has(seo.desc)) fail(route, `duplicate meta description (also ${descs.get(seo.desc)})`);
    else descs.set(seo.desc, route);
  }

  // This is a security check as much as an SEO one: a `</script>` inside any
  // JSON-LD string closes the element early, so the rest of that value stops
  // being data and becomes live HTML. Article titles are model-written, which
  // makes that reachable. A parse failure here is the symptom.
  for (const raw of seo.ld) {
    try {
      JSON.parse(raw);
    } catch {
      fail(route, 'JSON-LD does not parse — script element closed early by its own content?');
    }
  }

  // 6. Heading hierarchy.
  const headings = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) =>
      Number(h.tagName[1]),
    ),
  );
  const h1s = headings.filter((h) => h === 1).length;
  if (h1s !== 1) fail(route, `expected exactly one h1, found ${h1s}`);
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1)
      fail(route, `heading level skipped: h${headings[i - 1]} -> h${headings[i]}`);
  }

  // 7. Images and external links.
  const assets = await page.evaluate(() => ({
    imgsNoAlt: [...document.querySelectorAll('img')].filter(
      (i) => !i.hasAttribute('alt'),
    ).length,
    unsafeExternal: [...document.querySelectorAll('a[target="_blank"]')]
      .filter((a) => !(a.rel || '').includes('noopener'))
      .map((a) => a.href)
      .slice(0, 3),
  }));
  if (assets.imgsNoAlt) fail(route, `${assets.imgsNoAlt} <img> without alt`);
  if (assets.unsafeExternal.length)
    fail(route, `target=_blank without rel=noopener: ${assets.unsafeExternal.join(', ')}`);

  // 8. No fake newsletter left anywhere.
  const html = await page.content();
  if (/alert\(\s*['"]Subscribed/i.test(html))
    fail(route, 'fake newsletter alert() still present');

  // 1. Internal links resolve.
  const links = await page.evaluate((origin) =>
    [...new Set(
      [...document.querySelectorAll('a[href]')]
        .map((a) => a.href)
        .filter((h) => h.startsWith(origin))
        .map((h) => h.replace(origin, '').split('#')[0]),
    )],
    ORIGIN,
  );
  for (const l of links) {
    if (!l) continue;
    const r = await page.request.get(ORIGIN + l).catch(() => null);
    checkedLinks++;
    if (!r || r.status() >= 400) fail(route, `broken internal link -> ${l} (${r?.status()})`);
  }

  // 3. Horizontal overflow across widths.
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    const over = await page.evaluate(
      (vw) => document.documentElement.scrollWidth - vw,
      w,
    );
    // 1px of rounding is not a layout bug.
    if (over > 1) fail(route, `horizontal overflow at ${w}px: +${over}px`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });

  // 5. Accessibility — BOTH themes, each on a FRESH page.
  //
  // The site ships a light theme as well as dark, and a contrast failure in
  // one is invisible from the other — checking only the default missed the
  // Maker badge failing at 4.31:1 in light mode.
  //
  // Each scheme gets its own page load. Toggling the theme on a live page and
  // injecting axe twice produced false positives: the second injection ran
  // against stale computed styles and reported every nav link as failing.
  for (const scheme of ['light', 'dark']) {
    const ap = await ctx.newPage();
    await ap.emulateMedia({ colorScheme: scheme });
    await ap.goto(ORIGIN + route, { waitUntil: 'networkidle' });
    await ap.addScriptTag({ content: axeSource });

    const a11y = await ap.evaluate(async () => {
      // @ts-ignore - axe is injected above
      const r = await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.help,
        sample: v.nodes[0]?.html?.slice(0, 120) ?? '',
      }));
    });

    // Confirm the page really is in the scheme under test, so a silently
    // ineffective emulation cannot be mistaken for a clean pass.
    const actual = await ap.evaluate(() =>
      document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
    );
    if (actual !== scheme)
      fail(route, `theme emulation failed: wanted ${scheme}, got ${actual}`);

    if (a11y.length) {
      totalA11y += a11y.length;
      for (const v of a11y)
        fail(
          route,
          `a11y [${scheme}/${v.impact}] ${v.id}: ${v.help} (${v.nodes} node(s)) ${v.sample}`,
        );
    }
    await ap.close();
  }

  await page.close();
  process.stdout.write('.');
}

await browser.close();
server.close();

// ── Report ────────────────────────────────────────────────────────────────
console.log('\n');
console.log(`  pages checked        ${all.length}`);
console.log(`  internal links       ${checkedLinks} (all resolved unless listed below)`);
console.log(`  widths tested        ${WIDTHS.join(', ')}`);
console.log(`  a11y violations      ${totalA11y}`);
console.log(`  failures             ${fails.length}`);

if (notes.length) {
  console.log('\nNotes (environment, not site defects):');
  for (const n of [...new Set(notes)].slice(0, 5)) console.log(`  - ${n}`);
}

if (fails.length) {
  console.log('\nFAILURES:');
  for (const f of fails) console.log(`  ✗ ${f}`);
  console.log('');
  process.exit(1);
}

console.log('\nAll checks passed.\n');
