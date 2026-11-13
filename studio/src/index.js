/**
 * Qivy Studio — the editorial dashboard for qivy.in.
 *
 * Replaces the n8n pipeline, which ran on a PC and so only produced a draft
 * when that machine happened to be on. This runs on Cloudflare: a cron
 * trigger drafts, and this page is where drafts are reviewed, edited and
 * published.
 *
 *   cron 00:30 / 08:30 / 16:30 UTC  ->  pick topic  ->  OpenRouter
 *                                   ->  validate  ->  store draft in D1
 *   you press Publish               ->  commit to GitHub  ->  Pages  ->  live
 *
 * By default nothing publishes on its own. Auto-approve, off until you turn
 * it on from the dashboard, lets a *clean* scheduled draft commit itself —
 * clean meaning the validator raised no warning and `publishChecked` found
 * nothing wrong with the file. Everything else still stops and waits, and
 * the Generate button never auto-publishes. See `autoPublishDecision`.
 *
 * Secrets (OpenRouter key, GitHub token) live in KV, are editable on the
 * Settings page, and are never sent back to the browser — only whether they
 * are set, and their last four characters.
 */

import { requireAccess } from './access.js';
import {
  DEFAULT_MODEL,
  checkSources,
  dangerousHtml,
  publishedLinks,
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
  const [key, token, model, autoApprove] = await Promise.all([
    env.SETTINGS.get('openrouter_key'),
    env.SETTINGS.get('github_token'),
    env.SETTINGS.get('model'),
    env.SETTINGS.get('auto_approve'),
  ]);
  // Read fresh on every run, never cached: switching the toggle off has to
  // stop the next scheduled publish, not the one after it.
  return { key, token, model: model || DEFAULT_MODEL, autoApprove: autoApprove === 'on' };
}

const tail = (s) => (s ? `…${s.slice(-4)}` : null);

/**
 * Of everything wrong with a draft, the part that needs a person.
 *
 * Pure and exported so the line between "stop" and "mention" is testable
 * without a network or a database. Together with `autoPublishDecision` this
 * is the whole of what lets writing reach the public site unread.
 *
 * Stops: every validator warning. Fabricated first-hand experience, a
 * near-duplicate of your own article, an unfenced tag that eats its own
 * example, a length outside the house rules. Judgement calls, all of them.
 *
 * Mentions only: a redirect, and a source that refused an automated check.
 * Neither makes the article dishonest -- the link works, or very likely does
 * -- and holding on them is what made auto-approve publish nothing in four
 * runs.
 *
 * The exception is every source unverified. One shaky citation among several
 * still leaves the article standing on ones that were followed; none does
 * not, and nobody should find that out from the live site.
 *
 * `dead` appears nowhere here: publishChecked refuses it outright, and the
 * refusal is written to the runs log, so it needs no help from this.
 */
export function holdWarnings(draftWarnings, checked) {
  const hold = [...(draftWarnings || [])];
  if (checked && checked.allUnverified) {
    const w = (checked.warnings || []).find((x) => x.startsWith('Could not verify'));
    if (w) hold.push(w);
  }
  return hold;
}

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

  // The validator proves a source is shaped like a URL. Only the network
  // proves it leads anywhere, and "researched" is a claim about exactly
  // that — so a citation is followed before the draft is stored.
  const checked = await checkSources(draft.sources);
  if (checked.allDead) {
    throw new Error(
      `Every cited source is dead: ${checked.dead.join('; ')}. ` +
        'An article marked "researched" with nothing a reader can follow is ' +
        'unverifiable, so no draft was stored.',
    );
  }

  const hold = holdWarnings(draft.warnings, checked);
  draft.warnings.push(...checked.warnings);

  const inserted = await env.DB.prepare(
    `INSERT INTO drafts
       (topic_id, title, slug, category, summary, seo_title, meta_description,
        tags, sources, body, warnings, model, status, words)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'pending',?)`,
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
      // The validator's own count. Recomputing it in SQL got a different
      // answer — separator arithmetic counts a blank line twice — and the
      // reviewer judges length against the 150-900 rule, so the number on
      // the page has to be the number the rule was applied to.
      draft.words,
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

  // `warnings` is everything, for the review page and the log. `hold` is the
  // subset that may stop an unattended publish. Keeping both means the page
  // still shows a redirect note it no longer blocks on.
  return { draftId, title: draft.title, warnings: draft.warnings, hold };
}

