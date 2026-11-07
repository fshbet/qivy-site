#!/usr/bin/env node
/**
 * One-off migration: pull the 24 articles out of the legacy single-file site
 * and write them as Markdown content files.
 *
 * Run: node scripts/migrate-content.mjs [--dry]
 *
 * Source: index.html (the legacy 338 KB SPA, still in the repo)
 * Target: src/content/articles/<slug>.md
 *
 * Content loss is the real risk here, so the script finishes by comparing the
 * plain-text word count of each source body against its Markdown output and
 * reporting anything that drifts by more than 8%. A silent 30% drop would
 * otherwise be invisible until someone read all 24 articles.
 */
import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const DRY = process.argv.includes('--dry');
const SRC = 'index.html';
const OUT = 'src/content/articles';

// ── Per-article migration plan ────────────────────────────────────────────
// slug/category/tags are editorial decisions, so they live here rather than
// being guessed from the old markup. `date` is the month the ORIGINAL article
// stated in its own meta row — month-only precision, so day is set to 01 and
// recorded as such in the completion report. Nothing is invented.
const PLAN = {
  'page-bambu-review': {
    slug: 'bambu-lab-a1-mini-review',
    category: 'maker',
    date: '2026-01-01',
    tags: ['3d-printing', 'bambu-lab', 'review', 'hardware'],
    seoTitle: 'Bambu Lab A1 Mini — 3 Month Review',
    metaDescription:
      'An honest Bambu Lab A1 Mini review after three months of real use: print quality, speed, Bambu Studio, and the one thing still unfixed.',
  },
  'page-cable-rack': {
    slug: 'cable-management-wall-rack-build',
    category: 'maker',
    date: '2026-05-01',
    tags: ['3d-printing', 'build-log', 'petg', 'troubleshooting'],
    seoTitle: 'Cable Management Wall Rack — Build Log',
    metaDescription:
      'A 3D printed cable management wall rack from design to final part, including the warping and stringing failures along the way and the fixes.',
  },
  'page-starter-guide': {
    slug: '3d-printing-starter-guide',
    category: 'maker',
    date: '2026-04-01',
    tags: ['3d-printing', 'beginner', 'guide', 'filament'],
    seoTitle: '3D Printing Starter Guide for Beginners',
    metaDescription:
      'A complete 3D printing starter guide: choosing a printer, understanding filament, learning the slicer, your first prints, and fixing failures.',
  },
  'page-filament-compare': {
    slug: 'esun-pla-plus-vs-bambu-pla',
    category: 'maker',
    date: '2026-04-01',
    tags: ['filament', 'comparison', 'pla', 'budget'],
    seoTitle: 'eSUN PLA+ vs Bambu PLA — Worth 3x?',
    metaDescription:
      'eSUN PLA+ against Bambu PLA: where the premium filament genuinely wins, where the budget option holds its own, and which to buy.',
  },
  'page-slicer-settings': {
    slug: '5-slicer-settings-that-fixed-print-quality',
    category: 'maker',
    date: '2026-03-01',
    tags: ['slicer', '3d-printing', 'print-quality', 'tips'],
    seoTitle: '5 Slicer Settings That Fix Print Quality',
    metaDescription:
      'Five slicer settings — retraction, seam position, support interface, infill overlap and perimeter speed — that visibly improve 3D print quality.',
  },

  // Legacy "Data" pillar → Tips & Tricks. These are practical software
  // tutorials and comparisons, which is what that category is for. Power BI
  // and Looker Studio also appear as entries in the Tools directory.
  'page-data-powerbi-intro': {
    slug: 'power-bi-for-solo-operators',
    category: 'tips',
    date: '2026-05-01',
    tags: ['power-bi', 'dashboards', 'business-intelligence', 'guide'],
    seoTitle: 'Power BI in 2026 for Solo Operators',
    metaDescription:
      'Is Power BI still the best BI tool for solo operators in 2026? Which version you need, what connects well, and where it falls short.',
  },
  'page-data-sheets-dashboard': {
    slug: 'google-sheets-live-ops-dashboard',
    category: 'tips',
    date: '2026-05-01',
    tags: ['google-sheets', 'dashboards', 'no-code', 'looker-studio'],
    seoTitle: 'Google Sheets Live Ops Dashboard — Free',
    metaDescription:
      'Turn a Google Sheet into a live operations dashboard in about an hour: structure, IMPORTRANGE, charts, and embedding in Looker Studio.',
  },
  'page-data-python-pandas': {
    slug: 'python-pandas-for-non-coders',
    category: 'tips',
    date: '2026-04-01',
    tags: ['python', 'pandas', 'data-cleaning', 'tutorial'],
    seoTitle: 'Python + Pandas for Non-Coders',
    metaDescription:
      'Clean messy spreadsheet data with Python and Pandas in 30 minutes — setup, loading files, fixing columns and exporting the result.',
  },
  'page-data-looker-studio': {
    slug: 'looker-studio-vs-power-bi',
    category: 'tips',
    date: '2026-04-01',
    tags: ['looker-studio', 'power-bi', 'comparison', 'dashboards'],
    seoTitle: 'Looker Studio vs Power BI — Which One?',
    metaDescription:
      'Looker Studio against Power BI for Indian solo operators: cost, sharing, data sources and which one fits which kind of work.',
  },

  // Legacy "Automation" pillar → Automation. Direct fit, no reclassification.
  'page-auto-n8n-start': {
    slug: 'n8n-beginner-guide-first-workflow',
    category: 'automation',
    date: '2026-05-01',
    tags: ['n8n', 'beginner', 'workflow', 'automation'],
    seoTitle: 'n8n Beginner Guide — First Workflow',
    metaDescription:
      'Build your first working n8n workflow in under 30 minutes: install, triggers, nodes, connecting an app and testing the run.',
  },
  'page-auto-linkedin-auto': {
    slug: 'auto-post-to-linkedin-from-google-sheets',
    category: 'automation',
    date: '2026-05-01',
    tags: ['n8n', 'linkedin', 'google-sheets', 'workflow'],
    seoTitle: 'Auto-Post to LinkedIn from Google Sheets',
    metaDescription:
      'An n8n workflow that posts to LinkedIn from a Google Sheet on a schedule, step by step, including the credential setup.',
  },
  'page-auto-printer-alerts': {
    slug: 'python-3d-printer-whatsapp-alerts',
    category: 'automation',
    date: '2026-04-01',
    tags: ['python', 'whatsapp', 'monitoring', '3d-printing'],
    seoTitle: 'Python 3D Printer WhatsApp Alerts',
    metaDescription:
      'A Python script that monitors a 3D printer and sends WhatsApp alerts when a print finishes or fails, with the full code.',
  },
  'page-auto-rss-newsletter': {
    slug: 'rss-to-newsletter-automation-n8n',
    category: 'automation',
    date: '2026-04-01',
    tags: ['n8n', 'rss', 'newsletter', 'workflow'],
    seoTitle: 'RSS to Newsletter Automation with n8n',
    metaDescription:
      'Zero-touch weekly publishing: an n8n workflow that turns an RSS feed into a formatted newsletter and sends it on a schedule.',
  },

  // Filament knowledge base → Maker archive, filaments subcategory.
  'page-fil-pla': {
    slug: 'pla-filament-guide',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['pla', 'filament', 'beginner', 'reference'],
    seoTitle: 'PLA Filament — The Complete Guide',
    metaDescription:
      'PLA filament reference: properties, print temperatures, bed adhesion, when it fails, and how it compares to other materials.',
  },
  'page-fil-petg': {
    slug: 'petg-filament-guide',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['petg', 'filament', 'functional-parts', 'reference'],
    seoTitle: 'PETG Filament Guide for Functional Parts',
    metaDescription:
      'PETG filament reference: why glycol modification matters, print settings, stringing fixes, chemical resistance and PLA comparison.',
  },
  'page-fil-tpu': {
    slug: 'tpu-flexible-filament-guide',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['tpu', 'flexible', 'filament', 'reference'],
    seoTitle: 'TPU & Flexible Filaments — Complete Guide',
    metaDescription:
      'TPU and flexible filament reference: Shore hardness ratings, direct drive vs bowden, print speeds and retraction settings.',
  },
  'page-fil-abs': {
    slug: 'abs-asa-filament-guide',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['abs', 'asa', 'filament', 'engineering'],
    seoTitle: 'ABS & ASA Filament — Engineering Guide',
    metaDescription:
      'ABS and ASA filament reference: enclosure requirements, warping control, acetone smoothing, UV stability and print settings.',
  },
  'page-fil-nylon': {
    slug: 'nylon-pa-filament-guide',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['nylon', 'pa12', 'filament', 'engineering'],
    seoTitle: 'Nylon & PA Filament — Strength Guide',
    metaDescription:
      'Nylon and PA filament reference: moisture handling, all-metal hotend requirements, drying, and carbon-fibre reinforced variants.',
  },
  'page-fil-esun': {
    slug: 'esun-filament-brand-review',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['esun', 'brand-review', 'filament', 'india'],
    seoTitle: 'eSUN Filament — Complete Brand Review',
    metaDescription:
      'eSUN filament brand review: diameter tolerance, range, consistency, India availability and how it compares on price.',
  },
  'page-fil-prusament': {
    slug: 'prusament-filament-brand-review',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['prusament', 'brand-review', 'filament', 'premium'],
    seoTitle: 'Prusament Filament — Brand Review',
    metaDescription:
      'Prusament filament brand review: tolerance, batch traceability, colour range and whether the premium price is justified.',
  },
  'page-fil-polymaker': {
    slug: 'polymaker-filament-brand-review',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['polymaker', 'brand-review', 'filament'],
    seoTitle: 'Polymaker Filament — Brand Review',
    metaDescription:
      'Polymaker filament brand review: the PolyLite, PolyTerra and PolyMax ranges, quality consistency and where it fits.',
  },
  'page-fil-india': {
    slug: 'india-3d-printing-filament-guide',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['india', 'filament', 'buying-guide', 'storage'],
    seoTitle: 'India 3D Printing Filament Guide',
    metaDescription:
      'Buying filament in India: imports and GST, local vendors, Amazon India, monsoon storage and a practical budget guide.',
  },
  'page-fil-best-pla': {
    slug: 'best-pla-filament-ranked',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['pla', 'comparison', 'buying-guide', 'ranked'],
    seoTitle: 'Best PLA Filament — Ranked & Compared',
    metaDescription:
      'PLA filaments ranked and compared on tolerance, print quality, colour accuracy and price, with India availability noted.',
  },
  'page-fil-storage': {
    slug: 'filament-storage-and-drying-guide',
    category: 'maker',
    subcategory: 'filaments',
    date: '2026-05-01',
    tags: ['storage', 'drying', 'filament', 'india'],
    seoTitle: 'Filament Storage & Drying Guide',
    metaDescription:
      'Filament storage and drying: moisture damage signs, silica gel, drying temperatures per material, dry boxes and monsoon prep.',
  },
};

