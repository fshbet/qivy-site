/**
 * Qivy Studio — the editorial dashboard for qivy.in.
 *
 * Replaces the n8n pipeline, which ran on a PC and so only produced a draft
 * when that machine happened to be on. This runs on Cloudflare: a cron
 * trigger drafts, and this page is where drafts are reviewed, edited and
 * published.
 *
 *   cron 00:30 UTC (06:00 IST)  ->  pick topic  ->  OpenRouter  ->  validate
 *                               ->  store draft in D1  ->  waits for you
 *   you press Publish           ->  commit to GitHub  ->  Pages build  ->  live
 *
 * Nothing publishes on its own. That is the whole point of the gate.
 *
 * Secrets (OpenRouter key, GitHub token) live in KV, are editable on the
 * Settings page, and are never sent back to the browser — only whether they
 * are set, and their last four characters.
 */

import { requireAccess } from './access.js';
import {
  DEFAULT_MODEL,
  pickTopic,
  callModel,
  validateDraft,
  buildMarkdown,
  commitFile,
} from './pipeline.js';
import { page, esc, badge, notice } from './ui.js';

const CATEGORIES = ['ai', 'automation', 'tips', 'maker'];

// ─── Settings ───────────────────────────────────────────────────────────

async function getSettings(env) {
  const [key, token, model] = await Promise.all([
    env.SETTINGS.get('openrouter_key'),
    env.SETTINGS.get('github_token'),
    env.SETTINGS.get('model'),
  ]);
  return { key, token, model: model || DEFAULT_MODEL };
}

const tail = (s) => (s ? `…${s.slice(-4)}` : null);

// ─── Core job ───────────────────────────────────────────────────────────

