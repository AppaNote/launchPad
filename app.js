/* LaunchPad — local-first launcher, database registry and resource library.
   All data lives in localStorage and is never removed unless the user deletes it. */

const STORE_KEY = 'launchpad.v1';
const ENVS_PER_PAGE = 2;

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* Inline SVG icon set (stroke = currentColor) so tiles look identical on every OS. */
const SVG = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICONS = {
  globe:    SVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15 0 18-2.5-3-2.5-15.3 0-18z"/>'),
  grid:     SVG('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  money:    SVG('<path d="M12 2v20"/><path d="M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.7 7 6.8 9.3 9.8 12 10.4s5 1.4 5 3.6-2.2 3.5-5 3.5-5-1.2-5-3"/>'),
  tools:    SVG('<path d="M14.7 6.3a4 4 0 105.1 5.1l-5.1-5.1z"/><path d="M14.5 9.5L4 20l1.5 1.5L16 11"/>'),
  chart:    SVG('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  docs:     SVG('<rect x="7" y="3" width="12" height="15" rx="2"/><path d="M5 7v12a2 2 0 002 2h10"/>'),
  clock:    SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  org:      SVG('<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 7v5M5 16v-2h14v2M12 12v2"/>'),
  robot:    SVG('<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M2 13h2M20 13h2"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/>'),
  database: SVG('<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
  health:   SVG('<rect x="2" y="6" width="20" height="11" rx="2"/><path d="M12 9v5M9.5 11.5h5M6 17v2M18 17v2"/>'),
  folder:   SVG('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>'),
  book:     SVG('<path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 004 22V4.5z"/><path d="M8 7h8M8 11h6"/>'),
  gear:     SVG('<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
  lock:     SVG('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 118 0v3"/>'),
  mail:     SVG('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  cloud:    SVG('<path d="M7 18a4 4 0 010-8 5.5 5.5 0 0110.6-1.4A3.8 3.8 0 0117.5 18H7z"/>'),
  video:    SVG('<rect x="2" y="5" width="14" height="14" rx="3"/><path d="M16 10l6-3v10l-6-3z"/>'),
  search:   SVG('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  link:     SVG('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L11.5 7"/><path d="M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 109 18.7l1.5-1.5"/>')
};
const ICON_NAMES = Object.keys(ICONS);
const UI = {
  edit:  SVG('<path d="M4 20h4L20 8a2.8 2.8 0 10-4-4L4 16v4z"/><path d="M14 6l4 4"/>'),
  trash: SVG('<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/>'),
  open:  SVG('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>'),
  plus:  SVG('<path d="M12 5v14M5 12h14"/>'),
  play:  SVG('<circle cx="12" cy="12" r="10" fill="rgba(6,10,20,.55)"/><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor"/>')
};
const iconHtml = (name) => ICONS[name] || ICONS.globe;

function defaults() {
  const tiles = () => [
    { id: uid(), label: 'Mingle',       sub: '',      icon: 'grid',     url: '' },
    { id: uid(), label: 'Lawson Portal',sub: 'S3',    icon: 'money',    url: '' },
    { id: uid(), label: 'MyHR',         sub: 'Self-Service', icon: 'tools', url: '' },
    { id: uid(), label: 'Reporting',    sub: 'LBI',   icon: 'chart',    url: '' },
    { id: uid(), label: 'Document SS',  sub: 'MHC',   icon: 'docs',     url: '' },
    { id: uid(), label: 'Workbrain',    sub: 'WB',    icon: 'clock',    url: '' },
    { id: uid(), label: 'OrgPlus',      sub: 'Roads', icon: 'org',      url: '' },
    { id: uid(), label: 'Automation',   sub: 'IPA',   icon: 'robot',    url: '' },
    { id: uid(), label: 'SAP EDW',      sub: '',      icon: 'database', url: '' },
    { id: uid(), label: 'FINEOS',       sub: '',      icon: 'health',   url: '' }
  ];
  return {
    quickLinks: [
      { id: uid(), name: 'SharePoint', url: '', items: [
        { id: uid(), name: 'Team site', url: '' },
        { id: uid(), name: 'Finance', url: '' }
      ] },
      { id: uid(), name: 'Azure DevOps', url: '', items: [
        { id: uid(), name: 'Boards', url: '' },
        { id: uid(), name: 'Repos', url: '' },
        { id: uid(), name: 'Pipelines', url: '' }
      ] },
      { id: uid(), name: 'Intranet', url: '', items: [] },
      { id: uid(), name: 'Email', url: '', items: [] },
      { id: uid(), name: 'IT Wiki', url: '', items: [] },
      { id: uid(), name: 'Power Automate', url: '', items: [] }
    ],
    environments: [
      { id: uid(), name: 'Production (PROD)',            short: 'PROD',    tiles: tiles() },
      { id: uid(), name: 'Production Support (PRODSUP)', short: 'PRODSUP', tiles: tiles() },
      { id: uid(), name: 'User Acceptance (UAT)',        short: 'UAT',     tiles: tiles() },
      { id: uid(), name: 'System Integration (SIT)',     short: 'SIT',     tiles: tiles() }
    ],
    databases: [],
    resources: []
  };
}

let state = load();
let page = 0;
let view = 'launcher';
let dbFilter = 'All';
let resFilter = 'All';
let query = '';

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaults();
    const data = JSON.parse(raw);
    return {
      quickLinks: (data.quickLinks || []).map(normalizeQuickLink),
      environments: data.environments || [],
      databases: data.databases || [],
      resources: data.resources || []
    };
  } catch (e) {
    console.error('Could not read saved data, starting fresh copy in memory.', e);
    return defaults();
  }
}
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

/* A quick link is a group: it can open its own URL and/or hold child links. */
function normalizeQuickLink(q) {
  return {
    id: q.id || uid(),
    name: q.name || '',
    url: q.url || '',
    items: (Array.isArray(q.items) ? q.items : []).map((i) => ({ id: i.id || uid(), name: i.name || '', url: i.url || '' }))
  };
}
function findQuickGroup(id) {
  return state.quickLinks.find((g) => g.id === id) || null;
}
function findQuickItem(id) {
  for (const g of state.quickLinks) {
    const it = g.items.find((i) => i.id === id);
    if (it) return { group: g, item: it };
  }
  return null;
}

/* ---------- helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function normalizeUrl(u) {
  const s = (u || '').trim();
  if (!s) return '';
  if (/^([a-z]+:)?\/\//i.test(s) || /^(mailto|tel|file):/i.test(s)) return s;
  return 'https://' + s;
}
function openUrl(u) {
  const url = normalizeUrl(u);
  if (!url) return toast('No URL set — use Edit to add one.');
  window.open(url, '_blank', 'noopener');
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}
/* ---------- link metadata (derived client-side; no server, no CORS fetches) ---------- */
function parseUrl(u) {
  try { return new URL(normalizeUrl(u)); } catch (e) { return null; }
}
function hostOf(u) {
  return parseUrl(u)?.hostname.replace(/^www\./, '') || '';
}
function youTubeId(u) {
  const p = parseUrl(u);
  if (!p) return '';
  if (/(^|\.)youtu\.be$/.test(p.hostname)) return p.pathname.slice(1).split('/')[0];
  if (/(^|\.)youtube\.com$/.test(p.hostname)) {
    if (p.searchParams.get('v')) return p.searchParams.get('v');
    const m = p.pathname.match(/\/(embed|shorts|live)\/([^/?#]+)/);
    if (m) return m[2];
  }
  return '';
}
function thumbnailFor(r) {
  if (r.thumbnail) return normalizeUrl(r.thumbnail);
  const id = youTubeId(r.url);
  return id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : '';
}
function faviconCandidates(u) {
  const p = parseUrl(u);
  if (!p) return [];
  return [
    `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(p.hostname)}`,
    `${p.origin}/favicon.ico`
  ];
}
/* Turns ".../2024/05/tuning-sql-queries?utm=x" into "Tuning Sql Queries". */
function titleFromUrl(u) {
  const p = parseUrl(u);
  if (!p) return '';
  const q = p.searchParams.get('q') || p.searchParams.get('search') || p.searchParams.get('query');
  if (q) return `${hostOf(u)}: ${q}`.slice(0, 90);
  if (youTubeId(u)) return 'YouTube video';
  const slug = p.pathname.split('/').filter(Boolean).pop();
  if (!slug) return hostOf(u);
  const words = decodeURIComponent(slug)
    .replace(/\.(html?|php|aspx?|pdf)$/i, '')
    .replace(/[-_+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!words || words.length < 3) return hostOf(u);
  return words.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 90);
}

/* YouTube and Vimeo expose CORS-enabled oEmbed, so a real title can be pulled in
   without a backend. Every other site blocks cross-origin reads. */
function oEmbedEndpoint(u) {
  const p = parseUrl(u);
  if (!p) return '';
  const enc = encodeURIComponent(normalizeUrl(u));
  if (youTubeId(u)) return `https://www.youtube.com/oembed?format=json&url=${enc}`;
  if (/(^|\.)vimeo\.com$/.test(p.hostname)) return `https://vimeo.com/api/oembed.json?url=${enc}`;
  return '';
}
async function enrichResource(r) {
  const endpoint = oEmbedEndpoint(r.url);
  if (!endpoint || r.title) return false;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return false;
    const meta = await res.json();
    if (!meta.title) return false;
    r.title = meta.title;
    if (!r.thumbnail && meta.thumbnail_url) r.thumbnail = meta.thumbnail_url;
    save();
    return true;
  } catch (e) {
    return false; /* offline or blocked — the derived title stays in place */
  }
}

function matches(...parts) {
  if (!query) return true;
  return parts.filter(Boolean).join(' ').toLowerCase().includes(query);
}

/* ---------- rendering ---------- */
function render() {
  renderQuickLinks();
  if (view === 'launcher') renderLauncher();
  if (view === 'databases') renderDatabases();
  if (view === 'resources') renderResources();
}

function renderQuickLinks() {
  const wrap = $('#quickLinks');
  wrap.innerHTML = '';
  state.quickLinks.forEach((g) => wrap.appendChild(quickLinkGroup(g)));
  const add = el('button', 'qlink add', '+ link');
  add.addEventListener('click', () => openModal('quickLink'));
  wrap.appendChild(add);
}

function quickLinkGroup(g) {
  const grp = el('div', 'qgroup');

  const chip = el('button', 'qlink');
  chip.innerHTML = `<span>${esc(g.name)}</span>
    ${g.items.length ? '<span class="caret">&#9662;</span>' : ''}
    <span class="mini" data-a="edit" title="Edit group">${UI.edit}</span>
    <span class="mini" data-a="del" title="Delete group">${UI.trash}</span>`;
  grp.appendChild(chip);

  const menu = el('div', 'qmenu glass');
  g.items.forEach((it) => {
    const row = el('button', 'qitem');
    row.innerHTML = `<span class="qitem-name">${esc(it.name)}</span>
      <span class="mini" data-a="edit-item" data-id="${it.id}" title="Edit">${UI.edit}</span>
      <span class="mini" data-a="del-item" data-id="${it.id}" title="Delete">${UI.trash}</span>`;
    row.dataset.a = 'open-item';
    row.dataset.id = it.id;
    if (it.url) row.title = normalizeUrl(it.url);
    menu.appendChild(row);
  });
  const addItem = el('button', 'qitem add', '+ Add link');
  addItem.dataset.a = 'add-item';
  menu.appendChild(addItem);
  grp.appendChild(menu);

  grp.addEventListener('click', (e) => {
    const hit = e.target.closest('[data-a]');
    const a = hit?.dataset.a;
    if (a === 'edit') return openModal('quickLink', g);
    if (a === 'del') return removeItem('quickLinks', g.id, g.name);
    if (a === 'add-item') return openModal('quickSubLink', null, { parentId: g.id });
    if (a === 'edit-item') return openModal('quickSubLink', findQuickItem(hit.dataset.id)?.item, { parentId: g.id });
    if (a === 'del-item') return removeQuickItem(g, hit.dataset.id);
    if (a === 'open-item') {
      const it = g.items.find((i) => i.id === hit.dataset.id);
      return openUrl(it?.url);
    }
    if (g.url) return openUrl(g.url);
    if (g.items.length) grp.classList.toggle('open');
    else toast('No URL set — use Edit to add one.');
  });
  grp.addEventListener('mouseleave', () => grp.classList.remove('open'));

  return grp;
}

function removeQuickItem(group, id) {
  const it = group.items.find((i) => i.id === id);
  if (!it || !confirm(`Delete "${it.name}" from ${group.name}?`)) return;
  group.items = group.items.filter((i) => i.id !== id);
  save(); renderQuickLinks(); toast('Deleted');
}

function pageCount() {
  return Math.max(1, Math.ceil(state.environments.length / ENVS_PER_PAGE));
}
function turnPage(step) {
  const n = pageCount();
  page = ((page + step) % n + n) % n; // wraps in both directions, endlessly
  renderLauncher();
}

function renderLauncher() {
  const total = pageCount();
  if (page >= total) page = 0;
  const pages = $('#pages');
  pages.innerHTML = '';

  const slice = state.environments.slice(page * ENVS_PER_PAGE, page * ENVS_PER_PAGE + ENVS_PER_PAGE);
  if (!slice.length) {
    pages.appendChild(el('div', 'empty', 'No environments yet — use + Add → Environment.'));
  }
  slice.forEach((env) => pages.appendChild(envPanel(env)));

  const dots = $('#pageDots');
  dots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = el('button', 'pdot' + (i === page ? ' active' : ''));
    d.title = 'Page ' + (i + 1);
    d.addEventListener('click', () => { page = i; renderLauncher(); });
    dots.appendChild(d);
  }
}

function envPanel(env) {
  const panel = el('section', 'env glass');
  const head = el('div', 'env-head');
  head.appendChild(el('h3', null, esc(env.name)));
  const acts = el('div', 'env-actions');
  acts.innerHTML = `<button class="icon-btn" data-a="add" title="Add tile">${UI.plus}</button>
    <button class="icon-btn" data-a="edit" title="Edit environment">${UI.edit}</button>
    <button class="icon-btn" data-a="del" title="Delete environment">${UI.trash}</button>`;
  acts.addEventListener('click', (e) => {
    const a = e.target.closest('button')?.dataset.a;
    if (a === 'add') openModal('tile', null, { envId: env.id });
    if (a === 'edit') openModal('environment', env);
    if (a === 'del') removeEnvironment(env);
  });
  head.appendChild(acts);
  panel.appendChild(head);

  const grid = el('div', 'tiles');
  env.tiles.filter((t) => matches(t.label, t.sub, t.url, env.name)).forEach((t) => {
    const tile = el('button', 'tile');
    tile.innerHTML = `
      <div class="tile-actions">
        <span class="icon-btn" data-a="edit" title="Edit">${UI.edit}</span>
        <span class="icon-btn" data-a="del" title="Delete">${UI.trash}</span>
      </div>
      <div class="glyph">${iconHtml(t.icon)}</div>
      <div class="label">${esc(t.label)}</div>
      ${t.sub ? `<div class="sub">${esc(t.sub)}</div>` : ''}`;
    tile.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'edit') return openModal('tile', t, { envId: env.id });
      if (a === 'del') return removeTile(env, t);
      openUrl(t.url);
    });
    grid.appendChild(tile);
  });
  const add = el('button', 'tile add', `<div class="glyph">${UI.plus}</div><div class="label">Add tile</div>`);
  add.addEventListener('click', () => openModal('tile', null, { envId: env.id }));
  grid.appendChild(add);

  panel.appendChild(grid);
  return panel;
}

function renderFilters(node, values, current, onPick) {
  node.innerHTML = '';
  ['All', ...values].forEach((v) => {
    const c = el('button', 'chip' + (v === current ? ' active' : ''), esc(v));
    c.addEventListener('click', () => onPick(v));
    node.appendChild(c);
  });
}

function renderDatabases() {
  const envNames = [...new Set(state.databases.map((d) => d.env).filter(Boolean))].sort();
  renderFilters($('#dbFilters'), envNames, dbFilter, (v) => { dbFilter = v; renderDatabases(); });

  const list = $('#dbList');
  list.innerHTML = '';
  const items = state.databases
    .filter((d) => dbFilter === 'All' || d.env === dbFilter)
    .filter((d) => matches(d.name, d.env, d.server, d.database, d.system, d.notes));

  if (!items.length) {
    list.appendChild(el('div', 'empty', 'No database entries yet — use + Add → Database.'));
    return;
  }
  items.forEach((d) => {
    const card = el('article', 'card');
    card.innerHTML = `
      <div class="card-actions">
        <button class="icon-btn" data-a="edit" title="Edit">${UI.edit}</button>
        <button class="icon-btn" data-a="del" title="Delete">${UI.trash}</button>
      </div>
      <h4>${esc(d.name || d.database || 'Untitled')}</h4>
      <div class="tagrow">
        ${d.env ? `<span class="tag">${esc(d.env)}</span>` : ''}
        ${d.system ? `<span class="tag alt">${esc(d.system)}</span>` : ''}
      </div>
      <div class="kv"><b>Server</b><span>${esc(d.server || '—')}</span>
        ${d.server ? `<button class="copy" data-copy="${esc(d.server)}">copy</button>` : ''}</div>
      <div class="kv"><b>Database</b><span>${esc(d.database || '—')}</span>
        ${d.database ? `<button class="copy" data-copy="${esc(d.database)}">copy</button>` : ''}</div>
      ${d.port ? `<div class="kv"><b>Port</b><span>${esc(d.port)}</span></div>` : ''}
      ${d.username ? `<div class="kv"><b>User</b><span>${esc(d.username)}</span></div>` : ''}
      ${d.notes ? `<div class="note">${esc(d.notes)}</div>` : ''}`;
    card.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.copy != null) return copyText(btn.dataset.copy);
      if (btn.dataset.a === 'edit') return openModal('database', d);
      if (btn.dataset.a === 'del') return removeItem('databases', d.id, d.name || d.database);
    });
    list.appendChild(card);
  });
}