// ── Turndown setup ────────────────────────────────────────────────────────
const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
});
td.use(gfm);

// Drop the legacy in-page router UI. These are navigation chrome from the old
// SPA, not article content — keeping them would leave dead buttons in the text.
td.remove(['script', 'style']);
td.addRule('dropLegacyNav', {
  filter: (node) =>
    ['art-back', 'art-nav', 'art-nav-card', 'art-meta-row', 'tag-row'].some(
      (c) => node.classList?.contains(c),
    ),
  replacement: () => '',
});

// Callouts become blockquotes — the closest Markdown equivalent.
td.addRule('callout', {
  filter: (node) => node.classList?.contains('callout'),
  replacement: (content) =>
    '\n\n' +
    content
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((l) => `> ${l.trim()}`)
      .join('\n> \n') +
    '\n\n',
});

// Pros/cons columns become two labelled lists instead of a two-column grid.
td.addRule('prosCons', {
  filter: (node) => node.classList?.contains('pros-cons'),
  replacement: (_content, node) => {
    const col = (sel, heading) => {
      const el = node.querySelector(sel);
      if (!el) return '';
      const items = [...el.querySelectorAll('.v-good, .v-bad, li, div')]
        .map((d) => d.textContent.trim())
        .filter((t) => t && t.length > 1);
      const unique = [...new Set(items)];
      return unique.length
        ? `\n\n**${heading}**\n\n${unique.map((i) => `- ${i}`).join('\n')}`
        : '';
    };
    return col('.pros-col', 'Pros') + col('.cons-col', 'Cons') + '\n\n';
  },
});

