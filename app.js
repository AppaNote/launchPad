/* LaunchPad — local-first launcher, database registry and resource library.
   All data lives in localStorage and is never removed unless the user deletes it. */

const STORE_KEY = 'launchpad.v1';
/* Background photo is kept under its own key so a large image can never block saving the main data. */
const BG_KEY = 'launchpad.bg';
const NOTES_KEY = 'launchpad.notes';
const SPLIT_KEY = 'launchpad.mdSplit';
const OUTLINE_KEY = 'launchpad.mdOutline';
const BG_MAX_SIDE = 1920;
const ENVS_PER_PAGE = 2;
const LAYOUT_VERSION = 2;

/* Themes are pure CSS variable sets; the swatch colours mirror --accent/--accent2. */
const THEMES = [
  { id: 'sunny',   name: 'Sunny',   colors: ['#ffd84d', '#f5a623'] },
  { id: 'aurora',  name: 'Aurora',  colors: ['#7fd3ff', '#b79bff'] },
  { id: 'gold',    name: 'Gold',    colors: ['#f2c14e', '#d9a01f'] },
  { id: 'emerald', name: 'Emerald', colors: ['#57e8ae', '#29b6c9'] },
  { id: 'rose',    name: 'Rose',    colors: ['#ff9ec0', '#c07bff'] },
  { id: 'slate',   name: 'Slate',   colors: ['#9fb4cc', '#6d86a3'] }
];
const DEFAULT_THEME = 'sunny';

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
  note:     SVG('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>'),
  link:     SVG('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L11.5 7"/><path d="M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 109 18.7l1.5-1.5"/>')
};
const ICON_NAMES = Object.keys(ICONS);
/* App-icon gradient per glyph, iPad style. */
const ICON_COLORS = {
  globe: ['#4facfe', '#1f7ae0'], grid: ['#a18cd1', '#6f4fe8'], money: ['#43e97b', '#16a35a'],
  tools: ['#f7971e', '#e0600f'], chart: ['#5ee7df', '#2484d0'], docs: ['#ff9a9e', '#e0507f'],
  clock: ['#ffb347', '#f2763b'], org: ['#7fd6ff', '#3b74e8'], robot: ['#c471f5', '#7a3fe0'],
  database: ['#7b93c7', '#3a4c86'], health: ['#ff6a88', '#d9284a'], folder: ['#ffd24a', '#e39a07'],
  book: ['#ff9966', '#e0502b'], gear: ['#9aa8b5', '#5b6873'], lock: ['#5b7fd1', '#2a3f86'],
  mail: ['#36d1dc', '#1b82d6'], cloud: ['#74ebd5', '#2fa8c0'], video: ['#f857a6', '#c92a68'],
  search: ['#38ef7d', '#0f9488'], note: ['#ffd86b', '#f0a020'], link: ['#b993d6', '#7d8fd8']
};
const iconStyle = (name) => {
  const [c1, c2] = ICON_COLORS[name] || ICON_COLORS.globe;
  return `--c1:${c1};--c2:${c2}`;
};
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
    layoutVersion: LAYOUT_VERSION,
    quickLinks: [
      { id: uid(), name: 'Intranet', url: '', items: [] },
      { id: uid(), name: 'SharePoint', url: '', items: [
        { id: uid(), name: 'Team site', url: '' },
        { id: uid(), name: 'Finance', url: '' }
      ] },
      { id: uid(), name: 'Azure DevOps', url: '', items: [
        { id: uid(), name: 'Boards', url: '' },
        { id: uid(), name: 'Repos', url: '' },
        { id: uid(), name: 'Pipelines', url: '' }
      ] },
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
    resources: [],
    theme: DEFAULT_THEME
  };
}

let state = load();
let page = 0;
let view = 'launcher';
let dbFilter = 'All';
let resFilter = 'All';
let query = '';
let bg = loadBg();
let notes = loadNotes();