async function recordFailure(env, started, message) {
  await env.DB.prepare('INSERT INTO runs (started_at, ok, message) VALUES (?,0,?)')
    .bind(started, String(message).slice(0, 900))
    .run();
}

/**
 * Whether the cron may publish a draft with nobody watching.
 *
 * Pure and exported, because this is the only decision in the app that can
 * put writing on the public site unattended, and it should be provable
 * without a network or a database.
 *
 * `hold` is NOT every warning on the draft -- it is the subset that needs a
 * person. First-person language is a fabricated claim of personal experience
 * under your byline; a near-duplicate competes with one of your own
 * articles; an unfenced tag silently eats the example it was meant to show;
 * and a source nothing could verify leaves the article standing on a
 * citation nobody has followed. Those are judgements you would want to make
 * yourself.
 *
 * What is deliberately absent: a redirect note, and a single shaky source
 * among several. The first version of this held on *any* warning, and the
 * result was an auto-approve that published nothing in four runs -- three of
 * them stopped by a note whose own text says the link works today. A gate
 * that never opens is not a cautious gate, it is a broken one. `generateDraft`
 * decides what belongs in here; see the comment there.
 */
export function autoPublishDecision({ autoApprove, hold }) {
  if (!autoApprove) return { publish: false, why: 'Auto-approve off: waiting for review.' };
  const w = (hold || []).filter(Boolean);
  if (w.length) {
    return {
      publish: false,
      why: `Held for review despite auto-approve — ${w.length} thing${
        w.length > 1 ? 's' : ''
      } to check: ${w[0]}`,
    };
  }
  return { publish: true, why: null };
}

/**
 * Publish what the cron just drafted, if the toggle is on and the draft is
 * clean. Only ever reached from `scheduled`: the Generate button is a draft
 * you asked for, so it waits for you whatever the toggle says.
 *
 * Every outcome lands in `runs`, the decision not to publish included. An
 * unattended publish that leaves no record is one you cannot audit later.
 */
async function autoPublish(env, started, result) {
  const { token, autoApprove } = await getSettings(env);
  const decision = autoPublishDecision({ autoApprove, hold: result.hold });

  const log = (ok, message) =>
    env.DB.prepare('INSERT INTO runs (started_at, ok, message, draft_id) VALUES (?,?,?,?)')
      .bind(started, ok ? 1 : 0, String(message).slice(0, 900), result.draftId)
      .run();

  if (!decision.publish) {
    // Not a failure: the draft exists and is waiting, which is the system
    // working. Logged only when the toggle is on, or every run with it off
    // would carry a line saying nothing happened.
    if (autoApprove) await log(true, decision.why);
    return;
  }

  const d = await env.DB.prepare('SELECT * FROM drafts WHERE id=?').bind(result.draftId).first();
  try {
    const r = await publishChecked(env, d, draftMarkdown(d), token);
    await log(
      r.ok,
      r.ok ? `Auto-published "${d.title}" — ${r.commitUrl}` : `Auto-publish refused: ${r.reason}`,
    );
  } catch (err) {
    await log(false, `Auto-publish failed: ${err.message}`);
  }
}

// ─── Pages ──────────────────────────────────────────────────────────────