function renderResources() {
  const cats = [...new Set(state.resources.map((r) => r.category).filter(Boolean))].sort();
  renderFilters($('#resFilters'), cats, resFilter, (v) => { resFilter = v; renderResources(); });

  const list = $('#resList');
  list.innerHTML = '';
  const items = state.resources
    .filter((r) => resFilter === 'All' || r.category === resFilter)
    .filter((r) => matches(r.title, r.url, r.category, r.notes, r.tags));

  if (!items.length) {
    list.appendChild(el('div', 'empty', 'No resources yet — use + Add → Resource.'));
    return;
  }
  items.forEach((r) => {
    list.appendChild(resourceCard(r));
    if (!r.title && oEmbedEndpoint(r.url)) {
      enrichResource(r).then((ok) => { if (ok && view === 'resources') renderResources(); });
    }
  });
}

function resourceCard(r) {
  const host = hostOf(r.url);
  const title = r.title || titleFromUrl(r.url) || host || 'Untitled';
  const thumb = thumbnailFor(r);
  const isVideo = !!youTubeId(r.url);

  const card = el('article', 'card res-card');
  card.innerHTML = `
    <div class="card-actions">
      <button class="icon-btn" data-a="open" title="Open">${UI.open}</button>
      <button class="icon-btn" data-a="edit" title="Edit">${UI.edit}</button>
      <button class="icon-btn" data-a="del" title="Delete">${UI.trash}</button>
    </div>
    <div class="thumb ${thumb ? '' : 'fallback'}">
      ${thumb ? `<img alt="" src="${esc(thumb)}">` : `<div class="monogram">${esc((host || '?')[0].toUpperCase())}</div>`}
      ${isVideo ? `<span class="play">${UI.play}</span>` : ''}
    </div>
    <div class="res-body">
      <h4 title="${esc(normalizeUrl(r.url))}">${esc(title)}</h4>
      <div class="source"><img class="favicon" alt="" width="16" height="16"><span>${esc(host || 'link')}</span></div>
      <div class="tagrow">
        ${r.category ? `<span class="tag alt">${esc(r.category)}</span>` : ''}
        ${(r.tags || '').split(',').map((t) => t.trim()).filter(Boolean)
          .map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
      ${r.notes ? `<div class="note">${esc(r.notes)}</div>` : ''}
    </div>`;

  const img = card.querySelector('.thumb img');
  if (img) img.addEventListener('error', () => {
    const box = card.querySelector('.thumb');
    box.classList.add('fallback');
    box.innerHTML = `<div class="monogram">${esc((host || '?')[0].toUpperCase())}</div>`;
  });

  const fav = card.querySelector('.favicon');
  const sources = faviconCandidates(r.url);
  let attempt = 0;
  const tryFavicon = () => {
    if (attempt >= sources.length) { fav.remove(); return; }
    fav.src = sources[attempt++];
  };
  fav.addEventListener('error', tryFavicon);
  tryFavicon();

  card.addEventListener('click', (e) => {
    const a = e.target.closest('button')?.dataset.a;
    if (a === 'edit') return openModal('resource', r);
    if (a === 'del') return removeItem('resources', r.id, r.title || title);
    openUrl(r.url);
  });
  return card;
}