/* v2 moved the Intranet quick link to the front of the bar. */
function intranetFirst(groups) {
  const i = groups.findIndex((g) => g.name.trim().toLowerCase() === 'intranet');
  if (i > 0) groups.unshift(groups.splice(i, 1)[0]);
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaults();
    const data = JSON.parse(raw);
    const quickLinks = (data.quickLinks || []).map(normalizeQuickLink);
    if ((data.layoutVersion || 1) < 2) intranetFirst(quickLinks);
    return {
      layoutVersion: LAYOUT_VERSION,
      quickLinks,
      environments: data.environments || [],
      databases: data.databases || [],
      resources: data.resources || [],
      theme: THEMES.some((t) => t.id === data.theme) ? data.theme : DEFAULT_THEME
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

/* ---------- theme ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = state.theme || DEFAULT_THEME;
  renderThemePicker();
}
function renderThemePicker() {
  const wrap = $('#themePicker');
  if (!wrap) return;
  wrap.innerHTML = '';
  THEMES.forEach((t) => {
    const b = el('button', 'swatch' + (t.id === state.theme ? ' active' : ''));
    b.type = 'button';
    b.title = t.name;
    b.style.background = `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      state.theme = t.id;
      save();
      applyTheme();
    });
    wrap.appendChild(b);
  });
}

/* ---------- background ---------- */
function loadBg() {
  try {
    const data = JSON.parse(localStorage.getItem(BG_KEY) || '{}');
    return { src: data.src || '', blur: Number(data.blur) || 0 };
  } catch (e) {
    return { src: '', blur: 0 };
  }
}
function saveBg() {
  try {
    localStorage.setItem(BG_KEY, JSON.stringify(bg));
    return true;
  } catch (e) {
    toast('Image is too large to save — try a smaller one');
    return false;
  }
}
function applyBackground() {
  document.body.classList.toggle('has-image', !!bg.src);
  const node = $('#bg');
  node.style.setProperty('--bg-image', bg.src ? `url("${bg.src.replace(/"/g, '%22')}")` : 'none');
  node.style.setProperty('--bg-blur', bg.blur + 'px');
  $('#bgBlur').value = bg.blur;
}
function setBackground(src) {
  const prev = bg.src;
  bg.src = src;
  if (!saveBg()) bg.src = prev;
  applyBackground();
}
/* Uploaded photos are downscaled to JPEG so they fit comfortably in localStorage. */
function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, BG_MAX_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- rendering ---------- */
function render() {
  renderGreeting();
  renderStats();
  renderQuickLinks();
  if (view === 'launcher') renderLauncher();
  if (view === 'databases') renderDatabases();
  if (view === 'resources') renderResources();
  if (view === 'notes') renderNotes();
}

function renderGreeting() {
  const h = new Date().getHours();
  $('#greeting').textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  $('#subGreeting').textContent = new Date().toLocaleDateString(undefined,
    { weekday: 'long', month: 'long', day: 'numeric' }) + ' · here’s your workspace.';
}

function renderStats() {
  const wrap = $('#stats');
  wrap.innerHTML = '';
  const tiles = state.environments.reduce((n, e) => n + e.tiles.length, 0);
  [
    ['Environments', state.environments.length, 'cloud', 'launcher'],
    ['Launch tiles', tiles, 'grid', 'launcher'],
    ['Databases', state.databases.length, 'database', 'databases'],
    ['Resources', state.resources.length, 'book', 'resources'],
    ['Notes', notes.length, 'note', 'notes']
  ].forEach(([label, value, icon, target]) => {
    const b = el('button', 'stat glass');
    b.type = 'button';
    b.innerHTML = `<span class="ic">${iconHtml(icon)}</span>
      <span><span class="k">${esc(label)}</span><span class="v">${value}</span></span>`;
    b.addEventListener('click', () => setView(target));
    wrap.appendChild(b);
  });
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
      <div class="glyph" style="${iconStyle(t.icon)}">${iconHtml(t.icon)}</div>
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
  save(); render(); toast('Deleted');
}
function removeEnvironment(env) {
  if (!confirm(`Delete environment "${env.name}" and its ${env.tiles.length} tiles?`)) return;
  state.environments = state.environments.filter((e) => e.id !== env.id);
  save(); render(); toast('Deleted');
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
  noteName: {
    title: 'File name',
    heading: 'Save as',
    fields: [
      { k: 'name', label: 'File name (with extension)', required: true, placeholder: 'meeting-notes.md' }
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
  $('#modalTitle').textContent = schema.heading || (item ? 'Edit ' : 'Add ') + schema.title.toLowerCase();

  const form = $('#modalForm');
  form.innerHTML = '';

  if (!item && kind === 'chooser') return;

  schema.fields.forEach((f) => {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', null, esc(f.label) + (f.required ? ' *' : '')));
    let input;
    const value = item?.[f.k] ?? extra[f.k] ?? '';

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
    ['resource', 'Resource', 'Blog post, YouTube video, docs…'],
    ['note', 'Markdown note', 'Opens the Markdown editor for a new file']
  ];
  opts.forEach(([kind, title, desc]) => {
    const b = el('button', 'btn', `<div style="text-align:left"><div>${title}</div><div class="hint">${desc}</div></div>`);
    b.type = 'button';
    b.style.padding = '12px 14px';
    b.addEventListener('click', () => kind === 'note' ? (closeModal(), openEditor(null)) : openModal(kind, null, kind === 'tile' ? { envId: state.environments[page * ENVS_PER_PAGE]?.id } : {}));
    form.appendChild(b);
  });
  $('#overlay').classList.remove('hidden');
}

function closeModal() {
  $('#overlay').classList.add('hidden');
  modalCtx = null;
}

/* Looks an item up in the current state, which another tab may have reloaded since the modal opened. */
function currentItem(kind, id) {
  if (kind === 'tile') {
    for (const env of state.environments) {
      const t = env.tiles.find((x) => x.id === id);
      if (t) return t;
    }
    return null;
  }
  if (kind === 'quickLink') return findQuickGroup(id);
  if (kind === 'quickSubLink') return findQuickItem(id)?.item || null;
  if (kind === 'environment') return state.environments.find((e) => e.id === id) || null;
  const key = { database: 'databases', resource: 'resources' }[kind];
  return state[key].find((x) => x.id === id) || null;
}

function saveModal() {
  if (!modalCtx || modalCtx.kind === 'chooser') return closeModal();
  const { kind } = modalCtx;
  const item = modalCtx.item ? currentItem(kind, modalCtx.item.id) : null;
  const schema = SCHEMAS[kind];
  const values = {};
  $('#modalForm').querySelectorAll('[data-key]').forEach((i) => { values[i.dataset.key] = i.value.trim(); });

  for (const f of schema.fields) {
    if (f.required && !values[f.k]) return toast(f.label + ' is required');
  }

  if (kind === 'noteName') return saveNoteAs(values.name);
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

/* ---------- markdown (self-contained, escapes all raw HTML) ---------- */
function safeUrl(u, img) {
  u = u.trim().replace(/^<|>$/g, '');
  if (/^(https?:|mailto:|#|\/|\.\.?\/)/i.test(u)) return u;
  if (img && /^data:image\//i.test(u)) return u;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
  return '';
}
function slug(text) {
  return text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}
function linkHtml(url, inner) {
  const u = safeUrl(url);
  if (!u) return inner;
  const ext = u.startsWith('#') ? '' : ' target="_blank" rel="noopener"';
  return `<a href="${esc(u)}"${ext}>${inner}</a>`;
}
function mdInline(src) {
  const stash = [];
  const hold = (html) => `\u0000${stash.push(html) - 1}\u0000`;
  let s = src;
  s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => hold(`<code>${esc(code.trim())}</code>`));
  s = s.replace(/\\([\\`*_{}[\]()#+\-.!~=|>])/g, (_, c) => hold(esc(c)));
  s = s.replace(/!\[([^\]]*)\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+"([^"]*)")?\s*\)/g, (_, alt, url, title) => {
    const u = safeUrl(url, true);
    return hold(u ? `<img src="${esc(u)}" alt="${esc(alt)}"${title ? ` title="${esc(title)}"` : ''}>` : esc(alt));
  });
  s = s.replace(/\[([^\]]+)\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+"([^"]*)")?\s*\)/g, (_, text, url) => hold(linkHtml(url, mdInline(text))));
  s = s.replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, (_, url) => hold(linkHtml(url, esc(url))));
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<]*[^\s<).,;:!?'"])/g, (_, pre, url) => pre + hold(linkHtml(url, esc(url))));
  s = esc(s)
    .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/__(?=\S)([\s\S]*?\S)__/g, '<strong>$1</strong>')
    .replace(/\*(?=\S)([\s\S]*?\S)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_(?=\S)([\s\S]*?\S)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
    .replace(/==(?=\S)([\s\S]*?\S)==/g, '<mark>$1</mark>')
    .replace(/\n/g, '<br>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[i]);
}
const HL_LANGS = {
  sql: { c: /--[^\n]*|\/\*[\s\S]*?\*\//, s: /'(?:''|[^'])*'|"[^"\n]*"|\[[^\]\n]+\]/, ci: true,
    kw: 'select from where and or not insert into values update set delete create alter drop table view index join inner left right full outer cross apply on as group by order having limit top distinct union all except intersect exists in is null like between case when then else end begin commit rollback transaction tran declare with over partition primary key foreign references default go exec execute procedure proc function returns return if while cast convert asc desc nolock merge using matched output truncate count sum avg min max coalesce isnull getdate varchar nvarchar int bigint decimal numeric date datetime bit char text' },
  python: { c: /#[^\n]*/, s: /[rbfuRBFU]{0,2}"""[\s\S]*?"""|[rbfuRBFU]{0,2}'''[\s\S]*?'''|[rbfuRBFU]{0,2}"(?:\\.|[^"\\\n])*"|[rbfuRBFU]{0,2}'(?:\\.|[^'\\\n])*'/,
    kw: 'def class return if elif else for while in not and or is None True False import from as with try except finally raise lambda yield pass break continue global nonlocal async await del assert self print len range' },
  js: { c: /\/\/[^\n]*|\/\*[\s\S]*?\*\//, s: /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/,
    kw: 'const let var function return if else for while do switch case break continue new this class extends import export from default try catch finally throw typeof instanceof in of async await null undefined true false yield public private protected static void int string bool using namespace interface enum' },
  bash: { c: /#[^\n]*/, s: /"(?:\\.|[^"\\])*"|'[^']*'/,
    kw: 'if then else elif fi for while do done case esac in function return export local echo exit cd ls sudo' },
  powershell: { c: /<#[\s\S]*?#>|#[^\n]*/, s: /"(?:`.|[^"`])*"|'(?:''|[^'])*'/, ci: true,
    kw: 'function param if elseif else foreach for while do switch return try catch finally throw begin process end in write-host get-item set-item get-childitem import-module -eq -ne -gt -lt -ge -le -like -match -and -or -not $true $false $null' }
};
const HL_ALIAS = { javascript: 'js', ts: 'js', typescript: 'js', json: 'js', java: 'js', c: 'js', cpp: 'js', 'c++': 'js', cs: 'js', csharp: 'js', 'c#': 'js',
  py: 'python', python3: 'python', tsql: 'sql', 't-sql': 'sql', mssql: 'sql', mysql: 'sql', postgres: 'sql', postgresql: 'sql', plsql: 'sql', sqlite: 'sql',
  sh: 'bash', shell: 'bash', zsh: 'bash', ps: 'powershell', ps1: 'powershell', pwsh: 'powershell' };
function highlight(code, lang) {
  const key = String(lang || '').toLowerCase();
  const h = HL_LANGS[HL_ALIAS[key] || key];
  if (!h) return esc(code);
  h.set = h.set || new Set(h.kw.split(' '));
  h.re = h.re || new RegExp(`(${h.c.source})|(${h.s.source})|(\\b\\d+(?:\\.\\d+)?\\b)|([-$@]?[A-Za-z_][\\w$-]*)`, 'g' + (h.s.flags.includes('i') ? 'i' : ''));
  let out = '';
  let last = 0;
  code.replace(h.re, (m, c, s, n, w, idx) => {
    out += esc(code.slice(last, idx));
    last = idx + m.length;
    if (c) out += `<span class="tk-c">${esc(m)}</span>`;
    else if (s) out += `<span class="tk-s">${esc(m)}</span>`;
    else if (n) out += `<span class="tk-n">${esc(m)}</span>`;
    else if (h.set.has(h.ci ? w.toLowerCase() : w)) out += `<span class="tk-k">${esc(m)}</span>`;
    else if (code[last] === '(') out += `<span class="tk-f">${esc(m)}</span>`;
    else out += esc(m);
    return m;
  });
  return out + esc(code.slice(last));
}
let mdHeadings = [];
let mdSlugs = {};
function headingId(html) {
  const base = slug(html) || 'section';
  const n = mdSlugs[base] = (mdSlugs[base] || 0) + 1;
  return n === 1 ? base : `${base}-${n}`;
}
function tocHtml() {
  if (!mdHeadings.length) return '<nav class="md-toc"><em>No headings yet</em></nav>';
  return `<nav class="md-toc">${mdHeadings.map((h) =>
    `<a href="#${esc(h.id)}" class="toc-l${h.level}">${h.html.replace(/<\/?a\b[^>]*>/g, '')}</a>`).join('')}</nav>`;
}
const MD_FENCE = /^ {0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/;
const MD_LIST = /^( *)([-*+]|\d+[.)])\s+(.*)$/;
const MD_TABLE_SEP = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
function mdIsBlockStart(lines, i) {
  const l = lines[i];
  return MD_FENCE.test(l) || /^ {0,3}#{1,7}\s/.test(l) || /^\s*\[toc\]\s*$/i.test(l) || /^ {0,3}>/.test(l) || MD_LIST.test(l) ||
    /^ {0,3}([-*_])(\s*\1){2,}\s*$/.test(l) ||
    (l.includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1]));
}
function mdTableRow(l) {
  return l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}
function mdList(lines, start) {
  const first = lines[start].match(MD_LIST);
  const indent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  let i = start;
  while (i < lines.length) {
    const m = lines[i].match(MD_LIST);
    if (!m || m[1].length !== indent || /\d/.test(m[2]) !== ordered) break;
    const contentIndent = lines[i].length - m[3].length;
    const body = [m[3]];
    i++;
    while (i < lines.length) {
      const l = lines[i];
      const ind = l.match(/^ */)[0].length;
      if (!l.trim()) {
        const next = lines.slice(i + 1).find((x) => x.trim());
        if (next !== undefined && next.match(/^ */)[0].length > indent) { body.push(''); i++; continue; }
        break;
      }
      if (ind > indent) { body.push(l.slice(Math.min(ind, contentIndent))); i++; continue; }
      if (ind < indent || mdIsBlockStart(lines, i)) break;
      body.push(l.trim()); i++;
    }
    items.push(body);
  }
  const tag = ordered ? 'ol' : 'ul';
  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const html = items.map((body) => {
    let text = body[0];
    let task = '';
    const t = text.match(/^\[([ xX])\]\s+(.*)$/);
    if (t) { task = `<input type="checkbox" disabled${t[1] !== ' ' ? ' checked' : ''}> `; text = t[2]; }
    const rest = body.slice(1);
    const para = [text];
    let j = 0;
    while (j < rest.length && rest[j].trim() && !mdIsBlockStart(rest, j)) para.push(rest[j++]);
    return `<li${task ? ' class="task"' : ''}>${task}${mdInline(para.join('\n'))}${mdBlocks(rest.slice(j))}</li>`;
  }).join('');
  return { html: `<${tag}${startNum !== 1 ? ` start="${startNum}"` : ''}>${html}</${tag}>`, next: i };
}
function mdBlocks(lines) {
  let out = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m = line.match(MD_FENCE);
    if (m) {
      const fence = m[1];
      const buf = [];
      i++;
      const close = new RegExp(`^ {0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`);
      while (i < lines.length && !close.test(lines[i])) buf.push(lines[i++]);
      i++;
      const lang = m[2];
      out += `<div class="md-code">${lang ? `<span class="md-lang">${esc(lang)}</span>` : ''}` +
        `<button type="button" class="md-copy" title="Copy code">Copy</button>` +
        `<pre><code${lang ? ` class="lang-${esc(lang)}"` : ''}>${highlight(buf.join('\n'), lang)}</code></pre></div>`;
      continue;
    }
    if (/^\s*\[toc\]\s*$/i.test(line)) { out += '<div class="md-toc-slot"></div>'; i++; continue; }
    m = line.match(/^ {0,3}(#{1,7})(?:\s+(.*?))?\s*#*\s*$/);
    if (m && m[2] !== undefined) {
      const level = m[1].length;
      const html = mdInline(m[2]);
      const id = headingId(html);
      mdHeadings.push({ level, id, html });
      out += level === 7
        ? `<div class="h7" role="heading" aria-level="7" id="${esc(id)}">${html}</div>`
        : `<h${level} id="${esc(id)}">${html}</h${level}>`;
      i++;
      continue;
    }
    if (/^ {0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) { out += '<hr>'; i++; continue; }
    if (/^ {0,3}>/.test(line)) {
      const buf = [];
      while (i < lines.length && lines[i].trim() && /^ {0,3}>/.test(lines[i])) buf.push(lines[i++].replace(/^ {0,3}> ?/, ''));
      out += `<blockquote>${mdBlocks(buf)}</blockquote>`;
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1])) {
      const heads = mdTableRow(line);
      const aligns = mdTableRow(lines[i + 1]).map((c) =>
        c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : c.startsWith(':') ? 'left' : '');
      const cell = (tag, c, k) => `<${tag}${aligns[k] ? ` style="text-align:${aligns[k]}"` : ''}>${mdInline(c || '')}</${tag}>`;
      i += 2;
      let body = '';
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        const cells = mdTableRow(lines[i++]);
        body += `<tr>${heads.map((_, k) => cell('td', cells[k], k)).join('')}</tr>`;
      }
      out += `<table><thead><tr>${heads.map((h, k) => cell('th', h, k)).join('')}</tr></thead><tbody>${body}</tbody></table>`;
      continue;
    }
    if (MD_LIST.test(line)) {
      const r = mdList(lines, i);
      out += r.html;
      i = r.next;
      continue;
    }
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !mdIsBlockStart(lines, i)) buf.push(lines[i++]);
    out += `<p>${mdInline(buf.join('\n'))}</p>`;
  }
  return out;
}
function mdFrontMatter(text) {
  const fm = text.match(/^---\n([\s\S]*?)\n(?:---|\.\.\.)[ \t]*(?:\n|$)/);
  if (!fm) return { meta: null, body: text };
  const meta = {};
  fm[1].split('\n').forEach((l) => {
    const m = l.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
    if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^(["'])(.*)\1$/, '$2');
  });
  return { meta, body: text.slice(fm[0].length) };
}
function mdToHtml(src) {
  const { meta, body } = mdFrontMatter(String(src || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    '));
  mdHeadings = [];
  mdSlugs = {};
  let head = '';
  if (meta) {
    const subject = meta.subject || meta.title;
    const info = ['author', 'date', 'tags'].filter((k) => meta[k]).map((k) => esc(meta[k])).join(' · ');
    if (subject) head += `<div class="md-subject">${mdInline(subject)}</div>`;
    if (info) head += `<div class="md-meta">${info}</div>`;
  }
  const html = mdBlocks(body.split('\n'));
  return head + html.replace(/<div class="md-toc-slot"><\/div>/g, tocHtml);
}

/* ---------- notes (markdown files kept in their own storage key) ---------- */
function loadNotes() {
  try {
    const list = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    return Array.isArray(list) ? list.map(normalizeNote) : [];
  } catch (e) {
    return [];
  }
}
function normalizeNote(n) {
  const now = Date.now();
  return { id: n.id || uid(), name: String(n.name || 'Untitled.md'), content: String(n.content || ''),
    created: Number(n.created) || now, updated: Number(n.updated) || now };
}
function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (e) {
    toast('Browser storage is full — export a backup and delete old notes');
    return false;
  }
}
function fmtDate(ms) {
  return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function cleanFileName(name) {
  let n = String(name || '').trim().replace(/[\\/:*?"<>|]+/g, '-');
  if (!n) return '';
  if (!/\.[a-z0-9]{1,10}$/i.test(n)) n += '.md';
  return n;
}
function uniqueName(name, exceptId) {
  const taken = (n) => notes.some((x) => x.id !== exceptId && x.name.toLowerCase() === n.toLowerCase());
  if (!taken(name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let k = 2;
  while (taken(`${base} (${k})${ext}`)) k++;
  return `${base} (${k})${ext}`;
}

function renderNotes() {
  const wrap = $('#notesList');
  wrap.innerHTML = '';
  const add = el('button', 'note-card note-new', `<div class="note-page">${UI.plus}</div><div class="note-name">New note</div>`);
  add.type = 'button';
  add.addEventListener('click', () => openEditor(null));
  wrap.appendChild(add);
  [...notes].sort((a, b) => b.updated - a.updated)
    .filter((n) => matches(n.name, n.content))
    .forEach((n) => {
      const card = el('div', 'note-card');
      card.tabIndex = 0;
      card.title = n.name;
      card.innerHTML = `
        <div class="note-page"><div class="note-thumb md">${mdToHtml(n.content.slice(0, 1600))}</div></div>
        <div class="tile-actions">
          <span class="icon-btn" data-a="rename" title="Rename">${UI.edit}</span>
          <span class="icon-btn" data-a="del" title="Delete">${UI.trash}</span>
        </div>
        <div class="note-name">${esc(n.name)}</div>
        <div class="note-date">${esc(fmtDate(n.updated))}</div>`;
      card.addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]')?.dataset.a;
        if (a === 'rename') return renameNote(n);
        if (a === 'del') return deleteNote(n);
        openEditor(n.id);
      });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openEditor(n.id); });
      wrap.appendChild(card);
    });
  $('#notesEmpty').classList.toggle('hidden', notes.length > 0);
}
function renameNote(n) {
  const next = cleanFileName(prompt('Rename file', n.name));
  if (!next || next === n.name) return;
  if (notes.some((x) => x.id !== n.id && x.name.toLowerCase() === next.toLowerCase())) return toast(`"${next}" already exists`);
  n.name = next;
  n.updated = Date.now();
  saveNotes(); render(); toast('Renamed');
}
function deleteNote(n) {
  if (!confirm(`Delete "${n.name}"? This cannot be undone.`)) return;
  notes = notes.filter((x) => x.id !== n.id);
  saveNotes(); render(); toast('Deleted');
}
function importMarkdownFiles(files) {
  const list = [...files].filter((f) => /\.(md|markdown|mdown|txt)$/i.test(f.name) || f.type.startsWith('text/'));
  if (!list.length) return toast('Pick a .md or .txt file');
  let done = 0;
  list.forEach((f) => {
    const reader = new FileReader();
    reader.onload = () => {
      const now = Date.now();
      notes.push({ id: uid(), name: uniqueName(cleanFileName(f.name)), content: String(reader.result), created: now, updated: now });
      if (++done === list.length) {
        saveNotes(); render();
        toast(list.length === 1 ? `Opened ${list[0].name}` : `Added ${list.length} files`);
        if (list.length === 1) openEditor(notes[notes.length - 1].id);
      }
    };
    reader.readAsText(f);
  });
}

/* editor */
let editor = null; // { id, name, saved, mode }
let previewFrame = 0;
function editorDirty() {
  return !!editor && $('#mdInput').value !== editor.saved;
}
function openEditor(id) {
  const n = id ? notes.find((x) => x.id === id) : null;
  editor = { id: n?.id || null, name: n?.name || '', saved: n?.content || '', mode: n ? 'read' : 'split' };
  $('#mdInput').value = editor.saved;
  $('#mdEditor').classList.remove('hidden');
  document.body.classList.add('editing');
  applySplit(Number(localStorage.getItem(SPLIT_KEY)) || 50);
  setEditorMode(editor.mode);
  updatePreview();
  updateEditorTitle();
  if (editor.mode !== 'read') $('#mdInput').focus();
}
function closeEditor(force) {
  if (!editor) return;
  if (!force && editorDirty() && !confirm('You have unsaved changes. Close without saving?')) return;
  editor = null;
  $('#mdEditor').classList.add('hidden');
  document.body.classList.remove('editing');
  $('#mdExportMenu').classList.add('hidden');
  render();
}
function setEditorMode(mode) {
  editor.mode = mode;
  $('#mdEditor').dataset.mode = mode;
  document.querySelectorAll('#mdModes button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  if (mode !== 'read') $('#mdInput').focus();
}
function updateEditorTitle() {
  if (!editor) return;
  $('#mdName').textContent = editor.name || 'Untitled (not saved yet)';
  $('#mdDirty').classList.toggle('hidden', !editorDirty());
}
function updatePreview() {
  cancelAnimationFrame(previewFrame);
  previewFrame = requestAnimationFrame(() => {
    $('#mdPreview').innerHTML = mdToHtml($('#mdInput').value) ||
      '<p class="md-placeholder">Start typing Markdown on the left — the preview appears here.</p>';
    renderOutline(mdHeadings);
    updateEditorTitle();
  });
}
function renderOutline(heads) {
  const box = $('#mdOutlineList');
  box.innerHTML = heads.length ? '' : '<div class="md-outline-empty">Add headings (# to #######) to build the outline.</div>';
  heads.forEach((h, k) => {
    const a = el('button', `toc-l${h.level}`, h.html.replace(/<\/?a\b[^>]*>/g, ''));
    a.type = 'button';
    a.addEventListener('click', () => jumpToHeading(h.id, k));
    box.appendChild(a);
  });
}
function headingLines(text) {
  const out = [];
  let fence = null;
  text.split('\n').forEach((l, n) => {
    const f = l.match(/^ {0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1];
      else if (f[1][0] === fence[0] && f[1].length >= fence.length) fence = null;
      return;
    }
    if (!fence && /^ {0,3}#{1,7}\s+\S/.test(l)) out.push(n);
  });
  return out;
}
function jumpToHeading(id, k) {
  if (editor.mode !== 'edit') {
    $('#mdPreview').querySelector(`[id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (editor.mode === 'read') return;
  const ta = $('#mdInput');
  const lines = ta.value.split('\n');
  const n = headingLines(ta.value)[k];
  if (n === undefined) return;
  const pos = lines.slice(0, n).reduce((a, l) => a + l.length + 1, 0);
  ta.focus({ preventScroll: true });
  ta.setSelectionRange(pos, pos + lines[n].length);
  if (editor.mode === 'edit') ta.scrollTop = (n / Math.max(1, lines.length)) * ta.scrollHeight - 40;
}
function setOutline(open) {
  $('#mdEditor').classList.toggle('outline-open', open);
  $('#mdOutlineBtn').classList.toggle('active', open);
  localStorage.setItem(OUTLINE_KEY, open ? '1' : '0');
}
function setHeading(level) {
  const ta = $('#mdInput');
  const { value } = ta;
  const s = value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let e = value.indexOf('\n', ta.selectionEnd);
  if (e < 0) e = value.length;
  const block = value.slice(s, e).split('\n')
    .map((l) => (level ? '#'.repeat(level) + ' ' : '') + l.replace(/^ {0,3}#{1,7}\s*/, '')).join('\n');
  ta.setRangeText(block, s, e, 'end');
  ta.focus(); updatePreview();
}
function setSubject() {
  const ta = $('#mdInput');
  let { value } = ta;
  const s = value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let e = value.indexOf('\n', ta.selectionEnd);
  if (e < 0) e = value.length;
  const picked = value.slice(ta.selectionStart, ta.selectionEnd).trim();
  const lineText = value.slice(s, e).replace(/^ {0,3}#{1,7}\s*/, '').trim();
  const { meta } = mdFrontMatter(value);
  const inFront = meta && s < value.indexOf('\n---', 3) + 4;
  const subject = picked || (!inFront && lineText) || prompt('Subject', meta?.subject || meta?.title || '') || '';
  if (!subject) return;
  if (!picked && !inFront && lineText) value = value.slice(0, s) + value.slice(e + (e < value.length ? 1 : 0));
  const line = `subject: ${subject.replace(/\n/g, ' ')}`;
  if (meta) {
    const end = value.indexOf('\n', value.indexOf('\n---', 3) + 1);
    const fm = value.slice(0, end < 0 ? value.length : end);
    const rest = value.slice(fm.length);
    const next = /^\s*(subject|title)\s*:.*$/im.test(fm)
      ? fm.replace(/^\s*(subject|title)\s*:.*$/im, line)
      : fm.replace(/^---\n/, `---\n${line}\n`);
    value = next + rest;
  } else {
    value = `---\n${line}\n---\n\n` + value.replace(/^\n+/, '');
  }
  ta.value = value;
  ta.setSelectionRange(0, 0);
  ta.focus(); updatePreview();
}
function applySplit(pct) {
  const p = Math.min(85, Math.max(15, pct));
  $('#mdEditor').style.setProperty('--split', p + '%');
  return p;
}
function saveNote() {
  if (!editor) return;
  if (!editor.id) return openModal('noteName', null, { name: '' });
  const n = notes.find((x) => x.id === editor.id);
  if (!n) return openModal('noteName', null, { name: editor.name });
  n.content = $('#mdInput').value;
  n.updated = Date.now();
  if (!saveNotes()) return;
  editor.saved = n.content;
  updateEditorTitle(); toast(`Saved ${n.name}`);
}
function saveNoteAs(rawName) {
  const name = cleanFileName(rawName);
  if (!name) return toast('File name is required');
  const content = $('#mdInput').value;
  const now = Date.now();
  let target = notes.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (target && target.id !== editor.id && !confirm(`"${target.name}" already exists. Replace it?`)) return;
  if (target) {
    Object.assign(target, { name, content, updated: now });
  } else {
    target = { id: uid(), name, content, created: now, updated: now };
    notes.push(target);
  }
  if (!saveNotes()) return;
  Object.assign(editor, { id: target.id, name, saved: content });
  closeModal(); updateEditorTitle(); toast(`Saved ${name}`);
}
function download(name, text, type) {
  const a = el('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportMarkdown() {
  const name = (editor.name || 'Untitled.md').replace(/\.[^.]+$/, '') + '.md';
  download(name, $('#mdInput').value, 'text/markdown');
}
function exportPdf() {
  const area = $('#printArea');
  area.innerHTML = `<article class="md">${mdToHtml($('#mdInput').value)}</article>`;
  const title = document.title;
  document.title = (editor.name || 'Untitled').replace(/\.[^.]+$/, '');
  window.print();
  document.title = title;
}
function wrapSelection(before, after = before, placeholder = 'text') {
  const ta = $('#mdInput');
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const sel = value.slice(s, e) || placeholder;
  ta.setRangeText(before + sel + after, s, e, 'end');
  ta.setSelectionRange(s + before.length, s + before.length + sel.length);
  ta.focus(); updatePreview();
}
function prefixLines(prefix) {
  const ta = $('#mdInput');
  const { value } = ta;
  const s = value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let e = value.indexOf('\n', ta.selectionEnd);
  if (e < 0) e = value.length;
  const block = value.slice(s, e).split('\n').map((l, k) => (typeof prefix === 'function' ? prefix(k) : prefix) + l).join('\n');
  ta.setRangeText(block, s, e, 'select');
  ta.focus(); updatePreview();
}
const MD_TOOLS = {
  toc: () => wrapSelection('\n[TOC]\n', '', ''),
  codeblock: () => {
    const lang = prompt('Code language (e.g. sql, python, js, powershell) — leave blank for plain text', 'sql');
    if (lang === null) return;
    wrapSelection('\n```' + lang.trim() + '\n', '\n```\n', 'code');
  },
  bold: () => wrapSelection('**'), italic: () => wrapSelection('*'), strike: () => wrapSelection('~~'),
  code: () => wrapSelection('`', '`', 'code'),
  link: () => wrapSelection('[', '](https://)', 'link text'),
  ul: () => prefixLines('- '), ol: () => prefixLines((k) => `${k + 1}. `), task: () => prefixLines('- [ ] '),
  quote: () => prefixLines('> '),
  table: () => wrapSelection('\n| Column | Column |\n| --- | --- |\n| ', ' |  |\n', 'Cell'),
  hr: () => wrapSelection('\n---\n', '', '')
};

/* ---------- backup ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify({ ...state, background: bg, notes }, null, 2)], { type: 'application/json' });
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
      if (!confirm('Importing replaces the links, databases, resources and notes in this app with the backup. Continue?')) return;
      if (Array.isArray(data.notes)) { notes = data.notes.map(normalizeNote); saveNotes(); }
      state = {
        layoutVersion: LAYOUT_VERSION,
        quickLinks: (data.quickLinks || []).map(normalizeQuickLink),
        environments: data.environments || [],
        databases: data.databases || [],
        resources: data.resources || [],
        theme: THEMES.some((t) => t.id === data.theme) ? data.theme : state.theme
      };
      page = 0;
      if (data.background && typeof data.background.src === 'string') {
        bg = { src: data.background.src, blur: Number(data.background.blur) || 0 };
        saveBg();
        applyBackground();
      }
      applyTheme();
      save(); render(); toast('Backup imported');
    } catch (e) {
      toast('That file is not a valid backup');
    }
  };
  reader.readAsText(file);
}

/* ---------- wiring ---------- */
function setView(next) {
  view = next;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('hidden', v.id !== 'view-' + view));
  render();
}
document.querySelectorAll('.tab').forEach((b) => {
  b.innerHTML = `<span class="tab-ic">${iconHtml(b.dataset.icon)}</span><span class="tab-label">${esc(b.textContent)}</span>`;
});
$('#settingsBtn').innerHTML = iconHtml('gear');
$('#settingsBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  const open = $('#appearance').classList.toggle('open');
  $('#settingsBtn').classList.toggle('active', open);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#appearance, #settingsBtn')) {
    $('#appearance').classList.remove('open');
    $('#settingsBtn').classList.remove('active');
  }
});
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('.tab');
  if (b) setView(b.dataset.view);
});
$('#bgUpload').addEventListener('click', () => $('#bgFile').click());
$('#bgFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    setBackground(await imageFileToDataUrl(file));
  } catch (err) {
    toast('Could not read that image');
  }
});
$('#bgUrl').addEventListener('click', () => {
  const url = prompt('Image URL for the background', bg.src.startsWith('data:') ? '' : bg.src);
  if (url && url.trim()) setBackground(normalizeUrl(url.trim()));
});
$('#bgClear').addEventListener('click', () => setBackground(''));
$('#bgBlur').addEventListener('input', (e) => {
  bg.blur = Number(e.target.value);
  applyBackground();
});
$('#bgBlur').addEventListener('change', saveBg);
$('#prevPage').addEventListener('click', () => turnPage(-1));
$('#nextPage').addEventListener('click', () => turnPage(1));
$('#addBtn').addEventListener('click', () => {
  if (view === 'databases') return openModal('database');
  if (view === 'resources') return openModal('resource');
  if (view === 'notes') return openEditor(null);
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
  if (e.key === 'Escape') {
    $('#moreMenu').classList.add('hidden');
    if (modalCtx) closeModal();
    else if (!$('#mdExportMenu').classList.contains('hidden')) $('#mdExportMenu').classList.add('hidden');
    else if (editor) closeEditor();
  }
  if (editor && !modalCtx && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (e.shiftKey) openModal('noteName', null, { name: editor.name });
    else saveNote();
  }
  if (view === 'launcher' && !modalCtx && !editor && document.activeElement !== $('#search')) {
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
  if (a === 'notes') setView('notes');
  if (a === 'import') $('#importFile').click();
  if (a === 'reset') {
    if (confirm('Replace everything with the default layout? Export a backup first if unsure.')) {
      const theme = state.theme;
      state = defaults(); state.theme = theme; page = 0; save(); applyTheme(); render();
    }
  }
});
$('#bkExport').addEventListener('click', exportData);
$('#bkImport').addEventListener('click', () => $('#importFile').click());
$('#openMd').addEventListener('click', () => $('#mdFile').click());
$('#mdFile').addEventListener('change', (e) => {
  if (e.target.files.length) importMarkdownFiles(e.target.files);
  e.target.value = '';
});
$('#view-notes').addEventListener('dragover', (e) => { e.preventDefault(); });
$('#view-notes').addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length) importMarkdownFiles(e.dataTransfer.files);
});
$('#mdBack').addEventListener('click', () => closeEditor());
$('#mdSave').addEventListener('click', saveNote);
$('#mdSaveAs').addEventListener('click', () => openModal('noteName', null, { name: editor.name }));
$('#mdModes').addEventListener('click', (e) => {
  const m = e.target.closest('button')?.dataset.mode;
  if (m) setEditorMode(m);
});
$('#mdTools').innerHTML = [
  ['toc', 'TOC', 'Insert table of contents [TOC]'], ['bold', '<b>B</b>', 'Bold (Ctrl+B)'],
  ['italic', '<i>I</i>', 'Italic (Ctrl+I)'], ['strike', '<s>S</s>', 'Strikethrough'], ['code', '&lt;/&gt;', 'Inline code'],
  ['codeblock', '{ }', 'Code block (Ctrl+Shift+K)'], ['link', '&#128279;', 'Link (Ctrl+K)'], ['ul', '&bull;', 'Bulleted list'], ['ol', '1.', 'Numbered list'],
  ['task', '&#9744;', 'Task list'], ['quote', '&ldquo;', 'Quote'], ['table', '&#9638;', 'Table'], ['hr', '&mdash;', 'Divider']
].map(([t, label, title]) => `<button type="button" data-t="${t}" title="${title}">${label}</button>`).join('');
$('#mdHeading').innerHTML = '<option value="" disabled selected>Heading</option><option value="0">Paragraph (Ctrl+0)</option>' +
  '<option value="subject">Subject</option>' +
  [1, 2, 3, 4, 5, 6, 7].map((n) => `<option value="${n}">H${n} (Ctrl+${n})</option>`).join('');
$('#mdHeading').addEventListener('change', (e) => {
  const v = e.target.value;
  e.target.value = '';
  if (v === 'subject') setSubject();
  else setHeading(Number(v));
});
$('#mdOutlineBtn').addEventListener('click', () => setOutline(!$('#mdEditor').classList.contains('outline-open')));
setOutline(localStorage.getItem(OUTLINE_KEY) === '1');
$('#mdPreview').addEventListener('click', (e) => {
  const btn = e.target.closest('.md-copy');
  if (!btn) return;
  const code = btn.parentElement.querySelector('code').textContent;
  (navigator.clipboard?.writeText(code) || Promise.reject()).then(() => toast('Code copied'), () => {
    const t = el('textarea');
    t.value = code;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
    toast('Code copied');
  });
});
$('#mdTools').addEventListener('click', (e) => {
  const t = e.target.closest('button')?.dataset.t;
  if (t) MD_TOOLS[t]();
});
$('#mdInput').addEventListener('input', updatePreview);
$('#mdInput').addEventListener('keydown', (e) => {
  if (e.key === 'Tab') { e.preventDefault(); $('#mdInput').setRangeText('  ', $('#mdInput').selectionStart, $('#mdInput').selectionEnd, 'end'); updatePreview(); }
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
    const k = { b: 'bold', i: 'italic', k: 'link' }[e.key.toLowerCase()];
    if (k) { e.preventDefault(); MD_TOOLS[k](); }
    if (/^[0-7]$/.test(e.key)) { e.preventDefault(); setHeading(Number(e.key)); }
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); MD_TOOLS.codeblock(); }
});
$('#mdInput').addEventListener('scroll', () => {
  if (editor?.mode !== 'split') return;
  const ta = $('#mdInput');
  const pv = $('#mdPreview');
  const r = ta.scrollTop / Math.max(1, ta.scrollHeight - ta.clientHeight);
  pv.scrollTop = r * (pv.scrollHeight - pv.clientHeight);
});
$('#mdPreview').addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  $('#mdPreview').querySelector(`[id="${CSS.escape(decodeURIComponent(a.getAttribute('href').slice(1)))}"]`)?.scrollIntoView({ behavior: 'smooth' });
});
$('#mdDivider').addEventListener('pointerdown', (e) => {
  const div = $('#mdDivider');
  div.setPointerCapture(e.pointerId);
  div.classList.add('dragging');
  const rect = $('#mdBody').getBoundingClientRect();
  let pct = 50;
  const move = (ev) => { pct = applySplit(((ev.clientX - rect.left) / rect.width) * 100); };
  const up = () => {
    div.classList.remove('dragging');
    div.removeEventListener('pointermove', move);
    div.removeEventListener('pointerup', up);
    localStorage.setItem(SPLIT_KEY, String(Math.round(pct)));
  };
  div.addEventListener('pointermove', move);
  div.addEventListener('pointerup', up);
});
$('#mdDivider').addEventListener('dblclick', () => { applySplit(50); localStorage.setItem(SPLIT_KEY, '50'); });
$('#mdExportBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  $('#mdExportMenu').classList.toggle('hidden');
});
document.addEventListener('click', () => $('#mdExportMenu').classList.add('hidden'));
$('#mdExportMenu').addEventListener('click', (e) => {
  const x = e.target.closest('button')?.dataset.x;
  if (x === 'pdf') exportPdf();
  if (x === 'md') exportMarkdown();
});
window.addEventListener('beforeunload', (e) => {
  if (editorDirty()) { e.preventDefault(); e.returnValue = ''; }
});
$('#importFile').addEventListener('change', (e) => {
  if (e.target.files[0]) importData(e.target.files[0]);
  e.target.value = '';
});

/* Another tab saving the same app must not be overwritten by this tab's stale copy. */
window.addEventListener('storage', (e) => {
  if (e.key === BG_KEY) { bg = loadBg(); applyBackground(); return; }
  if (e.key === NOTES_KEY) { notes = loadNotes(); render(); return; }
  if (e.key !== STORE_KEY) return;
  state = load();
  applyTheme();
  render();
});

applyTheme();
applyBackground();
save();
render();