/** Draft one article. Used by both the cron and the Generate button. */
async function generateDraft(env) {
  const started = new Date().toISOString();
  const { key, model } = await getSettings(env);

  if (!key) {
    throw new Error('No OpenRouter API key set. Add one on the Settings page.');
  }

  const { results: rows } = await env.DB.prepare(
    'SELECT id, topic, category, status, title FROM topics',
  ).all();

  const picked = pickTopic(rows || []);
  if (!picked.ok) throw new Error(picked.reason);

  const { content, usedModel } = await callModel({
    apiKey: key,
    model,
    topic: picked.topic.topic,
    category: picked.topic.category,
    existingTitles: picked.existingTitles,
    siteUrl: env.SITE_URL,
  });

  const draft = validateDraft(content, {
    category: picked.topic.category,
    topicSimilarity: picked.similarity,
  });

  const inserted = await env.DB.prepare(
    `INSERT INTO drafts
       (topic_id, title, slug, category, summary, seo_title, meta_description,
        tags, sources, body, warnings, model, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
  )
    .bind(
      picked.topic.id,
      draft.title,
      draft.slug,
      picked.topic.category,
      draft.summary,
      draft.seoTitle,
      draft.metaDescription,
      draft.tags.join(', '),
      draft.sources.join('\n'),
      draft.body,
      draft.warnings.join('\n'),
      usedModel || model,
    )
    .run();

  const draftId = inserted.meta.last_row_id;

  await env.DB.prepare(
    "UPDATE topics SET status='drafted', title=?, slug=?, updated_at=datetime('now') WHERE id=?",
  )
    .bind(draft.title, draft.slug, picked.topic.id)
    .run();

  await env.DB.prepare('INSERT INTO runs (started_at, ok, message, draft_id) VALUES (?,1,?,?)')
    .bind(started, `Drafted "${draft.title}" (${draft.words} words)`, draftId)
    .run();

  return { draftId, title: draft.title, warnings: draft.warnings };
}

async function recordFailure(env, started, message) {
  await env.DB.prepare('INSERT INTO runs (started_at, ok, message) VALUES (?,0,?)')
    .bind(started, String(message).slice(0, 900))
    .run();
}

// ─── Pages ──────────────────────────────────────────────────────────────

async function queuePage(env, url) {
  const [{ results: drafts }, { results: counts }, { results: runs }] = await Promise.all([
    env.DB.prepare(
      "SELECT id,title,category,summary,warnings,model,created_at,words FROM (SELECT *, LENGTH(body)-LENGTH(REPLACE(body,' ',''))+1 AS words FROM drafts) WHERE status='pending' ORDER BY created_at DESC",
    ).all(),
    env.DB.prepare('SELECT status, COUNT(*) n FROM topics GROUP BY status').all(),
    env.DB.prepare('SELECT ok,message,started_at FROM runs ORDER BY id DESC LIMIT 1').all(),
  ]);

  const by = Object.fromEntries((counts || []).map((c) => [c.status, c.n]));
  const last = (runs || [])[0];
  const flash = url.searchParams.get('msg');
  const err = url.searchParams.get('err');

  let body = '<h1>Review queue</h1><p class="sub">Drafts wait here. Nothing reaches qivy.in until you publish it.</p>';

  if (flash) body += notice('ok', esc(flash));
  if (err) body += notice('warn', `<strong>Failed.</strong> ${esc(err)}`);

  body += `<div class="stats">
    <div class="stat"><b>${(drafts || []).length}</b><span>Awaiting review</span></div>
    <div class="stat"><b>${by.idea || 0}</b><span>Topics queued</span></div>
    <div class="stat"><b>${by.published || 0}</b><span>Published</span></div>
  </div>`;

  body += `<form method="POST" action="/generate"><div class="row">
    <button class="primary" type="submit">Generate a draft now</button>
    <span class="hint">Also runs automatically at 06:00 IST every day.</span>
  </div></form>`;

  if (last) {
    body += `<p class="hint" style="margin-top:14px">Last run ${esc(last.started_at)} UTC — ${
      last.ok ? '' : '<strong>failed:</strong> '
    }${esc(last.message)}</p>`;
  }

  body += '<h2>Pending drafts</h2>';
  if (!drafts || !drafts.length) {
    body += '<div class="empty">Nothing waiting. Generate a draft, or wait for tomorrow&rsquo;s run.</div>';
  } else {
    for (const d of drafts) {
      const w = (d.warnings || '').split('\n').filter(Boolean);
      body += `<div class="card">
        <h3><a href="/draft/${d.id}" style="color:inherit">${esc(d.title)}</a></h3>
        <div class="meta">${badge(d.category)}<span>${d.words} words</span>
          <span>${esc(d.created_at)} UTC</span><span><code>${esc(d.model || '')}</code></span></div>
        <p style="color:var(--dim);margin-top:10px">${esc(d.summary)}</p>
        ${w.length ? `<div class="warn"><strong>${w.length} thing${w.length > 1 ? 's' : ''} to check.</strong> ${esc(w[0])}</div>` : ''}
        <div class="row"><a class="btn" href="/draft/${d.id}">Open</a></div>
      </div>`;
    }
  }

  return page({ title: 'Queue', body, nav: 'queue' });
}

async function draftPage(env, id, url) {
  const d = await env.DB.prepare('SELECT * FROM drafts WHERE id=?').bind(id).first();
  if (!d) return null;

  const warnings = (d.warnings || '').split('\n').filter(Boolean);
  const markdown = buildMarkdown(
    {
      title: d.title,
      summary: d.summary,
      seoTitle: d.seo_title,
      metaDescription: d.meta_description,
      sources: (d.sources || '').split('\n').filter(Boolean),
      tags: (d.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      body: d.body,
    },
    { category: d.category, publishDate: new Date().toISOString().slice(0, 10) },
  );

  const err = url.searchParams.get('err');

  let body = `<h1>${esc(d.title)}</h1>
    <div class="meta">${badge(d.category)}<span><code>${esc(d.slug)}.md</code></span>
    <span><code>${esc(d.model || '')}</code></span><span>${esc(d.created_at)} UTC</span></div>`;

  if (err) body += notice('warn', `<strong>Publish failed.</strong> ${esc(err)}`);

  if (warnings.length) {
    body += `<div class="warn"><strong>Check before publishing</strong><ul style="margin:8px 0 0 18px">${warnings
      .map((w) => `<li>${esc(w)}</li>`)
      .join('')}</ul></div>`;
  }

  body += notice(
    'ok',
    'Published as <code>verification: researched</code>. Nothing here was run or tested — ' +
      'verify the commands against the cited sources before publishing. If you do test it ' +
      'yourself, change the field to <code>tested</code> after publishing.',
  );

  body += `<form method="POST" action="/draft/${d.id}/publish">
    <label for="md">Article file — edit freely, this is exactly what gets committed</label>
    <textarea id="md" name="markdown" spellcheck="true">${esc(markdown)}</textarea>
    <p class="hint">Commits to <code>src/content/articles/${esc(d.slug)}.md</code> on
      <code>${esc(env.GITHUB_BRANCH)}</code>, which triggers the site build. Live in a couple of minutes.</p>
    <div class="row">
      <button class="primary" type="submit">Publish to qivy.in</button>
      <a class="btn" href="/">Back</a>
    </div>
  </form>
  <form method="POST" action="/draft/${d.id}/reject" style="margin-top:10px">
    <button class="danger" type="submit">Reject &mdash; put the topic back in the queue</button>
  </form>`;

  return page({ title: d.title, body, nav: 'queue' });
}

async function topicsPage(env, url) {
  // Ideas first, OLDEST first — the drafter takes the oldest queued idea,
  // so the top row is genuinely what runs next. Newest-first would quietly
  // disagree with the thing it is describing.
  const { results } = await env.DB.prepare(
    "SELECT id,topic,category,status,title FROM topics ORDER BY CASE status WHEN 'idea' THEN 0 ELSE 1 END, id",
  ).all();

  const msg = url.searchParams.get('msg');
  let body = '<h1>Topics</h1><p class="sub">The queue the drafter pulls from, and everything already covered so it is never proposed twice.</p>';
  if (msg) body += notice('ok', esc(msg));

  body += `<form method="POST" action="/topics"><div class="card">
    <label for="t">Add a topic</label>
    <input id="t" name="topic" required placeholder="Getting consistent JSON out of a local model">
    <label for="c">Category</label>
    <select id="c" name="category">${CATEGORIES.map(
      (c) => `<option value="${c}">${c}</option>`,
    ).join('')}</select>
    <div class="row"><button class="primary" type="submit">Add to queue</button></div>
  </div></form>`;

  body += '<h2>Queue and history</h2><table><thead><tr><th>Topic</th><th>Category</th><th>Status</th></tr></thead><tbody>';
  let markedNext = false;
  for (const t of results || []) {
    const isNext = !markedNext && t.status === 'idea';
    if (isNext) markedNext = true;
    body += `<tr><td>${esc(t.title || t.topic)}${
      isNext ? ' <span class="badge tips">next up</span>' : ''
    }</td><td>${badge(t.category)}</td><td>${esc(t.status)}</td></tr>`;
  }
  body += '</tbody></table>';

  return page({ title: 'Topics', body, nav: 'topics' });
}

async function settingsPage(env, url) {
  const s = await getSettings(env);
  const msg = url.searchParams.get('msg');

  let body = '<h1>Settings</h1><p class="sub">Keys are stored server-side and never sent back to this page.</p>';
  if (msg) body += notice('ok', esc(msg));

  body += `<form method="POST" action="/settings"><div class="card">
    <label for="k">OpenRouter API key</label>
    <input id="k" name="openrouter_key" type="password" autocomplete="off"
      placeholder="${s.key ? `set, ending ${esc(tail(s.key))} — type to replace` : 'not set'}">
    <p class="hint">From <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" style="color:var(--ai)">openrouter.ai/keys</a>. A <code>:free</code> model needs no credit, but the balance must not be negative.</p>

    <label for="m">Model</label>
    <input id="m" name="model" value="${esc(s.model)}">
    <p class="hint">Any id from <code>openrouter.ai/api/v1/models</code>. Free ones end in <code>:free</code>.
      One call a day sits far under the free daily cap.</p>

    <label for="g">GitHub token</label>
    <input id="g" name="github_token" type="password" autocomplete="off"
      placeholder="${s.token ? `set, ending ${esc(tail(s.token))} — type to replace` : 'not set'}">
    <p class="hint">Needs <strong>Contents: read and write</strong> on
      <code>${esc(env.GITHUB_OWNER)}/${esc(env.GITHUB_REPO)}</code>. Used only when you press Publish.</p>

    <div class="row"><button class="primary" type="submit">Save</button></div>
    <p class="hint">Leave a field blank to keep the current value.</p>
  </div></form>`;

  return page({ title: 'Settings', body, nav: 'settings' });
}

// ─── Routing ────────────────────────────────────────────────────────────

const redirect = (to) => new Response(null, { status: 303, headers: { Location: to } });
const html = (s) =>
  new Response(s, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });

export default {
  async fetch(request, env) {
    const gate = await requireAccess(request, env);
    if (!gate.ok) {
      return new Response(gate.message, {
        status: gate.status,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method;

    try {
      if (method === 'GET' && path === '/') return html(await queuePage(env, url));
      if (method === 'GET' && path === '/topics') return html(await topicsPage(env, url));
      if (method === 'GET' && path === '/settings') return html(await settingsPage(env, url));

      if (method === 'POST' && path === '/settings') {
        const form = await request.formData();
        // A blank field keeps the stored value, so saving the model alone
        // does not silently wipe a key.
        for (const [field, name] of [
          ['openrouter_key', 'openrouter_key'],
          ['github_token', 'github_token'],
          ['model', 'model'],
        ]) {
          const v = (form.get(field) || '').toString().trim();
          if (v) await env.SETTINGS.put(name, v);
        }
        return redirect('/settings?msg=Saved.');
      }

      if (method === 'POST' && path === '/topics') {
        const form = await request.formData();
        const topic = (form.get('topic') || '').toString().trim();
        const category = (form.get('category') || 'ai').toString();
        if (!topic) return redirect('/topics?msg=Nothing to add.');
        if (!CATEGORIES.includes(category)) return redirect('/topics?msg=Unknown category.');
        await env.DB.prepare(
          "INSERT OR IGNORE INTO topics (topic, category, status) VALUES (?,?,'idea')",
        )
          .bind(topic, category)
          .run();
        return redirect('/topics?msg=Added to the queue.');
      }

      if (method === 'POST' && path === '/generate') {
        const started = new Date().toISOString();
        try {
          const r = await generateDraft(env);
          const note = r.warnings.length ? ` ${r.warnings.length} thing(s) to check.` : '';
          return redirect(`/?msg=${encodeURIComponent(`Drafted "${r.title}".${note}`)}`);
        } catch (err) {
          await recordFailure(env, started, err.message);
          return redirect(`/?err=${encodeURIComponent(err.message)}`);
        }
      }

      const draftMatch = path.match(/^\/draft\/(\d+)(\/publish|\/reject)?$/);
      if (draftMatch) {
        const id = Number(draftMatch[1]);
        const action = draftMatch[2];

        if (method === 'GET' && !action) {
          const rendered = await draftPage(env, id, url);
          return rendered ? html(rendered) : new Response('No such draft.', { status: 404 });
        }

        if (method === 'POST' && action === '/publish') {
          const form = await request.formData();
          const markdown = (form.get('markdown') || '').toString();
          const d = await env.DB.prepare('SELECT * FROM drafts WHERE id=?').bind(id).first();
          if (!d) return new Response('No such draft.', { status: 404 });

          const { token } = await getSettings(env);
          if (!token) {
            return redirect(
              `/draft/${id}?err=${encodeURIComponent('No GitHub token set. Add one on the Settings page.')}`,
            );
          }
          if (!markdown.trim().startsWith('---')) {
            return redirect(
              `/draft/${id}?err=${encodeURIComponent('The file must start with a --- frontmatter block.')}`,
            );
          }

          try {
            const commitUrl = await commitFile({
              token,
              owner: env.GITHUB_OWNER,
              repo: env.GITHUB_REPO,
              branch: env.GITHUB_BRANCH,
              path: `src/content/articles/${d.slug}.md`,
              content: markdown,
              message: `Publish: ${d.title}`,
            });

            await env.DB.prepare(
              "UPDATE drafts SET status='published', decided_at=datetime('now'), commit_url=? WHERE id=?",
            )
              .bind(commitUrl, id)
              .run();
            await env.DB.prepare(
              "UPDATE topics SET status='published', updated_at=datetime('now') WHERE id=?",
            )
              .bind(d.topic_id)
              .run();

            return redirect(
              `/?msg=${encodeURIComponent(
                `Published "${d.title}". The site build is running; it will be live in a couple of minutes.`,
              )}`,
            );
          } catch (err) {
            return redirect(`/draft/${id}?err=${encodeURIComponent(err.message)}`);
          }
        }

        if (method === 'POST' && action === '/reject') {
          const d = await env.DB.prepare('SELECT topic_id FROM drafts WHERE id=?').bind(id).first();
          await env.DB.prepare(
            "UPDATE drafts SET status='rejected', decided_at=datetime('now') WHERE id=?",
          )
            .bind(id)
            .run();
          // Back to 'idea', not 'rejected': a bad draft is usually a bad
          // generation, not a bad topic, so it stays available to retry.
          if (d?.topic_id) {
            await env.DB.prepare(
              "UPDATE topics SET status='idea', title=NULL, slug=NULL, updated_at=datetime('now') WHERE id=?",
            )
              .bind(d.topic_id)
              .run();
          }
          return redirect('/?msg=Rejected. The topic is back in the queue.');
        }
      }

      return new Response('Not found.', { status: 404 });
    } catch (err) {
      return new Response(`Something broke: ${err.message}`, { status: 500 });
    }
  },

  async scheduled(event, env, ctx) {
    const started = new Date().toISOString();
    ctx.waitUntil(
      generateDraft(env).catch((err) => recordFailure(env, started, err.message)),
    );
  },
};