function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => toast('Copied: ' + text)).catch(() => toast('Copy failed'));
}

/* ---------- mutations (deletes always ask first) ---------- */
function removeItem(collection, id, label) {
  if (!confirm(`Delete "${label || 'this item'}"? This cannot be undone.`)) return;
  state[collection] = state[collection].filter((x) => x.id !== id);
  save(); render(); toast('Deleted');
}
function removeTile(env, tile) {
  if (!confirm(`Delete tile "${tile.label}" from ${env.name}?`)) return;
  env.tiles = env.tiles.filter((t) => t.id !== tile.id);
  save(); renderLauncher(); toast('Deleted');
}
function removeEnvironment(env) {
  if (!confirm(`Delete environment "${env.name}" and its ${env.tiles.length} tiles?`)) return;
  state.environments = state.environments.filter((e) => e.id !== env.id);
  save(); renderLauncher(); toast('Deleted');
}

/* ---------- modal ---------- */
const SCHEMAS = {
  tile: {
    title: 'Launcher tile',
    fields: [
      { k: 'envId', label: 'Environment', type: 'select', options: () => state.environments.map((e) => ({ v: e.id, t: e.name })), required: true },
      { k: 'label', label: 'Name', required: true, placeholder: 'Lawson Portal' },
      { k: 'sub', label: 'Subtitle', placeholder: 'S3' },
      { k: 'icon', label: 'Icon', type: 'icon' },
      { k: 'url', label: 'URL', placeholder: 'https://…', full: true }
    ]
  },
  environment: {
    title: 'Environment',
    fields: [
      { k: 'name', label: 'Name', required: true, placeholder: 'Production (PROD)' },
      { k: 'short', label: 'Short code', placeholder: 'PROD' }
    ]
  },
  quickLink: {
    title: 'Quick link group',
    fields: [
      { k: 'name', label: 'Name', required: true, placeholder: 'SharePoint' },
      { k: 'url', label: 'URL', placeholder: 'Optional — leave blank for a hover menu only', full: true }
    ]
  },
  quickSubLink: {
    title: 'Link in a group',
    fields: [
      { k: 'parentId', label: 'Group', type: 'select', options: () => state.quickLinks.map((g) => ({ v: g.id, t: g.name })), required: true },
      { k: 'name', label: 'Name', required: true, placeholder: 'Finance SharePoint' },
      { k: 'url', label: 'URL', required: true, placeholder: 'https://…', full: true }
    ]
  },
  database: {
    title: 'Database',
    fields: [
      { k: 'name', label: 'Display name', required: true, placeholder: 'Lawson S3 — PROD' },
      { k: 'env', label: 'Environment', type: 'datalist', options: () => ['PROD', 'PRODSUP', 'UAT', 'SIT'] },
      { k: 'system', label: 'System', type: 'datalist', options: () => [...new Set(state.databases.map((d) => d.system).filter(Boolean))] },
      { k: 'server', label: 'Database server', required: true, placeholder: 'sqlprod01.corp.local' },
      { k: 'database', label: 'Database name', required: true, placeholder: 'LAWSONDB' },
      { k: 'port', label: 'Port', placeholder: '1433' },
      { k: 'username', label: 'Username', placeholder: 'optional' },
      { k: 'notes', label: 'Notes', type: 'textarea', full: true }
    ]
  },
  resource: {
    title: 'Resource',
    fields: [
      { k: 'url', label: 'URL', required: true, placeholder: 'https://…', full: true },
      { k: 'title', label: 'Title', placeholder: 'Left blank → derived from the link' },
      { k: 'thumbnail', label: 'Thumbnail URL', placeholder: 'Optional — YouTube links fill this automatically' },
      { k: 'category', label: 'Category', type: 'datalist', options: () => [...new Set(['Blog', 'Video', 'Docs', 'SharePoint', 'Tool', ...state.resources.map((r) => r.category).filter(Boolean)])] },
      { k: 'tags', label: 'Tags (comma separated)', placeholder: 'sql, performance' },
      { k: 'notes', label: 'Notes', type: 'textarea', full: true }
    ]
  }
};