// Comparison strips are tabular data rendered as columns — emit a real table.
td.addRule('compareStrip', {
  filter: (node) => node.classList?.contains('compare-strip'),
  replacement: (_c, node) => {
    const cols = [...node.querySelectorAll('.compare-col')].map((col) => ({
      head: col.querySelector('.compare-head')?.textContent.trim() ?? '',
      items: [...col.querySelectorAll('.compare-item')].map((i) =>
        i.textContent.trim(),
      ),
    }));
    if (cols.length < 2) return '';
    const rows = Math.max(...cols.map((c) => c.items.length));
    let out = `\n\n| ${cols.map((c) => c.head).join(' | ')} |\n`;
    out += `| ${cols.map(() => '---').join(' | ')} |\n`;
    for (let r = 0; r < rows; r++) {
      out += `| ${cols.map((c) => c.items[r] ?? '').join(' | ')} |\n`;
    }
    return out + '\n';
  },
});

// Ranked lists become ordered lists.
td.addRule('rankList', {
  filter: (node) => node.classList?.contains('rank-list'),
  replacement: (_c, node) => {
    const items = [...node.querySelectorAll('.rank-item')].map((it) => {
      const info = it.querySelector('.rank-info')?.textContent.trim() ?? '';
      const score = it.querySelector('.rank-score')?.textContent.trim() ?? '';
      return `${info.replace(/\s+/g, ' ')}${score ? ` — ${score}` : ''}`;
    });
    return items.length
      ? '\n\n' + items.map((t, i) => `${i + 1}. ${t}`).join('\n') + '\n\n'
      : '';
  },
});