async function queuePage(env, url) {
  const [{ results: drafts }, { results: counts }, { results: runs }, settings] =
    await Promise.all([
      env.DB.prepare(
        "SELECT id,title,category,summary,warnings,model,created_at,words FROM drafts WHERE status='pending' ORDER BY created_at DESC",
      ).all(),
      env.DB.prepare('SELECT status, COUNT(*) n FROM topics GROUP BY status').all(),
      env.DB.prepare('SELECT ok,message,started_at FROM runs ORDER BY id DESC LIMIT 1').all(),
      getSettings(env),
    ]);

  const by = Object.fromEntries((counts || []).map((c) => [c.status, c.n]));
  const last = (runs || [])[0];
  const flash = url.searchParams.get('msg');
  const err = url.searchParams.get('err');

  const auto = settings.autoApprove;

  let body = `<h1>Review queue</h1><p class="sub">${
    auto
      ? 'Auto-approve is on: a clean scheduled draft publishes itself. Anything with a warning still waits here.'
      : 'Drafts wait here. Nothing reaches qivy.in until you publish it.'
  }</p>`;

  if (flash) body += notice('ok', esc(flash));
  if (err) body += notice('warn', `<strong>Failed.</strong> ${esc(err)}`);

  body += `<div class="stats">
    <div class="stat"><b>${(drafts || []).length}</b><span>Awaiting review</span></div>
    <div class="stat"><b>${by.idea || 0}</b><span>Topics queued</span></div>
    <div class="stat"><b>${by.published || 0}</b><span>Published</span></div>
  </div>`;

  body += `<form method="POST" action="/generate"><div class="row">
    <button class="primary" type="submit">Generate a draft now</button>
    <span class="hint">Also runs automatically at 06:00, 14:00 and 22:00 IST.</span>
  </div></form>`;

  // Deliberately a form and not a checkbox: a checkbox that posts nothing
  // when cleared cannot say "off", only "nothing to see here", and off is
  // the state that has to be unambiguous. The button states what it will do,
  // and the paragraph states what is true now.
  body += `<form method="POST" action="/auto-approve"><div class="card">
    <h3 style="margin:0">Auto-approve ${auto ? 'is ON' : 'is off'}</h3>
    <p style="color:var(--dim);margin:8px 0 0">${
      auto
        ? 'Scheduled drafts publish to qivy.in without waiting for you — but only when ' +
          'the draft is clean. A draft carrying any warning, an unreachable link, or raw ' +
          'HTML still stops here, and the runs log says which. The Generate button never ' +
          'auto-publishes; it is a draft you asked for, so it waits.'
        : 'Every draft waits for you to read it and press Publish. Turn this on and clean ' +
          'scheduled drafts will go straight to the site instead.'
    }</p>
    <input type="hidden" name="on" value="${auto ? '0' : '1'}">
    <div class="row"><button class="${auto ? 'danger' : 'primary'}" type="submit">
      ${auto ? 'Turn auto-approve off' : 'Turn auto-approve on'}
    </button></div>
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

/**
 * The file a draft row would become.
 *
 * Shared so the textarea you review and the file auto-approve commits are
 * built by the same code. Two copies of this would be two definitions of
 * what the article is.
 */
function draftMarkdown(d) {
  return buildMarkdown(
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
}

/**
 * Commit a draft, unless something about the file itself forbids it.
 *
 * Returns `{ ok: false, reason }` instead of throwing, because both callers
 * need the reason as plain text: the button puts it in a banner, the cron
 * puts it in the runs table, where it is the only record anyone will see.
 *
 * Every refusal in here is mechanical -- a fact about the file, not a matter
 * of taste. That is what makes it safe to share with the unattended path:
 * auto-approve skips the reviewer, it does not skip these.
 */
async function publishChecked(env, d, markdown, token) {
  if (!token) return { ok: false, reason: 'No GitHub token set. Add one on the Settings page.' };
  if (!markdown.trim().startsWith('---')) {
    return { ok: false, reason: 'The file must start with a --- frontmatter block.' };
  }

  // Markdown hands raw HTML straight to the page, so an unfenced script tag
  // here does not show as an example -- it runs, for every reader.
  const risky = dangerousHtml(markdown);
  if (risky.length) {
    return {
      ok: false,
      reason:
        `Not published: this file contains ${risky.join(' and ')} outside a code fence. ` +
        'Markdown passes raw HTML to the page, so it would run on qivy.in rather than ' +
        'being shown. Wrap it in a triple-backtick fence, or delete it.',
    };
  }

  // The file ships `verification: researched`, which is a promise that the
  // reader can follow the links. Checked against the markdown passed in, not
  // the stored row, because that is what gets committed.
  const { dead } = await checkSources(publishedLinks(markdown));
  if (dead.length) {
    const one = dead.length === 1;
    return {
      ok: false,
      reason:
        `Not published: ${one ? 'a link in this file is' : `${dead.length} links in this file are`} ` +
        `unreachable — ${dead.join('; ')}. An article marked "researched" is only honest if a ` +
        `reader can follow its links, so fix or remove ${one ? 'it' : 'them'} and publish again.`,
    };
  }

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
    .bind(commitUrl, d.id)
    .run();
  await env.DB.prepare(
    "UPDATE topics SET status='published', updated_at=datetime('now') WHERE id=?",
  )
    .bind(d.topic_id)
    .run();

  return { ok: true, commitUrl };
}

async function draftPage(env, id, url) {
  const d = await env.DB.prepare('SELECT * FROM drafts WHERE id=?').bind(id).first();
  if (!d) return null;

  const warnings = (d.warnings || '').split('\n').filter(Boolean);
  const markdown = draftMarkdown(d);

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

/**
 * True when a state-changing request came from this app's own pages.
 *
 * Sec-Fetch-Site is asked first because it is the only one of these three
 * that survives our own Referrer-Policy. Measured, after this function
 * refused the dashboard's own Generate button: under
 * `Referrer-Policy: no-referrer` a same-origin form POST arrives with
 * `Origin: null` and no Referer at all, while Sec-Fetch-Site still reads
 * `same-origin`. The policy is `same-origin` now so the fallback below is
 * real rather than decorative, but the ordering is what makes this robust
 * to the header being tightened again later.
 *
 * It is also the harder header to forge: Sec-Fetch-Site is a forbidden
 * header name, so no script on any page can set it.
 */
export function isSameOrigin(request, url) {
  const site = request.headers.get('Sec-Fetch-Site');
  // `same-site` is deliberately refused: qivy.in and write.qivy.in share a
  // registrable domain, and qivy.in serves model-written pages.
  if (site) return site === 'same-origin';

  // Only reached on a browser old enough to send no Sec-Fetch-Site.
  const from = request.headers.get('Origin') || request.headers.get('Referer');
  // "null" is a value, not an absence — a sandboxed iframe and a
  // cross-origin redirect both send exactly that. Parsing it would throw,
  // and treating it as ours would be the hole this function exists to close.
  if (!from || from === 'null') return false;
  try {
    return new URL(from).origin === url.origin;
  } catch {
    return false;
  }
}

const redirect = (to) => new Response(null, { status: 303, headers: { Location: to } });

// Exported so a test can hold the Referrer-Policy to account: `no-referrer`
// here silently kills the Origin fallback in isSameOrigin, which is how the
// Generate button came to refuse itself. `same-origin` still sends nothing
// to any other site.
export const SECURITY_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

const html = (s) => new Response(s, { headers: SECURITY_HEADERS });

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

    // Access authenticates the BROWSER, not the page the request came from.
    // It attaches CF_Authorization to a cross-site form POST exactly as
    // readily as to one of ours, and this app commits to a public
    // repository -- so any page the reviewer happens to visit while signed
    // in could publish on their behalf. isSameOrigin reads Sec-Fetch-Site
    // for this, because Origin is NOT reliably present: see the note there
    // for what a same-origin POST actually carries.
    if (method !== 'GET' && method !== 'HEAD') {
      if (!isSameOrigin(request, url)) {
        return new Response(
          'Cross-site request refused. Use the form on the dashboard itself.',
          { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
        );
      }
    }

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

      if (method === 'POST' && path === '/auto-approve') {
        const form = await request.formData();
        const on = (form.get('on') || '').toString() === '1';
        // Stored as a word rather than deleted when off, so the log of what
        // you chose survives either way and getSettings has one thing to
        // compare against.
        await env.SETTINGS.put('auto_approve', on ? 'on' : 'off');
        return redirect(
          `/?msg=${encodeURIComponent(
            on
              ? 'Auto-approve is on. Clean scheduled drafts will publish without waiting for you.'
              : 'Auto-approve is off. Every draft waits for you again, starting with the next run.',
          )}`,
        );
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
          const startedPublish = new Date().toISOString();
          const form = await request.formData();
          const markdown = (form.get('markdown') || '').toString();
          const d = await env.DB.prepare('SELECT * FROM drafts WHERE id=?').bind(id).first();
          if (!d) return new Response('No such draft.', { status: 404 });

          const { token } = await getSettings(env);

          try {
            const r = await publishChecked(env, d, markdown, token);
            if (!r.ok) return redirect(`/draft/${id}?err=${encodeURIComponent(r.reason)}`);
            return redirect(
              `/?msg=${encodeURIComponent(
                `Published "${d.title}". The site build is running; it will be live in a couple of minutes.`,
              )}`,
            );
          } catch (err) {
            // Everything else here leaves a row behind. A failed publish is
            // the one worth the most later, since it is the step that
            // touches the repository, and a redirect banner is gone the
            // moment you navigate away.
            await recordFailure(env, startedPublish, `Publish failed: ${err.message}`);
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
      generateDraft(env)
        .then((r) => autoPublish(env, started, r))
        .catch((err) => recordFailure(env, started, err.message)),
    );
  },
};