let modalCtx = null; // { kind, item, extra }

function openModal(kind, item = null, extra = {}) {
  if (!kind) return;
  modalCtx = { kind, item, extra };
  const schema = SCHEMAS[kind];
  $('#modalTitle').textContent = (item ? 'Edit ' : 'Add ') + schema.title.toLowerCase();

  const form = $('#modalForm');
  form.innerHTML = '';

  if (!item && kind === 'chooser') return;

  schema.fields.forEach((f) => {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', null, esc(f.label) + (f.required ? ' *' : '')));
    let input;
    const value = item ? (item[f.k] ?? '') : (extra[f.k] ?? '');

    if (f.type === 'select') {
      input = el('select');
      f.options().forEach((o) => {
        const opt = el('option', null, esc(o.t));
        opt.value = o.v;
        input.appendChild(opt);
      });
      input.value = value || (f.options()[0]?.v ?? '');
    } else if (f.type === 'textarea') {
      input = el('textarea');
      input.value = value;
    } else if (f.type === 'icon') {
      input = el('select');
      ICON_NAMES.forEach((g) => {
        const opt = el('option', null, g);
        opt.value = g;
        input.appendChild(opt);
      });
      input.value = value || 'globe';
      const preview = el('div', 'icon-preview');
      preview.innerHTML = iconHtml(input.value);
      input.addEventListener('change', () => { preview.innerHTML = iconHtml(input.value); });
      wrap.appendChild(preview);
    } else if (f.type === 'datalist') {
      input = el('input');
      input.value = value;
      const listId = 'dl-' + f.k;
      input.setAttribute('list', listId);
      const dl = el('datalist');
      dl.id = listId;
      f.options().forEach((o) => {
        const opt = el('option');
        opt.value = o;
        dl.appendChild(opt);
      });
      wrap.appendChild(dl);
    } else {
      input = el('input');
      input.value = value;
    }
    if (f.placeholder) input.placeholder = f.placeholder;
    input.dataset.key = f.k;
    wrap.appendChild(input);
    form.appendChild(wrap);
  });

  $('#overlay').classList.remove('hidden');
  form.querySelector('input,select,textarea')?.focus();
}