// Variant cards -> a table (name / temperature / note).
td.addRule('variantCards', {
  filter: (node) =>
    node.classList?.contains('variant-card') &&
    !node.parentElement?.classList?.contains('variant-group'),
  replacement: (_c, node) => {
    const name = node.querySelector('.variant-name')?.textContent.trim() ?? '';
    const temp = node.querySelector('.variant-temp')?.textContent.trim() ?? '';
    const note = node.querySelector('.variant-note')?.textContent.trim() ?? '';
    return `\n- **${name}**${temp ? ` (${temp})` : ''}${note ? ` — ${note}` : ''}`;
  },
});

// The legacy articles place <h4> directly under <h2> with no <h3> between,
// which is a skipped heading level and an accessibility failure. They are
// sub-headings of the preceding h2, so h3 is the correct level.
td.addRule('demoteH4', {
  filter: ['h4'],
  replacement: (content) => `\n\n### ${content}\n\n`,
});

// FAQ blocks -> question heading + answer paragraph.
td.addRule('faq', {
  filter: (node) => node.classList?.contains('faq-item'),
  replacement: (_c, node) => {
    const q = node.querySelector('.faq-q')?.textContent.trim() ?? '';
    const a = node.querySelector('.faq-a')?.textContent.trim() ?? '';
    return q ? `\n\n### ${q}\n\n${a}\n\n` : '';
  },
});

// Inline SVG diagrams are content, not decoration — keep them verbatim.
// Markdown passes raw HTML through, so they survive intact.
td.addRule('svgDiagram', {
  filter: (node) => node.nodeName === 'SVG' || node.nodeName === 'svg',
  replacement: (_c, node) => `\n\n${node.outerHTML}\n\n`,
});

// ── Helpers ───────────────────────────────────────────────────────────────
const plainWords = (html) =>
  html
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

const mdWords = (md) =>
  md
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/[#*_>`|\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

const yamlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

// ── Extract ───────────────────────────────────────────────────────────────
const html = fs.readFileSync(SRC, 'utf8');

// NOTE: the slug class must allow digits — `page-auto-n8n-start` contains an
// `8`, and a [a-z-]+ pattern silently skips that whole article.
const pageRe = /<div id="(page-[a-z0-9-]+)" class="page[^"]*">/g;
const marks = [...html.matchAll(pageRe)].map((m) => ({
  id: m[1],
  start: m.index,
}));

