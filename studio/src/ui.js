/**
 * Server-rendered pages. No client framework, no build step — the whole app
 * is three source files and deploys as one Worker.
 */

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CSS = `
:root{--bg:#0b0f1a;--bg2:#111726;--bg3:#1a2234;--bd:#232c42;--text:#f2f4f8;
--dim:#a7b0c4;--faint:#8a93a8;--ai:#8b9bff;--auto:#a99ff0;--tips:#3fc79b;--maker:#f09478;--bad:#ff8a7a}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
-webkit-font-smoothing:antialiased}
.wrap{max-width:900px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid var(--bd);background:var(--bg2);position:sticky;top:0;z-index:9}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;height:60px;flex-wrap:wrap}
.brand{font-weight:700;letter-spacing:-.03em;font-size:1.15rem}
.brand span{color:var(--ai)}
nav{display:flex;gap:18px}
nav a{color:var(--dim);text-decoration:none;font-size:.92rem}
nav a:hover,nav a[aria-current]{color:var(--text)}
main{padding:32px 0 80px}
h1{font-size:1.7rem;letter-spacing:-.02em;margin-bottom:6px}
h2{font-size:1.1rem;margin:28px 0 12px}
p.sub{color:var(--dim);margin-bottom:22px}
.card{background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:18px;margin-bottom:14px}
.card h3{font-size:1.05rem;margin-bottom:4px}
.meta{color:var(--faint);font-size:.82rem;display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px}
.badge{display:inline-block;font-size:.72rem;font-weight:600;padding:2px 9px;border-radius:999px;
text-transform:uppercase;letter-spacing:.05em}
.ai{color:var(--ai);background:#8b9bff1f}.automation{color:var(--auto);background:#a99ff01f}
.tips{color:var(--tips);background:#3fc79b1f}.maker{color:var(--maker);background:#f094781f}
.warn{background:#ff8a7a14;border:1px solid #ff8a7a44;border-radius:10px;padding:12px 14px;margin:12px 0;color:#ffcabf;font-size:.9rem}
.warn strong{color:var(--bad)}
.ok{background:#3fc79b14;border:1px solid #3fc79b44;color:#b6f0da;border-radius:10px;padding:12px 14px;margin:12px 0;font-size:.9rem}
a.btn,button{font:inherit;font-size:.92rem;font-weight:600;border-radius:9px;padding:10px 16px;border:1px solid var(--bd);
background:var(--bg3);color:var(--text);cursor:pointer;text-decoration:none;display:inline-block}
button:hover,a.btn:hover{border-color:#36415e}
button.primary{background:var(--ai);border-color:var(--ai);color:#0b0f1a}
button.danger{background:transparent;border-color:#ff8a7a55;color:#ffb3a6}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}
label{display:block;font-size:.85rem;color:var(--dim);margin:14px 0 6px;font-weight:600}
input,textarea,select{width:100%;font:inherit;background:var(--bg);border:1px solid var(--bd);color:var(--text);
border-radius:9px;padding:10px 12px}
input:focus,textarea:focus,select:focus{outline:2px solid var(--ai);outline-offset:1px;border-color:transparent}
textarea{min-height:460px;font:13px/1.65 ui-monospace,SFMono-Regular,Consolas,monospace;resize:vertical}
.hint{color:var(--faint);font-size:.8rem;margin-top:5px}
.empty{color:var(--dim);text-align:center;padding:40px 20px;border:1px dashed var(--bd);border-radius:12px}
.stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}
.stat{background:var(--bg2);border:1px solid var(--bd);border-radius:10px;padding:12px 16px;flex:1;min-width:110px}
.stat b{display:block;font-size:1.5rem;letter-spacing:-.02em}
.stat span{color:var(--faint);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}
table{width:100%;border-collapse:collapse;font-size:.9rem}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--bd);vertical-align:top}
th{color:var(--faint);font-size:.76rem;text-transform:uppercase;letter-spacing:.05em}
code{font:13px ui-monospace,Consolas,monospace;background:var(--bg3);padding:1px 5px;border-radius:4px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media(max-width:600px){header .wrap{height:auto;padding-top:12px;padding-bottom:12px}}
`;

export function page({ title, body, nav = '' }) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} · Qivy Studio</title>
<style>${CSS}</style>
</head><body>
<header><div class="wrap">
  <div class="brand">qivy<span>.</span> studio</div>
  <nav>
    <a href="/"${nav === 'queue' ? ' aria-current="page"' : ''}>Queue</a>
    <a href="/topics"${nav === 'topics' ? ' aria-current="page"' : ''}>Topics</a>
    <a href="/settings"${nav === 'settings' ? ' aria-current="page"' : ''}>Settings</a>
    <a href="https://qivy.in" target="_blank" rel="noopener">Site &#8599;</a>
  </nav>
</div></header>
<main><div class="wrap">${body}</div></main>
</body></html>`;
}

export function badge(cat) {
  const labels = { ai: 'AI', automation: 'Automation', tips: 'Tips', maker: 'Maker' };
  return `<span class="badge ${esc(cat)}">${esc(labels[cat] || cat)}</span>`;
}

export function notice(kind, html) {
  return `<div class="${kind === 'ok' ? 'ok' : 'warn'}">${html}</div>`;
}