function openChooser() {
  modalCtx = { kind: 'chooser' };
  $('#modalTitle').textContent = 'What do you want to add?';
  const form = $('#modalForm');
  form.innerHTML = '';
  const opts = [
    ['tile', 'Launcher tile', 'A button inside an environment'],
    ['environment', 'Environment', 'A new environment page panel (PROD, UAT, …)'],
    ['quickLink', 'Quick link group', 'Top bar entry: SharePoint, Azure DevOps, Intranet…'],
    ['quickSubLink', 'Link in a group', 'One site inside a top bar hover menu'],
    ['database', 'Database', 'Server + database name per environment'],
    ['resource', 'Resource', 'Blog post, YouTube video, docs…']
  ];
  opts.forEach(([kind, title, desc]) => {
    const b = el('button', 'btn', `<div style="text-align:left"><div>${title}</div><div class="hint">${desc}</div></div>`);
    b.type = 'button';
    b.style.padding = '12px 14px';
    b.addEventListener('click', () => openModal(kind, null, kind === 'tile' ? { envId: state.environments[page * ENVS_PER_PAGE]?.id } : {}));
    form.appendChild(b);
  });
  $('#overlay').classList.remove('hidden');
}

function closeModal() {
  $('#overlay').classList.add('hidden');
  modalCtx = null;
}