if (!DRY) fs.mkdirSync(OUT, { recursive: true });

const report = [];
let written = 0;

for (let i = 0; i < marks.length; i++) {
  const { id, start } = marks[i];
  const end = marks[i + 1]?.start ?? html.length;
  const seg = html.slice(start, end);

  const plan = PLAN[id];
  if (!plan) {
    if (seg.includes('art-body')) {
      report.push({ id, status: 'UNPLANNED ARTICLE — skipped', loss: null });
    }
    continue;
  }

  const bodyMatch = seg.match(/<div class="art-body">([\s\S]*)$/);
  if (!bodyMatch) {
    report.push({ id, status: 'NO art-body FOUND', loss: null });
    continue;
  }

  // The body runs to the end of the segment; trim the trailing wrapper divs
  // and the legacy nav block that follows the prose.
  let bodyHtml = bodyMatch[1];
  const navIdx = bodyHtml.search(/<div class="art-nav"/);
  if (navIdx > -1) bodyHtml = bodyHtml.slice(0, navIdx);

  const titleMatch = seg.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = titleMatch
    ? titleMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
    : '';

  if (!title) {
    report.push({ id, status: 'NO TITLE FOUND', loss: null });
    continue;
  }

  const srcWords = plainWords(bodyHtml);
  let md = td.turndown(bodyHtml);

  // Tidy: collapse runs of blank lines, strip trailing spaces.
  md = md
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();

  const outWords = mdWords(md);
  const loss = srcWords ? 1 - outWords / srcWords : 0;

  // ── Frontmatter ────────────────────────────────────────────────────────
  // verification: 'tested' is correct for these — they are the owner's own
  // first-person articles, written from actual use. Only migrated human
  // content gets this; generated articles are forced to 'researched'.
  const fm = [
    '---',
    `title: ${yamlStr(title)}`,
    `summary: ${yamlStr(plan.metaDescription)}`,
    `category: ${plan.category}`,
    ...(plan.subcategory ? [`subcategory: ${plan.subcategory}`] : []),
    `publishDate: ${plan.date}`,
    `seoTitle: ${yamlStr(plan.seoTitle)}`,
    `metaDescription: ${yamlStr(plan.metaDescription)}`,
    'verification: tested',
    'sources: []',
    'tags:',
    ...plan.tags.map((t) => `  - ${t}`),
    '---',
    '',
  ].join('\n');

  const file = path.join(OUT, `${plan.slug}.md`);
  if (!DRY) fs.writeFileSync(file, fm + md + '\n', 'utf8');
  written++;

  report.push({
    id,
    slug: plan.slug,
    category: plan.category + (plan.subcategory ? `/${plan.subcategory}` : ''),
    srcWords,
    outWords,
    loss,
    status: 'ok',
  });
}

// ── Report ────────────────────────────────────────────────────────────────
console.log(`\n${DRY ? 'DRY RUN — ' : ''}Migrated ${written} article(s)\n`);
console.log(
  '  slug                                  category          src    out   diff',
);
console.log('  ' + '─'.repeat(72));

let flagged = 0;
for (const r of report) {
  if (r.status !== 'ok') {
    console.log(`  !! ${r.id} — ${r.status}`);
    flagged++;
    continue;
  }
  const pct = (r.loss * 100).toFixed(0);
  const warn = Math.abs(r.loss) > 0.08;
  if (warn) flagged++;
  console.log(
    `  ${warn ? '!' : ' '} ${r.slug.padEnd(36)} ${r.category.padEnd(17)} ${String(
      r.srcWords,
    ).padStart(5)} ${String(r.outWords).padStart(6)} ${(pct + '%').padStart(6)}`,
  );
}

const planned = Object.keys(PLAN).length;
console.log(
  `\n  planned: ${planned}   written: ${written}   flagged: ${flagged}\n`,
);

if (written !== planned) {
  console.error(
    `MISMATCH: ${planned} articles planned but ${written} written. Investigate before trusting this run.`,
  );
  process.exit(1);
}
if (flagged) {
  console.error(
    `${flagged} article(s) flagged — word count drifted >8% or extraction failed. Review before committing.`,
  );
  process.exit(1);
}
console.log('All articles migrated within tolerance.\n');