function saveModal() {
  if (!modalCtx || modalCtx.kind === 'chooser') return closeModal();
  const { kind, item } = modalCtx;
  const schema = SCHEMAS[kind];
  const values = {};
  $('#modalForm').querySelectorAll('[data-key]').forEach((i) => { values[i.dataset.key] = i.value.trim(); });

  for (const f of schema.fields) {
    if (f.required && !values[f.k]) return toast(f.label + ' is required');
  }

  if (kind === 'tile') {
    const targetEnv = state.environments.find((e) => e.id === values.envId);
    if (!targetEnv) return toast('Pick an environment');
    if (item) {
      const owner = state.environments.find((e) => e.tiles.some((t) => t.id === item.id));
      if (owner && owner !== targetEnv) owner.tiles = owner.tiles.filter((t) => t.id !== item.id);
      Object.assign(item, { label: values.label, sub: values.sub, icon: values.icon, url: values.url });
      if (owner !== targetEnv && !targetEnv.tiles.includes(item)) targetEnv.tiles.push(item);
    } else {
      targetEnv.tiles.push({ id: uid(), label: values.label, sub: values.sub, icon: values.icon, url: values.url });
    }
  } else if (kind === 'quickLink') {
    if (item) Object.assign(item, { name: values.name, url: values.url });
    else state.quickLinks.push(normalizeQuickLink({ name: values.name, url: values.url }));
  } else if (kind === 'quickSubLink') {
    const target = findQuickGroup(values.parentId);
    if (!target) return toast('Pick a group');
    if (item) {
      const owner = findQuickItem(item.id)?.group;
      if (owner && owner !== target) owner.items = owner.items.filter((i) => i.id !== item.id);
      Object.assign(item, { name: values.name, url: values.url });
      if (!target.items.includes(item)) target.items.push(item);
    } else {
      target.items.push({ id: uid(), name: values.name, url: values.url });
    }
  } else if (kind === 'environment') {
    if (item) Object.assign(item, { name: values.name, short: values.short });
    else state.environments.push({ id: uid(), name: values.name, short: values.short, tiles: [] });
  } else {
    const key = { database: 'databases', resource: 'resources' }[kind];
    if (item) Object.assign(item, values);
    else state[key].push({ id: uid(), ...values });
  }

  save();
  closeModal();
  render();
  toast('Saved');
}

/* ---------- backup ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = el('a');
  a.href = URL.createObjectURL(blob);
  a.download = `launchpad-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      state = {
        quickLinks: (data.quickLinks || []).map(normalizeQuickLink),
        environments: data.environments || [],
        databases: data.databases || [],
        resources: data.resources || []
      };
      page = 0;
      save(); render(); toast('Backup imported');
    } catch (e) {
      toast('That file is not a valid backup');
    }
  };
  reader.readAsText(file);
}

/* ---------- wiring ---------- */
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('.tab');
  if (!b) return;
  view = b.dataset.view;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === b));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('hidden', v.id !== 'view-' + view));
  render();
});
$('#prevPage').addEventListener('click', () => turnPage(-1));
$('#nextPage').addEventListener('click', () => turnPage(1));
$('#addBtn').addEventListener('click', () => {
  if (view === 'databases') return openModal('database');
  if (view === 'resources') return openModal('resource');
  openChooser();
});
$('#search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); render(); });
$('#modalClose').addEventListener('click', closeModal);
$('#modalCancel').addEventListener('click', closeModal);
$('#modalSave').addEventListener('click', saveModal);
$('#modalForm').addEventListener('submit', (e) => { e.preventDefault(); saveModal(); });
$('#modalForm').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); saveModal(); }
});
$('#overlay').addEventListener('mousedown', (e) => { if (e.target.id === 'overlay') closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); $('#moreMenu').classList.add('hidden'); }
  if (view === 'launcher' && !modalCtx && document.activeElement !== $('#search')) {
    if (e.key === 'ArrowLeft') turnPage(-1);
    if (e.key === 'ArrowRight') turnPage(1);
  }
});
$('#moreBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  $('#moreMenu').classList.toggle('hidden');
});
document.addEventListener('click', () => $('#moreMenu').classList.add('hidden'));
$('#moreMenu').addEventListener('click', (e) => {
  const a = e.target.closest('button')?.dataset.action;
  if (a === 'export') exportData();
  if (a === 'import') $('#importFile').click();
  if (a === 'reset') {
    if (confirm('Replace everything with the default layout? Export a backup first if unsure.')) {
      state = defaults(); page = 0; save(); render();
    }
  }
});
$('#importFile').addEventListener('change', (e) => {
  if (e.target.files[0]) importData(e.target.files[0]);
  e.target.value = '';
});

save();
render();
