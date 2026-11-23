(function () {
'use strict';
/* ---- 00-core.js ---- */
/* ===== Objectif 400 — noyau : utilitaires, aléatoire reproductible, nombres, maths ===== */
const TM = { gens: {}, chapters: {}, drills: {}, banks: {}, lessons: {} };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Aléatoire reproductible (seed) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const r = mulberry32(seed >>> 0);
  const R = {
    seed,
    next: r,
    int(a, b) { return a + Math.floor(r() * (b - a + 1)); },
    pick(arr) { return arr[Math.floor(r() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    chance(p) { return r() < p; },
    sign() { return r() < 0.5 ? -1 : 1; },
    sample(arr, k) { return R.shuffle(arr).slice(0, k); },
    intNot(a, b, ex) { let v, g = 0; do { v = R.int(a, b); } while (ex.includes(v) && g++ < 100); return v; },
    weighted(items, weights) {
      const tot = weights.reduce((s, w) => s + w, 0); let x = r() * tot;
      for (let i = 0; i < items.length; i++) { x -= weights[i]; if (x <= 0) return items[i]; }
      return items[items.length - 1];
    },
  };
  return R;
}
const newSeed = () => (Math.floor(Math.random() * 4294967296)) >>> 0;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------- Nombres ---------- */
const NB = ' '; // espace fine insécable
const MINUS = '−';
function round(x, d = 9) { return +(+x).toFixed(d); }
function decs(x) { const s = String(round(x, 9)); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
function fmt(x, maxDec = 4) {
  if (typeof x !== 'number') return String(x);
  if (!isFinite(x)) return '?';
  const v = round(x, maxDec);
  const neg = v < 0;
  let s = Math.abs(v).toFixed(maxDec).replace(/\.?0+$/, '');
  let [i, d] = s.split('.');
  if (i.length > 3) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  return (neg ? MINUS : '') + i + (d ? ',' + d : '');
}
const eur = (x, dec) => fmt(dec != null ? round(x, dec) : x, 2) + NB + '€';
const eur2 = (x) => { const s = round(x, 2); return (Number.isInteger(s) ? fmt(s) : fmt(s).replace(/,(\d)$/, ',$10')) + NB + '€'; };
const pc = (x) => fmt(x, 2) + NB + '%';
const unit = (x, u) => fmt(x) + NB + u;
const sgnPc = (x) => (x > 0 ? '+' : x < 0 ? MINUS : '') + fmt(Math.abs(x), 2) + NB + '%';
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
function divisors(n) { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
function fact(n) { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; }
function comb(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
function arr(n, k) { let r = 1; for (let i = 0; i < k; i++) r *= (n - i); return r; }

/* ---------- Typographie mathématique ---------- */
const F = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
const SQ = (x) => `<span class="sq">√<span class="sq-r">${x}</span></span>`;
const PW = (b, e) => `${b}<sup>${e}</sup>`;
const X = '×', DV = '÷';

class Fr {
  constructor(n, d = 1) {
    if (d === 0) throw new Error('denominator 0');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    this.n = n / g; this.d = d / g;
  }
  static of(x) { return x instanceof Fr ? x : new Fr(x, 1); }
  add(o) { o = Fr.of(o); return new Fr(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Fr.of(o); return new Fr(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Fr.of(o); return new Fr(this.n * o.n, this.d * o.d); }
  div(o) { o = Fr.of(o); return new Fr(this.n * o.d, this.d * o.n); }
  inv() { return new Fr(this.d, this.n); }
  eq(o) { o = Fr.of(o); return this.n === o.n && this.d === o.d; }
  val() { return this.n / this.d; }
  key() { return this.n + '/' + this.d; }
  html() {
    if (this.d === 1) return fmt(this.n);
    return (this.n < 0 ? MINUS : '') + F(fmt(Math.abs(this.n)), fmt(this.d));
  }
  txt() { return this.d === 1 ? String(this.n) : this.n + '/' + this.d; }
}
const frH = (n, d) => new Fr(n, d).html();
/* fraction non simplifiée (pour montrer les étapes) */
const frRaw = (n, d) => (n < 0 ? MINUS : '') + F(fmt(Math.abs(n)), fmt(d));

/* Durées */
function hm(hours) {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  if (h === 0) return m + NB + 'min';
  return h + NB + 'h' + (m ? NB + String(m).padStart(2, '0') : '');
}
function hmClock(totalMin) { totalMin = ((totalMin % 1440) + 1440) % 1440; const h = Math.floor(totalMin / 60), m = totalMin % 60; return h + NB + 'h' + NB + String(m).padStart(2, '0'); }

/* ---------- Texte ---------- */
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function inlineMd(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>')
    .replace(/(^|[^\d/,])(\d{1,4})\s?\/\s?(\d{1,4})(?![\d,/])/g, (m, pre, a, b) => pre + F(a, b));
}
/* Markdown minimal et sûr (le texte est échappé avant mise en forme) */
function md(src) {
  const lines = esc(src || '').replace(/\r/g, '').split('\n');
  let out = '', list = null, para = [];
  const flushP = () => { if (para.length) { out += '<p>' + inlineMd(para.join(' ')) + '</p>'; para = []; } };
  const flushL = () => { if (list) { out += `</${list}>`; list = null; } };
  for (let raw of lines) {
    const line = raw.trim();
    let m;
    if (!line) { flushP(); flushL(); continue; }
    if ((m = line.match(/^#{1,6}\s+(.*)$/))) { flushP(); flushL(); out += '<h4>' + inlineMd(m[1]) + '</h4>'; continue; }
    if ((m = line.match(/^[-*•]\s+(.*)$/))) { flushP(); if (list !== 'ul') { flushL(); out += '<ul>'; list = 'ul'; } out += '<li>' + inlineMd(m[1]) + '</li>'; continue; }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) { flushP(); if (list !== 'ol') { flushL(); out += '<ol>'; list = 'ol'; } out += '<li>' + inlineMd(m[1]) + '</li>'; continue; }
    flushL(); para.push(line);
  }
  flushP(); flushL();
  return `<div class="md">${out}</div>`;
}
const plural = (n, s, p) => n + ' ' + (Math.abs(n) >= 2 ? (p || s + 's') : s);
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/* ---------- Dates ---------- */
function dayKey(d = new Date()) { const z = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
function daysBetween(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); }
function addDays(key, n) { const d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return dayKey(d); }
const DAY_MS = 86400000;
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------- Icônes (SVG inline) ---------- */
const ICONS = {
  flame: '<path d="M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5Z" fill="currentColor"/>',
  gear: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.4 7.4 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" fill="currentColor"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  chev: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor"/>',
  repeat: '<path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  exam: '<rect x="4" y="3" width="16" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5L4 12Z" fill="currentColor"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  target: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
  calc: '<rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 7h7M8.5 12h1M12 12h1M15 12h.5M8.5 16h1M12 16h1M15 16h.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
};
const ic = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- Sous-tests ---------- */
const SUBS = [
  { id: 'calcul', hash: 'calcul', name: 'Calcul', short: 'Calcul', abbr: 'Calcul', color: 'var(--calc)', official: 2 },
  { id: 'cm', hash: 'conditions', name: 'Conditions minimales', short: 'Cond. minimales', abbr: 'CM', color: 'var(--cm)', official: 4 },
  { id: 'logique', hash: 'logique', name: 'Logique', short: 'Logique', abbr: 'Logique', color: 'var(--log)', official: 6 },
  { id: 'cdt', hash: 'comprehension', name: 'Compréhension de textes', short: 'Compréhension', abbr: 'CDT', color: 'var(--cdt)', official: 1 },
  { id: 'ra', hash: 'raisonnement', name: 'Raisonnement & Argumentation', short: 'Raisonnement', abbr: 'R&A', color: 'var(--ra)', official: 3 },
  { id: 'expr', hash: 'expression', name: 'Expression', short: 'Expression', abbr: 'Expression', color: 'var(--expr)', official: 5 },
];
const SUB = Object.fromEntries(SUBS.map((s) => [s.id, s]));
const OFFICIAL_ORDER = SUBS.slice().sort((a, b) => a.official - b.official).map((s) => s.id);

/* ---- 10-store.js ---- */
/* ===== Stockage : localStorage (toujours) + db Claude (synchro compte) quand disponible ===== */
const DEFAULT_ABOUT = "Bac STMG. Très lent en calcul mental ; ne sait pas encore calculer une vitesse moyenne ni une distance. Points faibles : fractions, puissances et racines, problèmes concrets (pourcentages, vitesses, mélanges), probabilités, géométrie, équations ; aussi Conditions minimales et Logique. Point fort : compréhension de textes (14/15 à un test). Jamais passé de Tage Mage blanc. Veut passer le Tage Mage après sa certification AMF et avant son TOEIC.";

function defaultState() {
  return {
    v: 1,
    profile: { target: 400, examDate: '', dailyMin: 45, scoring: 'nopenalty', about: DEFAULT_ABOUT, createdAt: Date.now(), seenIntro: false },
    skills: {},
    subs: {},
    drills: {},
    lessons: {},
    days: {},
    plan: {},
    sessions: [],
    updatedAt: 0,
  };
}

const LS_KEYS = { main: 'o400.main', errors: 'o400.errors', chat: 'o400.chat', ai: 'o400.ai' };
const DOC_LIMIT = 240 * 1024;

const Store = {
  S: defaultState(),
  E: { items: {}, updatedAt: 0 },
  C: { msgs: [], updatedAt: 0 },
  A: { cdt: [], ra: [], expr: [], cm: [], updatedAt: 0 },
  mode: 'local',
  db: null,
  uid: null,
  syncNote: '',
  dirty: new Set(),
  writing: new Set(),
  timer: null,
  listeners: [],

  bucket(name) { return { main: this.S, errors: this.E, chat: this.C, ai: this.A }[name]; },
  setBucket(name, val) {
    if (name === 'main') this.S = Object.assign(defaultState(), val, { profile: Object.assign(defaultState().profile, val.profile || {}) });
    else if (name === 'errors') this.E = Object.assign({ items: {}, updatedAt: 0 }, val);
    else if (name === 'chat') this.C = Object.assign({ msgs: [], updatedAt: 0 }, val);
    else if (name === 'ai') this.A = Object.assign({ cdt: [], ra: [], expr: [], cm: [], updatedAt: 0 }, val);
  },

  loadLocal() {
    for (const [name, key] of Object.entries(LS_KEYS)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) this.setBucket(name, JSON.parse(raw));
      } catch (e) { /* stockage indisponible : on garde l'état par défaut */ }
    }
  },
  writeLocal(name) {
    try { localStorage.setItem(LS_KEYS[name], JSON.stringify(this.bucket(name))); } catch (e) { /* plein ou bloqué */ }
  },

  save(name = 'main') {
    const b = this.bucket(name);
    b.updatedAt = Date.now();
    this.writeLocal(name);
    if (this.mode !== 'cloud') return;
    this.dirty.add(name);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 1500);
  },

  async flush() {
    if (this.mode !== 'cloud') return;
    const names = Array.from(this.dirty);
    this.dirty.clear();
    for (const name of names) {
      if (this.writing.has(name)) { this.dirty.add(name); continue; }
      this.writing.add(name);
      try {
        this.prune(name);
        const json = JSON.stringify(this.bucket(name));
        await this.docRef(name).set({ json, updatedAt: this.bucket(name).updatedAt });
        this.syncNote = '';
      } catch (e) {
        if (e && e.code === 'unavailable') { this.dirty.add(name); }
        else if (e && (e.code === 'revoked' || e.code === 'not_granted')) { this.mode = 'local'; this.syncNote = 'Synchronisation coupée : ta progression reste enregistrée sur cet appareil.'; }
        else if (e && e.code === 'quota_exceeded') { this.syncNote = 'Espace de synchronisation plein : supprime des erreurs maîtrisées dans le cahier.'; }
        else { this.dirty.add(name); }
      } finally {
        this.writing.delete(name);
      }
    }
    if (this.dirty.size) { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 4000); }
  },

  /* garde chaque document sous la limite de taille */
  prune(name) {
    const b = this.bucket(name);
    const size = () => JSON.stringify(b).length;
    if (name === 'main') {
      while (size() > DOC_LIMIT && b.sessions.length > 50) b.sessions.splice(0, 20);
      const dk = Object.keys(b.days).sort();
      while (size() > DOC_LIMIT && dk.length > 120) delete b.days[dk.shift()];
    } else if (name === 'errors') {
      let ids = Object.keys(b.items).sort((x, y) => (b.items[x].box === 6) - (b.items[y].box === 6) || b.items[x].upd - b.items[y].upd);
      while (size() > DOC_LIMIT && ids.length) { const id = ids.pop(); delete b.items[id]; }
    } else if (name === 'chat') {
      while (size() > DOC_LIMIT && b.msgs.length > 4) b.msgs.splice(0, 2);
    } else if (name === 'ai') {
      for (const k of ['cdt', 'ra', 'expr', 'cm']) while (size() > DOC_LIMIT && b[k].length > 2) b[k].shift();
    }
  },

  docRef(name) { return this.db.doc('data/users/' + this.uid + '/' + name); },

  async initCloud() {
    if (typeof window === 'undefined' || !window.claude || typeof window.claude.use !== 'function') return false;
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return false;
      const id = await user.id();
      if (!id) return false;
      this.db = db; this.uid = id;
      const names = Object.keys(LS_KEYS);
      const timeout = new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), 10000));
      const snaps = await Promise.race([Promise.all(names.map((n) => this.docRef(n).get())), timeout]);
      let changed = false;
      snaps.forEach((snap, i) => {
        const name = names[i];
        const local = this.bucket(name);
        let remote = null;
        if (snap.exists) { try { remote = JSON.parse(snap.data().json); } catch (e) { remote = null; } }
        if (name === 'errors' && remote) {
          const merged = Object.assign({}, remote.items || {});
          for (const [k, v] of Object.entries(local.items || {})) if (!merged[k] || (merged[k].upd || 0) < (v.upd || 0)) merged[k] = v;
          const before = JSON.stringify(local.items);
          this.setBucket('errors', { items: merged, updatedAt: Math.max(remote.updatedAt || 0, local.updatedAt || 0) });
          this.writeLocal('errors');
          if (JSON.stringify(merged) !== before) changed = true;
          if (JSON.stringify(merged) !== JSON.stringify(remote.items || {})) this.dirty.add('errors');
          return;
        }
        if (remote && (remote.updatedAt || 0) > (local.updatedAt || 0)) {
          this.setBucket(name, remote); this.writeLocal(name); changed = true;
        } else if ((local.updatedAt || 0) > ((remote && remote.updatedAt) || 0)) {
          this.dirty.add(name);
        }
      });
      this.mode = 'cloud';
      if (this.dirty.size) this.timer = setTimeout(() => this.flush(), 800);
      return changed;
    } catch (e) {
      this.syncNote = e && e.code === 'timeout' ? 'Synchronisation lente : ta progression est enregistrée sur cet appareil et sera envoyée plus tard.' : '';
      if (e && e.code === 'timeout' && this.db && this.uid) { this.mode = 'cloud'; }
      return false;
    }
  },

  /* au retour sur l'app (autre appareil utilisé entre-temps) */
  async refreshFromCloud() {
    if (this.mode !== 'cloud' || this.dirty.size || this.writing.size) return false;
    try {
      const snap = await this.docRef('main').get();
      if (!snap.exists) return false;
      const remote = JSON.parse(snap.data().json);
      if ((remote.updatedAt || 0) > (this.S.updatedAt || 0)) { this.setBucket('main', remote); this.writeLocal('main'); return true; }
    } catch (e) { /* hors ligne */ }
    return false;
  },

  exportCode() {
    const payload = { app: 'objectif-400', v: 1, at: Date.now(), main: this.S, errors: this.E };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  },
  importCode(code) {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!data || data.app !== 'objectif-400' || !data.main) throw new Error('code invalide');
    this.setBucket('main', data.main);
    const merged = Object.assign({}, this.E.items);
    for (const [k, v] of Object.entries((data.errors && data.errors.items) || {})) if (!merged[k] || (merged[k].upd || 0) < (v.upd || 0)) merged[k] = v;
    this.E.items = merged;
    this.save('main'); this.save('errors');
  },
  resetAll() {
    this.S = defaultState(); this.E = { items: {}, updatedAt: 0 }; this.C = { msgs: [], updatedAt: 0 }; this.A = { cdt: [], ra: [], expr: [], cm: [], updatedAt: 0 };
    ['main', 'errors', 'chat', 'ai'].forEach((n) => this.save(n));
  },
};

/* ---------- Statistiques élémentaires ---------- */
function recordAnswer(q, correct, ms) {
  const S = Store.S;
  const capMs = Math.min(ms || 0, 300000);
  if (q.skill) {
    const s = S.skills[q.skill] || (S.skills[q.skill] = { n: 0, ok: 0, ms: 0, ew: 0.5, lvl: 1, st: 0, last: 0 });
    s.n++; if (correct) s.ok++; s.ms += capMs;
    s.ew = s.ew * 0.75 + (correct ? 0.25 : 0);
    s.st = correct ? Math.max(1, s.st + 1) : Math.min(-1, s.st - 1);
    if (s.st >= 3 && s.lvl < 3) { s.lvl++; s.st = 0; }
    if (s.st <= -2 && s.lvl > 1) { s.lvl--; s.st = 0; }
    s.last = Date.now();
  }
  const r = S.subs[q.sub] || (S.subs[q.sub] = { hist: [] });
  r.hist.push([correct ? 1 : 0, Math.round(capMs / 1000), q.diff || 2]);
  if (r.hist.length > 80) r.hist.splice(0, r.hist.length - 80);
  addDay(1, correct ? 1 : 0, capMs);
}
function addDay(q, ok, ms) {
  const k = dayKey();
  const d = Store.S.days[k] || (Store.S.days[k] = { q: 0, ok: 0, ms: 0 });
  d.q += q; d.ok += ok; d.ms += ms;
}
function streakDays() {
  const days = Store.S.days;
  let k = dayKey(), n = 0;
  if (!(days[k] && days[k].q > 0)) k = addDays(k, -1);
  while (days[k] && days[k].q > 0) { n++; k = addDays(k, -1); }
  return n;
}
function skillMastery(id) {
  const s = Store.S.skills[id];
  if (!s || s.n === 0) return null;
  const conf = Math.min(1, s.n / 8);
  return Math.round(100 * (s.ew * conf + (s.ok / s.n) * (1 - conf)) * (0.85 + 0.075 * (s.lvl - 1)));
}
function chapterMastery(chId) {
  const ch = TM.chapters[chId];
  if (!ch) return null;
  const vals = ch.gens.map(skillMastery).filter((v) => v !== null);
  if (!vals.length) return null;
  const tried = vals.length / ch.gens.length;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * (0.6 + 0.4 * tried));
}
function scoringPenalty() { return Store.S.profile.scoring === 'penalty'; }
function score60(correct, wrong) { return 4 * correct - (scoringPenalty() ? wrong : 0); }

/* Projection /60 d'un sous-test */
function projectSub(sub) {
  const S = Store.S;
  const exams = S.sessions.filter((s) => s.sub === sub && (s.mode === 'exam' || s.mode === 'mock') && s.sc != null && Date.now() - s.t < 45 * DAY_MS).slice(-3);
  const h = (S.subs[sub] && S.subs[sub].hist) || [];
  let train = null;
  if (h.length >= 8) {
    const last = h.slice(-40);
    const p = last.reduce((a, x) => a + x[0], 0) / last.length;
    const avgD = last.reduce((a, x) => a + x[2], 0) / last.length;
    const pAdj = Math.min(0.98, p * (0.82 + 0.09 * (avgD - 1)));
    const avgT = last.reduce((a, x) => a + Math.max(5, x[1]), 0) / last.length;
    const answered = Math.min(15, 15 * 80 / avgT);
    const rest = 15 - answered;
    train = scoringPenalty() ? Math.max(0, answered * (5 * pAdj - 1)) : 4 * (answered * pAdj + rest * 0.2);
  }
  let ex = null;
  if (exams.length) { let w = 0, s = 0; exams.forEach((e, i) => { const wi = i + 1; w += wi; s += e.sc * wi; }); ex = s / w; }
  if (ex == null && train == null) return null;
  const v = ex != null && train != null ? 0.65 * ex + 0.35 * train : (ex != null ? ex : train);
  return Math.max(0, Math.min(60, Math.round(v)));
}
function projectTotal() {
  const vals = SUBS.map((s) => projectSub(s.id));
  const known = vals.filter((v) => v != null);
  if (known.length < 2) return { total: null, known: known.length, vals };
  const mean = known.reduce((a, b) => a + b, 0) / known.length;
  return { total: Math.round(mean * 10), known: known.length, vals };
}

/* ---- 20-qcm.js ---- */
/* ===== Questions : registre des générateurs, chapitres, fabrique de QCM ===== */
function gen(id, meta, make) { TM.gens[id] = Object.assign({ id, make, diffs: [1, 2, 3], w: 1 }, meta); }
function chapter(def) { TM.chapters[def.id] = Object.assign({ gens: [], order: 99 }, def); }
function linkGens() {
  for (const list of Object.values(TM.banks)) list.forEach((it, i) => { it._pos = (i * 3 + 1) % 5; });
  for (const ch of Object.values(TM.chapters)) ch.gens = [];
  for (const g of Object.values(TM.gens)) { if (g.ch && TM.chapters[g.ch]) TM.chapters[g.ch].gens.push(g.id); }
}
const chaptersOf = (sub) => Object.values(TM.chapters).filter((c) => c.sub === sub).sort((a, b) => a.order - b.order);
const gensOf = (sub) => Object.values(TM.gens).filter((g) => g.sub === sub && !g.hidden);

/* Mise en forme des corrections */
const steps = (...xs) => '<ol>' + xs.filter(Boolean).map((x) => `<li>${x}</li>`).join('') + '</ol>';
const res = (x) => `<p class="res">Réponse : ${x}</p>`;
const P = (x) => `<p>${x}</p>`;
const big = (x) => `<span class="big num">${x}</span>`;

/* Fabrique un QCM à 5 choix à partir de la bonne réponse et de distracteurs plausibles.
   Les deux premiers distracteurs (pièges classiques) sont toujours gardés ; la position de la
   bonne réponse est tirée au hasard pour qu'elle ne soit pas devinable (A à E équiprobables). */
function mcq(R, correct, cands, opts = {}) {
  const isNum = typeof correct === 'number';
  const isFr = correct instanceof Fr;
  const render = opts.render || (isFr ? (v) => v.html() : isNum ? (v) => fmt(v) : (v) => String(v));
  const key = opts.key || (isFr ? (v) => v.key() : isNum ? (v) => String(round(v, 6)) : (v) => String(v));
  const valid = (v) => v !== undefined && v !== null && !(typeof v === 'number' && !isFinite(v)) &&
    !(isNum && opts.positive !== false && correct > 0 && v <= 0) &&
    !(isFr && opts.positive !== false && correct.n > 0 && v.n <= 0) &&
    (!opts.valid || opts.valid(v));
  const sortable = opts.sort !== 'none' && (isNum || isFr || opts.sort === 'asc');
  const val = (v) => (isFr ? v.val() : opts.sortKey ? opts.sortKey(v) : v);
  const seen = new Set([key(correct)]);
  const pool = [];
  for (let c of cands) {
    if (isFr && typeof c === 'number') c = Fr.of(c);
    if (!valid(c)) continue;
    const k = key(c);
    if (seen.has(k)) continue;
    seen.add(k); pool.push(c);
  }
  const gen = (g) => (opts.fill ? opts.fill(R, g) : isNum ? numFill(R, correct, g) : isFr ? frFill(R, correct, g) : null);
  let chosen;
  if (sortable) {
    const cv = val(correct);
    const p = R.int(0, 4);
    const below = [], above = [];
    for (const c of pool) { const v = val(c); if (v < cv && below.length < p) below.push(c); else if (v > cv && above.length < 4 - p) above.push(c); }
    const spare = pool.filter((c) => !below.includes(c) && !above.includes(c));
    let g = 0;
    while ((below.length < p || above.length < 4 - p) && g++ < 300) {
      const c = gen(g);
      if (c == null) break;
      if (!valid(c)) continue;
      const k = key(c);
      if (seen.has(k)) continue;
      const v = val(c);
      if (v < cv && below.length < p) { seen.add(k); below.push(c); }
      else if (v > cv && above.length < 4 - p) { seen.add(k); above.push(c); }
    }
    while (below.length + above.length < 4 && spare.length) { const c = spare.shift(); (val(c) < cv ? below : above).push(c); }
    g = 0;
    while (below.length + above.length < 4 && g++ < 300) {
      const c = gen(g);
      if (c == null) break;
      if (!valid(c)) continue;
      const k = key(c);
      if (seen.has(k) || val(c) === cv) continue;
      seen.add(k); (val(c) < cv ? below : above).push(c);
    }
    chosen = below.concat(above);
  } else {
    chosen = pool.slice(0, 4);
    let g = 0;
    while (chosen.length < 4 && g++ < 600) {
      const c = gen(g);
      if (c == null) break;
      if (!valid(c)) continue;
      const k = key(c);
      if (seen.has(k)) continue;
      seen.add(k); chosen.push(c);
    }
  }
  if (chosen.length < 4) throw new Error('mcq: pas assez de choix');
  const all = [correct].concat(chosen);
  const order = sortable ? all.slice().sort((a, b) => val(a) - val(b)) : R.shuffle(all);
  const ck = key(correct);
  return { choices: order.map(render), answer: order.findIndex((v) => key(v) === ck) };
}
function numFill(R, c, g) {
  const d = Math.min(decs(c), 3);
  const mag = Math.abs(c);
  if (Number.isInteger(c)) {
    const step = Math.max(1, Math.round(mag * R.pick([0.04, 0.08, 0.1, 0.15, 0.2, 0.25])));
    return c + R.sign() * step * R.int(1, 3);
  }
  const unit = Math.pow(10, -d);
  const step = Math.max(unit, round(mag * R.pick([0.05, 0.1, 0.15, 0.2]), d));
  return round(c + R.sign() * step * R.int(1, 3), d);
}
function frFill(R, c, g) {
  const t = R.int(0, 4);
  if (t === 0) return new Fr(c.n + R.sign() * R.int(1, 2), c.d);
  if (t === 1) return new Fr(c.n, Math.max(1, c.d + R.sign() * R.int(1, 3)));
  if (t === 2 && c.n !== 0) return new Fr(c.d, Math.abs(c.n)).mul(c.n < 0 ? -1 : 1);
  if (t === 3) return new Fr(c.n * 2 + R.sign(), c.d * 2);
  return new Fr(c.n + R.int(1, 3), c.d + R.int(1, 3));
}
/* Choix textuels mélangés (bonne réponse = premier élément) */
function shuffleChoices(R, correctFirst) {
  const idx = R.shuffle(correctFirst.map((_, i) => i));
  return { choices: idx.map((i) => correctFirst[i]), answer: idx.indexOf(0) };
}

/* Construit une question complète à partir d'un générateur */
function buildQ(genId, seed, diff) {
  const g = TM.gens[genId];
  if (!g) throw new Error('générateur inconnu ' + genId);
  const lo = Math.min(...g.diffs), hi = Math.max(...g.diffs);
  const d = Math.max(lo, Math.min(hi, diff || lo));
  const R = makeRng(seed);
  const raw = g.make(R, d);
  return Object.assign({
    id: genId + ':' + seed + ':' + d, kind: 'qcm', sub: g.sub, skill: genId, chapter: g.ch, diff: d,
    src: { t: 'gen', g: genId, s: seed, d }, target: g.target || 80,
  }, raw);
}

/* Questions de banque (rédigées) : on mélange les choix de façon stable */
function bankQ(item, sub) {
  const R = makeRng(hashStr(item.id));
  let choices = item.choices.slice(), answer = item.answer || 0;
  if (!item.fixed) {
    const correct = item.choices[item.answer || 0];
    const others = R.shuffle(item.choices.filter((_, i) => i !== (item.answer || 0)));
    const pos = item._pos != null ? item._pos : hashStr(item.id) % 5;
    choices = others.slice(0, pos).concat([correct], others.slice(pos));
    answer = pos;
  }
  return Object.assign({}, item, {
    kind: 'qcm', sub: item.sub || sub, skill: item.skill || ((item.sub || sub) + '.' + (item.cat || 'bank')),
    chapter: item.ch || null, diff: item.diff || 2, src: { t: 'bank', id: item.id }, choices, answer, target: item.target || 80,
  });
}
function findBankItem(id) {
  for (const [sub, list] of Object.entries(TM.banks)) { const it = list.find((x) => x.id === id); if (it) return bankQ(it, sub); }
  return null;
}
function rebuild(src) {
  if (!src) return null;
  try {
    if (src.t === 'gen') return buildQ(src.g, src.s, src.d);
    if (src.t === 'bank') return findBankItem(src.id);
    if (src.t === 'ai') return Object.assign({}, src.q, { src });
  } catch (e) { return null; }
  return null;
}

/* Choix pondéré d'un générateur : on insiste sur ce qui est faible ou jamais vu */
function pickGen(R, ids) {
  const now = Date.now();
  const w = ids.map((id) => {
    const s = Store.S.skills[id];
    const g = TM.gens[id];
    if (!s || s.n === 0) return 2.2 * (g.w || 1);
    const m = skillMastery(id) / 100;
    const recency = Math.min(1.5, (now - s.last) / (2 * DAY_MS));
    return (0.35 + 1.6 * (1 - m) + 0.4 * recency) * (g.w || 1);
  });
  return R.weighted(ids, w);
}
function skillLevel(id) { const s = Store.S.skills[id]; return s ? s.lvl : 1; }

/* Les 5 réponses officielles des Conditions minimales */
const CM_CHOICES = [
  'La condition (1) seule permet de répondre, mais pas la (2) seule.',
  'La condition (2) seule permet de répondre, mais pas la (1) seule.',
  'Les deux conditions ensemble permettent de répondre, mais aucune ne suffit seule.',
  'Chacune des deux conditions permet, seule, de répondre.',
  'Même ensemble, les deux conditions ne permettent pas de répondre.',
];
const CM_LETTER = { A: 0, B: 1, C: 2, D: 3, E: 4 };

/* Générateur « banque » : pioche une question rédigée de la catégorie, en privilégiant les moins vues */
function bankGen(sub, cat, chId, name) {
  gen(sub + '.' + cat, { sub, ch: chId, name, bank: true, target: 45 }, (R) => {
    const items = TM.banks[sub].filter((x) => x.cat === cat);
    const seen = Store.S.seenBank || {};
    const sorted = items.slice().sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0));
    const pool = sorted.slice(0, Math.max(3, Math.ceil(sorted.length / 2)));
    const it = R.pick(pool);
    return Object.assign(bankQ(it, sub), { src: { t: 'bank', id: it.id }, chapter: chId });
  });
}

/* ---- 30-calcul-1.js ---- */
/* ===== CALCUL (1/3) : calcul mental, fractions, puissances, pourcentages ===== */

/* ---------------- Chapitre 1 : Calcul mental & priorités ---------------- */
chapter({
  id: 'ops', sub: 'calcul', order: 1, title: 'Calcul mental & priorités', short: 'Calcul mental',
  lesson: `
<p>Au Tage Mage, <b>pas de calculatrice</b> et environ <b>80 secondes par question</b>. Le calcul mental n'est pas un don : ce sont des réflexes qui s'installent avec 10 minutes d'entraînement par jour.</p>
<h3><span class="hl">1. L'ordre des opérations</span></h3>
<ol><li>Les parenthèses</li><li>Les puissances (les carrés…)</li><li>Les multiplications et divisions, <b>de gauche à droite</b></li><li>Les additions et soustractions, <b>de gauche à droite</b></li></ol>
<div class="ex"><b>Exemples</b><span>8 + 2 × 5 = 8 + 10 = <b>18</b> (et pas 10 × 5 = 50).</span><span>24 ÷ 4 × 2 = 6 × 2 = <b>12</b> (on va de gauche à droite, pas 24 ÷ 8).</span></div>
<div class="trap"><b>Piège :</b> −3² = −9 (le carré passe avant le signe moins), alors que (−3)² = 9.</div>
<h3><span class="hl">2. Les astuces qui font gagner du temps</span></h3>
<div class="tablewrap"><table>
<tr><th>Pour…</th><th>On fait…</th><th>Exemple</th></tr>
<tr><td>× 5</td><td>× 10 puis ÷ 2</td><td>48 × 5 = 480 ÷ 2 = 240</td></tr>
<tr><td>× 25</td><td>× 100 puis ÷ 4</td><td>36 × 25 = 3 600 ÷ 4 = 900</td></tr>
<tr><td>× 9</td><td>× 10 puis on retire le nombre</td><td>47 × 9 = 470 − 47 = 423</td></tr>
<tr><td>× 99</td><td>× 100 puis on retire le nombre</td><td>23 × 99 = 2 300 − 23 = 2 277</td></tr>
<tr><td>× 11</td><td>on écarte les deux chiffres et on met leur somme au milieu</td><td>43 × 11 → 4|7|3 = 473 ; 78 × 11 → 7|15|8 = 858 (retenue)</td></tr>
<tr><td>× 15</td><td>× 10, plus la moitié du résultat</td><td>24 × 15 = 240 + 120 = 360</td></tr>
<tr><td>÷ 5</td><td>× 2 puis ÷ 10</td><td>135 ÷ 5 = 270 ÷ 10 = 27</td></tr>
<tr><td>÷ 25</td><td>× 4 puis ÷ 100</td><td>350 ÷ 25 = 1 400 ÷ 100 = 14</td></tr>
</table></div>
<p><b>Décomposer</b> : 23 × 14 = 23 × 10 + 23 × 4 = 230 + 92 = 322.</p>
<p><b>Carré d'un nombre qui finit par 5</b> : 35² → 3 × 4 = 12, puis on colle 25 → 1 225. De même 65² → 6 × 7 = 42 → 4 225.</p>
<p><b>Deux nombres autour d'un nombre rond</b> : 48 × 52 = (50 − 2)(50 + 2) = 50² − 2² = 2 500 − 4 = 2 496.</p>
<h3><span class="hl">3. Les nombres décimaux</span></h3>
<p><b>Multiplier</b> : on calcule sans les virgules, puis on remet autant de chiffres après la virgule qu'il y en avait au total. 0,3 × 0,02 → 3 × 2 = 6, et 1 + 2 = 3 chiffres → <b>0,006</b>.</p>
<p><b>Diviser</b> : on multiplie les deux nombres par 10, 100… jusqu'à ce que le diviseur n'ait plus de virgule. 1,2 ÷ 0,04 = 120 ÷ 4 = <b>30</b>.</p>
<div class="formula">÷ 0,5 = × 2 &nbsp;·&nbsp; ÷ 0,25 = × 4 &nbsp;·&nbsp; ÷ 0,2 = × 5 &nbsp;·&nbsp; ÷ 0,1 = × 10</div>
<h3><span class="hl">4. Éliminer sans tout calculer</span></h3>
<p>Au QCM, on a rarement besoin du résultat exact. Deux réflexes :</p>
<ul><li><b>Le chiffre des unités</b> : 37 × 43 finit par 1, car 7 × 3 = 21.</li><li><b>L'ordre de grandeur</b> : 37 × 43 ≈ 40 × 40 = 1 600.</li></ul>
<p>Parmi 1 589 / 1 591 / 1 597 / 2 591 / 1 593, seul 1 591 finit par 1 <b>et</b> vaut environ 1 600.</p>
<div class="tip"><b>Astuce Tage Mage :</b> lis toujours les 5 réponses avant de calculer. Elles te disent quelle précision il te faut.</div>`,
});

gen('ops.prio', { sub: 'calcul', ch: 'ops', name: 'Priorités opératoires', target: 45 }, (R, d) => {
  let expr, val, wrong, ex;
  if (d === 1) {
    const b = R.int(2, 9), c = R.int(3, 9);
    if (R.chance(0.5)) {
      const a = R.int(3, 25);
      expr = `${a} + ${b} ${X} ${c}`; val = a + b * c;
      wrong = [(a + b) * c, a + b + c, a * b + c, val + 10];
      ex = steps(`La multiplication passe avant l'addition : ${b} ${X} ${c} = ${b * c}.`, `${a} + ${b * c} = ${val}.`);
    } else {
      const a = R.int(b * c + 2, b * c + 40);
      expr = `${a} ${MINUS} ${b} ${X} ${c}`; val = a - b * c;
      wrong = [(a - b) * c, a - b - c, a - b + c, val + 2 * c];
      ex = steps(`La multiplication passe avant la soustraction : ${b} ${X} ${c} = ${b * c}.`, `${a} ${MINUS} ${b * c} = ${val}.`);
    }
  } else if (d === 2) {
    const a = R.int(2, 12), b = R.int(2, 12), c = R.int(2, 6), e = R.int(2, 6), f = e * R.int(2, 9);
    expr = `(${a} + ${b}) ${X} ${c} ${MINUS} ${f} ${DV} ${e}`; val = (a + b) * c - f / e;
    wrong = [a + b * c - f / e, (a + b) * c + f / e, (a + b) * (c - f / e), (a + b) * c - f + e];
    ex = steps(`Parenthèses : ${a} + ${b} = ${a + b}.`, `Multiplication et division : ${a + b} ${X} ${c} = ${(a + b) * c} et ${f} ${DV} ${e} = ${f / e}.`, `Soustraction : ${(a + b) * c} ${MINUS} ${f / e} = ${fmt(val)}.`);
  } else if (R.chance(0.5)) {
    const a = R.int(10, 40), b = R.int(2, 6), c = R.int(2, 7), p = R.int(1, 9), q = R.int(p + 1, p + 9);
    expr = `${a} ${MINUS} ${PW(b, 2)} + ${c} ${X} (${p} ${MINUS} ${q})`; val = a - b * b + c * (p - q);
    wrong = [a - b * b + c * (q - p), (a - b) * (a - b) + c * (p - q), a + b * b + c * (p - q), a - 2 * b + c * (p - q)];
    ex = steps(`Parenthèses : ${p} ${MINUS} ${q} = ${fmt(p - q)} (c'est négatif !).`, `Puissance : ${PW(b, 2)} = ${b * b}.`, `Multiplication : ${c} ${X} (${fmt(p - q)}) = ${fmt(c * (p - q))}.`, `On termine de gauche à droite : ${a} ${MINUS} ${b * b} ${MINUS} ${Math.abs(c * (p - q))} = ${fmt(val)}.`);
  } else {
    const b = R.int(2, 6), c = R.int(2, 5), k = R.int(2, 6), a = b * k * R.int(1, 2), s = R.int(2, 5);
    expr = `${a} ${DV} ${b} ${X} ${c} ${MINUS} ${PW(s, 2)}`; val = (a / b) * c - s * s;
    wrong = [a / (b * c) - s * s, (a / b) * c - 2 * s, (a / b) * (c - s * s), (a / b) * c + s * s];
    ex = steps(`La puissance d'abord : ${PW(s, 2)} = ${s * s}.`, `× et ÷ de gauche à droite : ${a} ${DV} ${b} = ${a / b}, puis ${a / b} ${X} ${c} = ${(a / b) * c}.`, `Enfin : ${(a / b) * c} ${MINUS} ${s * s} = ${fmt(val)}.`);
  }
  const m = mcq(R, val, wrong, { positive: false, valid: Number.isInteger });
  return {
    q: P('Calculer :') + P(big(expr)), ...m, expl: ex + res(fmt(val)),
    trap: d === 3 ? '<b>Piège :</b> les × et ÷ se font <b>de gauche à droite</b>, et le carré passe avant le signe moins.' : '',
    tip: d === 1 ? '<b>Réflexe :</b> repère d\'abord les × et ÷, puis fais les + et −.' : '',
  };
});

gen('ops.astuce', { sub: 'calcul', ch: 'ops', name: 'Multiplications astucieuses', target: 40 }, (R, d) => {
  const T = d === 1 ? R.pick(['x5', 'x25', 'x9', 'x11']) : d === 2 ? R.pick(['x11c', 'x99', 'x15', 'sq5']) : R.pick(['ab', 'near100', 'ab', 'x101']);
  let expr, val, ex, tip, a;
  if (T === 'x5') { a = R.int(14, 198); val = a * 5; expr = `${a} ${X} 5`; ex = steps(`× 5, c'est × 10 puis ÷ 2.`, `${a} ${X} 10 = ${fmt(a * 10)}.`, `${fmt(a * 10)} ${DV} 2 = ${fmt(val)}.`); }
  else if (T === 'x25') { a = R.int(12, 96); val = a * 25; expr = `${a} ${X} 25`; ex = steps(`× 25, c'est × 100 puis ÷ 4.`, `${a} ${X} 100 = ${fmt(a * 100)}.`, `${fmt(a * 100)} ${DV} 4 = ${fmt(val)}.`); }
  else if (T === 'x9') { a = R.int(13, 99); val = a * 9; expr = `${a} ${X} 9`; ex = steps(`× 9, c'est × 10 moins une fois le nombre.`, `${a} ${X} 10 = ${a * 10}.`, `${a * 10} ${MINUS} ${a} = ${fmt(val)}.`); }
  else if (T === 'x11') { const t = R.int(1, 8), u = R.int(0, 9 - t); a = 10 * t + u; val = a * 11; expr = `${a} ${X} 11`; ex = steps(`On écarte les chiffres ${t} et ${u}.`, `On met leur somme au milieu : ${t} + ${u} = ${t + u}.`, `On obtient ${t}|${t + u}|${u} = ${fmt(val)}.`); }
  else if (T === 'x11c') { const t = R.int(2, 9), u = R.int(Math.max(1, 10 - t), 9); a = 10 * t + u; val = a * 11; expr = `${a} ${X} 11`; ex = steps(`On écarte les chiffres ${t} et ${u} ; leur somme vaut ${t + u} (plus de 9).`, `On écrit ${(t + u) % 10} au milieu et on ajoute la retenue 1 au premier chiffre : ${t} + 1 = ${t + 1}.`, `Résultat : ${fmt(val)}.`); }
  else if (T === 'x99') { a = R.int(12, 89); val = a * 99; expr = `${a} ${X} 99`; ex = steps(`× 99, c'est × 100 moins une fois le nombre.`, `${a} ${X} 100 = ${fmt(a * 100)}.`, `${fmt(a * 100)} ${MINUS} ${a} = ${fmt(val)}.`); }
  else if (T === 'x15') { a = 2 * R.int(6, 49); val = a * 15; expr = `${a} ${X} 15`; ex = steps(`× 15 = × 10 + × 5 (la moitié de × 10).`, `${a} ${X} 10 = ${a * 10} ; sa moitié vaut ${a * 5}.`, `${a * 10} + ${a * 5} = ${fmt(val)}.`); }
  else if (T === 'sq5') { const k = R.int(1, 9); a = 10 * k + 5; val = a * a; expr = PW(a, 2); ex = steps(`Pour un nombre qui finit par 5 : on multiplie le chiffre des dizaines par son suivant : ${k} ${X} ${k + 1} = ${k * (k + 1)}.`, `On colle 25 à la fin : ${fmt(val)}.`); }
  else if (T === 'ab') { const m = R.pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), k = R.int(1, 9); val = m * m - k * k; expr = `${m - k} ${X} ${m + k}`; ex = steps(`${m - k} et ${m + k} sont symétriques autour de ${m} : c'est (${m} ${MINUS} ${k})(${m} + ${k}).`, `On utilise (a ${MINUS} b)(a + b) = ${PW('a', 2)} ${MINUS} ${PW('b', 2)} : ${PW(m, 2)} ${MINUS} ${PW(k, 2)} = ${fmt(m * m)} ${MINUS} ${k * k}.`, `= ${fmt(val)}.`); a = m; }
  else if (T === 'near100') { const k = R.int(1, 9), s = R.sign(); a = 100 + s * k; val = a * a; expr = PW(a, 2); ex = steps(`${a} = 100 ${s > 0 ? '+' : MINUS} ${k}.`, `(100 ${s > 0 ? '+' : MINUS} ${k})² = 10 000 ${s > 0 ? '+' : MINUS} 2 ${X} 100 ${X} ${k} + ${PW(k, 2)} = 10 000 ${s > 0 ? '+' : MINUS} ${200 * k} + ${k * k}.`, `= ${fmt(val)}.`); }
  else { a = R.int(11, 98); val = a * 101; expr = `${a} ${X} 101`; ex = steps(`× 101 = × 100 + une fois le nombre.`, `${a} ${X} 100 + ${a} = ${fmt(a * 100)} + ${a}.`, `= ${fmt(val)} (le nombre « s'écrit deux fois »).`); }
  tip = '<b>À retenir :</b> transforme la multiplication en une opération plus simple (×10, ×100, carrés connus).';
  const cands = R.shuffle([val + 10, val - 10, val + 100, val - 100, val + (a || 7), val - (a || 7), val + 1, val - 9]);
  const m = mcq(R, val, cands, { valid: Number.isInteger });
  return { q: P('Calculer de tête :') + P(big(expr)), ...m, expl: ex + res(fmt(val)), tip };
});

gen('ops.dec', { sub: 'calcul', ch: 'ops', name: 'Calculs avec des décimaux', target: 50 }, (R, d) => {
  let expr, val, ex;
  if (d === 1) {
    const x = R.int(2, 99) / 10, c = R.int(2, 9);
    val = round(x * c, 6); expr = `${fmt(x)} ${X} ${c}`;
    ex = steps(`Sans la virgule : ${Math.round(x * 10)} ${X} ${c} = ${Math.round(x * 10) * c}.`, `${fmt(x)} a 1 chiffre après la virgule, donc on en remet 1 : ${fmt(val)}.`);
  } else if (d === 2) {
    if (R.chance(0.5)) {
      const a = R.int(2, 9), b = R.int(2, 9);
      val = round(a * b / 100, 6); expr = `0,${a} ${X} 0,${b}`;
      ex = steps(`Sans les virgules : ${a} ${X} ${b} = ${a * b}.`, `Il y a 1 + 1 = 2 chiffres après la virgule au total : ${fmt(val)}.`);
    } else {
      const div = R.pick([0.5, 0.25, 0.2]), mult = Math.round(1 / div), x = R.int(3, 60) / (R.chance(0.3) ? 10 : 1);
      val = round(x * mult, 6); expr = `${fmt(x)} ${DV} ${fmt(div)}`;
      ex = steps(`Diviser par ${fmt(div)}, c'est multiplier par ${mult} (car ${fmt(div)} = ${F(1, mult)}).`, `${fmt(x)} ${X} ${mult} = ${fmt(val)}.`);
    }
  } else {
    const b = R.int(2, 9), k = R.int(2, 9), a = round(b * k / 10, 6);
    if (R.chance(0.6)) {
      val = round(a / (b / 100), 6); expr = `${fmt(a)} ${DV} 0,0${b}`;
      ex = steps(`On multiplie les deux nombres par 100 pour enlever la virgule du diviseur : ${fmt(a)} ${DV} 0,0${b} = ${fmt(a * 100)} ${DV} ${b}.`, `${fmt(a * 100)} ${DV} ${b} = ${fmt(val)}.`);
    } else {
      const c = R.pick([20, 40, 50, 200, 500]);
      val = round(0.01 * b * c * (k / 10), 6); expr = `0,0${b} ${X} ${c} ${X} ${fmt(k / 10)}`;
      ex = steps(`On regroupe : 0,0${b} ${X} ${c} = ${fmt(round(0.01 * b * c, 6))}.`, `Puis ${fmt(round(0.01 * b * c, 6))} ${X} ${fmt(k / 10)} = ${fmt(val)}.`);
    }
  }
  const m = mcq(R, val, [val * 10, val / 10, val * 100, val / 100, val + 1].map((v) => round(v, 6)));
  return { q: P('Calculer :') + P(big(expr)), ...m, expl: ex + res(fmt(val)), trap: '<b>Piège :</b> l\'erreur classique est de mal placer la virgule. Vérifie avec un ordre de grandeur.' };
});

gen('ops.elim', { sub: 'calcul', ch: 'ops', name: 'Éliminer : unités et ordre de grandeur', target: 40 }, (R, d) => {
  let a, b;
  const nz = (lo, hi) => { let v; do { v = R.int(lo, hi); } while (v % 10 === 0 || v % 10 === 5 || v % 10 === 1); return v; };
  if (d === 1) { a = nz(12, 49); b = nz(12, 49); } else if (d === 2) { a = nz(23, 98); b = nz(23, 98); } else { a = nz(102, 489); b = nz(13, 79); }
  const val = a * b, u = val % 10;
  const offs = R.sample([-8, -6, -4, -2, 2, 4, 6, 8], 3);
  const nd = String(val).length;
  const far = val + Math.pow(10, nd - 1) * R.pick([1, 2]) * (val > 3 * Math.pow(10, nd - 1) && R.chance(0.4) ? -1 : 1);
  const m = mcq(R, val, [far, ...offs.map((o) => val + o)], { fill: (RR) => { let v; do { v = val + RR.sign() * RR.int(1, 60); } while (v % 10 === u || v <= 0); return v; } });
  const same = m.choices.filter((c) => c.replace(/\D/g, '').endsWith(String(u))).length;
  const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10;
  const ex = steps(
    `Chiffre des unités : ${a % 10} ${X} ${b % 10} = ${(a % 10) * (b % 10)}, donc le résultat finit par <b>${u}</b>.${same === 1 ? ' Une seule réponse finit par ' + u + ' : c\'est déjà gagné.' : ' Il ne reste que ' + same + ' réponses possibles.'}`,
    `Ordre de grandeur : ${a} ${X} ${b} ≈ ${ra} ${X} ${rb} = ${fmt(ra * rb)}.`,
    `La seule réponse qui finit par ${u} et qui vaut environ ${fmt(ra * rb)} est ${fmt(val)}.`);
  return { q: P(`Sans poser l'opération, trouver le résultat de ${big(`${a} ${X} ${b}`)}`), ...m, expl: ex + res(fmt(val)), tip: '<b>Méthode :</b> unités d\'abord, ordre de grandeur ensuite. 15 secondes suffisent.' };
});

/* ---------------- Chapitre 2 : Fractions ---------------- */
chapter({
  id: 'frac', sub: 'calcul', order: 2, title: 'Fractions', short: 'Fractions',
  lesson: `
<p>Une fraction ${F('a', 'b')}, c'est <b>a divisé par b</b>. Le nombre du haut (numérateur) compte les parts prises ; celui du bas (dénominateur) dit en combien de parts on a coupé.</p>
<h3><span class="hl">1. Simplifier</span></h3>
<p>On divise le haut et le bas par le même nombre. ${F(84, 126)} : les deux sont divisibles par 2 → ${F(42, 63)}, puis par 3 → ${F(14, 21)}, puis par 7 → ${F(2, 3)}.</p>
<div class="tip"><b>Divisibilité express :</b> par 2 si pair ; par 3 si la somme des chiffres est divisible par 3 ; par 5 si ça finit par 0 ou 5 ; par 9 si la somme des chiffres est divisible par 9.</div>
<h3><span class="hl">2. Additionner et soustraire</span></h3>
<p>Il faut le <b>même dénominateur</b>. On choisit le plus petit multiple commun des deux dénominateurs.</p>
<div class="formula">${F(2, 3)} + ${F(3, 4)} = ${F(8, 12)} + ${F(9, 12)} = ${F(17, 12)}</div>
<div class="trap"><b>Piège n°1 :</b> on n'additionne JAMAIS les dénominateurs. ${F(1, 2)} + ${F(1, 3)} n'est pas ${F(2, 5)} : c'est ${F(3, 6)} + ${F(2, 6)} = ${F(5, 6)}.</div>
<h3><span class="hl">3. Multiplier et diviser</span></h3>
<p><b>Multiplier</b> : haut × haut et bas × bas. Simplifie <b>avant</b> de multiplier, c'est plus rapide :</p>
<div class="formula">${F(6, 35)} × ${F(14, 9)} = ${F('6 × 14', '35 × 9')} = ${F('2 × 2', '5 × 3')} = ${F(4, 15)}</div>
<p><b>Diviser</b> par une fraction, c'est <b>multiplier par son inverse</b> (on la retourne) :</p>
<div class="formula">${F(3, 4)} ÷ ${F(9, 8)} = ${F(3, 4)} × ${F(8, 9)} = ${F(24, 36)} = ${F(2, 3)}</div>
<h3><span class="hl">4. Prendre une fraction d'une quantité</span></h3>
<p>Les ${F(3, 4)} de 120 : on divise par le bas, on multiplie par le haut → 120 ÷ 4 × 3 = <b>90</b>.</p>
<div class="trap"><b>Piège n°2, la « fraction du reste » :</b> si on dépense ${F(1, 3)} de son argent, puis ${F(1, 4)} <b>de ce qui reste</b>, il reste ${F(2, 3)} × ${F(3, 4)} = ${F(1, 2)} de l'argent. Et non 1 − ${F(1, 3)} − ${F(1, 4)}.</div>
<h3><span class="hl">5. Comparer des fractions</span></h3>
<ul><li><b>Produit en croix</b> : ${F('a', 'b')} &gt; ${F('c', 'd')} si a × d &gt; c × b. Exemple : ${F(5, 7)} ou ${F(7, 10)} ? 5 × 10 = 50 et 7 × 7 = 49, donc ${F(5, 7)} est plus grande.</li><li><b>Passer en décimal</b> quand les fractions sont proches.</li><li><b>Comparer à 1/2 ou à 1</b> pour éliminer vite.</li></ul>
<h3><span class="hl">6. Le tableau à connaître par cœur</span></h3>
<div class="tablewrap"><table>
<tr><th>Fraction</th><th>Décimal</th><th>%</th><th>Fraction</th><th>Décimal</th><th>%</th></tr>
<tr><td>1/2</td><td>0,5</td><td>50 %</td><td>1/8</td><td>0,125</td><td>12,5 %</td></tr>
<tr><td>1/4</td><td>0,25</td><td>25 %</td><td>3/8</td><td>0,375</td><td>37,5 %</td></tr>
<tr><td>3/4</td><td>0,75</td><td>75 %</td><td>1/3</td><td>≈ 0,333</td><td>≈ 33,3 %</td></tr>
<tr><td>1/5</td><td>0,2</td><td>20 %</td><td>2/3</td><td>≈ 0,667</td><td>≈ 66,7 %</td></tr>
<tr><td>1/10</td><td>0,1</td><td>10 %</td><td>1/6</td><td>≈ 0,167</td><td>≈ 16,7 %</td></tr>
<tr><td>1/20</td><td>0,05</td><td>5 %</td><td>1/9</td><td>≈ 0,111</td><td>≈ 11,1 %</td></tr>
</table></div>`,
});

gen('frac.simpl', { sub: 'calcul', ch: 'frac', name: 'Simplifier une fraction', target: 45 }, (R, d) => {
  let p, q;
  do { q = R.int(3, d === 1 ? 9 : 15); p = R.int(1, d === 3 ? 2 * q : q - 1); } while (gcd(p, q) !== 1 || p === q);
  const k = d === 1 ? R.pick([2, 3, 4, 5, 10]) : d === 2 ? R.pick([6, 7, 8, 9, 12, 15]) : R.pick([12, 14, 16, 18, 21, 24, 25]);
  const N = p * k, D = q * k, correct = new Fr(p, q);
  const m = mcq(R, correct, [new Fr(p, q + 1), new Fr(p + 1, q), new Fr(q, p), new Fr(p + 1, q + 1), new Fr(Math.max(1, p - 1), q), new Fr(2 * p + 1, 2 * q)]);
  const ex = steps(`On cherche le plus grand nombre qui divise à la fois ${fmt(N)} et ${fmt(D)} : c'est ${k}.`, `${fmt(N)} ${DV} ${k} = ${p} et ${fmt(D)} ${DV} ${k} = ${q}.`, `${p} et ${q} n'ont plus de diviseur commun : la fraction ${correct.html()} est irréductible.`);
  return { q: P(`Simplifier au maximum la fraction ${big(F(fmt(N), fmt(D)))}`), ...m, expl: ex + res(correct.html()), tip: '<b>Pas besoin de trouver le plus grand diviseur du premier coup :</b> divise par 2, puis 3, puis 5… jusqu\'à ce que ça bloque.' };
});

gen('frac.add', { sub: 'calcul', ch: 'frac', name: 'Additionner et soustraire des fractions', target: 60 }, (R, d) => {
  let terms, expr;
  const cop = (dd) => { let n; do { n = R.int(1, dd - 1); } while (gcd(n, dd) !== 1); return n; };
  if (d === 1) { const b = R.pick([2, 3, 4, 5, 6]), e = b * R.pick([2, 3]); terms = [[cop(b), b, 1], [cop(e), e, 1]]; }
  else if (d === 2) { let b, e; do { b = R.int(2, 9); e = R.int(2, 9); } while (b === e || gcd(b, e) !== 1); terms = [[cop(b), b, 1], [cop(e), e, R.pick([1, -1])]]; }
  else { const ds = R.sample([2, 3, 4, 6, 8, 12], 3); terms = ds.map((dd, i) => [cop(dd), dd, i === 2 ? -1 : 1]); }
  let sum = new Fr(0);
  terms.forEach(([n, dd, s]) => { sum = sum.add(new Fr(s * n, dd)); });
  const L = terms.reduce((acc, t) => lcm(acc, t[1]), 1);
  expr = terms.map(([n, dd, s], i) => (i === 0 ? '' : s > 0 ? ' + ' : ` ${MINUS} `) + F(n, dd)).join('');
  const conv = terms.map(([n, dd, s], i) => (i === 0 ? '' : s > 0 ? ' + ' : ` ${MINUS} `) + F(n * L / dd, L)).join('');
  const numSum = terms.reduce((acc, [n, dd, s]) => acc + s * n * L / dd, 0);
  const wrongNaive = new Fr(terms.reduce((a, t) => a + t[2] * t[0], 0) || 1, terms.reduce((a, t) => a + t[1], 0));
  const wrongProd = new Fr(terms.reduce((a, t) => a + t[2] * t[0], 0) || 1, terms.reduce((a, t) => a * t[1], 1));
  const wrongSign = terms.reduce((acc, [n, dd]) => acc.add(new Fr(n, dd)), new Fr(0));
  const m = mcq(R, sum, [wrongNaive, wrongProd, wrongSign, sum.add(new Fr(1, L)), sum.sub(new Fr(1, L))], { positive: false });
  const ex = steps(`Dénominateur commun : le plus petit multiple de ${terms.map((t) => t[1]).join(', ')} est ${L}.`, `On convertit : ${conv}.`, `On combine les numérateurs : ${frRaw(numSum, L)}${sum.d !== L || sum.n !== numSum ? ' = ' + sum.html() + ' (simplifiée)' : ''}.`);
  return { q: P('Calculer :') + P(big(expr)), ...m, expl: ex + res(sum.html()), trap: '<b>Piège :</b> on n\'additionne jamais les dénominateurs entre eux.' };
});

gen('frac.mul', { sub: 'calcul', ch: 'frac', name: 'Multiplier et diviser des fractions', target: 55 }, (R, d) => {
  const rf = (lo, hi) => { let n, dd; do { n = R.int(lo, hi); dd = R.int(lo + 1, hi + 3); } while (gcd(n, dd) !== 1 || n === dd); return new Fr(n, dd); };
  const a = rf(1, 9), b = rf(2, 12);
  let val, expr, ex, wrong;
  if (d === 1) {
    val = a.mul(b); expr = `${a.html()} ${X} ${b.html()}`;
    ex = steps(`On multiplie les numérateurs entre eux et les dénominateurs entre eux : ${frRaw(a.n * b.n, a.d * b.d)}.`, `On simplifie : ${val.html()}.`);
    wrong = [a.div(b), new Fr(a.n + b.n, a.d + b.d), new Fr(a.n * b.d, a.d + b.d), val.inv()];
  } else if (d === 2) {
    val = a.div(b); expr = `${a.html()} ${DV} ${b.html()}`;
    ex = steps(`Diviser par ${b.html()}, c'est multiplier par son inverse ${b.inv().html()}.`, `${a.html()} ${X} ${b.inv().html()} = ${frRaw(a.n * b.d, a.d * b.n)}.`, `On simplifie : ${val.html()}.`);
    wrong = [a.mul(b), val.inv(), new Fr(a.n * b.n, a.d * b.d + 1), b.div(a).add(1)];
  } else {
    const c = rf(2, 9);
    val = a.mul(b).div(c); expr = `${a.html()} ${X} ${b.html()} ${DV} ${c.html()}`;
    ex = steps(`On remplace ${DV} ${c.html()} par ${X} ${c.inv().html()}.`, `${a.html()} ${X} ${b.html()} ${X} ${c.inv().html()} = ${frRaw(a.n * b.n * c.d, a.d * b.d * c.n)}.`, `On simplifie : ${val.html()}.`);
    wrong = [a.mul(b).mul(c), a.div(b).div(c), val.inv(), a.mul(b)];
  }
  const m = mcq(R, val, wrong);
  return { q: P('Calculer :') + P(big(expr)), ...m, expl: ex + res(val.html()), tip: '<b>Astuce :</b> simplifie en croix avant de multiplier, les nombres restent petits.' };
});

gen('frac.of', { sub: 'calcul', ch: 'frac', name: 'Fraction d\'une quantité, fraction du reste', target: 70 }, (R, d) => {
  const rf = (maxD) => { let n, dd; do { dd = R.int(2, maxD); n = R.int(1, dd - 1); } while (gcd(n, dd) !== 1); return [n, dd]; };
  if (d === 1) {
    const [n, dd] = rf(9), N = dd * R.int(3, 30), val = N / dd * n;
    const m = mcq(R, val, [N / dd, N - val, N / n * dd, val + N / dd, val - N / dd].map((v) => round(v, 4)), { valid: Number.isInteger });
    return { q: P(`Combien valent les ${F(n, dd)} de ${fmt(N)} ?`), ...m, expl: steps(`On divise par le dénominateur : ${fmt(N)} ${DV} ${dd} = ${fmt(N / dd)}.`, `On multiplie par le numérateur : ${fmt(N / dd)} ${X} ${n} = ${fmt(val)}.`) + res(fmt(val)) };
  }
  const [a, b] = rf(5), [c, e] = rf(5);
  if (d === 2 && R.chance(0.5)) {
    const N = b * e * R.int(2, 12), val = N * a * c / (b * e);
    const m = mcq(R, val, [N * a / b, N * c / e, N * (a + c) / (b + e), val * 2, N - val].map((v) => round(v, 4)), { valid: Number.isInteger });
    return { q: P(`Combien valent les ${F(a, b)} des ${F(c, e)} de ${fmt(N)} ?`), ...m, expl: steps(`« Les ${F(a, b)} des ${F(c, e)} », c'est ${F(a, b)} ${X} ${F(c, e)} = ${frRaw(a * c, b * e)}.`, `${fmt(N)} ${X} ${frRaw(a * c, b * e)} = ${fmt(N)} ${DV} ${b * e} ${X} ${a * c} = ${fmt(val)}.`) + res(fmt(val)) };
  }
  const restFr = new Fr(b - a, b).mul(new Fr(e - c, e));
  const who = R.pick(['Léa', 'Tom', 'Inès', 'Hugo', 'Sarah', 'Yanis']);
  if (d === 2) {
    const wrong = [new Fr(1).sub(new Fr(a, b)).sub(new Fr(c, e)), new Fr(a, b).mul(new Fr(c, e)), new Fr(1).sub(restFr), new Fr(e - c, e)];
    const m = mcq(R, restFr, wrong.filter((f) => f.n > 0));
    return {
      q: P(`${who} dépense ${F(a, b)} de son salaire pour son loyer, puis ${F(c, e)} <b>de ce qui lui reste</b> pour ses courses. Quelle fraction de son salaire lui reste-t-il ?`), ...m,
      expl: steps(`Après le loyer, il reste 1 ${MINUS} ${F(a, b)} = ${F(b - a, b)} du salaire.`, `Les courses prennent ${F(c, e)} de ce reste : il reste donc ${F(e - c, e)} de ${F(b - a, b)}.`, `${F(e - c, e)} ${X} ${F(b - a, b)} = ${restFr.html()}.`) + res(restFr.html()),
      trap: `<b>Piège :</b> 1 ${MINUS} ${F(a, b)} ${MINUS} ${F(c, e)} est faux, car ${F(c, e)} porte sur le reste, pas sur le salaire entier.`,
    };
  }
  const B = b * e * R.int(4, 30), left = B * restFr.val();
  const m = mcq(R, B, [left / (1 - a / b - c / e), left * b / (b - a), left + B * a / b, B * 1.2, B * 0.8].map((v) => round(v, 2)), { valid: Number.isInteger, render: eur });
  return {
    q: P(`${who} dépense ${F(a, b)} de son budget, puis ${F(c, e)} de ce qui lui reste. Il lui reste alors ${eur(left)}. Quel était son budget de départ ?`), ...m,
    expl: steps(`Fraction restante : (1 ${MINUS} ${F(a, b)}) ${X} (1 ${MINUS} ${F(c, e)}) = ${F(b - a, b)} ${X} ${F(e - c, e)} = ${restFr.html()}.`, `Donc ${restFr.html()} du budget = ${eur(left)}.`, `Budget = ${fmt(left)} ${DV} ${restFr.html()} = ${fmt(left)} ${X} ${restFr.inv().html()} = ${eur(B)}.`) + res(eur(B)),
  };
});

gen('frac.cmp', { sub: 'calcul', ch: 'frac', name: 'Comparer des fractions', target: 60 }, (R, d) => {
  const center = R.pick([0.5, 0.6, 2 / 3, 0.7, 0.75, 0.4, 0.8]);
  const spread = d === 1 ? 0.2 : d === 2 ? 0.1 : 0.05;
  let fr = [], g = 0;
  while (g++ < 500) {
    fr = [];
    const seen = new Set();
    let h = 0;
    while (fr.length < 5 && h++ < 200) {
      const dd = R.int(d === 1 ? 3 : 5, d === 3 ? 19 : 13), n = Math.max(1, Math.round((center + (R.next() * 2 - 1) * spread) * dd));
      if (n >= dd || gcd(n, dd) !== 1) continue;
      const f = new Fr(n, dd);
      if (seen.has(f.key())) continue;
      seen.add(f.key()); fr.push(f);
    }
    if (fr.length < 5) continue;
    const vals = fr.map((f) => f.val()).sort((x, y) => y - x);
    if (vals[0] - vals[1] > 0.004 && vals[3] - vals[4] > 0.004) break;
  }
  const wantMax = R.chance(0.65);
  const sorted = fr.slice().sort((x, y) => y.val() - x.val());
  const correct = wantMax ? sorted[0] : sorted[4];
  const order = R.shuffle(fr);
  const list = sorted.map((f) => `${f.html()} ≈ ${fmt(round(f.val(), 3))}`).join(' ; ');
  const ex = steps(`On convertit chaque fraction en décimal (ou on compare deux à deux par produit en croix).`, `Du plus grand au plus petit : ${list}.`, `La ${wantMax ? 'plus grande' : 'plus petite'} est donc ${correct.html()}.`);
  return { q: P(`Quelle est la <b>${wantMax ? 'plus grande' : 'plus petite'}</b> de ces fractions ?`), choices: order.map((f) => f.html()), answer: order.indexOf(correct), expl: ex + res(correct.html()), tip: `<b>Produit en croix :</b> ${F('a', 'b')} &gt; ${F('c', 'd')} si a ${X} d &gt; c ${X} b. Utile pour départager les deux meilleures.` };
});

gen('frac.conv', { sub: 'calcul', ch: 'frac', name: 'Fractions, décimaux et pourcentages', target: 45 }, (R, d) => {
  if (d === 1) {
    const [n, dd] = R.pick([[1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [7, 20], [3, 20], [9, 25], [3, 10], [7, 10], [1, 20], [11, 20], [13, 25], [17, 50]]);
    const val = n / dd * 100;
    const m = mcq(R, val, [n * 10 + dd, val / 10, n + dd, 100 - val, val + 5].map((v) => round(v, 2)), { render: pc });
    return { q: P(`Écrire ${big(F(n, dd))} sous forme de pourcentage.`), ...m, expl: steps(`On veut une fraction sur 100 : ${F(n, dd)} = ${F(fmt(n * 100 / dd), 100)} (on a multiplié haut et bas par ${fmt(100 / dd)}).`, `${F(fmt(val), 100)} = ${pc(val)}.`) + res(pc(val)) };
  }
  if (d === 2) {
    const [t, n, dd] = R.pick([[12.5, 1, 8], [37.5, 3, 8], [62.5, 5, 8], [87.5, 7, 8], [35, 7, 20], [15, 3, 20], [4, 1, 25], [2.5, 1, 40], [0.5, 1, 200], [45, 9, 20], [64, 16, 25], [6.25, 1, 16]]);
    const correct = new Fr(n, dd);
    const m = mcq(R, correct, [new Fr(Math.round(t * 10), 1000), new Fr(n, dd * 10), new Fr(n + 1, dd), new Fr(n, dd + 2), new Fr(Math.round(t), 10)].filter((f) => !f.eq(correct)));
    return { q: P(`Quelle fraction irréductible est égale à ${big(pc(t))} ?`), ...m, expl: steps(`${pc(t)} = ${F(fmt(t), 100)}.`, `On simplifie (en multipliant haut et bas pour enlever la virgule si besoin) : ${correct.html()}.`, `Vérification : ${n} ${DV} ${dd} = ${fmt(n / dd)} = ${pc(t)}.`) + res(correct.html()) };
  }
  const pool = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [1, 8], [3, 8], [5, 8], [1, 10], [3, 10], [1, 20]];
  const [f1, f2, f3] = R.sample(pool, 3);
  const v1 = f1[0] / f1[1], v2 = f2[0] / f2[1], v3 = f3[0] / f3[1], val = round(v1 + v2 + v3, 6);
  const expr = `${fmt(v1)} + ${F(f2[0], f2[1])} + ${pc(v3 * 100)}`;
  const m = mcq(R, val, [round(v1 + v2 + v3 * 10, 6), round(v1 + v2 + v3 / 10, 6), round(v1 + f2[0] / (f2[1] + 1) + v3, 6), round(val + 0.05, 6), round(val - 0.1, 6)]);
  return { q: P('Calculer (résultat en décimal) :') + P(big(expr)), ...m, expl: steps(`On met tout en décimal : ${F(f2[0], f2[1])} = ${fmt(v2)} et ${pc(v3 * 100)} = ${fmt(v3)}.`, `${fmt(v1)} + ${fmt(v2)} + ${fmt(v3)} = ${fmt(val)}.`) + res(fmt(val)), tip: '<b>À connaître par cœur :</b> les huitièmes (0,125 ; 0,375 ; 0,625 ; 0,875).' };
});

gen('frac.etage', { sub: 'calcul', ch: 'frac', name: 'Fractions étagées', target: 70, diffs: [2, 3] }, (R, d) => {
  if (d === 2) {
    let a, b, c, e;
    do { b = R.int(2, 6); a = R.int(1, b - 1); e = R.int(2, 6); c = R.int(1, e - 1); } while (gcd(a, b) !== 1 || gcd(c, e) !== 1);
    const top = new Fr(1).add(new Fr(a, b)), bot = new Fr(1).sub(new Fr(c, e)), val = top.div(bot);
    const m = mcq(R, val, [top.mul(bot), bot.div(top), new Fr(a + 1, b + 1).div(new Fr(e - c, e)), val.add(1)]);
    return {
      q: P('Calculer :') + P(big(F(`1 + ${F(a, b)}`, `1 ${MINUS} ${F(c, e)}`))), ...m,
      expl: steps(`En haut : 1 + ${F(a, b)} = ${F(b + a, b)}.`, `En bas : 1 ${MINUS} ${F(c, e)} = ${F(e - c, e)}.`, `On divise : ${F(b + a, b)} ${X} ${F(e, e - c)} = ${val.html()}.`) + res(val.html()),
    };
  }
  const k = R.int(1, 3), j = R.int(2, 4);
  const inner = new Fr(k).add(new Fr(1, j));
  const mid = new Fr(1).add(inner.inv());
  const val = mid.inv();
  const m = mcq(R, val, [mid, inner.inv(), new Fr(1, k + j), val.add(new Fr(1, 2))]);
  return {
    q: P('Calculer :') + P(big(F(1, `1 + ${F(1, `${k} + ${F(1, j)}`)}`))), ...m,
    expl: steps(`On part du bas : ${k} + ${F(1, j)} = ${inner.html()}.`, `1 ${DV} ${inner.html()} = ${inner.inv().html()}, donc 1 + ${inner.inv().html()} = ${mid.html()}.`, `Enfin 1 ${DV} ${mid.html()} = ${val.html()}.`) + res(val.html()),
    tip: '<b>Méthode :</b> une fraction étagée se calcule toujours en partant de l\'étage le plus bas.',
  };
});

/* ---------------- Chapitre 3 : Puissances & racines ---------------- */
chapter({
  id: 'pow', sub: 'calcul', order: 3, title: 'Puissances & racines', short: 'Puissances',
  lesson: `
<p>${PW('a', 'n')} = a × a × … × a (n fois). Exemple : ${PW(2, 5)} = 2 × 2 × 2 × 2 × 2 = 32.</p>
<h3><span class="hl">1. Les 6 règles</span></h3>
<div class="formula">${PW('a', 'm')} × ${PW('a', 'n')} = ${PW('a', 'm+n')}<br>${PW('a', 'm')} ÷ ${PW('a', 'n')} = ${PW('a', 'm−n')}<br>(${PW('a', 'm')})${'<sup>n</sup>'} = ${PW('a', 'm×n')}<br>(a × b)${'<sup>n</sup>'} = ${PW('a', 'n')} × ${PW('b', 'n')}<br>${PW('a', 0)} = 1 &nbsp;·&nbsp; ${PW('a', '−n')} = ${F(1, PW('a', 'n'))}</div>
<div class="ex"><b>Exemple type Tage Mage</b><span>${F(`${PW(4, 3)} × ${PW(2, 5)}`, PW(8, 2))} : tout en base 2 → ${PW(4, 3)} = ${PW(2, 6)} et ${PW(8, 2)} = ${PW(2, 6)}.</span><span>${F(`${PW(2, 6)} × ${PW(2, 5)}`, PW(2, 6))} = ${PW(2, '6+5−6')} = ${PW(2, 5)} = 32.</span></div>
<div class="trap"><b>Piège :</b> ${PW(2, 3)} × ${PW(2, 4)} = ${PW(2, 7)} (on additionne), pas ${PW(2, 12)}. Et ${PW(2, 3)} + ${PW(2, 3)} = 2 × ${PW(2, 3)} = ${PW(2, 4)}.</div>
<h3><span class="hl">2. À connaître par cœur</span></h3>
<div class="tablewrap"><table>
<tr><th>Puissances de 2</th><td>2 · 4 · 8 · 16 · 32 · 64 · 128 · 256 · 512 · 1 024 (= ${PW(2, 10)})</td></tr>
<tr><th>Puissances de 3</th><td>3 · 9 · 27 · 81 · 243</td></tr>
<tr><th>Carrés</th><td>11²=121 · 12²=144 · 13²=169 · 14²=196 · 15²=225 · 16²=256 · 17²=289 · 18²=324 · 19²=361 · 25²=625</td></tr>
<tr><th>Cubes</th><td>2³=8 · 3³=27 · 4³=64 · 5³=125 · 10³=1 000</td></tr>
</table></div>
<h3><span class="hl">3. Puissances de 10</span></h3>
<p>${PW(10, 3)} = 1 000 ; ${PW(10, -2)} = 0,01. Multiplier par ${PW(10, 'n')} décale la virgule de n rangs vers la droite. Écriture scientifique : 45 000 = 4,5 × ${PW(10, 4)} ; 0,003 = 3 × ${PW(10, -3)}.</p>
<div class="ex"><b>Exemple</b><span>(2 × ${PW(10, 3)}) × (3 × ${PW(10, -5)}) = 6 × ${PW(10, '3−5')} = 6 × ${PW(10, -2)} = 0,06.</span></div>
<h3><span class="hl">4. Racines carrées</span></h3>
<div class="formula">${SQ('a × b')} = ${SQ('a')} × ${SQ('b')} &nbsp;·&nbsp; ${SQ(F('a', 'b'))} = ${F(SQ('a'), SQ('b'))} &nbsp;·&nbsp; (${SQ('a')})² = a</div>
<p><b>Simplifier</b> : on cherche le plus grand carré caché. ${SQ(72)} = ${SQ('36 × 2')} = 6${SQ(2)}. ${SQ(50)} + ${SQ(18)} = 5${SQ(2)} + 3${SQ(2)} = 8${SQ(2)}.</p>
<div class="trap"><b>Piège :</b> ${SQ('a + b')} ≠ ${SQ('a')} + ${SQ('b')}. Exemple : ${SQ(9)} + ${SQ(16)} = 3 + 4 = 7, alors que ${SQ(25)} = 5.</div>
<h3><span class="hl">5. Identités remarquables</span></h3>
<div class="formula">(a + b)² = a² + 2ab + b²<br>(a − b)² = a² − 2ab + b²<br>(a − b)(a + b) = a² − b²</div>
<p>Exemple : 1 001² − 999² = (1 001 − 999)(1 001 + 999) = 2 × 2 000 = 4 000.</p>
<h3><span class="hl">6. Comparer des puissances</span></h3>
<p>On ramène au <b>même exposant</b> : ${PW(2, 30)} = (${PW(2, 3)})<sup>10</sup> = ${PW(8, 10)} et ${PW(3, 20)} = (${PW(3, 2)})<sup>10</sup> = ${PW(9, 10)}. Comme 9 &gt; 8, ${PW(3, 20)} est le plus grand.</p>`,
});

gen('pow.rules', { sub: 'calcul', ch: 'pow', name: 'Règles des puissances', target: 55 }, (R, d) => {
  const b = R.pick([2, 3, 5, 10]);
  let expr, e, wrongE, ex;
  if (d === 1) {
    const m1 = R.int(2, 9), n1 = R.int(2, 9);
    if (R.chance(0.5)) { e = m1 + n1; wrongE = [m1 * n1, Math.abs(m1 - n1), e + 1]; expr = `${PW(b, m1)} ${X} ${PW(b, n1)}`; ex = steps(`Même base, on multiplie : on <b>additionne</b> les exposants.`, `${m1} + ${n1} = ${e}.`); }
    else { const hi = m1 + n1; e = hi - n1; wrongE = [hi + n1, Math.round(hi / n1) || 2, e + 1]; expr = `${PW(b, hi)} ${DV} ${PW(b, n1)}`; ex = steps(`Même base, on divise : on <b>soustrait</b> les exposants.`, `${hi} ${MINUS} ${n1} = ${e}.`); }
    const opts = [e, ...wrongE].map((x) => ({ b, e: x }));
    const m = mcq(R, opts[0], opts.slice(1).concat([{ b: b * b, e }, { b, e: e - 1 }]), { render: (o) => PW(o.b, o.e), key: (o) => o.b + '^' + o.e, sort: 'asc', sortKey: (o) => o.e + (o.b !== b ? 0.5 : 0), fill: (RR) => ({ b, e: Math.max(0, e + RR.int(-6, 6)) }) });
    return { q: P('Simplifier :') + P(big(expr)), ...m, expl: ex + res(PW(b, e)) };
  }
  if (d === 2) {
    const pw = { 4: 2, 8: 3, 16: 4 };
    const B1 = R.pick([4, 8]), B2 = R.pick([4, 8, 16]);
    const a1 = R.int(2, 5), a2 = R.int(2, 6), a3 = R.int(1, 4);
    e = pw[B1] * a1 + a2 - pw[B2] * a3;
    expr = F(`${PW(B1, a1)} ${X} ${PW(2, a2)}`, PW(B2, a3));
    ex = steps(`On écrit tout en base 2 : ${PW(B1, a1)} = ${PW(2, pw[B1] * a1)} et ${PW(B2, a3)} = ${PW(2, pw[B2] * a3)}.`, `Exposant final : ${pw[B1] * a1} + ${a2} ${MINUS} ${pw[B2] * a3} = ${e}.`, `Résultat : ${PW(2, e)}.`);
    const opts = [e, a1 + a2 - a3, pw[B1] * a1 + a2 + pw[B2] * a3, e + 1, e - 2, pw[B1] * a1 * a2 - pw[B2] * a3];
    const m = mcq(R, { b: 2, e: opts[0] }, opts.slice(1).map((x) => ({ b: 2, e: x })), { render: (o) => PW(o.b, o.e), key: (o) => o.b + '^' + o.e, sort: 'asc', sortKey: (o) => o.e, fill: (RR) => ({ b: 2, e: e + RR.int(-6, 6) }) });
    return { q: P('Simplifier (résultat sous forme de puissance de 2) :') + P(big(expr)), ...m, expl: ex + res(PW(2, e)), tip: '<b>Réflexe :</b> 4 = 2², 8 = 2³, 16 = 2⁴. Ramène tout à la même base.' };
  }
  const base = R.pick([3, 10]);
  const sq = base === 3 ? 9 : 100, cu = base === 3 ? 27 : 1000;
  const x1 = R.int(1, 4), x2 = R.int(2, 4), x3 = R.int(1, 2);
  e = -x1 + 2 * x2 - 3 * x3;
  expr = F(`${PW(base, MINUS + x1)} ${X} ${PW(sq, x2)}`, PW(cu, x3));
  ex = steps(`${sq} = ${PW(base, 2)} et ${fmt(cu)} = ${PW(base, 3)}.`, `Exposant : ${MINUS}${x1} + 2 ${X} ${x2} ${MINUS} 3 ${X} ${x3} = ${fmt(e)}.`, `Résultat : ${PW(base, fmt(e))}${e >= 0 && e <= 3 ? ' = ' + fmt(Math.pow(base, e)) : ''}.`);
  const opts = [e, x1 + 2 * x2 - 3 * x3, -x1 + x2 - x3, e + 2, e - 1, -x1 * 2 * x2];
  const m = mcq(R, { b: base, e: opts[0] }, opts.slice(1).map((x) => ({ b: base, e: x })), { render: (o) => PW(o.b, fmt(o.e)), key: (o) => o.b + '^' + o.e, sort: 'asc', sortKey: (o) => o.e, fill: (RR) => ({ b: base, e: e + RR.int(-6, 6) }) });
  return { q: P('Simplifier :') + P(big(expr)), ...m, expl: ex + res(PW(base, fmt(e))), trap: '<b>Piège :</b> attention au signe de l\'exposant négatif quand tu additionnes.' };
});

gen('pow.ten', { sub: 'calcul', ch: 'pow', name: 'Puissances de 10 et écriture scientifique', target: 55 }, (R, d) => {
  if (d === 1) {
    const a = R.int(2, 9), k = R.int(2, 4), b = R.int(2, 9), j = R.int(2, 4);
    const x = a * Math.pow(10, -k), y = b * Math.pow(10, j), val = round(x * y, 8);
    const m = mcq(R, val, [val * 10, val / 10, val * 100, val / 100].map((v) => round(v, 8)));
    return { q: P('Calculer :') + P(big(`${fmt(x, 8)} ${X} ${fmt(y)}`)), ...m, expl: steps(`${fmt(x, 8)} = ${a} ${X} ${PW(10, MINUS + k)} et ${fmt(y)} = ${b} ${X} ${PW(10, j)}.`, `${a} ${X} ${b} = ${a * b} et ${PW(10, `${MINUS}${k}+${j}`)} = ${PW(10, fmt(j - k))}.`, `${a * b} ${X} ${PW(10, fmt(j - k))} = ${fmt(val, 8)}.`) + res(fmt(val, 8)) };
  }
  const sci = (m, n) => { let mm = m, nn = n; while (mm >= 10) { mm /= 10; nn++; } while (mm < 1) { mm *= 10; nn--; } return { m: round(mm, 6), n: nn }; };
  const rend = (o) => `${fmt(o.m)} ${X} ${PW(10, fmt(o.n))}`, key = (o) => o.m + 'e' + o.n;
  let m1, e1, m2, e2, val, expr, ex;
  if (d === 2) {
    m1 = R.int(2, 9); e1 = R.int(2, 7); m2 = R.int(2, 9); e2 = -R.int(2, 8);
    val = sci(m1 * m2, e1 + e2);
    expr = `(${m1} ${X} ${PW(10, e1)}) ${X} (${m2} ${X} ${PW(10, fmt(e2))})`;
    ex = steps(`On multiplie les nombres entre eux : ${m1} ${X} ${m2} = ${m1 * m2}.`, `On additionne les exposants : ${e1} + (${fmt(e2)}) = ${fmt(e1 + e2)}.`, `${m1 * m2} ${X} ${PW(10, fmt(e1 + e2))} = ${rend(val)}.`);
  } else {
    m2 = R.int(2, 4); const q = R.int(2, 4); m1 = m2 * q; e1 = R.int(3, 8); e2 = -R.int(2, 6);
    val = sci(q, e1 - e2);
    expr = F(`${m1} ${X} ${PW(10, e1)}`, `${m2} ${X} ${PW(10, fmt(e2))}`);
    ex = steps(`${m1} ${DV} ${m2} = ${q}.`, `On soustrait les exposants : ${e1} ${MINUS} (${fmt(e2)}) = ${e1 - e2}.`, `Résultat : ${rend(val)}.`);
  }
  const wrong = [{ m: val.m, n: val.n + 1 }, { m: val.m, n: val.n - 1 }, { m: val.m, n: -val.n }, { m: val.m, n: val.n + 2 }, { m: round(val.m / 2, 4) >= 1 ? round(val.m / 2, 4) : round(val.m * 2, 4), n: val.n }];
  const m = mcq(R, val, wrong, { render: rend, key, sort: 'asc', sortKey: (o) => o.n + Math.log10(o.m) });
  return { q: P('Calculer :') + P(big(expr)), ...m, expl: ex + res(rend(val)), trap: '<b>Piège :</b> exposants qui s\'additionnent pour ×, qui se soustraient pour ÷ — et gare aux signes moins.' };
});

gen('pow.sqrt', { sub: 'calcul', ch: 'pow', name: 'Racines carrées', target: 55 }, (R, d) => {
  const rk = (k, m) => (k === 1 ? '' : fmt(k)) + SQ(m);
  if (d === 1) {
    const t = R.int(0, 2);
    if (t === 0) { const n = R.int(11, 25); const val = n; const m = mcq(R, val, [n + 1, n - 1, n * 2, n + 10], { valid: Number.isInteger }); return { q: P(`Calculer ${big(SQ(fmt(n * n)))}`), ...m, expl: steps(`On cherche le nombre qui, multiplié par lui-même, donne ${fmt(n * n)}.`, `${n} ${X} ${n} = ${fmt(n * n)}.`) + res(fmt(n)) }; }
    if (t === 1) { const k = R.int(2, 9), val = k / 10; const m = mcq(R, val, [k / 100, k, round(k * k / 200, 4), k / 10 + 0.1].map((v) => round(v, 4))); return { q: P(`Calculer ${big(SQ(fmt(k * k / 100)))}`), ...m, expl: steps(`${fmt(k * k / 100)} = ${F(k * k, 100)}.`, `${SQ(F(k * k, 100))} = ${F(SQ(k * k), SQ(100))} = ${F(k, 10)} = ${fmt(val)}.`) + res(fmt(val)), trap: `<b>Piège :</b> ${SQ('0,' + String(k * k).padStart(2, '0'))} n'est pas 0,0${k} : vérifie en mettant au carré.` }; }
    let a, b; do { a = R.int(1, 9); b = R.int(2, 12); } while (gcd(a, b) !== 1 || a >= b);
    const val = new Fr(a, b); const m = mcq(R, val, [new Fr(a * a, b), new Fr(a, b * b), new Fr(b, a), new Fr(a + 1, b)]);
    return { q: P(`Calculer ${big(SQ(F(a * a, b * b)))}`), ...m, expl: steps(`On prend la racine du haut et du bas : ${SQ(a * a)} = ${a} et ${SQ(b * b)} = ${b}.`) + res(val.html()) };
  }
  const val2 = (k, m) => k * Math.sqrt(m);
  const keyV = (o) => String(round(val2(o.k, o.m), 6));
  const rend = (o) => rk(o.k, o.m);
  if (d === 2) {
    const m0 = R.pick([2, 3, 5, 6, 7]);
    if (R.chance(0.5)) {
      const k = R.int(2, 9), N = k * k * m0, c = { k, m: m0 };
      const m = mcq(R, c, [{ k: k + 1, m: m0 }, { k: k - 1 || 3, m: m0 }, { k: m0, m: k }, { k: 2 * k, m: m0 }, { k, m: m0 + 1 }], { render: rend, key: keyV, sort: 'asc', sortKey: (o) => val2(o.k, o.m), fill: (RR) => ({ k: Math.max(1, k + RR.int(-4, 4)), m: RR.pick([2, 3, 5, 6, 7, 10]) }) });
      return { q: P(`Simplifier ${big(SQ(fmt(N)))}`), ...m, expl: steps(`On cherche le plus grand carré qui divise ${N} : ${N} = ${k * k} ${X} ${m0}.`, `${SQ(N)} = ${SQ(k * k)} ${X} ${SQ(m0)} = ${rk(k, m0)}.`) + res(rk(k, m0)) };
    }
    const k1 = R.int(2, 6), k2 = R.int(2, 6), c = { k: k1 + k2, m: m0 };
    const N1 = k1 * k1 * m0, N2 = k2 * k2 * m0;
    const m = mcq(R, c, [{ k: 1, m: N1 + N2 }, { k: k1 * k2, m: m0 }, { k: k1 + k2 + 1, m: m0 }, { k: k1 + k2, m: 2 * m0 }], { render: rend, key: keyV, sort: 'asc', sortKey: (o) => val2(o.k, o.m), fill: (RR) => ({ k: Math.max(1, k1 + k2 + RR.int(-4, 4)), m: RR.pick([2, 3, 5, 6, 7]) }) });
    return { q: P(`Calculer ${big(`${SQ(N1)} + ${SQ(N2)}`)}`), ...m, expl: steps(`${SQ(N1)} = ${SQ(`${k1 * k1} ${X} ${m0}`)} = ${rk(k1, m0)}.`, `${SQ(N2)} = ${SQ(`${k2 * k2} ${X} ${m0}`)} = ${rk(k2, m0)}.`, `${rk(k1, m0)} + ${rk(k2, m0)} = ${rk(k1 + k2, m0)}.`) + res(rk(k1 + k2, m0)), trap: `<b>Piège :</b> ${SQ(N1)} + ${SQ(N2)} n'est pas ${SQ(N1 + N2)}.` };
  }
  const t = R.int(0, 1);
  if (t === 0) {
    const a = R.pick([2, 3, 5, 6, 7]);
    const c = `${a + 1} + 2${SQ(a)}`;
    const opts = [c, `${a + 1}`, `${a} + 2${SQ(a)}`, `${a + 1} + ${SQ(a)}`, `${a + 2} + 2${SQ(a)}`];
    const m = mcq(R, c, opts.slice(1), { sort: 'none' });
    return { q: P(`Développer ${big(`(${SQ(a)} + 1)²`)}`), ...m, expl: steps(`(a + b)² = a² + 2ab + b² avec a = ${SQ(a)} et b = 1.`, `(${SQ(a)})² = ${a}, 2 ${X} ${SQ(a)} ${X} 1 = 2${SQ(a)}, 1² = 1.`, `Total : ${a} + 1 + 2${SQ(a)} = ${c}.`) + res(c), trap: `<b>Piège :</b> (${SQ(a)} + 1)² n'est pas ${a} + 1 : il manque le double produit.` };
  }
  const p = R.pick([[12, 3], [8, 2], [18, 2], [27, 3], [20, 5], [45, 5], [50, 2], [32, 2]]);
  const prod = Math.sqrt(p[0] * p[1]);
  const m = mcq(R, prod, [Math.sqrt(p[0]) * 1 + p[1], p[0] * p[1], prod * 2, prod / 2, p[0] + p[1]].map((v) => round(v, 4)), { valid: Number.isInteger });
  return { q: P(`Calculer ${big(`${SQ(p[0])} ${X} ${SQ(p[1])}`)}`), ...m, expl: steps(`${SQ('a')} ${X} ${SQ('b')} = ${SQ('a × b')}.`, `${SQ(`${p[0]} ${X} ${p[1]}`)} = ${SQ(p[0] * p[1])} = ${fmt(prod)}.`) + res(fmt(prod)) };
});

gen('pow.ident', { sub: 'calcul', ch: 'pow', name: 'Identités remarquables', target: 55 }, (R, d) => {
  if (d === 1) {
    const a = R.int(2, 9), s = R.sign(), sg = s > 0 ? '+' : MINUS;
    const c = `x² ${sg} ${2 * a}x + ${a * a}`;
    const opts = [c, `x² + ${a * a}`, `x² ${sg} ${a}x + ${a * a}`, `x² ${sg} ${2 * a}x + ${2 * a}`, `x² ${s > 0 ? MINUS : '+'} ${2 * a}x + ${a * a}`];
    const m = mcq(R, c, opts.slice(1), { sort: 'none', fill: (RR) => `x² ${RR.pick(['+', MINUS])} ${RR.int(1, 2 * a + 4)}x + ${RR.int(1, a * a + 9)}` });
    return { q: P(`Développer ${big(`(x ${sg} ${a})²`)}`), ...m, expl: steps(`(a ${sg} b)² = a² ${sg} 2ab + b².`, `Ici : x² ${sg} 2 ${X} x ${X} ${a} + ${a}² = ${c}.`) + res(c), trap: '<b>Piège :</b> oublier le double produit 2ab.' };
  }
  if (d === 2) {
    const t = R.int(0, 2);
    if (t === 0) { const m0 = R.pick([100, 1000, 50, 200, 500]), k = R.int(1, 9), val = (m0 + k) * (m0 + k) - (m0 - k) * (m0 - k); const m = mcq(R, val, [2 * k * m0, 2 * k, val / 2, val * 2, k * m0], { valid: Number.isInteger }); return { q: P(`Calculer ${big(`${PW(fmt(m0 + k), 2)} ${MINUS} ${PW(fmt(m0 - k), 2)}`)}`), ...m, expl: steps(`a² ${MINUS} b² = (a ${MINUS} b)(a + b).`, `(${fmt(m0 + k)} ${MINUS} ${fmt(m0 - k)})(${fmt(m0 + k)} + ${fmt(m0 - k)}) = ${2 * k} ${X} ${fmt(2 * m0)}.`, `= ${fmt(val)}.`) + res(fmt(val)) }; }
    const n = R.pick([31, 41, 51, 61, 71, 29, 39, 49, 59, 69, 81, 91]), r = Math.round(n / 10) * 10, k = n - r, val = n * n;
    const m = mcq(R, val, [r * r + k * k, val + 10, val - 20, r * r + 2 * Math.abs(k) * r], { valid: Number.isInteger });
    return { q: P(`Calculer ${big(PW(n, 2))} de tête.`), ...m, expl: steps(`${n} = ${r} ${k > 0 ? '+' : MINUS} ${Math.abs(k)}.`, `(${r} ${k > 0 ? '+' : MINUS} ${Math.abs(k)})² = ${fmt(r * r)} ${k > 0 ? '+' : MINUS} 2 ${X} ${r} ${X} ${Math.abs(k)} + ${k * k} = ${fmt(r * r)} ${k > 0 ? '+' : MINUS} ${2 * r * Math.abs(k)} + ${k * k}.`, `= ${fmt(val)}.`) + res(fmt(val)) };
  }
  const t = R.int(0, 1);
  if (t === 0) {
    const a = R.int(2, 9), c = `(x ${MINUS} ${a})(x + ${a})`;
    const opts = [c, `(x ${MINUS} ${a})²`, `(x + ${a})²`, `(x ${MINUS} ${a * a})(x + ${a * a})`, `x(x ${MINUS} ${a * a})`];
    const m = mcq(R, c, opts.slice(1), { sort: 'none', fill: (RR) => `(x ${MINUS} ${a + RR.int(1, 4)})(x + ${a + RR.int(1, 4)})` });
    return { q: P(`Factoriser ${big(`x² ${MINUS} ${a * a}`)}`), ...m, expl: steps(`x² ${MINUS} ${a * a} = x² ${MINUS} ${a}² : c'est a² ${MINUS} b² avec a = x et b = ${a}.`, `a² ${MINUS} b² = (a ${MINUS} b)(a + b) → ${c}.`) + res(c) };
  }
  const k = R.int(2, 5), a = R.int(1, 7);
  const c = `(${k}x ${MINUS} ${a})²`;
  const opts = [c, `(${k}x + ${a})²`, `(${k}x ${MINUS} ${a})(${k}x + ${a})`, `(${k * k}x ${MINUS} ${a})²`, `${k}(x ${MINUS} ${a})²`];
  const m = mcq(R, c, opts.slice(1), { sort: 'none', fill: (RR) => `(${k}x ${MINUS} ${a + RR.int(1, 5)})²` });
  return { q: P(`Factoriser ${big(`${k * k}x² ${MINUS} ${2 * k * a}x + ${a * a}`)}`), ...m, expl: steps(`${k * k}x² = (${k}x)² et ${a * a} = ${a}².`, `Le terme du milieu vaut 2 ${X} ${k}x ${X} ${a} = ${2 * k * a}x, avec un signe moins.`, `C'est donc (a ${MINUS} b)² avec a = ${k}x et b = ${a} : ${c}.`) + res(c) };
});

gen('pow.cmp', { sub: 'calcul', ch: 'pow', name: 'Comparer des puissances', target: 60 }, (R, d) => {
  if (d === 1) {
    const sets = [
      { items: [[4, 5, 1024], [2, 9, 512], [10, 3, 1000], [3, 6, 729], [5, 4, 625]], note: `${PW(4, 5)} = ${PW(2, 10)} = 1 024 ; ${PW(10, 3)} = 1 000 ; ${PW(3, 6)} = 729 ; ${PW(5, 4)} = 625 ; ${PW(2, 9)} = 512.` },
      { items: [[2, 7, 128], [5, 3, 125], [11, 2, 121], [3, 4, 81], [4, 3, 64]], note: `${PW(2, 7)} = 128 ; ${PW(5, 3)} = 125 ; ${PW(11, 2)} = 121 ; ${PW(3, 4)} = 81 ; ${PW(4, 3)} = 64.` },
      { items: [[3, 5, 243], [6, 3, 216], [15, 2, 225], [2, 8, 256], [4, 4, 256]], dup: true },
      { items: [[7, 3, 343], [3, 5, 243], [18, 2, 324], [2, 8, 256], [6, 3, 216]], note: `${PW(7, 3)} = 343 ; ${PW(18, 2)} = 324 ; ${PW(2, 8)} = 256 ; ${PW(3, 5)} = 243 ; ${PW(6, 3)} = 216.` },
    ].filter((s) => !s.dup);
    const s = R.pick(sets), wantMax = R.chance(0.6);
    const sorted = s.items.slice().sort((a, b) => b[2] - a[2]);
    const c = wantMax ? sorted[0] : sorted[4];
    const order = R.shuffle(s.items);
    return { q: P(`Quel est le <b>${wantMax ? 'plus grand' : 'plus petit'}</b> de ces nombres ?`), choices: order.map((x) => PW(x[0], x[1])), answer: order.indexOf(c), expl: steps(`On calcule chaque puissance : ${s.note}`) + res(PW(c[0], c[1])) };
  }
  const k = d === 2 ? R.pick([10, 12, 15, 20]) : R.pick([4, 5, 6, 8, 10]);
  const pool = d === 2 ? [[2, 3, 8], [3, 2, 9], [5, 1, 5], [6, 1, 6], [7, 1, 7]] : [[2, 5, 32], [3, 3, 27], [5, 2, 25], [6, 2, 36], [30, 1, 30]];
  const wantMax = R.chance(0.6);
  const sorted = pool.slice().sort((a, b) => b[2] - a[2]);
  const c = wantMax ? sorted[0] : sorted[4];
  const order = R.shuffle(pool);
  const lines = pool.map((x) => `${PW(x[0], x[1] * k)} = (${PW(x[0], x[1])})<sup>${k}</sup> = ${PW(x[2], k)}`).join(' ; ');
  return { q: P(`Quel est le <b>${wantMax ? 'plus grand' : 'plus petit'}</b> de ces nombres ?`), choices: order.map((x) => PW(x[0], x[1] * k)), answer: order.indexOf(c), expl: steps(`On ramène tout au même exposant ${k} : ${lines}.`, `Il suffit alors de comparer les bases : ${c[2]} est la ${wantMax ? 'plus grande' : 'plus petite'}.`) + res(PW(c[0], c[1] * k)), tip: '<b>Méthode :</b> cherche le plus grand diviseur commun des exposants, puis compare les bases.' };
});

/* ---------------- Chapitre 4 : Pourcentages ---------------- */
chapter({
  id: 'pct', sub: 'calcul', order: 4, title: 'Pourcentages', short: 'Pourcentages',
  lesson: `
<p>C'est LE chapitre le plus rentable du Tage Mage : il revient dans presque chaque épreuve, en calcul comme en conditions minimales.</p>
<h3><span class="hl">1. Prendre un pourcentage de tête</span></h3>
<div class="tablewrap"><table>
<tr><th>%</th><th>On fait</th><th>Exemple sur 240</th></tr>
<tr><td>10 %</td><td>÷ 10</td><td>24</td></tr>
<tr><td>5 %</td><td>moitié de 10 %</td><td>12</td></tr>
<tr><td>1 %</td><td>÷ 100</td><td>2,4</td></tr>
<tr><td>20 %</td><td>2 × 10 %</td><td>48</td></tr>
<tr><td>25 %</td><td>÷ 4</td><td>60</td></tr>
<tr><td>50 %</td><td>÷ 2</td><td>120</td></tr>
<tr><td>12,5 %</td><td>÷ 8</td><td>30</td></tr>
<tr><td>15 %</td><td>10 % + 5 %</td><td>24 + 12 = 36</td></tr>
</table></div>
<div class="tip"><b>Astuce d'inversion :</b> x % de y = y % de x. Donc 8 % de 50 = 50 % de 8 = 4.</div>
<h3><span class="hl">2. Le coefficient multiplicateur (CM)</span></h3>
<div class="formula">Hausse de t % → × (1 + t/100) &nbsp;&nbsp; ex : +15 % → × 1,15<br>Baisse de t % → × (1 − t/100) &nbsp;&nbsp; ex : −20 % → × 0,8</div>
<p>Un article à 80 € qui augmente de 15 % coûte 80 × 1,15 = 92 €.</p>
<h3><span class="hl">3. Trouver le taux d'évolution</span></h3>
<div class="formula">taux = (valeur finale − valeur initiale) ÷ valeur initiale</div>
<p>De 80 à 92 : (92 − 80) ÷ 80 = 12 ÷ 80 = 0,15 → <b>+15 %</b>. On divise toujours par la valeur de <b>départ</b>.</p>
<h3><span class="hl">4. Évolutions successives : on MULTIPLIE les CM</span></h3>
<p>+20 % puis −20 % : 1,2 × 0,8 = 0,96 → <b>−4 %</b> (et pas 0 %).</p>
<p>+10 % puis +10 % : 1,1 × 1,1 = 1,21 → <b>+21 %</b> (et pas 20 %).</p>
<div class="trap"><b>Piège n°1 :</b> les pourcentages ne s'additionnent jamais quand ils s'enchaînent.</div>
<h3><span class="hl">5. Évolution réciproque et valeur initiale</span></h3>
<p>Pour revenir au prix de départ après +25 %, on divise par 1,25, c'est-à-dire × 0,8 → <b>−20 %</b>.</p>
<p>Après une remise de 20 %, un article coûte 64 €. Prix initial : 64 ÷ 0,8 = <b>80 €</b>.</p>
<div class="trap"><b>Piège n°2 :</b> 64 × 1,2 = 76,8 est FAUX. Pour retrouver la valeur de départ, on divise par le CM.</div>
<div class="tablewrap"><table><tr><th>Hausse</th><td>+25 %</td><td>+50 %</td><td>+100 %</td><td>+20 %</td></tr><tr><th>Baisse pour revenir</th><td>−20 %</td><td>−33,3 %</td><td>−50 %</td><td>−16,7 %</td></tr></table></div>
<h3><span class="hl">6. Points de pourcentage</span></h3>
<p>Un taux qui passe de 8 % à 10 % augmente de <b>2 points</b>, mais de <b>25 %</b> (car 2 ÷ 8 = 0,25).</p>
<h3><span class="hl">7. HT, TTC et TVA à 20 %</span></h3>
<div class="formula">TTC = HT × 1,2 &nbsp;·&nbsp; HT = TTC ÷ 1,2 &nbsp;·&nbsp; TVA = HT × 0,2</div>`,
});

function pctHow(t, N) {
  const v = N * t / 100;
  const map = {
    10: `10 % = ${DV} 10 : ${fmt(N)} ${DV} 10 = ${fmt(v)}.`,
    20: `20 % = 2 ${X} 10 % : 2 ${X} ${fmt(N / 10)} = ${fmt(v)}.`,
    25: `25 % = ${DV} 4 : ${fmt(N)} ${DV} 4 = ${fmt(v)}.`,
    50: `50 % = la moitié : ${fmt(v)}.`,
    75: `75 % = 3 ${X} 25 % : 3 ${X} ${fmt(N / 4)} = ${fmt(v)}.`,
    5: `5 % = la moitié de 10 % : ${fmt(N / 10)} ${DV} 2 = ${fmt(v)}.`,
    15: `15 % = 10 % + 5 % : ${fmt(N / 10)} + ${fmt(N / 20)} = ${fmt(v)}.`,
    35: `35 % = 25 % + 10 % : ${fmt(N / 4)} + ${fmt(N / 10)} = ${fmt(v)}.`,
    45: `45 % = 50 % ${MINUS} 5 % : ${fmt(N / 2)} ${MINUS} ${fmt(N / 20)} = ${fmt(v)}.`,
    12.5: `12,5 % = ${F(1, 8)} : ${fmt(N)} ${DV} 8 = ${fmt(v)}.`,
    30: `30 % = 3 ${X} 10 % : 3 ${X} ${fmt(N / 10)} = ${fmt(v)}.`,
    60: `60 % = 50 % + 10 % : ${fmt(N / 2)} + ${fmt(N / 10)} = ${fmt(v)}.`,
    4: `4 % = 4 ${X} 1 % : 4 ${X} ${fmt(N / 100)} = ${fmt(v)}.`,
    8: `8 % de ${fmt(N)} = ${fmt(N)} % de 8 = ${fmt(v)} (astuce d'inversion), ou 8 ${X} ${fmt(N / 100)}.`,
    2.5: `2,5 % = le quart de 10 % : ${fmt(N / 10)} ${DV} 4 = ${fmt(v)}.`,
    17.5: `17,5 % = 10 % + 5 % + 2,5 % : ${fmt(N / 10)} + ${fmt(N / 20)} + ${fmt(N / 40)} = ${fmt(v)}.`,
    0.5: `0,5 % = la moitié de 1 % : ${fmt(N / 100)} ${DV} 2 = ${fmt(v)}.`,
    125: `125 % = 100 % + 25 % : ${fmt(N)} + ${fmt(N / 4)} = ${fmt(v)}.`,
    150: `150 % = 100 % + 50 % : ${fmt(N)} + ${fmt(N / 2)} = ${fmt(v)}.`,
    40: `40 % = 4 ${X} 10 % : 4 ${X} ${fmt(N / 10)} = ${fmt(v)}.`,
  };
  return map[t] || `${fmt(N)} ${X} ${fmt(t)} ${DV} 100 = ${fmt(v)}.`;
}

gen('pct.of', { sub: 'calcul', ch: 'pct', name: 'Prendre un pourcentage', target: 40 }, (R, d) => {
  const ts = d === 1 ? [10, 20, 25, 50, 75, 5] : d === 2 ? [15, 35, 45, 12.5, 30, 60, 4, 8, 40] : [2.5, 17.5, 0.5, 125, 150];
  if (d === 3 && R.chance(0.4)) {
    const t1 = R.pick([10, 20, 25, 50]), t2 = R.pick([10, 20, 30, 40, 60]), N = R.pick([200, 400, 500, 600, 800, 1000, 1200]);
    const val = N * t1 / 100 * t2 / 100;
    const m = mcq(R, val, [N * (t1 + t2) / 100, N * t1 / 100, N * t2 / 100, val * 10, val / 2].map((v) => round(v, 4)));
    return { q: P(`Combien font ${big(`${pc(t1)} de ${pc(t2)} de ${fmt(N)}`)} ?`), ...m, expl: steps(`On commence par la fin : ${pc(t2)} de ${fmt(N)} = ${fmt(N * t2 / 100)}.`, pctHow(t1, N * t2 / 100)) + res(fmt(val)), trap: '<b>Piège :</b> on n\'additionne pas les pourcentages (ce serait ' + pc(t1 + t2) + ' de ' + fmt(N) + ').' };
  }
  const t = R.pick(ts);
  const unitN = 100 / gcd(Math.round(t * 10), 1000) * 10;
  const N = Math.round(unitN) * R.int(2, d === 1 ? 12 : 9) * (d === 1 ? 10 / gcd(10, Math.round(unitN)) : 1);
  const val = round(N * t / 100, 4);
  const m = mcq(R, val, [val * 10, val / 10, N - val, round(N / t, 4), val + N / 20].map((v) => round(v, 4)));
  return { q: P(`Combien font ${big(`${pc(t)} de ${fmt(N)}`)} ?`), ...m, expl: steps(pctHow(t, N)) + res(fmt(val)), tip: '<b>Réflexe :</b> décompose en 10 %, 5 %, 1 %, 25 % ou 50 %.' };
});

gen('pct.evol', { sub: 'calcul', ch: 'pct', name: 'Évolution en pourcentage', target: 60 }, (R, d) => {
  if (d === 1) {
    const t = R.pick([10, 20, 25, 5, 15, 30, 40]), up = R.chance(0.5), P0 = R.int(2, 30) * 20;
    const cm = up ? 1 + t / 100 : 1 - t / 100, val = round(P0 * cm, 2);
    const m = mcq(R, val, [P0 + (up ? t : -t), round(P0 * t / 100, 2), round(P0 * (up ? 1 - t / 100 : 1 + t / 100), 2), round(P0 + (up ? 2 : -2) * P0 * t / 100, 2)], { render: eur2 });
    return { q: P(`Un article coûte ${eur(P0)}. Son prix ${up ? 'augmente' : 'baisse'} de ${pc(t)}. Quel est son nouveau prix ?`), ...m, expl: steps(`Coefficient multiplicateur : 1 ${up ? '+' : MINUS} ${fmt(t / 100)} = ${fmt(cm)}.`, `${fmt(P0)} ${X} ${fmt(cm)} = ${eur(val)}.`, `(Ou : ${pc(t)} de ${fmt(P0)} = ${fmt(P0 * t / 100)}, puis ${fmt(P0)} ${up ? '+' : MINUS} ${fmt(P0 * t / 100)}.)`) + res(eur(val)) };
  }
  const pairs = d === 2 ? [10, 20, 25, 15, 40, 12.5, 5, -10, -20, -25, -15, -40, -12.5, -5, 50, -50] : [25, -20, 75, -30, 28, -16, 60, -37.5, 150, -60, 35, -35];
  const t = R.pick(pairs);
  let V1, g = 0; do { V1 = R.int(2, 40) * (d === 2 ? 10 : 8); g++; } while (!Number.isInteger(round(V1 * (1 + t / 100), 6)) && g < 200);
  const V2 = round(V1 * (1 + t / 100), 4);
  const m = mcq(R, t, [round((V2 - V1) / V2 * 100, 2), V2 - V1, -t, t + (t > 0 ? 5 : -5), round(t * 1.2, 2)].map((v) => round(v, 2)), { render: sgnPc, positive: false });
  return { q: P(`Une valeur passe de ${fmt(V1)} à ${fmt(V2)}. Quel est le taux d'évolution ?`), ...m, expl: steps(`Variation : ${fmt(V2)} ${MINUS} ${fmt(V1)} = ${fmt(V2 - V1)}.`, `On divise par la valeur de DÉPART : ${fmt(V2 - V1)} ${DV} ${fmt(V1)} = ${fmt(t / 100)}.`, `Soit ${sgnPc(t)}.`) + res(sgnPc(t)), trap: '<b>Piège :</b> diviser par la valeur d\'arrivée au lieu de la valeur de départ.' };
});

gen('pct.succ', { sub: 'calcul', ch: 'pct', name: 'Évolutions successives', target: 60 }, (R, d) => {
  if (d === 3) {
    const combo = R.pick([[-20, 20, 50], [25, 0, -20], [50, 20, -20], [-40, -10, 50], [20, -4, -20], [60, 20, -25], [-50, -25, 50], [-20, 0, 25], [100, 50, -25]]);
    const [t1, target, need] = combo;
    const m = mcq(R, need, [target - t1, -t1, need + 10, need - 10, round(need / 2, 2)], { render: sgnPc, positive: false });
    return { q: P(`Un prix évolue d'abord de ${sgnPc(t1)}. Quelle seconde évolution faut-il appliquer pour obtenir au total une évolution de ${sgnPc(target)} ?`), ...m, expl: steps(`CM de la 1re évolution : ${fmt(1 + t1 / 100)}. CM total voulu : ${fmt(1 + target / 100)}.`, `CM de la 2e : ${fmt(1 + target / 100)} ${DV} ${fmt(1 + t1 / 100)} = ${fmt(1 + need / 100)}.`, `Soit ${sgnPc(need)}.`) + res(sgnPc(need)), trap: `<b>Piège :</b> faire ${fmt(target)} ${MINUS} (${fmt(t1)}) = ${sgnPc(target - t1)}.` };
  }
  const combos = d === 1 ? [[10, 10], [20, -20], [-10, -10], [50, -50], [10, -10], [20, 20], [-20, -20], [30, 10]] : [[25, -20], [-20, 25], [50, -20], [30, -30], [40, -25], [-50, 100], [60, -25], [10, 10, 10], [20, -10, -10]];
  const ts = R.pick(combos);
  const cm = ts.reduce((a, t) => a * (1 + t / 100), 1), tot = round((cm - 1) * 100, 2);
  const sum = ts.reduce((a, t) => a + t, 0);
  const m = mcq(R, tot, [sum, round(tot - 2, 2), -tot, sum + (tot > sum ? -1 : 1) * 1, round(tot / 2, 2)], { render: sgnPc, positive: false });
  const txt = ts.map((t) => sgnPc(t)).join(', puis ');
  return { q: P(`Un prix subit successivement : ${txt}. Quelle est l'évolution globale ?`), ...m, expl: steps(`On multiplie les coefficients : ${ts.map((t) => fmt(1 + t / 100)).join(` ${X} `)} = ${fmt(round(cm, 4))}.`, `${fmt(round(cm, 4))} ${MINUS} 1 = ${fmt(round(cm - 1, 4))}, soit ${sgnPc(tot)}.`) + res(sgnPc(tot)), trap: `<b>Piège :</b> additionner les pourcentages (${sgnPc(sum)}) est faux.` };
});

gen('pct.recip', { sub: 'calcul', ch: 'pct', name: 'Évolution réciproque', target: 55 }, (R, d) => {
  const pairs = d === 1 ? [[25, -20], [-20, 25], [100, -50], [-50, 100]] : d === 2 ? [[60, -37.5], [-60, 150], [300, -75], [-75, 300], [-80, 400], [150, -60]] : [[50, -100 / 3], [20, -100 / 6], [-25, 100 / 3], [-10, 100 / 9], [-37.5, 60], [400, -80]];
  const [t, r] = R.pick(pairs);
  const approx = !Number.isInteger(round(r * 100, 6));
  const rr = round(r, 1);
  const rend = (v) => (approx ? '≈ ' : '') + sgnPc(round(v, 1));
  const m = mcq(R, rr, [-t, round(-t * 0.9, 1), round(rr + (rr > 0 ? 10 : -10), 1), round(rr / 2, 1)], { render: rend, positive: false });
  return { q: P(`Un prix ${t > 0 ? 'augmente' : 'baisse'} de ${pc(Math.abs(t))}. Quelle évolution faut-il appliquer pour qu'il revienne à sa valeur initiale ?`), ...m, expl: steps(`CM de l'évolution : ${fmt(1 + t / 100)}.`, `Pour revenir au départ, on applique le CM inverse : 1 ${DV} ${fmt(1 + t / 100)} = ${fmt(round(1 + r / 100, 4))}.`, `Soit ${rend(rr)}.`) + res(rend(rr)), trap: `<b>Piège :</b> répondre ${sgnPc(-t)}. La base a changé entre les deux évolutions.` };
});

gen('pct.init', { sub: 'calcul', ch: 'pct', name: 'Retrouver la valeur initiale', target: 60 }, (R, d) => {
  if (d < 3) {
    const t = R.pick(d === 1 ? [20, 25, 10, 50] : [20, 25, 15, 40, 12.5, 30]), up = d === 1 ? R.chance(0.3) : R.chance(0.5);
    const cm = up ? 1 + t / 100 : 1 - t / 100;
    let V0, g = 0; do { V0 = R.int(4, 60) * 10; g++; } while (!Number.isInteger(round(V0 * cm, 6)) && g < 300);
    const V = round(V0 * cm, 4);
    const m = mcq(R, V0, [round(V * (up ? 1 - t / 100 : 1 + t / 100), 2), round(V + (up ? -1 : 1) * t, 2), round(V / (up ? 1 - t / 100 : 1 + t / 100), 2), V0 + 10], { render: eur2 });
    return { q: P(`Après ${up ? 'une hausse' : 'une remise'} de ${pc(t)}, un article coûte ${eur(V)}. Quel était son prix avant ${up ? 'la hausse' : 'la remise'} ?`), ...m, expl: steps(`Prix initial ${X} ${fmt(cm)} = ${fmt(V)}.`, `Donc prix initial = ${fmt(V)} ${DV} ${fmt(cm)} = ${eur(V0)}.`, `Vérification : ${fmt(V0)} ${X} ${fmt(cm)} = ${fmt(V)}. ✔`) + res(eur(V0)), trap: `<b>Piège :</b> ${fmt(V)} ${X} ${fmt(up ? 1 - t / 100 : 1 + t / 100)} = ${fmt(round(V * (up ? 1 - t / 100 : 1 + t / 100), 2))} est faux : on DIVISE par le coefficient.` };
  }
  const [t1, t2] = R.pick([[20, -25], [25, -20], [-20, 50], [10, 10], [50, -20], [-10, 20]]);
  const cm = (1 + t1 / 100) * (1 + t2 / 100);
  let V0, g = 0; do { V0 = R.int(4, 50) * 20; g++; } while (!Number.isInteger(round(V0 * cm, 6)) && g < 300);
  const V = round(V0 * cm, 4);
  const m = mcq(R, V0, [round(V / (1 + (t1 + t2) / 100), 2), round(V * (1 - t1 / 100) * (1 - t2 / 100), 2), V0 + 20, V0 - 20], { render: eur2 });
  return { q: P(`Un prix augmente ou baisse successivement de ${sgnPc(t1)} puis ${sgnPc(t2)}. Il vaut alors ${eur(V)}. Quel était le prix de départ ?`), ...m, expl: steps(`CM global : ${fmt(1 + t1 / 100)} ${X} ${fmt(1 + t2 / 100)} = ${fmt(round(cm, 4))}.`, `Prix de départ = ${fmt(V)} ${DV} ${fmt(round(cm, 4))} = ${eur(V0)}.`) + res(eur(V0)) };
});

gen('pct.pts', { sub: 'calcul', ch: 'pct', name: 'Points de pourcentage', target: 50 }, (R, d) => {
  const pairs = d === 1 ? [[8, 10], [20, 25], [4, 5], [10, 12], [5, 6], [40, 50]] : d === 2 ? [[12, 15], [10, 15], [6, 9], [20, 30], [5, 8], [10, 8], [25, 20]] : [[50, 40], [12, 9], [8, 6], [16, 20], [15, 12], [24, 30], [2.5, 3]];
  const [a, b] = R.pick(pairs);
  const t = round((b - a) / a * 100, 2);
  const m = mcq(R, t, [b - a, round((b - a) / b * 100, 2), round(a / b * 100, 2), -t, t + 5].map((v) => round(v, 2)), { render: sgnPc, positive: false });
  const what = R.pick(['Le taux de chômage', 'La part de marché d\'une entreprise', 'Le taux d\'intérêt d\'un livret', 'Le taux de réussite à un examen']);
  return { q: P(`${what} passe de ${pc(a)} à ${pc(b)}. De combien de <b>pourcents</b> (et non de points) a-t-il évolué ?`), ...m, expl: steps(`L'écart est de ${fmt(b - a)} <b>points</b>.`, `En pourcentage, on rapporte l'écart à la valeur de départ : ${fmt(b - a)} ${DV} ${fmt(a)} = ${fmt(round((b - a) / a, 4))}.`, `Soit ${sgnPc(t)}.`) + res(sgnPc(t)), trap: `<b>Piège :</b> confondre ${fmt(Math.abs(b - a))} points et ${fmt(Math.abs(b - a))} %.` };
});

gen('pct.tva', { sub: 'calcul', ch: 'pct', name: 'HT, TTC et TVA', target: 50 }, (R, d) => {
  if (d === 3) {
    const HT = R.int(2, 40) * 10, TTC = round(HT * 1.1, 2);
    const m = mcq(R, HT, [round(TTC * 0.9, 2), round(TTC - 10, 2), round(TTC / 1.2, 2), HT + 10], { render: eur2 });
    return { q: P(`Dans un restaurant, la TVA est de 10 %. Une addition s'élève à ${eur(TTC)} TTC. Quel est le montant hors taxes ?`), ...m, expl: steps(`TTC = HT ${X} 1,1.`, `HT = ${fmt(TTC)} ${DV} 1,1 = ${eur(HT)}.`) + res(eur(HT)), trap: `<b>Piège :</b> ${fmt(TTC)} ${X} 0,9 = ${fmt(round(TTC * 0.9, 2))} n'est pas le prix HT.` };
  }
  const HT = R.int(3, 50) * 5, TTC = HT * 1.2;
  if (d === 1) {
    if (R.chance(0.5)) { const m = mcq(R, TTC, [HT + 20, HT * 1.02, HT * 0.8, TTC + 10].map((v) => round(v, 2)), { render: eur2 }); return { q: P(`Un article coûte ${eur(HT)} hors taxes. Avec une TVA de 20 %, quel est son prix TTC ?`), ...m, expl: steps(`TTC = HT ${X} 1,2 = ${fmt(HT)} ${X} 1,2 = ${eur(TTC)}.`) + res(eur(TTC)) }; }
    const tva = round(HT * 0.2, 2); const m = mcq(R, tva, [round(TTC * 0.2, 2), round(HT * 0.02, 2), round(tva * 2, 2), 20], { render: eur2 });
    return { q: P(`Un article coûte ${eur(TTC)} TTC (TVA 20 %). Quel est le montant de la TVA ?`), ...m, expl: steps(`HT = ${fmt(TTC)} ${DV} 1,2 = ${fmt(HT)}.`, `TVA = ${fmt(TTC)} ${MINUS} ${fmt(HT)} = ${eur(tva)}.`) + res(eur(tva)), trap: `<b>Piège :</b> la TVA ne vaut pas 20 % du prix TTC (${fmt(round(TTC * 0.2, 2))} €).` };
  }
  const m = mcq(R, HT, [round(TTC * 0.8, 2), TTC - 20, round(TTC / 1.02, 2), HT + 5], { render: eur2 });
  return { q: P(`Un article coûte ${eur(TTC)} TTC, avec une TVA de 20 %. Quel est son prix hors taxes ?`), ...m, expl: steps(`TTC = HT ${X} 1,2, donc HT = TTC ${DV} 1,2.`, `${fmt(TTC)} ${DV} 1,2 = ${eur(HT)}.`) + res(eur(HT)), trap: `<b>Piège :</b> ${fmt(TTC)} ${X} 0,8 = ${fmt(round(TTC * 0.8, 2))} est faux (retirer 20 % du TTC ≠ revenir au HT).` };
});

gen('pct.pop', { sub: 'calcul', ch: 'pct', name: 'Pourcentages de populations', target: 70 }, (R, d) => {
  if (d === 1) {
    const N = R.pick([200, 400, 500, 800, 1000, 1200]), a = R.pick([40, 50, 60, 75, 25]), b = R.pick([10, 20, 25, 30, 40]);
    const val = N * a / 100 * b / 100;
    const m = mcq(R, val, [N * b / 100, N * a / 100, N * (a + b) / 100, val * 2, N * (100 - a) / 100 * b / 100].map((v) => round(v, 2)), { valid: Number.isInteger });
    return { q: P(`Une entreprise compte ${fmt(N)} salariés. ${pc(a)} sont des femmes, et ${pc(b)} de ces femmes sont cadres. Combien y a-t-il de femmes cadres ?`), ...m, expl: steps(`Femmes : ${pc(a)} de ${fmt(N)} = ${fmt(N * a / 100)}.`, `Femmes cadres : ${pc(b)} de ${fmt(N * a / 100)} = ${fmt(val)}.`) + res(fmt(val)) };
  }
  const combos = d === 2 ? [[60, 25, 40, 31], [40, 50, 25, 35], [70, 20, 50, 29], [30, 40, 20, 26], [50, 30, 10, 20], [80, 25, 50, 30]] : [[60, 25, 37.5, 50], [40, 30, 20, 50], [75, 20, 60, 50], [20, 60, 10, 60], [30, 50, 15, 58.82]];
  const [p, r1, r2, ans] = R.pick(combos);
  if (d === 2) {
    const m = mcq(R, ans, [round((r1 + r2) / 2, 2), r1, r2, round(ans + 5, 2)], { render: pc });
    return { q: P(`Dans une école, ${pc(p)} des élèves sont des filles. ${pc(r1)} des filles et ${pc(r2)} des garçons font du sport. Quel pourcentage des élèves fait du sport ?`), ...m, expl: steps(`Filles sportives : ${fmt(p / 100)} ${X} ${fmt(r1 / 100)} = ${fmt(round(p * r1 / 10000, 4))}.`, `Garçons sportifs : ${fmt(1 - p / 100)} ${X} ${fmt(r2 / 100)} = ${fmt(round((100 - p) * r2 / 10000, 4))}.`, `Total : ${fmt(round(p * r1 / 10000 + (100 - p) * r2 / 10000, 4))}, soit ${pc(ans)}.`) + res(pc(ans)), trap: `<b>Piège :</b> faire la moyenne simple ${pc(round((r1 + r2) / 2, 2))} sans tenir compte de la proportion de filles.` };
  }
  const f = p * r1 / 100, gg = (100 - p) * r2 / 100, val = round(f / (f + gg) * 100, 1);
  const m = mcq(R, val, [r1, p, round(f, 1), round(100 - val, 1)], { render: (v) => (Number.isInteger(v) ? '' : '≈ ') + pc(v) });
  return { q: P(`Dans une école, ${pc(p)} des élèves sont des filles. ${pc(r1)} des filles et ${pc(r2)} des garçons font du théâtre. Parmi les élèves qui font du théâtre, quelle est la proportion de filles ?`), ...m, expl: steps(`Sur 100 élèves : ${fmt(p)} filles dont ${fmt(f)} font du théâtre ; ${fmt(100 - p)} garçons dont ${fmt(gg)} font du théâtre.`, `Total théâtre : ${fmt(round(f + gg, 2))}.`, `Proportion de filles : ${fmt(f)} ${DV} ${fmt(round(f + gg, 2))} ${Number.isInteger(val) ? '=' : '≈'} ${pc(val)}.`) + res(pc(val)), tip: '<b>Méthode :</b> raisonne sur 100 personnes, tout devient concret.' };
});

/* ---- 31-calcul-2.js ---- */
/* ===== CALCUL (2/3) : proportionnalité, durées, vitesses, moyennes, équations ===== */
const cx = (k, v = 'x') => (k === 1 ? v : k === -1 ? MINUS + v : fmt(k) + v);
const NAMES = ['Léa', 'Tom', 'Inès', 'Hugo', 'Sarah', 'Yanis', 'Chloé', 'Nathan', 'Emma', 'Adam', 'Jade', 'Lucas'];

/* ---------------- Chapitre 5 : Proportionnalité, partages, ratios ---------------- */
chapter({
  id: 'prop', sub: 'calcul', order: 5, title: 'Proportionnalité, partages & ratios', short: 'Proportionnalité',
  lesson: `
<p>Deux grandeurs sont proportionnelles quand on passe de l'une à l'autre en multipliant toujours par le même nombre : prix et quantité, distance et durée à vitesse fixe, recette et nombre de personnes…</p>
<h3><span class="hl">1. La règle de trois</span></h3>
<p>5 kg coûtent 12 €. Combien coûtent 8 kg ?</p>
<ul><li><b>Par l'unité</b> : 1 kg coûte 12 ÷ 5 = 2,40 €, donc 8 kg coûtent 8 × 2,40 = <b>19,20 €</b>.</li><li><b>Produit en croix</b> : 12 × 8 ÷ 5 = 96 ÷ 5 = <b>19,20 €</b>.</li></ul>
<div class="formula">${F('a', 'b')} = ${F('c', 'x')} &nbsp;⇒&nbsp; x = ${F('b × c', 'a')}</div>
<h3><span class="hl">2. La proportionnalité inverse</span></h3>
<p>Quand l'une augmente, l'autre diminue, et c'est leur <b>produit</b> qui reste constant : ouvriers × jours, vitesse × temps, débit × durée.</p>
<div class="ex"><b>Exemple</b><span>6 ouvriers mettent 10 jours : le chantier représente 6 × 10 = 60 « jours-ouvrier ».</span><span>Avec 4 ouvriers : 60 ÷ 4 = <b>15 jours</b>.</span></div>
<div class="trap"><b>Piège :</b> faire une règle de trois directe (on trouverait 6,67 jours). Moins d'ouvriers = plus de jours !</div>
<h3><span class="hl">3. Le partage proportionnel</span></h3>
<p>Partager 540 € proportionnellement à 2, 3 et 4 : on compte les parts (2 + 3 + 4 = 9), une part vaut 540 ÷ 9 = 60 €, donc on distribue <b>120 €, 180 € et 240 €</b>.</p>
<p>Partage <b>inversement</b> proportionnel à 2, 3 et 6 : on partage selon ${F(1, 2)}, ${F(1, 3)}, ${F(1, 6)}, c'est-à-dire selon 3, 2 et 1 (en multipliant tout par 6).</p>
<h3><span class="hl">4. Les ratios</span></h3>
<p>« Le rapport filles/garçons vaut 3/5 » (ou 3 : 5) : pour 3 filles il y a 5 garçons, soit des « paquets » de 8 élèves. Avec 48 élèves : 48 ÷ 8 = 6 paquets → <b>18 filles et 30 garçons</b>.</p>
<h3><span class="hl">5. Les échelles</span></h3>
<p>Échelle 1/25 000 : 1 cm sur la carte = 25 000 cm en vrai = 250 m. Donc 4 cm = 1 km.</p>
<div class="tip"><b>Conversion express :</b> 1 km = 100 000 cm. Pour passer des cm aux km, on enlève 5 zéros.</div>`,
});

gen('prop.trois', { sub: 'calcul', ch: 'prop', name: 'Règle de trois', target: 55 }, (R, d) => {
  if (d < 3) {
    const ctx = R.pick([['kg de pommes', 'coûtent', '€'], ['m de tissu', 'coûtent', '€'], ['L d\'essence', 'coûtent', '€']]);
    const p = d === 1 ? R.pick([1.5, 2, 2.5, 3, 4, 0.5]) : R.pick([1.2, 1.6, 2.4, 3.2, 1.25, 0.8, 1.75, 2.8]);
    const q1 = R.int(3, 9); let q2; do { q2 = R.int(2, 15); } while (q2 === q1);
    const t1 = round(p * q1, 2), val = round(p * q2, 2);
    const m = mcq(R, val, [round(t1 + (q2 - q1), 2), round(t1 * q1 / q2, 2), round(val + p, 2), round(val - p, 2), round(t1 / q1, 2)], { render: eur2 });
    return { q: P(`${q1} ${ctx[0]} ${ctx[1]} ${eur2(t1)}. Combien coûtent ${q2} ${ctx[0]} ?`), ...m, expl: steps(`Prix d'une unité : ${eur2(t1)} ${DV} ${q1} = ${eur2(p)}.`, `${q2} ${X} ${fmt(p)} = ${eur2(val)}.`) + res(eur2(val)) };
  }
  const m1 = R.int(2, 5), h1 = R.int(2, 6), rate = R.int(3, 15), m2 = R.intNot(2, 8, [m1]), h2 = R.intNot(2, 9, [h1]);
  const n1 = m1 * h1 * rate, val = m2 * h2 * rate;
  const m = mcq(R, val, [n1 * m2 / m1, n1 * h2 / h1, n1 + (m2 - m1) + (h2 - h1), val + rate * m2, Math.round(n1 * m1 * h1 / (m2 * h2))], { valid: Number.isInteger });
  return { q: P(`${m1} machines identiques fabriquent ${n1} pièces en ${h1} heures. Combien de pièces fabriquent ${m2} machines en ${h2} heures ?`), ...m, expl: steps(`Une machine fabrique en une heure : ${n1} ${DV} (${m1} ${X} ${h1}) = ${rate} pièces.`, `${m2} machines pendant ${h2} h : ${rate} ${X} ${m2} ${X} ${h2} = ${val}.`) + res(fmt(val)), tip: '<b>Méthode :</b> ramène tout à « 1 machine pendant 1 heure ».' };
});

gen('prop.inv', { sub: 'calcul', ch: 'prop', name: 'Proportionnalité inverse', target: 60 }, (R, d) => {
  if (d === 1) {
    const total = R.pick([60, 72, 84, 90, 120, 144, 180]);
    const ws = divisors(total).filter((x) => x >= 2 && x <= 15 && total / x <= 40);
    const [w1, w2] = R.sample(ws, 2); const d1 = total / w1, val = total / w2;
    const m = mcq(R, val, [round(d1 * w2 / w1, 2), d1 + (w1 - w2), d1, val + 2].map((v) => round(v, 2)));
    return { q: P(`${w1} ouvriers mettent ${d1} jours pour construire un mur. Combien de jours faudrait-il à ${w2} ouvriers travaillant au même rythme ?`), ...m, expl: steps(`Le travail total vaut ${w1} ${X} ${d1} = ${total} jours-ouvrier.`, `Avec ${w2} ouvriers : ${total} ${DV} ${w2} = ${fmt(val)} jours.`) + res(plural(val, 'jour')), trap: '<b>Piège :</b> moins d\'ouvriers → plus de jours. Ce n\'est pas une règle de trois directe.' };
  }
  if (d === 2) {
    const [v1, t1, v2] = R.pick([[90, 2, 120], [60, 3, 90], [80, 1.5, 120], [100, 3, 120], [75, 2, 100], [120, 2.5, 100], [50, 3, 60]]);
    const dist = v1 * t1, t2 = dist / v2;
    const m = mcq(R, Math.round(t2 * 60), [Math.round(t1 * v2 / v1 * 60), Math.round(t2 * 60) + 10, Math.round(t2 * 60) - 15, Math.round((t1 - (v2 - v1) / 60) * 60), Math.round(t2 * 100)], { render: (v) => hm(v / 60) });
    return { q: P(`À ${v1} km/h, un trajet dure ${hm(t1)}. Combien de temps dure-t-il à ${v2} km/h ?`), ...m, expl: steps(`Distance : ${v1} ${X} ${fmt(t1)} = ${dist} km.`, `Durée à ${v2} km/h : ${dist} ${DV} ${v2} = ${fmt(round(t2, 4))} h = ${hm(t2)}.`) + res(hm(t2)) };
  }
  const people = R.pick([10, 12, 15, 20]), days = R.pick([20, 24, 30, 36]), after = R.pick([4, 5, 6, 10]);
  const rem = people * (days - after);
  const cands = []; for (let x = 2; x < people - 1; x++) if (rem % (people - x) === 0) cands.push(x);
  const leave = R.pick(cands), val = rem / (people - leave);
  const m = mcq(R, val, [days - after, days, round(val * (people - leave) / people, 2), val + 5], { valid: (v) => v > 0 });
  return { q: P(`Une réserve permet de nourrir ${people} personnes pendant ${days} jours. Au bout de ${after} jours, ${leave} personnes s'en vont. Pendant combien de jours la réserve durera-t-elle encore ?`), ...m, expl: steps(`Réserve totale : ${people} ${X} ${days} = ${people * days} rations.`, `Après ${after} jours, il reste ${people * days} ${MINUS} ${people} ${X} ${after} = ${rem} rations.`, `Pour ${people - leave} personnes : ${rem} ${DV} ${people - leave} = ${fmt(val)} jours.`) + res(plural(val, 'jour')) };
});

gen('prop.partage', { sub: 'calcul', ch: 'prop', name: 'Partages proportionnels', target: 60 }, (R, d) => {
  let parts, ask, total, intro, ex;
  if (d === 3) {
    const sets = [[2, 3, 6], [3, 4, 6], [2, 4, 4], [1, 2, 3]];
    const inv = R.pick(sets), L = inv.reduce((a, b) => lcm(a, b), 1);
    parts = inv.map((x) => L / x);
    const S = parts.reduce((a, b) => a + b, 0);
    total = S * R.int(10, 40) * 10; ask = R.int(0, 2);
    const val = total / S * parts[ask];
    const m = mcq(R, val, [total / inv.reduce((a, b) => a + b, 0) * inv[ask], total / 3, total / S * parts[2 - ask], val + total / S].map((v) => round(v, 2)), { render: eur });
    return { q: P(`On partage ${eur(total)} entre trois personnes, <b>inversement proportionnellement</b> à leur nombre d'absences : ${inv.join(', ')}. Combien reçoit la personne qui a ${inv[ask]} absence${inv[ask] > 1 ? 's' : ''} ?`), ...m, expl: steps(`Inversement proportionnel à ${inv.join(', ')} = proportionnel à ${inv.map((x) => F(1, x)).join(', ')}.`, `On multiplie par ${L} : proportionnel à ${parts.join(', ')} (total ${S} parts).`, `Une part vaut ${fmt(total)} ${DV} ${S} = ${fmt(total / S)} €, donc ${parts[ask]} parts = ${eur(val)}.`) + res(eur(val)), trap: '<b>Piège :</b> celui qui a le plus d\'absences reçoit le moins.' };
  }
  if (d === 1) { parts = R.sample([1, 2, 3, 4, 5, 6], 3); }
  else { const base = R.pick([500, 1000, 1500]); parts = R.sample([2, 3, 4, 5, 7], 3); intro = parts.map((p) => fmt(p * base) + NB + '€'); }
  const S = parts.reduce((a, b) => a + b, 0);
  total = S * R.int(4, 30) * 10; ask = R.int(0, 2);
  const val = total / S * parts[ask];
  const m = mcq(R, val, [total / 3, total / S * parts[(ask + 1) % 3], total / S * parts[(ask + 2) % 3], val + total / S, total / S].map((v) => round(v, 2)), { render: eur });
  const q = d === 1
    ? `On partage ${eur(total)} entre Ana, Ben et Cléo proportionnellement à ${parts.join(', ')}. Combien reçoit ${['Ana', 'Ben', 'Cléo'][ask]} ?`
    : `Trois associés ont apporté ${intro.join(', ')}. Ils se partagent un bénéfice de ${eur(total)} proportionnellement à leurs apports. Combien reçoit celui qui a apporté ${intro[ask]} ?`;
  ex = steps(d === 2 ? `Les apports sont proportionnels à ${parts.join(', ')} (on divise tout par le même nombre).` : `Nombre de parts : ${parts.join(' + ')} = ${S}.`, `Une part vaut ${fmt(total)} ${DV} ${S} = ${fmt(total / S)} €.`, `${parts[ask]} parts : ${parts[ask]} ${X} ${fmt(total / S)} = ${eur(val)}.`);
  return { q: P(q), ...m, expl: ex + res(eur(val)) };
});

gen('prop.ratio', { sub: 'calcul', ch: 'prop', name: 'Ratios', target: 60 }, (R, d) => {
  let a, b; do { a = R.int(1, 7); b = R.int(2, 9); } while (gcd(a, b) !== 1 || a === b);
  if (d === 1) {
    const k = R.int(3, 12), total = (a + b) * k, val = a * k;
    const m = mcq(R, val, [b * k, Math.round(total * a / b), total / 2, val + a, total - b], { valid: Number.isInteger });
    return { q: P(`Dans un club de ${total} membres, le rapport filles/garçons est de ${F(a, b)}. Combien y a-t-il de filles ?`), ...m, expl: steps(`Pour ${a} fille${a > 1 ? 's' : ''}, il y a ${b} garçons : des « paquets » de ${a + b} membres.`, `Nombre de paquets : ${total} ${DV} ${a + b} = ${k}.`, `Filles : ${a} ${X} ${k} = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ${F(a, b)} n'est pas la part des filles dans le club (qui vaut ${F(a, a + b)}).` };
  }
  if (d === 2) {
    if (a > b) [a, b] = [b, a];
    const k = R.int(3, 12), diff = (b - a) * k, val = a * k;
    const m = mcq(R, val, [b * k, diff, diff * a, val + k, (a + b) * k], { valid: Number.isInteger });
    return { q: P(`Le rapport filles/garçons d'une classe est de ${a} pour ${b}. Il y a ${diff} garçons de plus que de filles. Combien y a-t-il de filles ?`), ...m, expl: steps(`Dans chaque paquet (${plural(a, 'fille')}, ${plural(b, 'garçon')}), il y a ${plural(b - a, 'garçon')} de plus.`, `Nombre de paquets : ${diff} ${DV} ${b - a} = ${k}.`, `Filles : ${a} ${X} ${k} = ${val}.`) + res(fmt(val)) };
  }
  const [p, q, add, r, s] = R.pick([[2, 3, 5, 1, 1], [3, 5, 4, 1, 1], [1, 2, 6, 1, 1], [2, 5, 4, 2, 3], [3, 4, 3, 1, 1], [1, 3, 10, 1, 1]]);
  const k = (add * s) / (q * r - p * s);
  const boys = q * k, girls = p * k;
  const m = mcq(R, boys, [girls, girls + add, boys + add, k, boys * 2], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Le rapport filles/garçons d'un club est de ${p} pour ${q}. Après l'arrivée de ${add} nouvelles filles, il devient ${r} pour ${s}. Combien y a-t-il de garçons ?`), ...m, expl: steps(`Au départ : ${p}k filles et ${q}k garçons.`, `Après : (${p}k + ${add}) ${DV} ${q}k = ${F(r, s)}, donc ${s}(${p}k + ${add}) = ${r} ${X} ${q}k.`, `${s * p}k + ${s * add} = ${r * q}k → k = ${k}.`, `Garçons : ${q} ${X} ${k} = ${boys}.`) + res(fmt(boys)) };
});

gen('prop.echelle', { sub: 'calcul', ch: 'prop', name: 'Échelles', target: 55 }, (R, d) => {
  const sc = R.pick([10000, 20000, 25000, 50000, 100000, 200000]);
  if (d === 1) {
    const cm = R.int(2, 12) + (R.chance(0.3) ? 0.5 : 0), km = round(cm * sc / 100000, 3);
    const m = mcq(R, km, [km * 10, km / 10, round(cm * sc / 1000, 3), round(km + 1, 3)].map((v) => round(v, 3)), { render: (v) => unit(v, 'km') });
    return { q: P(`Sur une carte à l'échelle 1/${fmt(sc)}, deux villages sont distants de ${unit(cm, 'cm')}. Quelle est la distance réelle ?`), ...m, expl: steps(`1 cm sur la carte = ${fmt(sc)} cm en réalité.`, `${fmt(cm)} ${X} ${fmt(sc)} = ${fmt(cm * sc)} cm.`, `On enlève 5 zéros pour passer en km : ${unit(km, 'km')}.`) + res(unit(km, 'km')) };
  }
  if (d === 2) {
    const km = R.int(1, 30) * (sc >= 100000 ? 2 : 0.5), cm = round(km * 100000 / sc, 3);
    const m = mcq(R, cm, [cm * 10, cm / 10, round(cm * 2, 3), round(cm + 1, 3)].map((v) => round(v, 3)), { render: (v) => unit(v, 'cm') });
    return { q: P(`Deux villes sont distantes de ${unit(km, 'km')}. Quelle distance les sépare sur une carte à l'échelle 1/${fmt(sc)} ?`), ...m, expl: steps(`${unit(km, 'km')} = ${fmt(km * 100000)} cm.`, `On divise par ${fmt(sc)} : ${unit(cm, 'cm')}.`) + res(unit(cm, 'cm')) };
  }
  const s2 = R.pick([100, 200, 500, 1000]), a = R.int(2, 8), b = R.int(2, 9);
  const area = (a * s2 / 100) * (b * s2 / 100);
  const m = mcq(R, area, [a * b * s2 / 100, area * 100, area / 10, (a + b) * 2 * s2 / 100], { render: (v) => unit(v, 'm²') });
  return { q: P(`Sur un plan à l'échelle 1/${fmt(s2)}, un terrain rectangulaire mesure ${a} cm sur ${b} cm. Quelle est son aire réelle ?`), ...m, expl: steps(`Longueurs réelles : ${a} ${X} ${s2} = ${fmt(a * s2)} cm = ${fmt(a * s2 / 100)} m et ${b} ${X} ${s2} = ${fmt(b * s2)} cm = ${fmt(b * s2 / 100)} m.`, `Aire : ${fmt(a * s2 / 100)} ${X} ${fmt(b * s2 / 100)} = ${unit(area, 'm²')}.`) + res(unit(area, 'm²')), trap: '<b>Piège :</b> une échelle s\'applique aux longueurs. Pour une aire, l\'échelle joue deux fois.' };
});

/* ---------------- Chapitre 6 : Durées & conversions ---------------- */
chapter({
  id: 'conv', sub: 'calcul', order: 6, title: 'Durées & conversions', short: 'Durées',
  lesson: `
<p>Les durées piègent tout le monde parce qu'une heure fait <b>60</b> minutes, pas 100. C'est la base des vitesses : maîtrise ce chapitre avant d'attaquer le suivant.</p>
<h3><span class="hl">1. Heures décimales ↔ heures et minutes</span></h3>
<div class="tablewrap"><table>
<tr><th>Décimal</th><td>0,1 h</td><td>0,2 h</td><td>0,25 h</td><td>0,5 h</td><td>0,75 h</td><td>1,2 h</td><td>1,5 h</td></tr>
<tr><th>Minutes</th><td>6 min</td><td>12 min</td><td>15 min</td><td>30 min</td><td>45 min</td><td>1 h 12</td><td>1 h 30</td></tr>
</table></div>
<p>Pour convertir : <b>partie décimale × 60</b>. 2,4 h = 2 h + 0,4 × 60 min = <b>2 h 24</b>.</p>
<p>Dans l'autre sens : <b>minutes ÷ 60</b>. 1 h 45 = 1 + 45 ÷ 60 = <b>1,75 h</b>.</p>
<div class="formula">20 min = ${F(1, 3)} h &nbsp;·&nbsp; 40 min = ${F(2, 3)} h &nbsp;·&nbsp; 10 min = ${F(1, 6)} h &nbsp;·&nbsp; 50 min = ${F(5, 6)} h</div>
<div class="trap"><b>Piège n°1 :</b> 1 h 15 n'est PAS 1,15 h, c'est 1,25 h. Et 1,5 h n'est pas 1 h 50, c'est 1 h 30.</div>
<h3><span class="hl">2. Additionner des horaires</span></h3>
<p>On additionne les heures d'un côté, les minutes de l'autre, puis on convertit les minutes en trop. 9 h 47 + 2 h 38 = 11 h 85 = <b>12 h 25</b> (85 min = 1 h 25).</p>
<p>Durée entre 7 h 52 et 11 h 15 : de 7 h 52 à 8 h 00 = 8 min, de 8 h à 11 h 15 = 3 h 15, total <b>3 h 23</b>.</p>
<h3><span class="hl">3. Unités de longueur, d'aire et de volume</span></h3>
<ul><li><b>Longueurs</b> : on multiplie par 10 à chaque rang (km, hm, dam, m, dm, cm, mm).</li><li><b>Aires</b> : par 100 à chaque rang. 1 m² = 100 dm² = 10 000 cm². 1 ha = 10 000 m². 1 km² = 100 ha.</li><li><b>Volumes</b> : par 1 000 à chaque rang. 1 m³ = 1 000 dm³ = 1 000 000 cm³.</li></ul>
<div class="formula">1 L = 1 dm³ &nbsp;·&nbsp; 1 m³ = 1 000 L &nbsp;·&nbsp; 1 mL = 1 cm³</div>`,
});

gen('conv.h', { sub: 'calcul', ch: 'conv', name: 'Heures décimales ↔ minutes', target: 35 }, (R, d) => {
  if (d === 1) {
    const h = R.int(0, 4), dec = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.3]), x = round(h + dec, 2);
    const mins = Math.round(x * 60);
    const wrong = [h * 60 + Math.round(dec * 100), mins + 6, mins - 6, h * 60 + Math.round(dec * 10)];
    const m = mcq(R, mins, wrong, { render: (v) => hm(v / 60) });
    return { q: P(`Combien vaut ${big(fmt(x) + NB + 'h')} en heures et minutes ?`), ...m, expl: steps(`On garde ${h} h et on convertit la partie décimale : ${fmt(dec)} ${X} 60 = ${Math.round(dec * 60)} min.`) + res(hm(x)), trap: `<b>Piège :</b> ${fmt(x)} h n'est pas ${h} h ${String(Math.round(dec * 100)).padStart(2, '0')}.` };
  }
  if (d === 2) {
    const h = R.int(0, 3), mm = R.pick([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54]), val = round(h + mm / 60, 4);
    const m = mcq(R, val, [round(h + mm / 100, 4), round(val + 0.1, 4), round(val - 0.05, 4), round(h + mm / 10, 4)], { render: (v) => fmt(v) + NB + 'h' });
    return { q: P(`Écrire ${big(hm(h + mm / 60))} en heures décimales.`), ...m, expl: steps(`${mm} min = ${mm} ${DV} 60 h = ${fmt(mm / 60)} h.`, `Total : ${h} + ${fmt(mm / 60)} = ${fmt(val)} h.`) + res(fmt(val) + NB + 'h'), trap: `<b>Piège :</b> ${hm(h + mm / 60)} n'est pas ${fmt(h + mm / 100)} h.` };
  }
  if (R.chance(0.5)) {
    const [mm, f] = R.pick([[20, new Fr(1, 3)], [40, new Fr(2, 3)], [10, new Fr(1, 6)], [50, new Fr(5, 6)], [45, new Fr(3, 4)], [12, new Fr(1, 5)], [35, new Fr(7, 12)]]);
    const m = mcq(R, f, [new Fr(mm, 100), new Fr(1, 2), new Fr(mm, 6), f.add(new Fr(1, 12))]);
    return { q: P(`Quelle fraction d'heure représentent ${big(mm + NB + 'min')} ?`), ...m, expl: steps(`${mm} min = ${F(mm, 60)} h.`, `On simplifie : ${f.html()} h.`) + res(f.html() + NB + 'h') };
  }
  const x = R.pick([1.2, 2.4, 3.5, 0.3, 1.8, 4.25, 2.6, 0.45]), sec = Math.round(x * 60);
  const m = mcq(R, sec, [Math.floor(x) * 60 + Math.round((x % 1) * 100), sec + 6, sec - 12, Math.round(x * 100)], { render: (v) => Math.floor(v / 60) + NB + 'min' + NB + String(v % 60).padStart(2, '0') + NB + 's' });
  return { q: P(`Combien vaut ${big(fmt(x) + NB + 'min')} en minutes et secondes ?`), ...m, expl: steps(`On garde ${Math.floor(x)} min et on convertit : ${fmt(round(x % 1, 2))} ${X} 60 = ${Math.round((x % 1) * 60)} s.`) + res(Math.floor(sec / 60) + ' min ' + String(sec % 60).padStart(2, '0') + ' s') };
});

gen('conv.add', { sub: 'calcul', ch: 'conv', name: 'Horaires et durées', target: 45 }, (R, d) => {
  const rend = (v) => hmClock(v);
  if (d === 1) {
    const dep = R.int(6, 15) * 60 + R.int(5, 55), dur = R.int(0, 4) * 60 + R.int(15, 55), arr = dep + dur;
    const m = mcq(R, arr, [dep + Math.floor(dur / 60) * 100 + (dur % 60), arr + 10, arr - 60, arr + 40, arr - 10], { render: rend, sort: 'asc' });
    return { q: P(`Un train part à ${hmClock(dep)} et le trajet dure ${hm(dur / 60)}. À quelle heure arrive-t-il ?`), ...m, expl: steps(`Heures : ${Math.floor(dep / 60)} + ${Math.floor(dur / 60)} = ${Math.floor(dep / 60) + Math.floor(dur / 60)} h ; minutes : ${dep % 60} + ${dur % 60} = ${(dep % 60) + (dur % 60)} min.`, (dep % 60) + (dur % 60) >= 60 ? `${(dep % 60) + (dur % 60)} min = 1 h ${String((dep % 60) + (dur % 60) - 60).padStart(2, '0')} : on ajoute 1 h.` : '', `Arrivée : ${hmClock(arr)}.`) + res(hmClock(arr)) };
  }
  if (d === 2) {
    const a = R.int(6, 12) * 60 + R.int(31, 58), b = a + R.int(1, 5) * 60 + R.int(5, 50), dur = b - a;
    const naive = (Math.floor(b / 60) - Math.floor(a / 60)) * 100 + ((b % 60) - (a % 60));
    const m = mcq(R, dur, [dur + 40, dur - 40, dur + 10, Math.floor(naive / 100) * 60 + Math.abs(naive % 100)], { render: (v) => hm(v / 60) });
    return { q: P(`Un cours commence à ${hmClock(a)} et se termine à ${hmClock(b)}. Combien de temps dure-t-il ?`), ...m, expl: steps(`De ${hmClock(a)} à ${Math.floor(a / 60) + 1} h 00 : ${60 - (a % 60)} min.`, `De ${Math.floor(a / 60) + 1} h 00 à ${hmClock(b)} : ${hm((b - (Math.floor(a / 60) + 1) * 60) / 60)}.`, `Total : ${hm(dur / 60)}.`) + res(hm(dur / 60)), tip: '<b>Méthode :</b> passe par l\'heure ronde suivante, c\'est plus sûr.' };
  }
  const dep = R.int(20, 23) * 60 + R.pick([10, 20, 30, 40, 50]), durH = R.pick([2.5, 3.75, 4.2, 5.25, 1.8, 2.4, 6.5]), arr = dep + Math.round(durH * 60);
  const m = mcq(R, arr % 1440, [(dep + Math.floor(durH) * 60 + Math.round((durH % 1) * 100)) % 1440, (arr + 30) % 1440, (arr - 60) % 1440, (arr + 15) % 1440], { render: rend, sort: 'none' });
  return { q: P(`Un avion décolle à ${hmClock(dep)} pour un vol de ${fmt(durH)} heures. À quelle heure (heure du départ) atterrit-il ?`), ...m, expl: steps(`${fmt(durH)} h = ${hm(durH)}.`, `${hmClock(dep)} + ${hm(durH)} = ${Math.floor(arr / 60)} h ${String(arr % 60).padStart(2, '0')}, c'est-à-dire ${hmClock(arr)} le lendemain.`) + res(hmClock(arr)) };
});

gen('conv.unit', { sub: 'calcul', ch: 'conv', name: 'Unités d\'aire et de volume', target: 45 }, (R, d) => {
  const items = d === 1
    ? [[3.5, 'm²', 'cm²', 10000], [0.8, 'L', 'cm³', 1000], [2500, 'L', 'm³', 0.001], [4, 'ha', 'm²', 10000], [1.2, 'km', 'm', 1000], [45, 'cL', 'L', 0.01]]
    : d === 2
      ? [[0.35, 'km²', 'ha', 100], [7200, 'cm²', 'm²', 0.0001], [0.06, 'm³', 'L', 1000], [1.5, 'dm³', 'mL', 1000], [250, 'mm²', 'cm²', 0.01], [3, 'm³', 'dm³', 1000]]
      : null;
  if (items) {
    const [x, u1, u2, f] = R.pick(items), val = round(x * f, 6);
    const m = mcq(R, val, [val * 10, val / 10, val * 100, val / 100].map((v) => round(v, 6)), { render: (v) => unit(v, u2) });
    return { q: P(`Convertir ${big(unit(x, u1))} en ${u2}.`), ...m, expl: steps(`1 ${u1} = ${fmt(f >= 1 ? f : f, 6)} ${u2}.`, `${fmt(x)} ${X} ${fmt(f, 6)} = ${unit(val, u2)}.`) + res(unit(val, u2)), trap: '<b>Piège :</b> ×100 par rang pour les aires, ×1 000 pour les volumes.' };
  }
  const L = R.int(4, 12), l = R.int(2, 6), h = R.pick([1.2, 1.5, 1.6, 2, 0.8]);
  const val = round(L * l * h * 1000, 2);
  const m = mcq(R, val, [val / 10, val * 10, round(L * l * h * 100, 2), round((L + l) * 2 * h * 1000, 2)], { render: (v) => unit(v, 'L') });
  return { q: P(`Une piscine a la forme d'un pavé de ${L} m de long, ${l} m de large et ${fmt(h)} m de profondeur. Combien de litres d'eau faut-il pour la remplir ?`), ...m, expl: steps(`Volume : ${L} ${X} ${l} ${X} ${fmt(h)} = ${fmt(round(L * l * h, 3))} m³.`, `1 m³ = 1 000 L, donc ${unit(val, 'L')}.`) + res(unit(val, 'L')) };
});

/* ---------------- Chapitre 7 : Vitesses ---------------- */
chapter({
  id: 'vit', sub: 'calcul', order: 7, title: 'Vitesses, distances, temps', short: 'Vitesses',
  lesson: `
<p>Ce chapitre fait peur, mais tout repose sur <b>une seule formule</b> et <b>une seule règle sur les unités</b>.</p>
<h3><span class="hl">1. La formule</span></h3>
<div class="formula">vitesse = ${F('distance', 'temps')}<br>distance = vitesse × temps<br>temps = ${F('distance', 'vitesse')}</div>
<p><b>Moyen mnémotechnique</b> : le triangle <b>D</b> en haut, <b>V</b> et <b>T</b> en bas. Cache ce que tu cherches : D = V × T ; V = D / T ; T = D / V.</p>
<h3><span class="hl">2. La règle d'or des unités</span></h3>
<p>Si la vitesse est en <b>km/h</b>, le temps doit être en <b>heures</b> (décimales). On convertit donc les minutes : <b>minutes ÷ 60</b>.</p>
<div class="tablewrap"><table><tr><th>Durée</th><td>15 min</td><td>20 min</td><td>30 min</td><td>45 min</td><td>1 h 15</td><td>1 h 20</td><td>2 h 30</td></tr><tr><th>En heures</th><td>0,25</td><td>${F(1, 3)}</td><td>0,5</td><td>0,75</td><td>1,25</td><td>${F(4, 3)}</td><td>2,5</td></tr></table></div>
<div class="ex"><b>Exemple 1 — trouver une vitesse</b><span>Un train parcourt 150 km en 1 h 15. 1 h 15 = 1,25 h.</span><span>v = 150 ÷ 1,25 = <b>120 km/h</b>. (Astuce : 150 ÷ 1,25 = 150 × 0,8 = 120.)</span></div>
<div class="ex"><b>Exemple 2 — trouver une distance</b><span>À 90 km/h pendant 20 min : 20 min = ${F(1, 3)} h.</span><span>d = 90 × ${F(1, 3)} = <b>30 km</b>.</span></div>
<div class="ex"><b>Exemple 3 — trouver un temps</b><span>100 km à 80 km/h : t = 100 ÷ 80 = 1,25 h = <b>1 h 15</b>.</span></div>
<div class="tip"><b>Astuce « par minute » :</b> 60 km/h = 1 km par minute ; 90 km/h = 1,5 km/min ; 120 km/h = 2 km/min. 45 min à 120 km/h → 45 × 2 = 90 km.</div>
<h3><span class="hl">3. La vitesse moyenne (LE piège du Tage Mage)</span></h3>
<div class="formula">vitesse moyenne = ${F('distance TOTALE', 'temps TOTAL')}</div>
<p>Ce n'est presque jamais la moyenne des vitesses !</p>
<div class="ex"><b>Exemple — aller-retour</b><span>Aller : 120 km à 60 km/h → 2 h. Retour : 120 km à 40 km/h → 3 h.</span><span>Total : 240 km en 5 h → <b>48 km/h</b> (et non 50 km/h).</span></div>
<p>Pour un aller-retour (même distance), il y a une formule rapide :</p>
<div class="formula">v<sub>moy</sub> = ${F('2 × v₁ × v₂', 'v₁ + v₂')} &nbsp;&nbsp; ex : ${F('2 × 60 × 40', '60 + 40')} = ${F(4800, 100)} = 48</div>
<p>La moyenne simple des vitesses ne marche que si les deux trajets durent <b>le même temps</b>.</p>
<h3><span class="hl">4. Croisement et rattrapage</span></h3>
<ul><li><b>Ils se rapprochent</b> (face à face) : les vitesses s'<b>additionnent</b>. Deux voitures à 300 km l'une de l'autre, à 70 et 80 km/h : elles se rapprochent de 150 km chaque heure → rencontre au bout de 300 ÷ 150 = <b>2 h</b>.</li><li><b>L'un rattrape l'autre</b> (même sens) : les vitesses se <b>soustraient</b>. B à 90 km/h part 1 h après A à 60 km/h : A a 60 km d'avance, B gagne 30 km par heure → rattrapage en 60 ÷ 30 = <b>2 h</b>.</li></ul>
<h3><span class="hl">5. km/h ↔ m/s</span></h3>
<div class="formula">km/h → m/s : ÷ 3,6 &nbsp;·&nbsp; m/s → km/h : × 3,6 &nbsp;&nbsp; (36 km/h = 10 m/s · 72 km/h = 20 m/s · 90 km/h = 25 m/s)</div>`,
});

const VIT_T = {
  1: [[1, '1 h'], [2, '2 h'], [3, '3 h'], [0.5, '30 min'], [1.5, '1 h 30'], [2.5, '2 h 30']],
  2: [[1.25, '1 h 15'], [0.75, '45 min'], [1.75, '1 h 45'], [2.25, '2 h 15'], [1 / 3, '20 min'], [2 / 3, '40 min'], [4 / 3, '1 h 20']],
  3: [[5 / 6, '50 min'], [1.2, '1 h 12'], [1.6, '1 h 36'], [2.4, '2 h 24'], [0.3, '18 min'], [1.1, '1 h 06'], [0.4, '24 min']],
};
function misreadH(t) { const h = Math.floor(t + 1e-9), mm = Math.round((t - h) * 60); return h + mm / 100; }
function vitPair(R, d) {
  const [t, lab] = R.pick(VIT_T[d]);
  let v, dist, g = 0;
  do { v = R.int(d === 1 ? 4 : 3, 15) * (d === 1 ? 10 : R.pick([6, 12, 15, 9])); dist = round(v * t, 6); g++; } while ((!Number.isInteger(dist) || v > 150 || v < 24) && g < 300);
  return { t, lab, v, dist };
}
gen('vit.v', { sub: 'calcul', ch: 'vit', name: 'Calculer une vitesse', target: 60 }, (R, d) => {
  const { t, lab, v, dist } = vitPair(R, d);
  const mr = misreadH(t);
  const m = mcq(R, v, [round(dist / mr, 1), round(dist * t, 1), v + 10, v - 10, round(dist / (Math.round(t * 60) / 100), 1)].map((x) => round(x, 1)), { render: (x) => unit(x, 'km/h') });
  const who = v <= 35 ? 'Un cycliste' : v <= 130 ? 'Une voiture' : 'Un train';
  return { q: P(`${who} parcourt ${unit(dist, 'km')} en ${lab}. Quelle est sa vitesse moyenne ?`), ...m, expl: steps(t === Math.round(t) ? `La durée est déjà en heures : ${fmt(t)} h.` : `On convertit la durée en heures : ${lab} = ${Number.isInteger(round(t * 100, 6)) ? fmt(t) : new Fr(Math.round(t * 60), 60).html()} h.`, `v = d ${DV} t = ${fmt(dist)} ${DV} ${Number.isInteger(round(t * 100, 6)) ? fmt(t) : new Fr(Math.round(t * 60), 60).html()} = ${unit(v, 'km/h')}.`) + res(unit(v, 'km/h')), trap: t !== Math.round(t) ? `<b>Piège :</b> ${lab} ne s'écrit pas ${fmt(mr)} h.` : '' };
});
gen('vit.d', { sub: 'calcul', ch: 'vit', name: 'Calculer une distance', target: 55 }, (R, d) => {
  const { t, lab, v, dist } = vitPair(R, d);
  const mr = misreadH(t);
  const m = mcq(R, dist, [round(v * mr, 1), round(v / t, 1), dist + v / 4, dist - 10, round(v * Math.round(t * 60) / 100, 1)].map((x) => round(x, 1)), { render: (x) => unit(x, 'km') });
  const tTxt = Number.isInteger(round(t * 100, 6)) ? fmt(t) : new Fr(Math.round(t * 60), 60).html();
  return { q: P(`Une voiture roule à ${unit(v, 'km/h')} pendant ${lab}. Quelle distance parcourt-elle ?`), ...m, expl: steps(t % 1 ? `${lab} = ${tTxt} h.` : '', `d = v ${X} t = ${v} ${X} ${tTxt} = ${unit(dist, 'km')}.`, d > 1 ? `Astuce : ${v} km/h = ${fmt(v / 60)} km par minute${lab.includes('h') ? `, et ${lab} = ${Math.round(t * 60)} min` : ''} → ${fmt(v / 60)} ${X} ${Math.round(t * 60)} = ${fmt(dist)} km.` : '') + res(unit(dist, 'km')) };
});
gen('vit.t', { sub: 'calcul', ch: 'vit', name: 'Calculer une durée', target: 55 }, (R, d) => {
  const { t, v, dist } = vitPair(R, d);
  const mins = Math.round(t * 60);
  const dec = round(t, 4), decTxt = Number.isInteger(round(t * 100, 6)) ? fmt(dec) : new Fr(mins, 60).html();
  const naive = Math.floor(t) * 60 + Math.round((t % 1) * 100);
  const m = mcq(R, mins, [naive, mins + 10, mins - 10, mins + 30, Math.round(v / dist * 60)], { render: (x) => hm(x / 60), valid: (x) => x > 0 });
  return { q: P(`À ${unit(v, 'km/h')}, combien de temps faut-il pour parcourir ${unit(dist, 'km')} ?`), ...m, expl: steps(`t = d ${DV} v = ${fmt(dist)} ${DV} ${v} = ${decTxt} h.`, `On convertit en minutes : ${decTxt} ${X} 60 = ${mins} min${mins >= 60 ? ' = ' + hm(t) : ''}.`) + res(hm(t)), trap: t % 1 ? `<b>Piège :</b> ${fmt(round(t, 2))} h ne veut pas dire ${Math.floor(t)} h ${String(Math.round((t % 1) * 100)).padStart(2, '0')}.` : '' };
});
gen('vit.conv', { sub: 'calcul', ch: 'vit', name: 'km/h ↔ m/s', target: 45 }, (R, d) => {
  if (d === 1) { const ms = R.pick([5, 10, 15, 20, 25, 30, 35, 40]), kmh = ms * 3.6; const m = mcq(R, ms, [kmh / 60, kmh / 3, ms * 2, ms + 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'm/s') }); return { q: P(`Convertir ${big(unit(kmh, 'km/h'))} en m/s.`), ...m, expl: steps(`1 km/h = 1 000 m en 3 600 s, donc on divise par 3,6.`, `${fmt(kmh)} ${DV} 3,6 = ${unit(ms, 'm/s')}.`) + res(unit(ms, 'm/s')) }; }
  if (d === 2) { const ms = R.pick([5, 12, 15, 25, 30, 45, 50]), kmh = round(ms * 3.6, 2); const m = mcq(R, kmh, [ms * 60, round(ms / 3.6, 2), ms * 3, round(kmh + 10, 2)], { render: (x) => unit(x, 'km/h') }); return { q: P(`Un guépard court à ${big(unit(ms, 'm/s'))}. Quelle est sa vitesse en km/h ?`), ...m, expl: steps(`m/s → km/h : on multiplie par 3,6.`, `${ms} ${X} 3,6 = ${unit(kmh, 'km/h')}.`) + res(unit(kmh, 'km/h')) }; }
  const kmh = R.pick([54, 72, 90, 108, 36]), ms = kmh / 3.6, Lt = R.pick([100, 150, 200, 250]), tun = R.pick([350, 550, 800, 1000, 1250]);
  const tt = round((Lt + tun) / ms, 2);
  const m = mcq(R, tt, [round(tun / ms, 2), round((Lt + tun) / kmh, 2), round(tt + 10, 2), round((tun - Lt) / ms, 2)], { render: (x) => unit(x, 's') });
  return { q: P(`Un train de ${Lt} m de long roule à ${unit(kmh, 'km/h')}. Combien de temps met-il pour traverser entièrement un tunnel de ${fmt(tun)} m (de l'entrée de la locomotive à la sortie du dernier wagon) ?`), ...m, expl: steps(`Vitesse : ${kmh} ${DV} 3,6 = ${fmt(ms)} m/s.`, `Le train doit parcourir le tunnel PLUS sa propre longueur : ${fmt(tun)} + ${Lt} = ${fmt(Lt + tun)} m.`, `t = ${fmt(Lt + tun)} ${DV} ${fmt(ms)} = ${unit(tt, 's')}.`) + res(unit(tt, 's')), trap: '<b>Piège :</b> oublier la longueur du train.' };
});
gen('vit.moy', { sub: 'calcul', ch: 'vit', name: 'Vitesse moyenne (aller-retour)', target: 70 }, (R, d) => {
  if (d === 1) {
    const [v1, v2] = R.shuffle(R.pick([[60, 40], [30, 20], [90, 60], [120, 80], [100, 150], [50, 75], [12, 24], [45, 90], [60, 90], [40, 60]]));
    const vm = 2 * v1 * v2 / (v1 + v2);
    const m = mcq(R, vm, [(v1 + v2) / 2, Math.abs(v1 - v2), vm + 5, Math.max(v1, v2) - 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'km/h') });
    const D = lcm(v1, v2);
    return { q: P(`Un automobiliste fait l'aller à ${unit(v1, 'km/h')} et le retour, par la même route, à ${unit(v2, 'km/h')}. Quelle est sa vitesse moyenne sur l'aller-retour ?`), ...m, expl: steps(`Prenons une distance pratique, ${D} km (divisible par les deux vitesses).`, `Aller : ${D} ${DV} ${v1} = ${fmt(D / v1)} h. Retour : ${D} ${DV} ${v2} = ${fmt(D / v2)} h.`, `Total : ${2 * D} km en ${fmt(D / v1 + D / v2)} h → ${fmt(2 * D)} ${DV} ${fmt(D / v1 + D / v2)} = ${unit(vm, 'km/h')}.`, `Formule rapide : ${F(`2 ${X} ${v1} ${X} ${v2}`, `${v1} + ${v2}`)} = ${fmt(vm)}.`) + res(unit(vm, 'km/h')), trap: `<b>Piège :</b> ${unit((v1 + v2) / 2, 'km/h')} (la moyenne des vitesses) est faux, car on passe plus de temps au retour lent.` };
  }
  if (d === 2) {
    const [d1, v1, d2, v2] = R.pick([[120, 60, 120, 120], [180, 90, 60, 60], [100, 50, 200, 100], [90, 45, 150, 75], [60, 30, 180, 90], [240, 80, 60, 30]]);
    const T = d1 / v1 + d2 / v2, vm = (d1 + d2) / T;
    const m = mcq(R, vm, [(v1 + v2) / 2, (d1 * v1 + d2 * v2) / (d1 + d2), vm + 10, vm - 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'km/h') });
    return { q: P(`Un coureur parcourt ${d1} km à ${unit(v1, 'km/h')}, puis ${d2} km à ${unit(v2, 'km/h')}. Quelle est sa vitesse moyenne sur l'ensemble du parcours ?`), ...m, expl: steps(`Temps 1 : ${d1} ${DV} ${v1} = ${fmt(d1 / v1)} h. Temps 2 : ${d2} ${DV} ${v2} = ${fmt(d2 / v2)} h.`, `Distance totale : ${d1 + d2} km ; temps total : ${fmt(T)} h.`, `v moyenne = ${d1 + d2} ${DV} ${fmt(T)} = ${unit(vm, 'km/h')}.`) + res(unit(vm, 'km/h')), trap: '<b>Rappel :</b> vitesse moyenne = distance totale ÷ temps total.' };
  }
  const [v1, T, v2] = R.pick([[60, 80, 120], [40, 48, 60], [90, 72, 60], [50, 60, 75], [100, 120, 150], [30, 40, 60], [45, 60, 90], [60, 90, 180]]);
  const m = mcq(R, v2, [2 * T - v1, T, v2 + 20, Math.round((v2 + T) / 2)], { render: (x) => unit(x, 'km/h') });
  return { q: P(`Un cycliste fait l'aller à ${unit(v1, 'km/h')}. À quelle vitesse doit-il faire le retour (même distance) pour que sa vitesse moyenne sur l'aller-retour soit de ${unit(T, 'km/h')} ?`), ...m, expl: steps(`Prenons une distance de ${lcm(lcm(v1, T), v2)} km pour l'aller (et autant au retour).`, `Temps total autorisé : ${2 * lcm(lcm(v1, T), v2)} ${DV} ${T} = ${fmt(2 * lcm(lcm(v1, T), v2) / T)} h. L'aller prend déjà ${fmt(lcm(lcm(v1, T), v2) / v1)} h.`, `Il reste ${fmt(2 * lcm(lcm(v1, T), v2) / T - lcm(lcm(v1, T), v2) / v1)} h pour ${lcm(lcm(v1, T), v2)} km → ${unit(v2, 'km/h')}.`) + res(unit(v2, 'km/h')), trap: `<b>Piège :</b> répondre ${unit(2 * T - v1, 'km/h')} (en raisonnant comme si on faisait la moyenne des vitesses).` };
});
gen('vit.croise', { sub: 'calcul', ch: 'vit', name: 'Croisements', target: 70 }, (R, d) => {
  const t = R.pick(d === 1 ? [1, 2, 3, 1.5] : [1.5, 2.5, 0.75, 1.25, 2, 3]);
  let v1, v2; do { v1 = R.int(4, 12) * 10; v2 = R.int(4, 12) * 10; } while (v1 === v2 || !Number.isInteger(round((v1 + v2) * t, 6)));
  const D = (v1 + v2) * t;
  if (d === 1) {
    const mins = Math.round(t * 60);
    const m = mcq(R, mins, [Math.round(D / Math.abs(v1 - v2) * 60), Math.round(D / ((v1 + v2) / 2) * 60), mins + 30, mins - 15], { render: (x) => hm(x / 60), valid: (x) => x > 0 && x < 2000 });
    return { q: P(`Deux villes A et B sont distantes de ${unit(D, 'km')}. Une voiture part de A vers B à ${unit(v1, 'km/h')} ; au même moment, une autre part de B vers A à ${unit(v2, 'km/h')}. Au bout de combien de temps se croisent-elles ?`), ...m, expl: steps(`Elles se rapprochent de ${v1} + ${v2} = ${v1 + v2} km chaque heure.`, `t = ${fmt(D)} ${DV} ${v1 + v2} = ${fmt(t)} h${t % 1 ? ' = ' + hm(t) : ''}.`) + res(hm(t)) };
  }
  if (d === 2) {
    const dA = v1 * t;
    const m = mcq(R, dA, [D / 2, v2 * t, D - dA + 10, dA + 15], { render: (x) => unit(x, 'km') });
    return { q: P(`A et B sont distantes de ${unit(D, 'km')}. Un train part de A vers B à ${unit(v1, 'km/h')} et, au même moment, un autre part de B vers A à ${unit(v2, 'km/h')}. À quelle distance de A se croisent-ils ?`), ...m, expl: steps(`Vitesse de rapprochement : ${v1} + ${v2} = ${v1 + v2} km/h.`, `Ils se croisent au bout de ${fmt(D)} ${DV} ${v1 + v2} = ${fmt(t)} h.`, `Le train parti de A a alors parcouru ${v1} ${X} ${fmt(t)} = ${unit(dA, 'km')}.`) + res(unit(dA, 'km')) };
  }
  const lag = R.pick([0.5, 1]);
  const D2 = D + v1 * lag;
  const mins = Math.round(t * 60);
  const m = mcq(R, mins, [Math.round(D2 / (v1 + v2) * 60), mins + Math.round(lag * 60), mins - 15, mins + 20], { render: (x) => hm(x / 60), valid: (x) => x > 0 });
  return { q: P(`A et B sont distantes de ${unit(D2, 'km')}. Une voiture part de A vers B à ${unit(v1, 'km/h')}. ${hm(lag)} plus tard, une seconde voiture part de B vers A à ${unit(v2, 'km/h')}. Combien de temps après le départ de la seconde voiture se croisent-elles ?`), ...m, expl: steps(`Pendant ${hm(lag)}, la première parcourt ${v1} ${X} ${fmt(lag)} = ${fmt(v1 * lag)} km. Il reste ${fmt(D2)} ${MINUS} ${fmt(v1 * lag)} = ${fmt(D)} km entre elles.`, `Ensuite elles se rapprochent de ${v1 + v2} km/h : ${fmt(D)} ${DV} ${v1 + v2} = ${fmt(t)} h${t % 1 ? ' = ' + hm(t) : ''}.`) + res(hm(t)) };
});
gen('vit.rattrape', { sub: 'calcul', ch: 'vit', name: 'Rattrapages', target: 75, diffs: [2, 3] }, (R, d) => {
  const [v1, v2, lag] = R.pick([[60, 90, 1], [40, 60, 0.5], [80, 120, 1], [50, 75, 1], [90, 120, 0.5], [15, 20, 1], [12, 18, 0.5], [70, 105, 1]]);
  const tc = v1 * lag / (v2 - v1);
  if (d === 2) {
    const mins = Math.round(tc * 60);
    const m = mcq(R, mins, [Math.round(v1 * lag / (v1 + v2) * 60), Math.round(lag * 60), mins + 30, mins * 2], { render: (x) => hm(x / 60), valid: (x) => x > 0 });
    return { q: P(`Une voiture part à ${unit(v1, 'km/h')}. ${hm(lag)} plus tard, une seconde voiture part du même endroit, sur la même route, à ${unit(v2, 'km/h')}. Combien de temps après son départ la seconde rattrape-t-elle la première ?`), ...m, expl: steps(`Avance de la première : ${v1} ${X} ${fmt(lag)} = ${fmt(v1 * lag)} km.`, `La seconde gagne ${v2} ${MINUS} ${v1} = ${v2 - v1} km par heure.`, `Temps : ${fmt(v1 * lag)} ${DV} ${v2 - v1} = ${fmt(tc)} h${tc % 1 ? ' = ' + hm(tc) : ''}.`) + res(hm(tc)), trap: '<b>Piège :</b> dans le même sens, on SOUSTRAIT les vitesses.' };
  }
  const h0 = R.int(7, 14) * 60 + R.pick([0, 15, 30, 45]), catchAt = h0 + Math.round((lag + tc) * 60);
  const m = mcq(R, catchAt, [h0 + Math.round(tc * 60), catchAt + 30, catchAt - 30, h0 + Math.round((lag + v1 * lag / (v1 + v2)) * 60)], { render: hmClock });
  return { q: P(`Un camion part à ${hmClock(h0)} à ${unit(v1, 'km/h')}. Une moto part du même point à ${hmClock(h0 + lag * 60)}, sur la même route, à ${unit(v2, 'km/h')}. À quelle heure la moto rattrape-t-elle le camion ?`), ...m, expl: steps(`Quand la moto part, le camion a ${fmt(v1 * lag)} km d'avance.`, `La moto gagne ${v2 - v1} km/h : rattrapage en ${fmt(v1 * lag)} ${DV} ${v2 - v1} = ${hm(tc)}.`, `${hmClock(h0 + lag * 60)} + ${hm(tc)} = ${hmClock(catchAt)}.`) + res(hmClock(catchAt)) };
});

/* ---------------- Chapitre 8 : Moyennes ---------------- */
chapter({
  id: 'moy', sub: 'calcul', order: 8, title: 'Moyennes', short: 'Moyennes',
  lesson: `
<h3><span class="hl">1. La définition… et la vraie clé</span></h3>
<div class="formula">moyenne = ${F('somme des valeurs', 'nombre de valeurs')} &nbsp;&nbsp;⇔&nbsp;&nbsp; <b>somme = moyenne × nombre</b></div>
<p>La deuxième écriture résout 80 % des exercices. « 8 nombres ont pour moyenne 15 » veut dire : leur somme vaut 8 × 15 = 120.</p>
<div class="ex"><b>Note manquante</b><span>Notes 12, 15 et 9. Quelle 4e note pour avoir 13 de moyenne ?</span><span>Il faut une somme de 4 × 13 = 52. On a déjà 36. Il manque <b>16</b>.</span></div>
<h3><span class="hl">2. L'astuce des écarts (calcul mental)</span></h3>
<p>Moyenne de 47, 52, 49 et 56 ? On choisit une base, 50 : écarts −3, +2, −1, +6 → total +4 → +4 ÷ 4 = +1 → moyenne <b>51</b>.</p>
<h3><span class="hl">3. La moyenne pondérée</span></h3>
<p>Chaque note compte autant de fois que son coefficient : (14 × 3 + 10 × 1) ÷ (3 + 1) = 52 ÷ 4 = <b>13</b>.</p>
<h3><span class="hl">4. Moyenne de deux groupes</span></h3>
<p>20 filles ont 14 de moyenne et 10 garçons ont 11 : (20 × 14 + 10 × 11) ÷ 30 = 390 ÷ 30 = <b>13</b>.</p>
<div class="trap"><b>Piège :</b> faire (14 + 11) ÷ 2 = 12,5. Le groupe le plus nombreux pèse plus lourd.</div>
<h3><span class="hl">5. Ajouter ou retirer une valeur</span></h3>
<p>Moyenne de 8 nombres = 15 (somme 120). On ajoute 24 : nouvelle somme 144 pour 9 nombres → <b>16</b>.</p>`,
});

gen('moy.simple', { sub: 'calcul', ch: 'moy', name: 'Moyenne simple et note manquante', target: 50 }, (R, d) => {
  if (d === 1 || d === 3) {
    const n = d === 1 ? 5 : 4, base = d === 1 ? R.int(10, 16) : R.pick([1500, 250, 980, 2000, 75]);
    const spread = d === 1 ? 4 : base >= 1000 ? 15 : 6;
    let devs; do { devs = Array.from({ length: n }, () => R.int(-spread, spread)); } while (devs.reduce((a, b) => a + b, 0) % n !== 0);
    const vals = devs.map((x) => base + x), avg = base + devs.reduce((a, b) => a + b, 0) / n;
    const m = mcq(R, avg, [avg + 1, avg - 1, avg + 2, base, avg - 2].map((x) => round(x, 2)), { valid: (x) => x !== avg });
    return { q: P(`Quelle est la moyenne de : ${big(vals.map((x) => fmt(x)).join(' ; '))} ?`), ...m, expl: steps(`On prend ${fmt(base)} comme base. Écarts : ${devs.map((x) => (x >= 0 ? '+' : MINUS) + Math.abs(x)).join(', ')}.`, `Somme des écarts : ${fmt(devs.reduce((a, b) => a + b, 0))} ; divisée par ${n} : ${fmt(devs.reduce((a, b) => a + b, 0) / n)}.`, `Moyenne : ${fmt(base)} ${devs.reduce((a, b) => a + b, 0) >= 0 ? '+' : MINUS} ${fmt(Math.abs(devs.reduce((a, b) => a + b, 0) / n))} = ${fmt(avg)}.`) + res(fmt(avg)), tip: '<b>Astuce des écarts :</b> beaucoup plus rapide que d\'additionner de gros nombres.' };
  }
  const n = R.int(3, 5), target = R.int(11, 15);
  let notes, miss; do { notes = Array.from({ length: n }, () => R.int(7, 18)); miss = target * (n + 1) - notes.reduce((a, b) => a + b, 0); } while (miss < 4 || miss > 20);
  const m = mcq(R, miss, [target, round(target * 2 - notes.reduce((a, b) => a + b, 0) / n, 1), miss + 1, miss - 2, miss + 3], { valid: (x) => x >= 0 });
  return { q: P(`${R.pick(NAMES)} a obtenu ${notes.join(', ')}. Quelle note doit-il obtenir au prochain devoir pour avoir exactement ${target} de moyenne ?`), ...m, expl: steps(`Avec ${n + 1} notes, il faut une somme de ${n + 1} ${X} ${target} = ${(n + 1) * target}.`, `Somme actuelle : ${notes.join(' + ')} = ${notes.reduce((a, b) => a + b, 0)}.`, `Il manque ${(n + 1) * target} ${MINUS} ${notes.reduce((a, b) => a + b, 0)} = ${miss}.`) + res(fmt(miss)) };
});
gen('moy.pond', { sub: 'calcul', ch: 'moy', name: 'Moyenne pondérée', target: 60 }, (R, d) => {
  const k = d === 1 ? 2 : d === 2 ? 3 : 4;
  let notes, coefs, S, C; do { notes = Array.from({ length: k }, () => R.int(6, 19)); coefs = Array.from({ length: k }, () => R.int(1, d === 1 ? 3 : 5)); S = notes.reduce((a, x, i) => a + x * coefs[i], 0); C = coefs.reduce((a, b) => a + b, 0); } while (S % C !== 0 && !(d === 3 && Number.isInteger(round(S / C * 2, 6))));
  const avg = round(S / C, 2);
  const simple = round(notes.reduce((a, b) => a + b, 0) / k, 2);
  const m = mcq(R, avg, [simple, round(avg + 1, 2), round(avg - 1, 2), round(S / k, 2)], { valid: (x) => x <= 20 });
  const rows = notes.map((x, i) => `${x} (coef. ${coefs[i]})`).join(', ');
  return { q: P(`Un étudiant obtient ${rows}. Quelle est sa moyenne ?`), ...m, expl: steps(`Somme pondérée : ${notes.map((x, i) => `${x} ${X} ${coefs[i]}`).join(' + ')} = ${S}.`, `Somme des coefficients : ${coefs.join(' + ')} = ${C}.`, `Moyenne : ${S} ${DV} ${C} = ${fmt(avg)}.`) + res(fmt(avg)), trap: `<b>Piège :</b> la moyenne simple (${fmt(simple)}) ignore les coefficients.` };
});
gen('moy.groupes', { sub: 'calcul', ch: 'moy', name: 'Moyenne de deux groupes', target: 65 }, (R, d) => {
  if (d < 3) {
    let n1, n2, m1, m2, avg; do { n1 = R.int(5, 30); n2 = R.int(5, 30); m1 = R.int(8, 16); m2 = R.int(8, 16); avg = (n1 * m1 + n2 * m2) / (n1 + n2); } while (m1 === m2 || !Number.isInteger(round(avg * (d === 1 ? 1 : 2), 6)));
    const m = mcq(R, avg, [(m1 + m2) / 2, avg + 0.5, avg - 1, Math.max(m1, m2) - 0.5].map((x) => round(x, 2)));
    return { q: P(`Dans une classe, les ${n1} filles ont une moyenne de ${m1} et les ${n2} garçons une moyenne de ${m2}. Quelle est la moyenne de la classe ?`), ...m, expl: steps(`Somme des notes des filles : ${n1} ${X} ${m1} = ${n1 * m1}. Des garçons : ${n2} ${X} ${m2} = ${n2 * m2}.`, `Total : ${n1 * m1 + n2 * m2} points pour ${n1 + n2} élèves.`, `Moyenne : ${n1 * m1 + n2 * m2} ${DV} ${n1 + n2} = ${fmt(avg)}.`) + res(fmt(avg)), trap: `<b>Piège :</b> ${fmt((m1 + m2) / 2)} (moyenne des deux moyennes) ignore la taille des groupes.` };
  }
  let f, mF, mG, M, g; do { f = R.int(6, 24); mF = R.int(12, 16); mG = R.int(7, 11); M = R.int(mG + 1, mF - 1); g = f * (mF - M) / (M - mG); } while (!Number.isInteger(g) || g < 3 || g > 40);
  const m = mcq(R, g, [f, Math.round(f * (M - mG) / (mF - M)) || g + 3, g + 2, g - 3, f + g], { valid: (x) => Number.isInteger(x) && x > 0 });
  return { q: P(`Une classe a ${M} de moyenne. Les ${f} filles ont ${mF} de moyenne et les garçons ${mG}. Combien y a-t-il de garçons ?`), ...m, expl: steps(`Soit g le nombre de garçons : ${f} ${X} ${mF} + ${mG}g = ${M}(${f} + g).`, `${f * mF} + ${mG}g = ${M * f} + ${M}g → ${f * mF - M * f} = ${cx(M - mG, 'g')}.`, M - mG === 1 ? `Donc g = ${g}.` : `g = ${f * mF - M * f} ${DV} ${M - mG} = ${g}.`) + res(fmt(g)), tip: '<b>Astuce :</b> chaque fille est à +' + (mF - M) + ' de la moyenne, chaque garçon à −' + (M - mG) + '. Les écarts doivent se compenser.' };
});
gen('moy.ajout', { sub: 'calcul', ch: 'moy', name: 'Ajouter ou retirer des valeurs', target: 55 }, (R, d) => {
  const n = R.int(5, 12), a = R.int(10, 20), S = n * a;
  if (d === 1) {
    let x, na; do { x = R.int(a - 10, a + 25); na = (S + x) / (n + 1); } while (!Number.isInteger(na) || x === a);
    const m = mcq(R, na, [(a + x) / 2, a + 1, na + 1, na - 1].map((v) => round(v, 2)));
    return { q: P(`La moyenne de ${n} nombres est ${a}. On ajoute le nombre ${x}. Quelle est la nouvelle moyenne ?`), ...m, expl: steps(`Somme des ${n} nombres : ${n} ${X} ${a} = ${S}.`, `Nouvelle somme : ${S} + ${x} = ${S + x}, pour ${n + 1} nombres.`, `${S + x} ${DV} ${n + 1} = ${fmt(na)}.`) + res(fmt(na)) };
  }
  if (d === 2) {
    let x, na; do { x = R.int(a - 10, a + 20); na = (S - x) / (n - 1); } while (!Number.isInteger(na) || x === a);
    const m = mcq(R, na, [a - (x - a) / n, (S - x) / n, na + 1, na - 1].map((v) => round(v, 2)));
    return { q: P(`La moyenne de ${n} nombres est ${a}. On retire le nombre ${x}. Quelle est la moyenne des nombres restants ?`), ...m, expl: steps(`Somme : ${n} ${X} ${a} = ${S}.`, `Après retrait : ${S} ${MINUS} ${x} = ${S - x}, pour ${n - 1} nombres.`, `${S - x} ${DV} ${n - 1} = ${fmt(na)}.`) + res(fmt(na)) };
  }
  const n0 = R.pick([10, 12, 20]), a0 = R.int(12, 20), k = R.pick([2, 4]), mk = R.int(8, 14);
  const na = round((n0 * a0 - k * mk) / (n0 - k), 2);
  const m = mcq(R, na, [round(a0 + (a0 - mk) / 2, 2), round((n0 * a0 - mk) / (n0 - 1), 2), round(na + 0.5, 2), a0], {});
  return { q: P(`La moyenne de ${n0} valeurs est ${a0}. On retire ${k} valeurs dont la moyenne est ${mk}. Quelle est la moyenne des valeurs restantes ?`), ...m, expl: steps(`Somme totale : ${n0} ${X} ${a0} = ${n0 * a0}. Somme retirée : ${k} ${X} ${mk} = ${k * mk}.`, `Il reste ${n0 * a0 - k * mk} pour ${n0 - k} valeurs.`, `${n0 * a0 - k * mk} ${DV} ${n0 - k} = ${fmt(na)}.`) + res(fmt(na)) };
});

/* ---------------- Chapitre 9 : Équations & mise en équation ---------------- */
chapter({
  id: 'eq', sub: 'calcul', order: 9, title: 'Équations & mise en équation', short: 'Équations',
  lesson: `
<h3><span class="hl">1. Résoudre une équation du 1er degré</span></h3>
<p>Le but : isoler x. Tout ce qu'on fait d'un côté, on le fait de l'autre.</p>
<div class="formula">3x − 7 = 2x + 5 &nbsp;→&nbsp; 3x − 2x = 5 + 7 &nbsp;→&nbsp; x = 12</div>
<p>Avec des fractions, on multiplie tout par le dénominateur commun : ${F('x', 3)} + ${F('x', 4)} = 14 → (× 12) 4x + 3x = 168 → 7x = 168 → x = 24.</p>
<h3><span class="hl">2. Les systèmes de deux équations</span></h3>
<p><b>Par combinaison</b> : x + y = 30 et x − y = 8. On additionne : 2x = 38 → x = 19, puis y = 11.</p>
<div class="tip"><b>Astuce Tage Mage :</b> on demande souvent x + y, pas x et y séparément. 2x + 3y = 23 et 3x + 2y = 22 : on additionne → 5x + 5y = 45 → <b>x + y = 9</b>, sans résoudre !</div>
<h3><span class="hl">3. Mettre un problème en équation</span></h3>
<ol><li>Nommer l'inconnue (« soit x le nombre de lapins »).</li><li>Traduire chaque phrase en égalité.</li><li>Résoudre.</li><li>Vérifier avec l'énoncé (et regarder les réponses proposées : tester est parfois plus rapide !).</li></ol>
<div class="ex"><b>Poules et lapins</b><span>35 têtes, 94 pattes. Si tout était poule : 70 pattes. Il y a 24 pattes en trop, et chaque lapin en apporte 2 de plus → <b>12 lapins</b>.</span></div>
<div class="ex"><b>Âges</b><span>Un père a 3 fois l'âge de son fils. Dans 12 ans, il aura 2 fois son âge. Fils : f ; père : 3f.</span><span>3f + 12 = 2(f + 12) → 3f + 12 = 2f + 24 → <b>f = 12</b>.</span></div>
<div class="trap"><b>Piège des âges :</b> dans X ans, les DEUX personnes vieillissent de X ans.</div>
<h3><span class="hl">4. Le second degré (les cas utiles)</span></h3>
<p>(x − 2)(x − 3) = 0 ⇔ x = 2 ou x = 3. Pour x² − 5x + 6 = 0, on cherche deux nombres de <b>somme 5</b> et de <b>produit 6</b> : 2 et 3.</p>
<h3><span class="hl">5. Les inéquations</span></h3>
<div class="trap"><b>Règle d'or :</b> si on multiplie ou divise par un nombre <b>négatif</b>, on <b>retourne</b> le signe. −2x &gt; 6 ⇔ x &lt; −3.</div>`,
});

gen('eq.lin', { sub: 'calcul', ch: 'eq', name: 'Équations du 1er degré', target: 50 }, (R, d) => {
  const x = R.int(-9, 15) || 4;
  if (d === 1) {
    const a = R.int(2, 9), b = R.intNot(-20, 20, [0]), c = a * x + b;
    const m = mcq(R, x, [(c + b) / a, (c - b) * a, c - b, -x, x + 1].map((v) => round(v, 2)), { positive: false });
    return { q: P(`Résoudre : ${big(`${a}x ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} = ${fmt(c)}`)}`), ...m, expl: steps(`On passe ${b >= 0 ? '+' : MINUS}${Math.abs(b)} de l'autre côté : ${a}x = ${fmt(c)} ${b >= 0 ? MINUS : '+'} ${Math.abs(b)} = ${fmt(c - b)}.`, `On divise par ${a} : x = ${fmt(x)}.`) + res('x = ' + fmt(x)) };
  }
  if (d === 2) {
    let a, c2; do { a = R.int(2, 9); c2 = R.int(1, 8); } while (a === c2);
    const b = R.int(-15, 15), dd = (a - c2) * x + b;
    const m = mcq(R, x, [(dd + b) / (a - c2), (dd - b) / (a + c2), -x, x + 2, (dd - b) / a].map((v) => round(v, 2)), { positive: false, valid: (v) => Number.isInteger(v) });
    return { q: P(`Résoudre : ${big(`${a}x ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} = ${c2}x ${dd >= 0 ? '+' : MINUS} ${Math.abs(dd)}`)}`), ...m, expl: steps(`Les x à gauche, les nombres à droite : ${a}x ${MINUS} ${c2}x = ${fmt(dd)} ${b >= 0 ? MINUS : '+'} ${Math.abs(b)}.`, `${cx(a - c2)} = ${fmt(dd - b)}.`, a - c2 === 1 ? '' : `x = ${fmt(dd - b)} ${DV} ${a - c2} = ${fmt(x)}.`) + res('x = ' + fmt(x)) };
  }
  const [p, q] = R.pick([[3, 4], [2, 3], [4, 6], [2, 5], [3, 6], [5, 10]]);
  const L = lcm(p, q), k = R.int(1, 6), X0 = L * k, c = X0 / p + X0 / q;
  const m = mcq(R, X0, [c * 2, round(c * p * q / (p + q) + 1, 2), X0 + L, X0 - L, round(c / 2, 2)], { valid: (v) => v > 0 });
  return { q: P(`Résoudre : ${big(`${F('x', p)} + ${F('x', q)} = ${fmt(c)}`)}`), ...m, expl: steps(`On multiplie tout par ${L} : ${L / p}x + ${L / q}x = ${fmt(c * L)}.`, `${L / p + L / q}x = ${fmt(c * L)}.`, `x = ${fmt(c * L)} ${DV} ${L / p + L / q} = ${fmt(X0)}.`) + res('x = ' + fmt(X0)) };
});
gen('eq.sys', { sub: 'calcul', ch: 'eq', name: 'Systèmes de deux équations', target: 65 }, (R, d) => {
  if (d === 1) {
    const x = R.int(5, 40), y = R.int(1, x - 1), S = x + y, D = x - y, askX = R.chance(0.5), val = askX ? x : y;
    const m = mcq(R, val, [askX ? y : x, S / 2, D, val + 1, val - 2], { valid: Number.isInteger });
    return { q: P(`Deux nombres ont pour somme ${S} et pour différence ${D}. Quel est le ${askX ? 'plus grand' : 'plus petit'} ?`), ...m, expl: steps(`x + y = ${S} et x ${MINUS} y = ${D}.`, `En additionnant : 2x = ${S + D}, donc x = ${x}.`, `y = ${S} ${MINUS} ${x} = ${y}.`) + res(fmt(val)) };
  }
  if (d === 2) {
    const x = R.int(1, 12), y = R.int(1, 12), a = R.int(1, 5), b = R.int(1, 5), c = R.int(1, 5), e = R.int(1, 5);
    if (a * e - b * c === 0) return TM.gens['eq.sys'].make(R, 1);
    const r1 = a * x + b * y, r2 = c * x + e * y, askX = R.chance(0.5), val = askX ? x : y;
    const m = mcq(R, val, [askX ? y : x, val + 1, val - 1, val + 2, Math.abs(r1 - r2)], { valid: (v) => Number.isInteger(v) && v > 0, fill: (RR) => RR.int(1, 24) });
    return { q: P(`On sait que ${big(`${cx(a)} + ${cx(b, 'y')} = ${r1}`)} et ${big(`${cx(c)} + ${cx(e, 'y')} = ${r2}`)}. Combien vaut ${askX ? 'x' : 'y'} ?`), ...m, expl: steps(`On élimine ${askX ? 'y' : 'x'} en combinant les deux équations (ou on remplace).`, `On trouve x = ${x} et y = ${y}.`, `Vérification : ${a} ${X} ${x} + ${b} ${X} ${y} = ${r1} ✔ et ${c} ${X} ${x} + ${e} ${X} ${y} = ${r2} ✔.`) + res(fmt(val)), tip: '<b>Astuce :</b> tester les réponses proposées dans les deux équations est souvent plus rapide.' };
  }
  let a, b, x, y; do { a = R.int(2, 7); b = R.int(1, 6); x = R.int(1, 15); y = R.int(1, 15); } while (a === b);
  const r1 = a * x + b * y, r2 = b * x + a * y, s = x + y;
  const m = mcq(R, s, [x, y, s + 1, Math.abs(x - y) || s + 3, s * 2], { valid: Number.isInteger });
  return { q: P(`Si ${big(`${cx(a)} + ${cx(b, 'y')} = ${r1}`)} et ${big(`${cx(b)} + ${cx(a, 'y')} = ${r2}`)}, combien vaut x + y ?`), ...m, expl: steps(`On additionne les deux équations : ${cx(a + b)} + ${cx(a + b, 'y')} = ${r1 + r2}.`, `Donc ${a + b}(x + y) = ${r1 + r2}, et x + y = ${r1 + r2} ${DV} ${a + b} = ${s}.`) + res(fmt(s)), tip: '<b>Inutile de trouver x et y !</b> Repère la symétrie et additionne.' };
});
gen('eq.pb', { sub: 'calcul', ch: 'eq', name: 'Problèmes à mettre en équation', target: 75 }, (R, d) => {
  const t = d === 1 ? 0 : d === 2 ? R.int(0, 2) : R.int(1, 3);
  if (t === 0) {
    const lap = R.int(3, 25), pou = R.int(3, 25), tetes = lap + pou, pattes = 4 * lap + 2 * pou;
    const m = mcq(R, lap, [pou, tetes / 2, (pattes - 2 * tetes), lap + 2, lap - 3], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Dans une ferme, on compte ${tetes} têtes et ${pattes} pattes, uniquement des poules et des lapins. Combien y a-t-il de lapins ?`), ...m, expl: steps(`Si tous les animaux étaient des poules : ${tetes} ${X} 2 = ${2 * tetes} pattes.`, `Il y a ${pattes} ${MINUS} ${2 * tetes} = ${pattes - 2 * tetes} pattes en trop ; chaque lapin en ajoute 2.`, `Lapins : ${pattes - 2 * tetes} ${DV} 2 = ${lap}.`) + res(fmt(lap)) };
  }
  if (t === 1) {
    const n10 = R.int(2, 20), n20 = R.int(2, 20), n = n10 + n20, tot = 10 * n10 + 20 * n20;
    const m = mcq(R, n20, [n10, n / 2, tot / 20, n20 + 1, n20 - 2], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Une caissière a ${n} billets de 10 € et de 20 €, pour un total de ${eur(tot)}. Combien a-t-elle de billets de 20 € ?`), ...m, expl: steps(`Si tous étaient des billets de 10 € : ${10 * n} €.`, `Il manque ${tot} ${MINUS} ${10 * n} = ${tot - 10 * n} € ; chaque billet de 20 € apporte 10 € de plus.`, `${tot - 10 * n} ${DV} 10 = ${n20} billets de 20 €.`) + res(fmt(n20)) };
  }
  if (t === 2) {
    const c = R.pick([1.2, 1.4, 1.5, 1.8, 2, 2.5]), k = R.pick([0.9, 1.1, 1.2, 1.3, 1.5, 1.6]);
    const a1 = R.int(2, 4), b1 = R.int(1, 3), a2 = R.int(1, 3), b2 = R.int(2, 4);
    if (a1 * b2 === a2 * b1) return TM.gens['eq.pb'].make(R, 2);
    const p1 = round(a1 * c + b1 * k, 2), p2 = round(a2 * c + b2 * k, 2);
    const m = mcq(R, c, [k, round(p1 / (a1 + b1), 2), round(c + 0.1, 2), round(c - 0.2, 2)], { render: eur2 });
    return { q: P(`${a1} cafés et ${b1} croissant${b1 > 1 ? 's' : ''} coûtent ${eur2(p1)}. ${a2} café${a2 > 1 ? 's' : ''} et ${b2} croissants coûtent ${eur2(p2)}. Quel est le prix d'un café ?`), ...m, expl: steps(`Soit c le prix d'un café et k celui d'un croissant : ${a1}c + ${b1}k = ${fmt(p1)} et ${a2}c + ${b2}k = ${fmt(p2)}.`, `On résout (par combinaison ou en testant les réponses) : c = ${fmt(c)} et k = ${fmt(k)}.`, `Vérification : ${a1} ${X} ${fmt(c)} + ${b1} ${X} ${fmt(k)} = ${fmt(p1)} ✔.`) + res(eur2(c)) };
  }
  const plein = R.pick([10, 12, 9, 11]), red = plein - R.pick([3, 4, 5]), np = R.int(20, 80), nr = R.int(20, 80), tot = np * plein + nr * red;
  const m = mcq(R, nr, [np, Math.round((np + nr) / 2), nr + 5, nr - 5], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Un cinéma vend des places à ${eur(plein)} (plein tarif) et ${eur(red)} (tarif réduit). Il a vendu ${np + nr} places pour une recette de ${eur(tot)}. Combien de places à tarif réduit a-t-il vendues ?`), ...m, expl: steps(`Si toutes les places étaient à plein tarif : ${np + nr} ${X} ${plein} = ${(np + nr) * plein} €.`, `Écart : ${(np + nr) * plein} ${MINUS} ${tot} = ${(np + nr) * plein - tot} € ; chaque place réduite coûte ${plein - red} € de moins.`, `${(np + nr) * plein - tot} ${DV} ${plein - red} = ${nr} places réduites.`) + res(fmt(nr)) };
});
gen('eq.age', { sub: 'calcul', ch: 'eq', name: 'Problèmes d\'âges', target: 70 }, (R, d) => {
  if (d === 1) {
    const s = R.int(5, 20), k = R.int(2, 4), dlt = (k - 1) * s, sum = s + k * s;
    const m = mcq(R, s, [k * s, sum / 2, s + 2, s - 2, dlt], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Une mère a ${k} fois l'âge de sa fille. À elles deux, elles ont ${sum} ans. Quel âge a la fille ?`), ...m, expl: steps(`Fille : f ; mère : ${k}f. Donc f + ${k}f = ${sum}.`, `${k + 1}f = ${sum} → f = ${s}.`) + res(plural(s, 'an')) };
  }
  if (d === 2) {
    let f, k, j, n; do { f = R.int(4, 20); k = R.int(3, 5); j = k - 1 >= 2 ? R.int(2, k - 1) : 2; n = (k - j) * f / (j - 1); } while (!Number.isInteger(n) || n <= 0 || n > 30 || j >= k);
    const m = mcq(R, f, [k * f, f + n, n, f + 2, f - 2], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Un père a ${k} fois l'âge de son fils. Dans ${n} ans, il aura ${j} fois l'âge de son fils. Quel âge a le fils aujourd'hui ?`), ...m, expl: steps(`Fils : f ; père : ${k}f. Dans ${n} ans : ${k}f + ${n} = ${j}(f + ${n}).`, `${k}f + ${n} = ${j}f + ${j * n} → ${k - j}f = ${j * n - n}.`, `f = ${j * n - n} ${DV} ${k - j} = ${f}.`) + res(plural(f, 'an')), trap: `<b>Piège :</b> dans ${n} ans, le fils aussi a vieilli de ${n} ans.` };
  }
  let a, b; do { a = R.int(25, 50); b = R.int(3, 18); } while (a - 2 * b <= 0 || a - 2 * b > 30);
  const X0 = a - 2 * b;
  const m = mcq(R, X0, [a - b, Math.round(a / 2) - b + 1, X0 + 3, X0 - 2, b], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Paul a ${a} ans et sa fille ${b} ans. Dans combien d'années Paul aura-t-il exactement le double de l'âge de sa fille ?`), ...m, expl: steps(`Dans x ans : ${a} + x = 2(${b} + x).`, `${a} + x = ${2 * b} + 2x → x = ${a} ${MINUS} ${2 * b} = ${X0}.`, `Vérification : ${a + X0} = 2 ${X} ${b + X0} ✔.`) + res(plural(X0, 'an')) };
});
gen('eq.deg2', { sub: 'calcul', ch: 'eq', name: 'Second degré (cas simples)', target: 70, diffs: [2, 3] }, (R, d) => {
  let r1, r2; do { r1 = R.int(-9, 9); r2 = R.int(-9, 9); } while (r1 === r2 || r1 === 0 || r2 === 0 || r1 + r2 === 0);
  const s = r1 + r2, p = r1 * r2;
  const poly = `x² ${s >= 0 ? MINUS : '+'} ${Math.abs(s) === 1 ? '' : Math.abs(s)}x ${p >= 0 ? '+' : MINUS} ${Math.abs(p)} = 0`.replace('  ', ' ');
  if (d === 2) {
    const val = Math.max(r1, r2);
    const m = mcq(R, val, [Math.min(r1, r2), -val, s, p, val + 1], { positive: false, valid: Number.isInteger });
    return { q: P(`Quelle est la plus grande solution de ${big(poly)} ?`), ...m, expl: steps(`On cherche deux nombres de somme ${fmt(s)} et de produit ${fmt(p)}.`, `Ce sont ${fmt(r1)} et ${fmt(r2)} : (x ${r1 >= 0 ? MINUS : '+'} ${Math.abs(r1)})(x ${r2 >= 0 ? MINUS : '+'} ${Math.abs(r2)}) = 0.`, `La plus grande solution est ${fmt(val)}.`) + res(fmt(val)) };
  }
  const askS = R.chance(0.5), val = askS ? s : p;
  const m = mcq(R, val, [askS ? -s : -p, askS ? p : s, val + 1, val - 2], { positive: false, valid: Number.isInteger });
  return { q: P(`${askS ? 'Quelle est la somme' : 'Quel est le produit'} des solutions de ${big(poly)} ?`), ...m, expl: steps(`Pour x² ${MINUS} Sx + P = 0, la somme des solutions vaut S et leur produit vaut P.`, `Ici les solutions sont ${fmt(r1)} et ${fmt(r2)} : somme ${fmt(s)}, produit ${fmt(p)}.`) + res(fmt(val)), trap: '<b>Piège :</b> le signe. Dans x² − 5x + 6, la somme vaut +5 (et non −5).' };
});
gen('eq.ineq', { sub: 'calcul', ch: 'eq', name: 'Inéquations', target: 60 }, (R, d) => {
  if (d < 3) {
    const a = d === 1 ? R.int(2, 9) : -R.int(2, 9), b = R.int(-15, 15), lim = R.int(-5, 10), c = a * lim + b + (d === 1 ? R.int(1, Math.abs(a) - 1 || 1) : -R.int(1, Math.abs(a) - 1 || 1));
    const bound = (c - b) / a;
    const val = d === 1 ? Math.ceil(bound) - 1 : Math.floor(bound) + 1;
    const ask = d === 1 ? 'le plus grand entier x' : 'le plus petit entier x';
    const sign = '&lt;';
    const m = mcq(R, val, [val + 1, val - 1, -val, Math.round(bound) + 2], { positive: false, valid: Number.isInteger });
    return { q: P(`Quel est ${ask} tel que ${big(`${cx(a)} ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} ${sign} ${fmt(c)}`)} ?`), ...m, expl: steps(`${cx(a)} ${sign} ${fmt(c)} ${b >= 0 ? MINUS : '+'} ${Math.abs(b)} = ${fmt(c - b)}.`, d === 1 ? `On divise par ${a} (positif, le sens ne change pas) : x &lt; ${fmt(round(bound, 3))}.` : `On divise par ${fmt(a)} (NÉGATIF, on retourne le sens) : x &gt; ${fmt(round(bound, 3))}.`, `${d === 1 ? 'Le plus grand' : 'Le plus petit'} entier qui convient est ${val}.`) + res(fmt(val)), trap: d === 2 ? '<b>Piège :</b> oublier de retourner le signe en divisant par un négatif.' : '' };
  }
  const a = R.pick([2, 3]), b = R.int(-5, 5), lo = R.int(-12, 0), hi = R.int(3, 18);
  const xs = []; for (let x = -50; x <= 50; x++) { const v = a * x + b; if (v > lo && v <= hi) xs.push(x); }
  const val = xs.length;
  const m = mcq(R, val, [val + 1, val - 1, hi - lo, Math.round((hi - lo) / a)], { valid: (v) => Number.isInteger(v) && v > 0, fill: (RR) => val + RR.int(-6, 9) });
  return { q: P(`Combien d'entiers x vérifient ${big(`${fmt(lo)} &lt; ${a}x ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} ≤ ${hi}`)} ?`), ...m, expl: steps(`${b >= 0 ? 'On retire ' + b : 'On ajoute ' + Math.abs(b)} partout : ${fmt(lo - b)} &lt; ${a}x ≤ ${fmt(hi - b)}.`, `On divise par ${a} : ${fmt(round((lo - b) / a, 3))} &lt; x ≤ ${fmt(round((hi - b) / a, 3))}.`, `Entiers possibles : ${xs.join(', ')}, soit ${val}.`) + res(fmt(val)), tip: '<b>Attention aux bornes :</b> &lt; exclut, ≤ inclut.' };
});

/* ---- 32-calcul-3.js ---- */
/* ===== CALCUL (3/3) : travail & mélanges, arithmétique, probabilités, géométrie, suites ===== */

/* ---------------- Chapitre 10 : Travail en commun, mélanges ---------------- */
chapter({
  id: 'trav', sub: 'calcul', order: 10, title: 'Travail en commun & mélanges', short: 'Travail & mélanges',
  lesson: `
<h3><span class="hl">1. Travailler ensemble (robinets, ouvriers, imprimantes)</span></h3>
<p>On raisonne en <b>part du travail faite en 1 heure</b>. Un robinet qui remplit une cuve en 3 h en remplit ${F(1, 3)} par heure.</p>
<div class="ex"><b>Exemple</b><span>Robinet A : 3 h. Robinet B : 6 h. Ensemble : ${F(1, 3)} + ${F(1, 6)} = ${F(2, 6)} + ${F(1, 6)} = ${F(3, 6)} = ${F(1, 2)} cuve par heure → <b>2 h</b>.</span></div>
<div class="formula">Pour deux : t = ${F('a × b', 'a + b')} &nbsp;&nbsp; ex : ${F('3 × 6', '3 + 6')} = ${F(18, 9)} = 2 h</div>
<div class="trap"><b>Piège :</b> faire la moyenne (4,5 h) ou la somme (9 h). Ensemble, on va TOUJOURS plus vite que le plus rapide seul.</div>
<p><b>Une fuite</b> qui vide la cuve en 12 h ? On soustrait : ${F(1, 3)} − ${F(1, 12)} = ${F(3, 12)} = ${F(1, 4)} → 4 h.</p>
<h3><span class="hl">2. Mélanges et concentrations</span></h3>
<div class="formula">quantité de produit pur = volume × concentration</div>
<div class="ex"><b>Mélanger deux solutions</b><span>2 L à 30 % + 3 L à 10 % : produit pur 0,6 + 0,3 = 0,9 L dans 5 L → 0,9 ÷ 5 = <b>18 %</b>.</span></div>
<div class="ex"><b>Diluer</b><span>10 L de sirop à 20 % contiennent 2 L de sirop pur. Pour descendre à 8 %, il faut 2 ÷ 0,08 = 25 L au total, donc ajouter <b>15 L d'eau</b>.</span></div>
<h3><span class="hl">3. Prix moyen d'un mélange</h3>
<p>1 kg de café à 12 € + 2 kg à 18 € : (12 + 36) ÷ 3 = <b>16 €/kg</b>. C'est une moyenne pondérée par les quantités.</p>
<div class="tip"><b>Règle de la balance :</b> pour obtenir 15 €/kg avec des cafés à 12 € et 20 €, on mélange dans le rapport des écarts inversés : (20 − 15) : (15 − 12) = 5 : 3.</div>`,
});

gen('trav.rob', { sub: 'calcul', ch: 'trav', name: 'Travail en commun, robinets', target: 70 }, (R, d) => {
  let q, mins, ex, wrong;
  if (d === 1) {
    const [a, b] = R.shuffle(R.pick([[3, 6], [2, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [4, 4], [2, 3], [6, 3], [5, 20]]));
    const t = a * b / (a + b); mins = Math.round(t * 60);
    wrong = [Math.round((a + b) / 2 * 60), (a + b) * 60, Math.abs(a - b) * 60 || 90, mins + 30];
    q = `Un robinet remplit une cuve en ${plural(a, 'heure')}, un autre en ${plural(b, 'heure')}. En combien de temps la remplissent-ils ensemble ?`;
    ex = steps(`Par heure : ${F(1, a)} + ${F(1, b)} = ${frRaw(a + b, a * b)} de la cuve.`, `Temps : ${F(a * b, a + b)} h = ${Number.isInteger(t) ? hm(t) : fmt(round(t, 3)) + ' h = ' + hm(t)}.`);
  } else if (d === 2) {
    const [a, b] = R.pick([[3, 12], [4, 12], [2, 6], [6, 10], [4, 6], [3, 6], [2, 3], [5, 30]]);
    const t = a * b / (b - a); mins = Math.round(t * 60);
    wrong = [Math.round(a * b / (a + b) * 60), (b - a) * 60, (a + b) * 60, mins - 60];
    q = `Un robinet remplit une cuve en ${plural(a, 'heure')}, mais une fuite la viderait en ${plural(b, 'heure')}. En combien de temps la cuve se remplit-elle ?`;
    ex = steps(`Par heure : on remplit ${F(1, a)} et on perd ${F(1, b)}.`, `${F(1, a)} ${MINUS} ${F(1, b)} = ${frRaw(b - a, a * b)} de la cuve par heure.`, `Temps : ${F(a * b, b - a)} = ${hm(t)}.`);
  } else {
    const [a, c] = R.pick([[6, 4], [3, 2], [10, 6], [12, 8], [15, 10], [20, 12], [4, 3]]);
    const b = a * c / (a - c); mins = Math.round(b * 60);
    wrong = [(a - c) * 60, (a + c) * 60, Math.round(a * c / (a + c) * 60), mins + 120];
    q = `Ensemble, Alice et Bruno repeignent une salle en ${plural(c, 'heure')}. Seule, Alice mettrait ${plural(a, 'heure')}. Combien de temps mettrait Bruno seul ?`;
    ex = steps(`Ensemble : ${F(1, c)} de la salle par heure. Alice seule : ${F(1, a)}.`, `Bruno : ${F(1, c)} ${MINUS} ${F(1, a)} = ${frRaw(a - c, a * c)} = ${new Fr(a - c, a * c).html()} par heure.`, `Il met donc ${fmt(b)} h.`);
  }
  const m = mcq(R, mins, wrong, { render: (v) => hm(v / 60), valid: (v) => v > 0 });
  return { q: P(q), ...m, expl: ex + res(hm(mins / 60)), trap: d === 1 ? '<b>Piège :</b> à deux, on va forcément plus vite que le plus rapide des deux.' : '' };
});
gen('trav.mel', { sub: 'calcul', ch: 'trav', name: 'Mélanges et concentrations', target: 75 }, (R, d) => {
  if (d === 1) {
    let v1, c1, v2, c2, c; do { v1 = R.int(1, 6); v2 = R.int(1, 6); c1 = R.pick([10, 20, 30, 40, 50, 60]); c2 = R.pick([5, 10, 15, 20, 25]); c = (v1 * c1 + v2 * c2) / (v1 + v2); } while (c1 === c2 || !Number.isInteger(c));
    const m = mcq(R, c, [(c1 + c2) / 2, c1 + c2, c + 5, c - 3].map((x) => round(x, 2)), { render: pc });
    return { q: P(`On mélange ${unit(v1, 'L')} de jus à ${pc(c1)} de sucre et ${unit(v2, 'L')} de jus à ${pc(c2)} de sucre. Quelle est la concentration en sucre du mélange ?`), ...m, expl: steps(`Sucre pur : ${v1} ${X} ${fmt(c1 / 100)} + ${v2} ${X} ${fmt(c2 / 100)} = ${fmt(round((v1 * c1 + v2 * c2) / 100, 3))} L.`, `Volume total : ${v1 + v2} L.`, `Concentration : ${fmt(round((v1 * c1 + v2 * c2) / 100, 3))} ${DV} ${v1 + v2} = ${fmt(c / 100)}, soit ${pc(c)}.`) + res(pc(c)), trap: `<b>Piège :</b> faire la moyenne des concentrations (${pc((c1 + c2) / 2)}) sans tenir compte des volumes.` };
  }
  if (d === 2) {
    const [V, c, c2] = R.pick([[10, 20, 8], [12, 25, 10], [6, 30, 20], [8, 15, 10], [20, 12, 8], [5, 40, 25], [9, 20, 12]]);
    const add = round(V * c / c2 - V, 3);
    const m = mcq(R, add, [V * (c - c2) / 100, V * c / c2, round(V * c2 / c, 3), add + 2].map((x) => round(x, 3)), { render: (x) => unit(x, 'L') });
    return { q: P(`On a ${unit(V, 'L')} de sirop à ${pc(c)}. Combien de litres d'eau faut-il ajouter pour obtenir un sirop à ${pc(c2)} ?`), ...m, expl: steps(`Sirop pur : ${V} ${X} ${fmt(c / 100)} = ${fmt(V * c / 100)} L. Ajouter de l'eau ne change pas cette quantité.`, `Volume total nécessaire : ${fmt(V * c / 100)} ${DV} ${fmt(c2 / 100)} = ${fmt(round(V * c / c2, 3))} L.`, `Eau à ajouter : ${fmt(round(V * c / c2, 3))} ${MINUS} ${V} = ${unit(add, 'L')}.`) + res(unit(add, 'L')) };
  }
  const [V, c2, c1, c3] = R.pick([[10, 10, 40, 20], [6, 20, 50, 30], [12, 5, 25, 15], [9, 10, 30, 15], [9, 20, 60, 30], [4, 10, 40, 25]]);
  const x = V * (c3 - c2) / (c1 - c3);
  const m = mcq(R, x, [V, V * (c3 - c2) / c1, x * 2, x + 3].map((v) => round(v, 3)), { render: (v) => unit(v, 'L') });
  return { q: P(`Combien de litres d'une solution à ${pc(c1)} faut-il ajouter à ${unit(V, 'L')} d'une solution à ${pc(c2)} pour obtenir une solution à ${pc(c3)} ?`), ...m, expl: steps(`Soit x le volume ajouté : ${fmt(c1 / 100)}x + ${fmt(V * c2 / 100)} = ${fmt(c3 / 100)}(x + ${V}).`, `${fmt(round((c1 - c3) / 100, 3))}x = ${fmt(round(V * (c3 - c2) / 100, 3))}.`, `x = ${unit(round(x, 3), 'L')}.`) + res(unit(round(x, 3), 'L')), tip: '<b>Règle de la balance :</b> les volumes sont dans le rapport inverse des écarts à la concentration visée.' };
});
gen('trav.prix', { sub: 'calcul', ch: 'trav', name: 'Prix moyen d\'un mélange', target: 65 }, (R, d) => {
  if (d === 1) {
    let q1, p1, q2, p2, pm; do { q1 = R.int(1, 5); q2 = R.int(1, 5); p1 = R.int(8, 20); p2 = R.int(8, 24); pm = (q1 * p1 + q2 * p2) / (q1 + q2); } while (p1 === p2 || !Number.isInteger(pm));
    const m = mcq(R, pm, [(p1 + p2) / 2, pm + 1, pm - 1, (q1 * p1 + q2 * p2) / 2].map((x) => round(x, 2)), { render: (x) => eur(x) + '/kg' });
    return { q: P(`Un torréfacteur mélange ${q1} kg de café à ${eur(p1)}/kg et ${q2} kg de café à ${eur(p2)}/kg. Quel est le prix au kilo du mélange ?`), ...m, expl: steps(`Coût total : ${q1} ${X} ${p1} + ${q2} ${X} ${p2} = ${q1 * p1 + q2 * p2} €.`, `Pour ${q1 + q2} kg : ${q1 * p1 + q2 * p2} ${DV} ${q1 + q2} = ${eur(pm)}/kg.`) + res(eur(pm) + '/kg') };
  }
  const [a, b, t] = R.pick([[12, 20, 15], [10, 18, 12], [8, 16, 14], [15, 25, 18], [6, 14, 9], [20, 30, 24]]);
  const ra = b - t, rb = t - a, g = gcd(ra, rb);
  const qa = R.pick([10, 15, 20, 30, 40]) * (ra / g) / (ra / g) * (ra / g);
  const qb = qa * rb / ra;
  const m = mcq(R, qb, [qa * ra / rb, qa, qa / 2, qb + 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'kg') });
  return { q: P(`On veut obtenir un café à ${eur(t)}/kg en mélangeant un café à ${eur(a)}/kg et un café à ${eur(b)}/kg. Pour ${unit(qa, 'kg')} du premier, combien faut-il du second ?`), ...m, expl: steps(`Règle de la balance : le rapport des quantités est l'inverse du rapport des écarts au prix visé.`, `Écarts : ${t} ${MINUS} ${a} = ${rb} et ${b} ${MINUS} ${t} = ${ra}. Quantités dans le rapport ${ra} : ${rb}.`, `Pour ${fmt(qa)} kg du premier : ${fmt(qa)} ${X} ${rb} ${DV} ${ra} = ${unit(qb, 'kg')}.`, `Vérification : (${fmt(qa)} ${X} ${a} + ${fmt(qb)} ${X} ${b}) ${DV} ${fmt(qa + qb)} = ${fmt(round((qa * a + qb * b) / (qa + qb), 2))} €/kg ✔.`) + res(unit(qb, 'kg')) };
});

/* ---------------- Chapitre 11 : Arithmétique ---------------- */
chapter({
  id: 'arith', sub: 'calcul', order: 11, title: 'Arithmétique : divisibilité, PGCD, cycles', short: 'Arithmétique',
  lesson: `
<h3><span class="hl">1. Critères de divisibilité</span></h3>
<div class="tablewrap"><table>
<tr><th>Par</th><th>Si…</th><th>Exemple</th></tr>
<tr><td>2</td><td>le nombre est pair</td><td>358</td></tr>
<tr><td>3</td><td>la somme des chiffres est divisible par 3</td><td>471 → 4+7+1 = 12</td></tr>
<tr><td>4</td><td>les deux derniers chiffres forment un multiple de 4</td><td>1 316 → 16</td></tr>
<tr><td>5</td><td>il finit par 0 ou 5</td><td>2 375</td></tr>
<tr><td>6</td><td>divisible par 2 ET par 3</td><td>942</td></tr>
<tr><td>9</td><td>la somme des chiffres est divisible par 9</td><td>3 978 → 27</td></tr>
<tr><td>11</td><td>(somme des chiffres de rang impair) − (somme de rang pair) est divisible par 11</td><td>2 728 → (2+2) − (7+8) = −11</td></tr>
<tr><td>25</td><td>il finit par 00, 25, 50 ou 75</td><td>1 175</td></tr>
</table></div>
<h3><span class="hl">2. Nombres premiers</span></h3>
<p>Divisibles seulement par 1 et eux-mêmes : 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97.</p>
<div class="trap"><b>Faux premiers à connaître :</b> 51 = 3 × 17 ; 57 = 3 × 19 ; 91 = 7 × 13 ; 87 = 3 × 29 ; 119 = 7 × 17 ; 143 = 11 × 13.</div>
<p>Pour tester un nombre, il suffit d'essayer les premiers jusqu'à sa racine carrée.</p>
<h3><span class="hl">3. PGCD et PPCM : lequel utiliser ?</span></h3>
<ul><li><b>PPCM</b> (plus petit multiple commun) : quand des choses se <b>répètent</b> et qu'on cherche quand elles <b>coïncident</b>. Bus toutes les 12 et 18 min → ensemble toutes les 36 min.</li><li><b>PGCD</b> (plus grand diviseur commun) : quand on <b>partage</b> en paquets identiques le plus grands possible. 84 roses et 60 tulipes → 12 bouquets au maximum.</li></ul>
<div class="formula">PGCD × PPCM = a × b &nbsp;&nbsp; ex : 12 et 18 → PGCD 6, PPCM 36, et 6 × 36 = 12 × 18</div>
<h3><span class="hl">4. Cycles et restes</span></h3>
<p><b>Jours de la semaine</b> : dans 100 jours, 100 = 14 × 7 + 2, donc même jour + 2.</p>
<p><b>Chiffre des unités des puissances</b> : il revient en boucle.</p>
<div class="tablewrap"><table><tr><th>2</th><td>2, 4, 8, 6</td></tr><tr><th>3</th><td>3, 9, 7, 1</td></tr><tr><th>7</th><td>7, 9, 3, 1</td></tr><tr><th>8</th><td>8, 4, 2, 6</td></tr><tr><th>4 et 9</th><td>4, 6 · 9, 1</td></tr><tr><th>0, 1, 5, 6</th><td>toujours le même</td></tr></table></div>
<p>Unités de 7<sup>2026</sup> : cycle de 4, 2026 = 4 × 506 + 2 → 2e terme du cycle → <b>9</b>.</p>
<h3><span class="hl">5. Parité et entiers consécutifs</span></h3>
<p>pair + pair = pair ; impair + impair = pair ; pair + impair = impair ; un produit est impair seulement si tous les facteurs sont impairs.</p>
<p>La somme de 5 entiers consécutifs vaut 5 fois celui du milieu : 135 ÷ 5 = 27 → 25, 26, 27, 28, 29.</p>
<p><b>Nombre de diviseurs</b> : 72 = 2³ × 3² → (3 + 1) × (2 + 1) = 12 diviseurs.</p>`,
});

const DIV_RULES = { 3: 'somme des chiffres divisible par 3', 4: 'deux derniers chiffres multiples de 4', 6: 'pair ET somme des chiffres divisible par 3', 9: 'somme des chiffres divisible par 9', 11: 'différence des sommes alternées divisible par 11', 12: 'divisible par 3 ET par 4', 15: 'divisible par 3 ET par 5', 25: 'finit par 00, 25, 50 ou 75' };
gen('ar.div', { sub: 'calcul', ch: 'arith', name: 'Critères de divisibilité', target: 45 }, (R, d) => {
  const N = R.pick(d === 1 ? [3, 4, 9, 25] : d === 2 ? [6, 9, 4, 15] : [11, 12, 6, 15]);
  const lo = d === 1 ? 100 : 1000, hi = d === 1 ? 999 : 9999;
  let good; do { good = R.int(lo, hi); } while (good % N !== 0);
  const bad = []; let g = 0;
  while (bad.length < 4 && g++ < 500) { const x = good + R.sign() * R.int(1, Math.max(12, N * 3)); if (x >= lo && x <= hi && x % N !== 0 && !bad.includes(x)) bad.push(x); }
  const sumd = (x) => String(x).split('').reduce((a, c) => a + +c, 0);
  const all = R.shuffle([good, ...bad]);
  let detail;
  if (N === 3 || N === 9) detail = all.map((x) => `${fmt(x)} → ${sumd(x)}`).join(' ; ');
  else if (N === 4) detail = all.map((x) => `${fmt(x)} → ${String(x).slice(-2)}`).join(' ; ');
  else if (N === 25) detail = all.map((x) => `${fmt(x)} finit par ${String(x).slice(-2)}`).join(' ; ');
  else detail = all.map((x) => `${fmt(x)} ${x % N === 0 ? '✔' : '✘'}`).join(' ; ');
  return { q: P(`Lequel de ces nombres est divisible par <b>${N}</b> ?`), choices: all.map((x) => fmt(x)), answer: all.indexOf(good), expl: steps(`Critère : ${DIV_RULES[N]}.`, `Vérification : ${detail}.`, `Seul ${fmt(good)} convient (${fmt(good)} = ${N} ${X} ${fmt(good / N)}).`) + res(fmt(good)) };
});
gen('ar.prem', { sub: 'calcul', ch: 'arith', name: 'Nombres premiers', target: 45 }, (R, d) => {
  const fakes = [[51, '3 × 17'], [57, '3 × 19'], [91, '7 × 13'], [87, '3 × 29'], [119, '7 × 17'], [133, '7 × 19'], [143, '11 × 13'], [161, '7 × 23'], [187, '11 × 17'], [209, '11 × 19'], [221, '13 × 17'], [69, '3 × 23'], [77, '7 × 11'], [93, '3 × 31'], [111, '3 × 37'], [117, '9 × 13'], [123, '3 × 41'], [129, '3 × 43'], [169, '13 × 13'], [203, '7 × 29']];
  const primes = (d === 1 ? [53, 59, 61, 67, 71, 73, 79, 83, 89, 97] : [101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199]);
  const pool = d === 1 ? fakes.filter((f) => f[0] < 100) : fakes;
  const wantPrime = R.chance(0.6);
  let items, correct;
  if (wantPrime) { const p = R.pick(primes); const f = R.sample(pool, 4); items = R.shuffle([[p, 'premier'], ...f]); correct = p; }
  else { const f = R.pick(pool); const ps = R.sample(primes, 4).map((p) => [p, 'premier']); items = R.shuffle([f, ...ps]); correct = f[0]; }
  const detail = items.map(([n, w]) => `${n} = ${w === 'premier' ? 'premier' : w}`).join(' ; ');
  return { q: P(wantPrime ? 'Lequel de ces nombres est <b>premier</b> ?' : 'Lequel de ces nombres <b>n\'est pas</b> premier ?'), choices: items.map((x) => fmt(x[0])), answer: items.findIndex((x) => x[0] === correct), expl: steps(`On teste la divisibilité par 3, 7, 11, 13… (jusqu'à la racine carrée).`, detail + '.') + res(fmt(correct)), trap: '<b>Piège :</b> 51, 57, 87, 91, 119, 133, 143 ressemblent à des nombres premiers mais n\'en sont pas.' };
});
gen('ar.pp', { sub: 'calcul', ch: 'arith', name: 'PGCD et PPCM en situation', target: 60 }, (R, d) => {
  if (d === 1) {
    const [a, b] = R.pick([[12, 18], [8, 12], [10, 15], [6, 8], [9, 12], [15, 20], [14, 21], [16, 24], [20, 30], [12, 16]]);
    const val = lcm(a, b);
    const m = mcq(R, val, [a * b, gcd(a, b), a + b, val + a, Math.max(a, b) * 2 === val ? val + b : Math.max(a, b) * 2], { valid: Number.isInteger });
    return { q: P(`Deux bus partent ensemble du terminus à 8 h. L'un repart toutes les ${a} minutes, l'autre toutes les ${b} minutes. Dans combien de minutes repartiront-ils de nouveau ensemble ?`), ...m, expl: steps(`On cherche le premier multiple commun de ${a} et ${b} : c'est le PPCM.`, `Multiples de ${Math.max(a, b)} : ${[1, 2, 3, 4, 5].map((k) => k * Math.max(a, b)).join(', ')}… Le premier divisible par ${Math.min(a, b)} est ${val}.`) + res(plural(val, 'minute')), trap: `<b>Piège :</b> ${a} ${X} ${b} = ${a * b} est un multiple commun, mais pas le plus petit.` };
  }
  if (d === 2) {
    const g = R.pick([6, 8, 9, 12, 14, 15, 18]), x = R.int(2, 9), y = R.intNot(2, 9, [x]);
    if (gcd(x, y) !== 1) return TM.gens['ar.pp'].make(R, 2);
    const A = g * x, B = g * y;
    const m = mcq(R, g, [lcm(A, B), Math.min(A, B), g / 2, g * 2, x + y], { valid: Number.isInteger });
    return { q: P(`Un fleuriste a ${A} roses et ${B} tulipes. Il veut faire le plus grand nombre possible de bouquets identiques en utilisant toutes les fleurs. Combien de bouquets fera-t-il ?`), ...m, expl: steps(`Le nombre de bouquets doit diviser ${A} et ${B} : on cherche le PGCD.`, `${A} = ${g} ${X} ${x} et ${B} = ${g} ${X} ${y}, avec ${x} et ${y} sans diviseur commun.`, `PGCD = ${g} : ${g} bouquets de ${x} roses et ${y} tulipes.`) + res(plural(g, 'bouquet')) };
  }
  const g = R.pick([15, 20, 25, 30, 40, 45, 60]), x = R.int(2, 9), y = R.intNot(2, 9, [x]);
  if (gcd(x, y) !== 1) return TM.gens['ar.pp'].make(R, 3);
  const L = g * x, l = g * y, n = x * y;
  const m = mcq(R, n, [L * l / 100, x + y, n * 2, (x + 1) * (y + 1)], { valid: Number.isInteger });
  return { q: P(`On veut carreler une pièce rectangulaire de ${fmt(L)} cm sur ${fmt(l)} cm avec des carreaux carrés identiques, les plus grands possibles, sans découpe. Combien de carreaux faut-il ?`), ...m, expl: steps(`Le côté du carreau doit diviser ${L} et ${l} : le plus grand possible est le PGCD = ${g} cm.`, `${L} ${DV} ${g} = ${x} carreaux en longueur, ${l} ${DV} ${g} = ${y} en largeur.`, `Total : ${x} ${X} ${y} = ${n} carreaux.`) + res(fmt(n)) };
});
gen('ar.cycle', { sub: 'calcul', ch: 'arith', name: 'Cycles : jours et chiffres des unités', target: 55 }, (R, d) => {
  if (d === 1) {
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const s = R.int(0, 6), n = R.int(15, 400), e = (s + n) % 7;
    const opts = R.shuffle([e, (e + 1) % 7, (e + 6) % 7, (e + 2) % 7, (e + 3) % 7]);
    return { q: P(`Nous sommes un ${days[s]}. Quel jour serons-nous dans ${n} jours ?`), choices: opts.map((x) => days[x]), answer: opts.indexOf(e), expl: steps(`Une semaine = 7 jours : seul le reste de ${n} ${DV} 7 compte.`, `${n} = 7 ${X} ${Math.floor(n / 7)} + ${n % 7}.`, `${days[s]} + ${n % 7} jour${n % 7 > 1 ? 's' : ''} = ${days[e]}.`) + res(days[e]) };
  }
  const cyc = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 4: [4, 6], 9: [9, 1] };
  const b = R.pick(d === 2 ? [2, 3, 7] : [7, 8, 4, 9, 3]), cy = cyc[b], n = R.int(20, 2030);
  const idx = (n - 1) % cy.length, val = cy[idx];
  const others = [...new Set(cy.filter((x) => x !== val).concat(R.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== val))))].slice(0, 4);
  const opts = R.shuffle([val, ...others]);
  const base = d === 3 ? b + 10 * R.int(1, 9) : b;
  return { q: P(`Quel est le chiffre des unités de ${big(PW(base, n))} ?`), choices: opts.map(String), answer: opts.indexOf(val), expl: steps(d === 3 ? `Seul le chiffre des unités de ${base} compte : ${b}.` : '', `Les unités des puissances de ${b} forment un cycle : ${cy.join(', ')} (longueur ${cy.length}).`, `${n} = ${cy.length} ${X} ${Math.floor(n / cy.length)} + ${n % cy.length} → on prend le ${n % cy.length === 0 ? cy.length : n % cy.length}e terme du cycle.`, `Le chiffre des unités est ${val}.`) + res(String(val)) };
});
gen('ar.consec', { sub: 'calcul', ch: 'arith', name: 'Entiers consécutifs et parité', target: 55 }, (R, d) => {
  if (d < 3) {
    const k = d === 1 ? R.pick([3, 5]) : R.pick([4, 5, 6, 7]), even = d === 2 && R.chance(0.5), step = even ? 2 : 1;
    const first = even ? 2 * R.int(3, 40) : R.int(5, 90), list = Array.from({ length: k }, (_, i) => first + i * step), S = list.reduce((a, b) => a + b, 0);
    const askMax = R.chance(0.5), val = askMax ? list[k - 1] : list[0];
    const m = mcq(R, val, [askMax ? list[0] : list[k - 1], Math.round(S / k), val + step, val - step, S / k + k], { valid: Number.isInteger });
    return { q: P(`La somme de ${k} entiers ${even ? 'pairs ' : ''}consécutifs vaut ${S}. Quel est le ${askMax ? 'plus grand' : 'plus petit'} ?`), ...m, expl: steps(`La moyenne de nombres régulièrement espacés est le nombre du milieu : ${S} ${DV} ${k} = ${fmt(S / k)}.`, `Les nombres sont donc ${list.join(', ')}.`) + res(fmt(val)) };
  }
  const items = R.pick([
    { q: 'Si a est impair et b est pair, lequel de ces nombres est forcément impair ?', c: 'a + b', w: ['a × b', '2a + b', 'b²', 'a + 3'], e: 'impair + pair = impair. Les autres sont pairs (a × b contient le facteur pair b ; 2a + b et b² sont pairs ; a + 3 = impair + impair = pair).' },
    { q: 'Si n est un entier, lequel de ces nombres est toujours pair ?', c: 'n(n + 1)', w: ['n + 1', '2n + 1', 'n²', '3n'], e: 'n et n + 1 sont consécutifs : l\'un des deux est pair, donc leur produit est pair.' },
    { q: 'Si a et b sont impairs, lequel de ces nombres est impair ?', c: 'a × b', w: ['a + b', 'a − b', 'a² + b²', '2ab'], e: 'impair × impair = impair. Les sommes et différences de deux impairs sont paires.' },
    { q: 'Si n est un entier, lequel de ces nombres est toujours divisible par 3 ?', c: 'n(n + 1)(n + 2)', w: ['n(n + 1)', 'n² + 1', '3n + 1', 'n + 3'], e: 'Parmi trois entiers consécutifs, il y en a toujours un multiple de 3.' },
  ]);
  const m = shuffleChoices(R, [items.c, ...items.w]);
  return { q: P(items.q), ...m, expl: P(items.e) + res(items.c), tip: '<b>Méthode express :</b> teste avec de petits nombres (n = 1, n = 2) pour éliminer.' };
});
gen('ar.ndiv', { sub: 'calcul', ch: 'arith', name: 'Nombre de diviseurs', target: 60, diffs: [2, 3] }, (R, d) => {
  const ps = d === 2 ? [[2, R.int(1, 4)], [3, R.int(1, 2)]] : [[2, R.int(1, 3)], [3, R.int(1, 2)], [5, 1]];
  const N = ps.reduce((a, [p, e]) => a * Math.pow(p, e), 1), val = ps.reduce((a, [, e]) => a * (e + 1), 1);
  const m = mcq(R, val, [ps.reduce((a, [, e]) => a * e, 1), ps.reduce((a, [, e]) => a + e, 0), val + 2, val - 1, ps.reduce((a, [, e]) => a + e + 1, 0)], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Combien le nombre ${big(fmt(N))} a-t-il de diviseurs (1 et lui-même compris) ?`), ...m, expl: steps(`Décomposition : ${fmt(N)} = ${ps.map(([p, e]) => (e > 1 ? PW(p, e) : p)).join(` ${X} `)}.`, `On ajoute 1 à chaque exposant et on multiplie : ${ps.map(([, e]) => `(${e} + 1)`).join(` ${X} `)} = ${val}.`) + res(fmt(val)) };
});

/* ---------------- Chapitre 12 : Dénombrement & probabilités ---------------- */
chapter({
  id: 'proba', sub: 'calcul', order: 12, title: 'Dénombrement & probabilités', short: 'Probabilités',
  lesson: `
<h3><span class="hl">1. Compter : le principe multiplicatif</span></h3>
<p>3 entrées, 4 plats, 2 desserts → 3 × 4 × 2 = <b>24 menus</b>. À chaque étape, on multiplie par le nombre de choix possibles.</p>
<div class="tablewrap"><table>
<tr><th>Situation</th><th>Calcul</th><th>Exemple</th></tr>
<tr><td>Ranger n objets (l'ordre compte, tous)</td><td>n! = n × (n−1) × … × 1</td><td>5 livres : 120</td></tr>
<tr><td>Choisir k parmi n, l'ordre compte</td><td>n × (n−1) × … (k facteurs)</td><td>Podium de 3 parmi 8 : 8 × 7 × 6 = 336</td></tr>
<tr><td>Choisir k parmi n, l'ordre ne compte pas</td><td>${F('n × (n−1) × …', 'k!')}</td><td>2 délégués parmi 10 : ${F('10 × 9', 2)} = 45</td></tr>
<tr><td>Codes avec répétition</td><td>(nombre de symboles)<sup>longueur</sup></td><td>Code à 4 chiffres : 10⁴</td></tr>
</table></div>
<div class="tip"><b>Poignées de main</b> entre n personnes : ${F('n × (n − 1)', 2)}. Entre 12 personnes : 66.</div>
<p><b>Question clé : l'ordre compte-t-il ?</b> Un podium (1er, 2e, 3e) : oui. Une équipe de 3 : non.</p>
<h3><span class="hl">2. Probabilités</span></h3>
<div class="formula">P = ${F('nombre de cas favorables', 'nombre de cas possibles')}</div>
<ul><li><b>Contraire</b> : P(non A) = 1 − P(A).</li><li><b>« Au moins un »</b> : passe TOUJOURS par le contraire. P(au moins un 6 en 2 lancers) = 1 − ${F(5, 6)} × ${F(5, 6)} = 1 − ${F(25, 36)} = ${F(11, 36)}.</li><li><b>Événements successifs</b> : on multiplie. Deux piles de suite : ${F(1, 2)} × ${F(1, 2)} = ${F(1, 4)}.</li></ul>
<div class="ex"><b>Tirage sans remise</b><span>Urne de 5 rouges et 3 bleues, on tire 2 boules sans remise. P(2 rouges) = ${F(5, 8)} × ${F(4, 7)} = ${F(20, 56)} = ${F(5, 14)}.</span><span>Avec remise : ${F(5, 8)} × ${F(5, 8)} = ${F(25, 64)}.</span></div>
<h3><span class="hl">3. Deux dés : 36 cas</span></h3>
<p>Nombre de façons d'obtenir chaque somme : 2 → 1 · 3 → 2 · 4 → 3 · 5 → 4 · 6 → 5 · <b>7 → 6</b> · 8 → 5 · 9 → 4 · 10 → 3 · 11 → 2 · 12 → 1.</p>
<h3><span class="hl">4. Ensembles (diagrammes de Venn)</span></h3>
<div class="formula">nb(A ou B) = nb(A) + nb(B) − nb(A et B)</div>
<p>40 élèves : 25 font de l'anglais, 18 de l'espagnol, 7 les deux. Au moins une langue : 25 + 18 − 7 = 36. Aucune : 40 − 36 = <b>4</b>.</p>
<div class="trap"><b>Piège :</b> oublier de retirer ceux qui sont comptés deux fois.</div>`,
});

gen('pb.simple', { sub: 'calcul', ch: 'proba', name: 'Probabilités simples', target: 50 }, (R, d) => {
  if (R.chance(0.5)) {
    const r = R.int(2, 9), b = R.int(2, 9), v = R.int(1, 7), n = r + b + v;
    const t = d === 1 ? 0 : d === 2 ? 1 : 2;
    const fav = t === 0 ? r : t === 1 ? n - r : r + v;
    const lab = t === 0 ? 'rouge' : t === 1 ? 'qui ne soit pas rouge' : 'rouge ou verte';
    const val = new Fr(fav, n);
    const m = mcq(R, val, [new Fr(fav, n - fav || 1), new Fr(r, b + v), new Fr(1, 3), new Fr(fav + 1, n), new Fr(n - fav, n)].filter((f) => f.n > 0 && f.val() <= 1));
    return { q: P(`Une urne contient ${r} boules rouges, ${b} bleue${b > 1 ? 's' : ''} et ${v} verte${v > 1 ? 's' : ''}. On tire une boule au hasard. Quelle est la probabilité de tirer une boule ${lab} ?`), ...m, expl: steps(`Nombre total de boules : ${r} + ${b} + ${v} = ${n}.`, `Cas favorables : ${fav}.`, `P = ${frRaw(fav, n)}${val.d !== n ? ' = ' + val.html() : ''}.`) + res(val.html()) };
  }
  const cases = [
    { q: 'd\'obtenir un nombre pair avec un dé à 6 faces', f: 3, n: 6, e: '2, 4, 6' },
    { q: 'd\'obtenir au moins 5 avec un dé à 6 faces', f: 2, n: 6, e: '5, 6' },
    { q: 'd\'obtenir un multiple de 3 avec un dé à 6 faces', f: 2, n: 6, e: '3, 6' },
    { q: 'de tirer un roi dans un jeu de 32 cartes', f: 4, n: 32, e: '4 rois' },
    { q: 'de tirer un cœur dans un jeu de 32 cartes', f: 8, n: 32, e: '8 cœurs' },
    { q: 'de tirer une figure (valet, dame ou roi) dans un jeu de 32 cartes', f: 12, n: 32, e: '3 figures × 4 couleurs = 12' },
    { q: 'de tirer une figure (valet, dame ou roi) dans un jeu de 52 cartes', f: 12, n: 52, e: '3 × 4 = 12' },
    { q: 'de tirer un as rouge dans un jeu de 52 cartes', f: 2, n: 52, e: 'as de cœur et as de carreau' },
    { q: 'd\'obtenir un nombre premier avec un dé à 6 faces', f: 3, n: 6, e: '2, 3, 5' },
  ];
  const c = R.pick(cases), val = new Fr(c.f, c.n);
  const m = mcq(R, val, [new Fr(c.f, c.n - c.f), new Fr(1, c.f), new Fr(c.f + 1, c.n), new Fr(1, 2), new Fr(1, 3)].filter((f) => f.val() < 1));
  return { q: P(`Quelle est la probabilité ${c.q} ?`), ...m, expl: steps(`Cas favorables : ${c.e} → ${c.f}.`, `Cas possibles : ${c.n}.`, `P = ${frRaw(c.f, c.n)} = ${val.html()}.`) + res(val.html()) };
});
gen('pb.tirages', { sub: 'calcul', ch: 'proba', name: 'Tirages avec ou sans remise', target: 70 }, (R, d) => {
  const r = R.int(3, 7), b = R.int(2, 6), n = r + b, sans = d >= 2 ? true : R.chance(0.3);
  if (d < 3) {
    const val = sans ? new Fr(r * (r - 1), n * (n - 1)) : new Fr(r * r, n * n);
    const other = sans ? new Fr(r * r, n * n) : new Fr(r * (r - 1), n * (n - 1));
    const m = mcq(R, val, [other, new Fr(r, n), new Fr(2 * r, n), new Fr(r * (r - 1), n * n), new Fr(r - 1, n - 1)].filter((f) => f.val() < 1));
    return { q: P(`Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire successivement deux jetons ${sans ? '<b>sans remise</b>' : '<b>avec remise</b>'}. Quelle est la probabilité que les deux soient rouges ?`), ...m, expl: steps(`1er tirage : ${F(r, n)}.`, sans ? `2e tirage (un rouge en moins, un jeton en moins) : ${F(r - 1, n - 1)}.` : `2e tirage (on a remis le jeton) : ${F(r, n)}.`, `P = ${F(r, n)} ${X} ${sans ? F(r - 1, n - 1) : F(r, n)} = ${val.html()}.`) + res(val.html()) };
  }
  const val = new Fr(2 * r * b, n * (n - 1));
  const m = mcq(R, val, [new Fr(r * b, n * (n - 1)), new Fr(2 * r * b, n * n), new Fr(1, 2), new Fr(r * b, n * n)].filter((f) => f.val() < 1));
  return { q: P(`Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire deux jetons sans remise. Quelle est la probabilité d'obtenir un jeton de chaque couleur ?`), ...m, expl: steps(`Rouge puis bleu : ${F(r, n)} ${X} ${F(b, n - 1)} = ${frRaw(r * b, n * (n - 1))}.`, `Bleu puis rouge : ${F(b, n)} ${X} ${F(r, n - 1)} = ${frRaw(r * b, n * (n - 1))}.`, `Total : ${frRaw(2 * r * b, n * (n - 1))} = ${val.html()}.`) + res(val.html()), trap: '<b>Piège :</b> oublier l\'ordre inverse (bleu puis rouge).' };
});
gen('pb.aumoins', { sub: 'calcul', ch: 'proba', name: '« Au moins un »', target: 65 }, (R, d) => {
  const cases = d === 1 ? [{ q: 'd\'obtenir au moins une fois pile en lançant 3 fois une pièce', p: new Fr(1, 2), k: 3, txt: 'face' }, { q: 'd\'obtenir au moins une fois pile en lançant 2 fois une pièce', p: new Fr(1, 2), k: 2, txt: 'face' }]
    : d === 2 ? [{ q: 'd\'obtenir au moins un 6 en lançant 2 fois un dé', p: new Fr(5, 6), k: 2, txt: '« pas de 6 »' }, { q: 'd\'obtenir au moins une fois pile en lançant 4 fois une pièce', p: new Fr(1, 2), k: 4, txt: 'face' }]
      : [{ q: 'd\'obtenir au moins un 6 en lançant 3 fois un dé', p: new Fr(5, 6), k: 3, txt: '« pas de 6 »' }, { q: 'qu\'au moins un des deux tireurs touche la cible, sachant que l\'un touche 2 fois sur 3 et l\'autre 3 fois sur 4', p: null }];
  const c = R.pick(cases);
  if (!c.p) {
    const val = new Fr(1).sub(new Fr(1, 3).mul(new Fr(1, 4)));
    const m = mcq(R, val, [new Fr(2, 3).mul(new Fr(3, 4)), new Fr(17, 12).sub(1), new Fr(1, 12), new Fr(5, 6)].filter((f) => f.val() <= 1));
    return { q: P(`Quelle est la probabilité ${c.q} ?`), ...m, expl: steps(`On passe par le contraire : aucun ne touche.`, `P(aucun) = ${F(1, 3)} ${X} ${F(1, 4)} = ${F(1, 12)}.`, `P(au moins un) = 1 ${MINUS} ${F(1, 12)} = ${val.html()}.`) + res(val.html()) };
  }
  let none = new Fr(1); for (let i = 0; i < c.k; i++) none = none.mul(c.p);
  const val = new Fr(1).sub(none);
  const naive = new Fr(1).sub(c.p).mul(c.k);
  const m = mcq(R, val, [naive, none, new Fr(1).sub(c.p), new Fr(1, 2)].filter((f) => f.val() <= 1 && f.n > 0));
  return { q: P(`Quelle est la probabilité ${c.q} ?`), ...m, expl: steps(`On passe par le contraire : n'obtenir que des ${c.txt}.`, `P(contraire) = (${c.p.html()})<sup>${c.k}</sup> = ${none.html()}.`, `P(au moins un) = 1 ${MINUS} ${none.html()} = ${val.html()}.`) + res(val.html()), trap: `<b>Piège :</b> additionner les probabilités (${naive.html()}).` };
});
gen('pb.des', { sub: 'calcul', ch: 'proba', name: 'Somme de deux dés', target: 55 }, (R, d) => {
  const ways = (s) => 6 - Math.abs(s - 7);
  if (d < 3) {
    const s = d === 1 ? R.pick([7, 6, 8, 12, 2]) : R.pick([4, 5, 9, 10, 11, 3]);
    const val = new Fr(ways(s), 36);
    const m = mcq(R, val, [new Fr(1, 11), new Fr(ways(s), 12), new Fr(ways(s) + 1, 36), new Fr(1, 6), new Fr(s, 36)].filter((f) => f.val() < 1));
    const list = []; for (let a = 1; a <= 6; a++) { const b = s - a; if (b >= 1 && b <= 6) list.push(`(${a}, ${b})`); }
    return { q: P(`On lance deux dés équilibrés. Quelle est la probabilité que la somme vaille ${s} ?`), ...m, expl: steps(`Il y a 6 ${X} 6 = 36 résultats possibles.`, `Somme ${s} : ${list.join(', ')} → ${ways(s)} cas.`, `P = ${frRaw(ways(s), 36)}${val.d !== 36 ? ' = ' + val.html() : ''}.`) + res(val.html()), trap: '<b>Piège :</b> (2, 5) et (5, 2) sont deux cas différents.' };
  }
  const t = R.pick([9, 10, 8]);
  let f = 0; for (let s = t; s <= 12; s++) f += ways(s);
  const val = new Fr(f, 36);
  const m = mcq(R, val, [new Fr(13 - t, 11), new Fr(f - 1, 36), new Fr(f, 30), new Fr(1, 4)].filter((x) => x.val() < 1));
  return { q: P(`On lance deux dés. Quelle est la probabilité que la somme soit supérieure ou égale à ${t} ?`), ...m, expl: steps(`Cas par somme : ${Array.from({ length: 13 - t }, (_, i) => `${t + i} → ${ways(t + i)}`).join(' ; ')}.`, `Total : ${f} cas sur 36.`, `P = ${val.html()}.`) + res(val.html()) };
});
gen('dn.mult', { sub: 'calcul', ch: 'proba', name: 'Principe multiplicatif', target: 45 }, (R, d) => {
  if (d === 1) {
    const a = R.int(2, 6), b = R.int(2, 6), c = R.int(2, 5), val = a * b * c;
    const m = mcq(R, val, [a + b + c, a * b + c, val * 2, (a + b) * c], { valid: Number.isInteger });
    return { q: P(`Un restaurant propose ${a} entrées, ${b} plats et ${c} desserts. Combien de menus différents (entrée + plat + dessert) peut-on composer ?`), ...m, expl: steps(`On multiplie les choix : ${a} ${X} ${b} ${X} ${c} = ${val}.`) + res(fmt(val)) };
  }
  if (d === 2) {
    const L = R.pick([3, 4]), distinct = R.chance(0.5), val = distinct ? arr(10, L) : Math.pow(10, L);
    const m = mcq(R, val, [distinct ? Math.pow(10, L) : arr(10, L), 10 * L, comb(10, L), Math.pow(9, L)], { valid: Number.isInteger });
    return { q: P(`Combien de codes de ${L} chiffres (de 0 à 9) ${distinct ? '<b>tous différents</b>' : '(les répétitions sont autorisées)'} peut-on former ?`), ...m, expl: steps(distinct ? `1er chiffre : 10 choix, 2e : 9, 3e : 8${L === 4 ? ', 4e : 7' : ''}.` : `Chaque chiffre a 10 choix.`, `${distinct ? Array.from({ length: L }, (_, i) => 10 - i).join(` ${X} `) : `10<sup>${L}</sup>`} = ${fmt(val)}.`) + res(fmt(val)) };
  }
  const lettres = R.pick([[2, 3], [3, 2]]), v2 = Math.pow(26, lettres[0]) * Math.pow(10, lettres[1]);
  const m = mcq(R, v2, [26 * lettres[0] + 10 * lettres[1], arr(26, lettres[0]) * arr(10, lettres[1]), Math.pow(36, lettres[0] + lettres[1]), v2 / 2], { valid: Number.isInteger });
  return { q: P(`Un identifiant est formé de ${lettres[0]} lettres (A à Z) suivies de ${lettres[1]} chiffres, répétitions autorisées. Combien d'identifiants différents existe-t-il ?`), ...m, expl: steps(`Lettres : 26 choix chacune → 26<sup>${lettres[0]}</sup>. Chiffres : 10 choix chacun → 10<sup>${lettres[1]}</sup>.`, `Total : ${fmt(Math.pow(26, lettres[0]))} ${X} ${fmt(Math.pow(10, lettres[1]))} = ${fmt(v2)}.`) + res(fmt(v2)) };
});
gen('dn.perm', { sub: 'calcul', ch: 'proba', name: 'Permutations et arrangements', target: 50 }, (R, d) => {
  if (d === 1) { const n = R.int(4, 6), val = fact(n); const m = mcq(R, val, [n * n, n * (n - 1), fact(n - 1), Math.pow(2, n)], { valid: Number.isInteger }); return { q: P(`De combien de façons peut-on ranger ${n} livres différents sur une étagère ?`), ...m, expl: steps(`1re place : ${n} choix, puis ${n - 1}, ${n - 2}… jusqu'à 1.`, `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(` ${X} `)} = ${val}.`) + res(fmt(val)) }; }
  if (d === 2) { const n = R.int(6, 10), k = 3, val = arr(n, k); const m = mcq(R, val, [comb(n, k), Math.pow(n, k), n * k, arr(n, k - 1)], { valid: Number.isInteger }); return { q: P(`${n} coureurs participent à une course. Combien y a-t-il de podiums possibles (1er, 2e, 3e) ?`), ...m, expl: steps(`L'ordre compte. 1er : ${n} choix, 2e : ${n - 1}, 3e : ${n - 2}.`, `${n} ${X} ${n - 1} ${X} ${n - 2} = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ${comb(n, 3)} compterait les groupes de 3 sans ordre.` }; }
  const w = R.pick([['PAPA', 6, '4! ÷ (2! × 2!)'], ['ELLE', 6, '4! ÷ (2! × 2!)'], ['RADAR', 30, '5! ÷ (2! × 2!)'], ['ANNA', 6, '4! ÷ (2! × 2!)'], ['LILAS', 30, '5! ÷ (2! × 2!)'], ['NANA', 6, '4! ÷ (2! × 2!)'], ['TOTO', 6, '4! ÷ (2! × 2!)'], ['ANANAS', 60, '6! ÷ (3! × 2!)']]);
  const m = mcq(R, w[1], [fact(w[0].length), fact(w[0].length) / 2, w[1] * 2, w[1] + 4], { valid: Number.isInteger });
  return { q: P(`Combien d'anagrammes (avec ou sans signification) peut-on former avec les lettres du mot ${big(w[0])} ?`), ...m, expl: steps(`Si toutes les lettres étaient différentes : ${w[0].length}! = ${fact(w[0].length)}.`, `On divise par les permutations des lettres répétées : ${w[2]} = ${w[1]}.`) + res(fmt(w[1])) };
});
gen('dn.comb', { sub: 'calcul', ch: 'proba', name: 'Combinaisons (l\'ordre ne compte pas)', target: 55 }, (R, d) => {
  if (d === 1) { const n = R.int(6, 15), val = comb(n, 2); const hs = R.chance(0.5); const m = mcq(R, val, [n * (n - 1), n * n, val + n, 2 * n], { valid: Number.isInteger }); return { q: P(hs ? `${n} personnes se serrent toutes la main une fois. Combien de poignées de main sont échangées ?` : `De combien de façons peut-on choisir 2 délégués parmi ${n} élèves ?`), ...m, expl: steps(`Choix ordonnés : ${n} ${X} ${n - 1} = ${n * (n - 1)}.`, `Chaque paire est comptée 2 fois (A-B et B-A) : ${n * (n - 1)} ${DV} 2 = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ${n * (n - 1)} compte chaque paire deux fois.` }; }
  if (d === 2) { const n = R.int(6, 10), val = comb(n, 3); const m = mcq(R, val, [arr(n, 3), comb(n, 2), val * 2, n * 3], { valid: Number.isInteger }); return { q: P(`De combien de façons peut-on former une équipe de 3 personnes parmi ${n} ?`), ...m, expl: steps(`Choix ordonnés : ${n} ${X} ${n - 1} ${X} ${n - 2} = ${arr(n, 3)}.`, `Une même équipe est comptée 3! = 6 fois : ${arr(n, 3)} ${DV} 6 = ${val}.`) + res(fmt(val)) }; }
  const f = R.int(4, 7), g = R.int(3, 6), val = comb(f, 2) * g;
  const m = mcq(R, val, [comb(f + g, 3), comb(f, 2) + g, arr(f, 2) * g, f * g], { valid: Number.isInteger });
  return { q: P(`Dans une classe de ${f} filles et ${g} garçons, on forme un comité de 2 filles et 1 garçon. Combien de comités différents peut-on former ?`), ...m, expl: steps(`2 filles parmi ${f} : ${F(`${f} ${X} ${f - 1}`, 2)} = ${comb(f, 2)}.`, `1 garçon parmi ${g} : ${g}.`, `Total : ${comb(f, 2)} ${X} ${g} = ${val}.`) + res(fmt(val)) };
});
gen('dn.venn', { sub: 'calcul', ch: 'proba', name: 'Ensembles et diagrammes de Venn', target: 60 }, (R, d) => {
  const both = R.int(2, 12), onlyA = R.int(3, 20), onlyB = R.int(3, 20), none = R.int(1, 12), N = both + onlyA + onlyB + none, A = onlyA + both, B = onlyB + both;
  if (d === 1) {
    const m = mcq(R, none, [N - A - B > 0 ? N - A - B : none + both + 1, both, none + both, N - A], { valid: (v) => Number.isInteger(v) && v >= 0 });
    return { q: P(`Sur ${N} élèves, ${A} font de l'anglais, ${B} de l'espagnol et ${both} font les deux. Combien ne font ni l'un ni l'autre ?`), ...m, expl: steps(`Au moins une langue : ${A} + ${B} ${MINUS} ${both} = ${A + B - both} (on retire ceux comptés deux fois).`, `Aucune : ${N} ${MINUS} ${A + B - both} = ${none}.`) + res(fmt(none)) };
  }
  if (d === 2) {
    const m = mcq(R, both, [A + B - N, none, both + none, Math.abs(A - B) || both + 2], { valid: (v) => Number.isInteger(v) && v >= 0 });
    return { q: P(`Dans un club de ${N} membres, ${A} pratiquent le tennis, ${B} le golf, et ${none} ne pratiquent aucun des deux. Combien pratiquent les deux ?`), ...m, expl: steps(`Au moins un sport : ${N} ${MINUS} ${none} = ${N - none}.`, `Les deux : ${A} + ${B} ${MINUS} ${N - none} = ${both}.`) + res(fmt(both)) };
  }
  const m = mcq(R, onlyA, [A, both, A - B, onlyA + both + 1], { valid: (v) => Number.isInteger(v) && v >= 0 });
  return { q: P(`Sur ${N} clients, ${A} ont acheté le produit X, ${B} le produit Y, et ${none} n'ont acheté ni X ni Y. Combien de clients ont acheté X <b>mais pas</b> Y ?`), ...m, expl: steps(`Au moins un produit : ${N} ${MINUS} ${none} = ${N - none}.`, `Les deux : ${A} + ${B} ${MINUS} ${N - none} = ${both}.`, `X seulement : ${A} ${MINUS} ${both} = ${onlyA}.`) + res(fmt(onlyA)), tip: '<b>Méthode :</b> dessine les deux cercles et remplis d\'abord l\'intersection.' };
});

/* ---------------- Chapitre 13 : Géométrie ---------------- */
chapter({
  id: 'geo', sub: 'calcul', order: 13, title: 'Géométrie', short: 'Géométrie',
  lesson: `
<h3><span class="hl">1. Aires et périmètres</span></h3>
<div class="tablewrap"><table>
<tr><th>Figure</th><th>Périmètre</th><th>Aire</th></tr>
<tr><td>Rectangle L × l</td><td>2(L + l)</td><td>L × l</td></tr>
<tr><td>Carré de côté a</td><td>4a</td><td>a²</td></tr>
<tr><td>Triangle</td><td>somme des côtés</td><td>${F('base × hauteur', 2)}</td></tr>
<tr><td>Trapèze</td><td>somme des côtés</td><td>${F('(B + b) × h', 2)}</td></tr>
<tr><td>Disque de rayon r</td><td>2πr</td><td>πr²</td></tr>
<tr><td>Losange</td><td>4 × côté</td><td>${F('D × d', 2)}</td></tr>
</table></div>
<h3><span class="hl">2. Pythagore</span></h3>
<div class="formula">Dans un triangle rectangle : hypoténuse² = côté² + côté²</div>
<p><b>Triplets à connaître</b> (et leurs multiples) : 3-4-5 · 5-12-13 · 8-15-17 · 7-24-25. Ex : 6-8-10, 9-12-15, 15-20-25.</p>
<p>Diagonale d'un carré de côté a : <b>a${SQ(2)}</b> (≈ 1,41a). Hauteur d'un triangle équilatéral de côté a : <b>${F(`a${SQ(3)}`, 2)}</b>.</p>
<h3><span class="hl">3. Angles</span></h3>
<ul><li>Somme des angles d'un triangle : <b>180°</b> ; d'un quadrilatère : <b>360°</b>.</li><li>Polygone à n côtés : somme des angles = (n − 2) × 180°. Hexagone régulier : 720° ÷ 6 = 120° par angle.</li><li>Horloge : l'aiguille des heures avance de 30° par heure et de 0,5° par minute ; celle des minutes de 6° par minute.</li></ul>
<h3><span class="hl">4. Volumes</span></h3>
<div class="formula">Cube a³ · Pavé L × l × h · Cylindre πr²h · Cône ${F('πr²h', 3)} · Sphère ${F(4, 3)}πr³ &nbsp;&nbsp;|&nbsp;&nbsp; 1 dm³ = 1 L</div>
<h3><span class="hl">5. Agrandissement / réduction</span></h3>
<p>Si les longueurs sont multipliées par k : les aires sont multipliées par <b>k²</b>, les volumes par <b>k³</b>.</p>
<div class="ex"><b>Exemple</b><span>Côtés d'un carré +20 % → × 1,2. Aire → × 1,2² = × 1,44, soit <b>+44 %</b>.</span></div>
<div class="trap"><b>Piège :</b> doubler le rayon d'un disque ne double pas son aire : il la multiplie par 4.</div>`,
});

gen('geo.aire', { sub: 'calcul', ch: 'geo', name: 'Aires et périmètres', target: 55 }, (R, d) => {
  if (d === 1) {
    if (R.chance(0.5)) { const L = R.int(4, 20), l = R.int(2, L - 1), askA = R.chance(0.5), val = askA ? L * l : 2 * (L + l); const m = mcq(R, val, [askA ? 2 * (L + l) : L * l, L + l, val + L, val - l], { valid: Number.isInteger, render: (v) => unit(v, askA ? 'cm²' : 'cm') }); return { q: P(`Un rectangle mesure ${L} cm sur ${l} cm. Quel est son ${askA ? 'aire' : 'périmètre'} ?`), ...m, expl: steps(askA ? `Aire = L ${X} l = ${L} ${X} ${l} = ${val} cm².` : `Périmètre = 2 ${X} (L + l) = 2 ${X} ${L + l} = ${val} cm.`) + res(askA ? unit(val, 'cm²') : unit(val, 'cm')) }; }
    const b = 2 * R.int(2, 10), h = R.int(3, 15), val = b * h / 2; const m = mcq(R, val, [b * h, b + h, val + h, val / 2], { valid: (v) => v > 0, render: (v) => unit(v, 'cm²') });
    return { q: P(`Un triangle a une base de ${b} cm et une hauteur de ${h} cm. Quelle est son aire ?`), ...m, expl: steps(`Aire = ${F('base × hauteur', 2)} = ${F(`${b} ${X} ${h}`, 2)} = ${val} cm².`) + res(unit(val, 'cm²')), trap: '<b>Piège :</b> oublier de diviser par 2.' };
  }
  if (d === 2) {
    if (R.chance(0.5)) { const B = R.int(8, 20), b = R.int(3, B - 2), h = 2 * R.int(2, 8), val = (B + b) * h / 2; const m = mcq(R, val, [(B + b) * h, B * b * h / 2, val + h, B * h], { valid: Number.isInteger, render: (v) => unit(v, 'cm²') }); return { q: P(`Un trapèze a des bases de ${B} cm et ${b} cm, et une hauteur de ${h} cm. Quelle est son aire ?`), ...m, expl: steps(`Aire = ${F('(B + b) × h', 2)} = ${F(`(${B} + ${b}) ${X} ${h}`, 2)} = ${F((B + b) * h, 2)} = ${val} cm².`) + res(unit(val, 'cm²')) }; }
    const L = R.int(8, 16), l = R.int(6, 12), a = R.int(2, L - 4), b = R.int(2, l - 3), val = L * l - a * b;
    const m = mcq(R, val, [L * l, L * l - a - b, val + a * b / 2, 2 * (L + l)], { valid: Number.isInteger, render: (v) => unit(v, 'm²') });
    return { q: P(`Une pièce a la forme d'un rectangle de ${L} m sur ${l} m auquel on a retiré, dans un coin, un rectangle de ${a} m sur ${b} m. Quelle est son aire ?`), ...m, expl: steps(`Grand rectangle : ${L} ${X} ${l} = ${L * l} m².`, `Partie retirée : ${a} ${X} ${b} = ${a * b} m².`, `Aire : ${L * l} ${MINUS} ${a * b} = ${val} m².`) + res(unit(val, 'm²')) };
  }
  const k = R.int(2, 4), l = R.int(2, 9), L = k * l, Pm = 2 * (L + l), val = L * l;
  const m = mcq(R, val, [Pm * k, (Pm / 4) * (Pm / 4), val + l, val * 2], { valid: Number.isInteger, render: (v) => unit(v, 'cm²') });
  return { q: P(`Un rectangle a un périmètre de ${Pm} cm et sa longueur vaut ${k} fois sa largeur. Quelle est son aire ?`), ...m, expl: steps(`Largeur l, longueur ${k}l : périmètre = 2(${k}l + l) = ${2 * (k + 1)}l = ${Pm}.`, `l = ${Pm} ${DV} ${2 * (k + 1)} = ${l} cm, L = ${L} cm.`, `Aire : ${L} ${X} ${l} = ${val} cm².`) + res(unit(val, 'cm²')) };
});
gen('geo.pyth', { sub: 'calcul', ch: 'geo', name: 'Théorème de Pythagore', target: 55 }, (R, d) => {
  const tr = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [20, 21, 29]]);
  if (d === 1) {
    const [a, b, c] = tr;
    const m = mcq(R, c, [a + b, c + 1, c + 2, b + 2], { valid: Number.isInteger, render: (v) => unit(v, 'cm') });
    return { q: P(`Un triangle rectangle a des côtés de l'angle droit de ${a} cm et ${b} cm. Quelle est la longueur de l'hypoténuse ?`), ...m, expl: steps(`hyp² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`, `hyp = ${SQ(c * c)} = ${c} cm.`) + res(unit(c, 'cm')), trap: `<b>Piège :</b> l'hypoténuse n'est pas ${a} + ${b} = ${a + b}.` };
  }
  if (d === 2) {
    const [a, b, c] = tr, k = R.int(1, 3), A = a * k, B = b * k, C = c * k;
    const ladder = R.chance(0.5);
    const m = mcq(R, B, [C - A, B + 1, A, Math.round(Math.sqrt(C * C + A * A))], { valid: (v) => Number.isInteger(v) && v > 0, render: (v) => unit(v, ladder ? 'm' : 'cm') });
    return { q: P(ladder ? `Une échelle de ${C} m est posée contre un mur vertical. Son pied est à ${A} m du mur. À quelle hauteur touche-t-elle le mur ?` : `Dans un triangle rectangle, l'hypoténuse mesure ${C} cm et un côté de l'angle droit mesure ${A} cm. Combien mesure l'autre côté ?`), ...m, expl: steps(`${C}² = ${A}² + x², donc x² = ${C * C} ${MINUS} ${A * A} = ${B * B}.`, `x = ${SQ(B * B)} = ${B}.`) + res(unit(B, ladder ? 'm' : 'cm')) };
  }
  if (R.chance(0.5)) {
    const a = R.int(2, 12);
    const c = `${a}${SQ(2)}`;
    const m = mcq(R, c, [`${2 * a}`, `${a}${SQ(3)}`, `${2 * a}${SQ(2)}`, `${a + 1}${SQ(2)}`], { sort: 'none', fill: (RR) => `${a + RR.int(2, 6)}${SQ(RR.pick([2, 3]))}` });
    return { q: P(`Quelle est la longueur de la diagonale d'un carré de côté ${a} cm ?`), ...m, expl: steps(`d² = ${a}² + ${a}² = ${2 * a * a}.`, `d = ${SQ(2 * a * a)} = ${SQ(`${a * a} ${X} 2`)} = ${c} cm.`) + res(c + NB + 'cm') };
  }
  const [a, b, c] = R.pick([[6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
  const area = a * b;
  const m = mcq(R, area, [a * c, b * c, area / 2, (a + b) * 2], { valid: Number.isInteger, render: (v) => unit(v, 'cm²') });
  return { q: P(`Un rectangle a une diagonale de ${c} cm et une largeur de ${a} cm. Quelle est son aire ?`), ...m, expl: steps(`Longueur : ${SQ(`${c}² ${MINUS} ${a}²`)} = ${SQ(c * c - a * a)} = ${b} cm.`, `Aire : ${a} ${X} ${b} = ${area} cm².`) + res(unit(area, 'cm²')) };
});
gen('geo.cercle', { sub: 'calcul', ch: 'geo', name: 'Cercles et disques', target: 50 }, (R, d) => {
  const pi = (k) => (k === 1 ? 'π' : fmt(k) + 'π');
  if (d === 1) {
    const r = R.int(2, 12), askA = R.chance(0.5), k = askA ? r * r : 2 * r;
    const m = mcq(R, k, [askA ? 2 * r : r * r, askA ? 2 * r * r : r, k * 2, k + r], { render: (v) => pi(v) + (askA ? ' cm²' : ' cm'), valid: Number.isInteger });
    return { q: P(`Un disque a un rayon de ${r} cm. Quel est ${askA ? 'son aire' : 'le périmètre du cercle'} ?`), ...m, expl: steps(askA ? `Aire = πr² = π ${X} ${r}² = ${pi(k)} cm².` : `Périmètre = 2πr = 2 ${X} π ${X} ${r} = ${pi(k)} cm.`) + res(pi(k) + (askA ? ' cm²' : ' cm')) };
  }
  if (d === 2) {
    if (R.chance(0.5)) { const k = R.pick([2, 3, 4]), val = k * k; const m = mcq(R, val, [k, 2 * k, k * k * k, k + 1], { render: (v) => '× ' + v }); return { q: P(`Si on multiplie par ${k} le rayon d'un disque, par combien son aire est-elle multipliée ?`), ...m, expl: steps(`Aire = πr². Avec un rayon ${k}r : π(${k}r)² = ${k * k}πr².`) + res('× ' + val), trap: `<b>Piège :</b> l'aire n'est pas multipliée par ${k}.` }; }
    const R1 = R.int(4, 10), R2 = R.int(1, R1 - 1), val = R1 * R1 - R2 * R2;
    const m = mcq(R, val, [(R1 - R2) * (R1 - R2), R1 * R1, 2 * (R1 - R2), val + R2], { render: (v) => pi(v) + ' cm²', valid: (v) => v > 0 });
    return { q: P(`Une couronne est comprise entre deux cercles de même centre, de rayons ${R1} cm et ${R2} cm. Quelle est son aire ?`), ...m, expl: steps(`Grand disque : π ${X} ${R1}² = ${pi(R1 * R1)}. Petit disque : π ${X} ${R2}² = ${pi(R2 * R2)}.`, `Couronne : ${pi(R1 * R1)} ${MINUS} ${pi(R2 * R2)} = ${pi(val)} cm².`) + res(pi(val) + ' cm²'), trap: `<b>Piège :</b> π(${R1} ${MINUS} ${R2})² = ${pi((R1 - R2) ** 2)} est faux.` };
  }
  const r = R.int(2, 10);
  if (R.chance(0.5)) { const val = 2 * r * r; const m = mcq(R, val, [r * r, 4 * r * r, val / 2 + r, Math.round(Math.PI * r * r)], { render: (v) => unit(v, 'cm²') }); return { q: P(`Un carré est inscrit dans un cercle de rayon ${r} cm (ses 4 sommets sont sur le cercle). Quelle est l'aire du carré ?`), ...m, expl: steps(`La diagonale du carré est un diamètre : ${2 * r} cm.`, `Aire d'un carré = ${F('diagonale²', 2)} = ${F(`${2 * r}²`, 2)} = ${val} cm².`) + res(unit(val, 'cm²')) }; }
  const a = 2 * r, val = r * r;
  const m = mcq(R, val, [a * a, 2 * r, 4 * r * r / 2, r], { render: (v) => pi(v) + ' cm²' });
  return { q: P(`Un disque est inscrit dans un carré de côté ${a} cm (il touche les 4 côtés). Quelle est l'aire du disque ?`), ...m, expl: steps(`Le diamètre du disque égale le côté du carré : rayon = ${a} ${DV} 2 = ${r} cm.`, `Aire = π ${X} ${r}² = ${pi(val)} cm².`) + res(pi(val) + ' cm²') };
});
gen('geo.vol', { sub: 'calcul', ch: 'geo', name: 'Volumes et contenances', target: 55 }, (R, d) => {
  if (d === 1) {
    const L = R.int(2, 12), l = R.int(2, 10), h = R.int(2, 9), val = L * l * h;
    const m = mcq(R, val, [L + l + h, 2 * (L * l + l * h + L * h), val * 2, L * l], { valid: Number.isInteger, render: (v) => unit(v, 'cm³') });
    return { q: P(`Quel est le volume d'un pavé droit de ${L} cm × ${l} cm × ${h} cm ?`), ...m, expl: steps(`V = L ${X} l ${X} h = ${L} ${X} ${l} ${X} ${h} = ${val} cm³.`) + res(unit(val, 'cm³')) };
  }
  if (d === 2) {
    const r = R.int(1, 6), h = R.int(2, 12), k = r * r * h;
    const m = mcq(R, k, [2 * r * h, r * h, k * 2, r * r + h], { render: (v) => (v === 1 ? 'π' : fmt(v) + 'π') + ' cm³', valid: Number.isInteger });
    return { q: P(`Quel est le volume d'un cylindre de rayon ${r} cm et de hauteur ${h} cm ?`), ...m, expl: steps(`V = πr²h = π ${X} ${r}² ${X} ${h} = ${fmt(k)}π cm³.`) + res(fmt(k) + 'π cm³') };
  }
  if (R.chance(0.5)) {
    const b = R.pick([1, 2, 3, 5]), k = R.int(2, 5), A = b * k, n = k ** 3;
    const m = mcq(R, n, [3 * k, k * k, n * 2, n + k], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Combien de petits cubes de ${b} cm d'arête faut-il pour remplir exactement un grand cube de ${A} cm d'arête ?`), ...m, expl: steps(`Sur chaque arête, on aligne ${A} ${DV} ${b} = ${k} petits cubes.`, `Il en faut ${k} ${X} ${k} ${X} ${k} = ${n}.`) + res(fmt(n)), trap: `<b>Piège :</b> ${k * k} ne remplirait qu'une seule couche.` };
  }
  const L = R.int(2, 8), l = R.int(2, 5), h = R.int(2, 6), V = L * l * h;
  const m = mcq(R, V, [V * 10, V / 10, V * 100, V + 10].map((v) => round(v, 3)), { render: (v) => unit(v, 'L') });
  return { q: P(`Un aquarium mesure ${L} dm de long, ${l} dm de large et ${h * 10} cm de haut. Combien de litres contient-il quand il est plein ?`), ...m, expl: steps(`On met tout dans la même unité : ${h * 10} cm = ${h} dm.`, `Volume : ${L} ${X} ${l} ${X} ${h} = ${V} dm³.`, `1 dm³ = 1 L, donc ${unit(V, 'L')}.`) + res(unit(V, 'L')), trap: `<b>Piège :</b> multiplier ${L} ${X} ${l} ${X} ${h * 10} sans convertir donne 10 fois trop.` };
});
gen('geo.angle', { sub: 'calcul', ch: 'geo', name: 'Angles', target: 50 }, (R, d) => {
  if (d === 1) {
    const a = R.int(20, 100), b = R.int(20, 160 - a), val = 180 - a - b;
    const m = mcq(R, val, [360 - a - b, 90 - Math.min(a, b) > 0 ? 90 - Math.min(a, b) : val + 15, val + 10, val - 10], { render: (v) => v + '°', valid: (v) => v > 0 });
    return { q: P(`Dans un triangle, deux angles mesurent ${a}° et ${b}°. Combien mesure le troisième ?`), ...m, expl: steps(`La somme des angles d'un triangle vaut 180°.`, `180 ${MINUS} ${a} ${MINUS} ${b} = ${val}°.`) + res(val + '°') };
  }
  if (d === 2) {
    if (R.chance(0.5)) { const top = 2 * R.int(10, 70), val = (180 - top) / 2; const m = mcq(R, val, [top, 180 - top, val + 10, 90 - top / 2 + 10], { render: (v) => v + '°', valid: (v) => v > 0 }); return { q: P(`Un triangle isocèle a un angle au sommet (entre les deux côtés égaux) de ${top}°. Combien mesure chacun des deux autres angles ?`), ...m, expl: steps(`Les deux angles à la base sont égaux.`, `(180 ${MINUS} ${top}) ${DV} 2 = ${val}°.`) + res(val + '°') }; }
    const n = R.pick([5, 6, 8, 10, 12]), val = (n - 2) * 180 / n;
    const m = mcq(R, val, [360 / n, 180 - 360 / n === val ? val + 12 : 180 - 360 / n, (n - 2) * 180, val + 15], { render: (v) => fmt(v) + '°' });
    return { q: P(`Combien mesure chaque angle intérieur d'un polygone régulier à ${n} côtés ?`), ...m, expl: steps(`Somme des angles : (${n} ${MINUS} 2) ${X} 180 = ${(n - 2) * 180}°.`, `Chaque angle : ${(n - 2) * 180} ${DV} ${n} = ${fmt(val)}°.`) + res(fmt(val) + '°') };
  }
  const h = R.int(1, 11), mm = R.pick([0, 10, 15, 20, 30, 40, 45, 50]);
  const ah = (h % 12) * 30 + mm * 0.5, am = mm * 6;
  let val = Math.abs(ah - am); if (val > 180) val = 360 - val;
  const naive = Math.abs((h % 12) * 30 - am) > 180 ? 360 - Math.abs((h % 12) * 30 - am) : Math.abs((h % 12) * 30 - am);
  const m = mcq(R, val, [naive, val + 15, val + 30, Math.abs(val - 30)], { render: (v) => fmt(v) + '°', valid: (v) => v >= 0 && v <= 180 });
  return { q: P(`Quel est le plus petit angle formé par les aiguilles d'une horloge à ${h} h ${String(mm).padStart(2, '0')} ?`), ...m, expl: steps(`Aiguille des minutes : ${mm} ${X} 6 = ${am}° (depuis midi).`, `Aiguille des heures : ${h % 12} ${X} 30 + ${mm} ${X} 0,5 = ${fmt(ah)}°.`, `Écart : ${fmt(Math.abs(ah - am))}°${Math.abs(ah - am) > 180 ? `, donc le plus petit angle vaut 360 ${MINUS} ${fmt(Math.abs(ah - am))} = ${fmt(val)}°` : ''}.`) + res(fmt(val) + '°'), trap: '<b>Piège :</b> l\'aiguille des heures avance aussi pendant les minutes (0,5° par minute).' };
});
gen('geo.agr', { sub: 'calcul', ch: 'geo', name: 'Agrandissement et réduction', target: 55 }, (R, d) => {
  if (d === 1) {
    const k = R.pick([2, 3, 4]), vol = R.chance(0.5), val = vol ? k ** 3 : k ** 2;
    const m = mcq(R, val, [k, vol ? k * k : k ** 3, 2 * k, val * 2], { render: (v) => '× ' + v });
    return { q: P(`On multiplie toutes les longueurs d'un ${vol ? 'cube' : 'carré'} par ${k}. Par combien ${vol ? 'son volume' : 'son aire'} est-${vol ? 'il' : 'elle'} multiplié${vol ? '' : 'e'} ?`), ...m, expl: steps(`Longueurs × ${k} → aires × ${k}² = ${k * k} → volumes × ${k}³ = ${k ** 3}.`) + res('× ' + val) };
  }
  const t = R.pick(d === 2 ? [10, 20, 50, -10, -20, 30] : [10, 20, 50, -10, -20, -50, 100]), vol = d === 3 && R.chance(0.5);
  const kk = 1 + t / 100, val = round(((vol ? kk ** 3 : kk ** 2) - 1) * 100, 2);
  const m = mcq(R, val, [vol ? 3 * t : 2 * t, t, round(val + 4, 2), round((kk ** (vol ? 2 : 3) - 1) * 100, 2)], { render: sgnPc, positive: false });
  return { q: P(`Toutes les longueurs d'un ${vol ? 'cube' : 'carré'} ${t > 0 ? 'augmentent' : 'diminuent'} de ${pc(Math.abs(t))}. De quel pourcentage ${vol ? 'son volume' : 'son aire'} varie-t-${vol ? 'il' : 'elle'} ?`), ...m, expl: steps(`Longueurs × ${fmt(kk)}.`, `${vol ? 'Volume' : 'Aire'} × ${fmt(kk)}${vol ? '³' : '²'} = × ${fmt(round(vol ? kk ** 3 : kk ** 2, 4))}.`, `Soit ${sgnPc(val)}.`) + res(sgnPc(val)), trap: `<b>Piège :</b> répondre ${sgnPc(vol ? 3 * t : 2 * t)}.` };
});

/* ---------------- Chapitre 14 : Suites & intérêts ---------------- */
chapter({
  id: 'suite', sub: 'calcul', order: 14, title: 'Suites & intérêts', short: 'Suites',
  lesson: `
<h3><span class="hl">1. Suite arithmétique : on ajoute toujours le même nombre</span></h3>
<p>5, 8, 11, 14… (raison r = 3). Le n-ième terme : <b>u<sub>n</sub> = u<sub>1</sub> + (n − 1) × r</b>. Le 20e terme : 5 + 19 × 3 = 62.</p>
<p><b>Nombre de termes</b> entre a et b (pas r) : ${F('b − a', 'r')} + 1. De 7 à 97 de 5 en 5 : ${F(90, 5)} + 1 = 19 termes.</p>
<div class="formula">Somme = nombre de termes × ${F('premier + dernier', 2)}</div>
<p>1 + 2 + … + 100 = 100 × ${F(101, 2)} = <b>5 050</b>. Pairs de 2 à 50 : 25 termes × ${F(52, 2)} = 650.</p>
<h3><span class="hl">2. Suite géométrique : on multiplie toujours par le même nombre</span></h3>
<p>3, 6, 12, 24… (raison q = 2). <b>u<sub>n</sub> = u<sub>1</sub> × q<sup>n−1</sup></b>.</p>
<div class="ex"><b>Doublement</b><span>Des bactéries doublent toutes les 20 min. En 3 h (9 périodes) : × 2⁹ = × 512.</span></div>
<div class="trap"><b>Piège du nénuphar :</b> un nénuphar double chaque jour et couvre le lac en 30 jours. Il en couvrait la moitié… le 29e jour (pas le 15e).</div>
<h3><span class="hl">3. Intérêts simples et composés</span></h3>
<ul><li><b>Simples</b> : on gagne chaque année t % du capital <b>initial</b>. 1 000 € à 5 % pendant 3 ans → 1 000 + 3 × 50 = 1 150 €.</li><li><b>Composés</b> : les intérêts produisent eux-mêmes des intérêts → × (1 + t)<sup>n</sup>. 1 000 € à 5 % pendant 2 ans → 1 000 × 1,05² = 1 102,50 €.</li></ul>`,
});

gen('su.arith', { sub: 'calcul', ch: 'suite', name: 'Suites arithmétiques et sommes', target: 55 }, (R, d) => {
  if (d === 1) { const u1 = R.int(-5, 20), r = R.int(2, 9), n = R.int(10, 40), val = u1 + (n - 1) * r; const m = mcq(R, val, [u1 + n * r, n * r, val + r, val - 2 * r], { positive: false, valid: Number.isInteger }); return { q: P(`Une suite commence par ${u1}, ${u1 + r}, ${u1 + 2 * r}, ${u1 + 3 * r}… Quel est son ${n}e terme ?`), ...m, expl: steps(`Raison : +${r}. Du 1er au ${n}e terme, on ajoute ${n - 1} fois ${r}.`, `${u1} + ${n - 1} ${X} ${r} = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ajouter ${n} fois la raison au lieu de ${n - 1}.` }; }
  if (d === 2) { const r = R.pick([3, 4, 5, 6, 7]), a = R.int(2, 20), n = R.int(10, 30), b = a + (n - 1) * r; const m = mcq(R, n, [n - 1, n + 1, Math.round((b - a) / r * 1.1), Math.round(b / r)], { valid: (v) => Number.isInteger(v) && v > 0 }); return { q: P(`Combien y a-t-il de nombres dans la liste ${a}, ${a + r}, ${a + 2 * r}, …, ${b} ?`), ...m, expl: steps(`Nombre de termes = ${F('dernier − premier', 'raison')} + 1.`, `${F(`${b} ${MINUS} ${a}`, r)} + 1 = ${(b - a) / r} + 1 = ${n}.`) + res(fmt(n)), trap: '<b>Piège des piquets :</b> ne pas oublier le +1.' }; }
  const t = R.int(0, 1);
  if (t === 0) { const n = R.pick([20, 30, 40, 50, 60, 80, 100]), val = n * (n + 1) / 2; const m = mcq(R, val, [n * n / 2, n * (n - 1) / 2, val + n, n * (n + 1)], { valid: Number.isInteger }); return { q: P(`Combien vaut la somme ${big(`1 + 2 + 3 + … + ${n}`)} ?`), ...m, expl: steps(`Somme = nombre de termes ${X} ${F('premier + dernier', 2)}.`, `${n} ${X} ${F(`1 + ${n}`, 2)} = ${n} ${X} ${fmt((n + 1) / 2)} = ${fmt(val)}.`) + res(fmt(val)) }; }
  const n = R.pick([25, 30, 40, 50]), val = n * (n + 1);
  const m = mcq(R, val, [n * n, 2 * n * (2 * n + 1) / 2, val / 2, val + 2 * n], { valid: Number.isInteger });
  return { q: P(`Combien vaut la somme des nombres pairs de 2 à ${2 * n} ?`), ...m, expl: steps(`Il y a ${n} nombres pairs de 2 à ${2 * n}.`, `Somme : ${n} ${X} ${F(`2 + ${2 * n}`, 2)} = ${n} ${X} ${n + 1} = ${fmt(val)}.`) + res(fmt(val)) };
});
gen('su.geom', { sub: 'calcul', ch: 'suite', name: 'Doublements et suites géométriques', target: 55 }, (R, d) => {
  if (d === 1) { const per = R.pick([10, 15, 20, 30]), H = R.pick([1, 2, 3]), k = H * 60 / per, val = Math.pow(2, k); const m = mcq(R, val, [2 * k, k * k, val / 2, val * 2], { render: (v) => '× ' + fmt(v), valid: Number.isInteger }); return { q: P(`Une population de bactéries double toutes les ${per} minutes. Par combien est-elle multipliée en ${plural(H, 'heure')} ?`), ...m, expl: steps(`${plural(H, 'heure')} = ${H * 60} min = ${k} périodes de ${per} min.`, `× 2 à chaque période : 2<sup>${k}</sup> = ${fmt(val)}.`) + res('× ' + fmt(val)), trap: `<b>Piège :</b> × ${2 * k} serait un doublement « additif ».` }; }
  if (d === 2) { const u1 = R.int(1, 5), q = R.pick([2, 3]), n = R.int(4, 7), val = u1 * Math.pow(q, n - 1); const m = mcq(R, val, [u1 * Math.pow(q, n), u1 + (n - 1) * q, val / q + 1, u1 * q * n], { valid: Number.isInteger }); return { q: P(`Une suite commence par ${u1}, ${u1 * q}, ${u1 * q * q}… (on multiplie à chaque fois par ${q}). Quel est son ${n}e terme ?`), ...m, expl: steps(`u<sub>n</sub> = u<sub>1</sub> ${X} q<sup>n−1</sup> = ${u1} ${X} ${q}<sup>${n - 1}</sup> = ${u1} ${X} ${Math.pow(q, n - 1)} = ${val}.`) + res(fmt(val)) }; }
  if (R.chance(0.5)) { const D = R.pick([20, 24, 30, 40, 48, 60]), frac = R.pick([[2, 1, 'la moitié'], [4, 2, 'le quart']]); const val = D - frac[1]; const m = mcq(R, val, [D / frac[0], D / 2, D - 2 * frac[1], D - frac[1] - 1, D / 4 * 3], { render: (v) => 'le ' + v + 'e jour', valid: (v) => Number.isInteger(v) && v > 0 && v < D }); return { q: P(`Un nénuphar double de surface chaque jour. Il recouvre entièrement un étang le ${D}e jour. Quel jour en recouvrait-il ${frac[2]} ?`), ...m, expl: steps(`Il double chaque jour : la veille d'être complet, il couvrait la moitié.`, frac[1] === 1 ? `Moitié → jour ${D} ${MINUS} 1 = ${val}.` : `Quart → deux jours avant : jour ${D} ${MINUS} 2 = ${val}.`) + res('le ' + val + 'e jour'), trap: `<b>Piège :</b> répondre le ${D / frac[0]}e jour (raisonnement proportionnel).` }; }
  const t = R.pick([10, 20, 50]), n = R.pick([2, 3]), val = round((Math.pow(1 + t / 100, n) - 1) * 100, 2);
  const m = mcq(R, val, [t * n, round(val - 1, 2), round(val + 5, 2), round(t * (n + 1), 2)], { render: sgnPc });
  return { q: P(`Une population augmente de ${pc(t)} par an pendant ${n} ans. De quel pourcentage a-t-elle augmenté au total ?`), ...m, expl: steps(`CM sur ${n} ans : ${fmt(1 + t / 100)}<sup>${n}</sup> = ${fmt(round(Math.pow(1 + t / 100, n), 4))}.`, `Hausse : ${sgnPc(val)}.`) + res(sgnPc(val)), trap: `<b>Piège :</b> ${sgnPc(t * n)} oublie que les hausses se cumulent.` };
});
gen('su.int', { sub: 'calcul', ch: 'suite', name: 'Intérêts simples et composés', target: 60 }, (R, d) => {
  const C = R.pick([1000, 2000, 5000, 10000, 500]), t = R.pick([2, 4, 5, 10]), n = d === 1 ? R.int(2, 5) : d === 2 ? 2 : 3;
  const simple = d === 1;
  const val = simple ? C * (1 + t * n / 100) : round(C * Math.pow(1 + t / 100, n), 2);
  const m = mcq(R, val, [simple ? round(C * Math.pow(1 + t / 100, n), 2) : C * (1 + t * n / 100), C * t * n / 100, round(val + C * t / 100, 2), C + t * n].map((v) => round(v, 2)), { render: eur2 });
  return { q: P(`On place ${eur(C)} à ${pc(t)} par an, à intérêts <b>${simple ? 'simples' : 'composés'}</b>. De quelle somme dispose-t-on au bout de ${n} ans ?`), ...m, expl: simple ? steps(`Intérêts simples : chaque année, ${pc(t)} de ${fmt(C)} = ${fmt(C * t / 100)} €.`, `Sur ${n} ans : ${n} ${X} ${fmt(C * t / 100)} = ${fmt(C * t * n / 100)} €.`, `Total : ${eur2(val)}.`) + res(eur2(val)) : steps(`Intérêts composés : × ${fmt(1 + t / 100)} chaque année.`, `${fmt(C)} ${X} ${fmt(1 + t / 100)}<sup>${n}</sup> = ${fmt(C)} ${X} ${fmt(round(Math.pow(1 + t / 100, n), 6))} = ${eur2(val)}.`) + res(eur2(val)) };
});

/* ---- 33-commerce.js ---- */
/* ===== CALCUL : mathématiques commerciales (marge, CA, seuil de rentabilité) ===== */
chapter({
  id: 'com', sub: 'calcul', order: 4.5, title: 'Mathématiques commerciales', short: 'Maths commerciales',
  lesson: `
<p>Tu as vu ces notions en STMG : au Tage Mage, elles reviennent sous forme de problèmes de pourcentages. C'est un chapitre où ton bac est un vrai avantage.</p>
<h3><span class="hl">1. Le vocabulaire</span></h3>
<div class="tablewrap"><table>
<tr><th>Notion</th><th>Calcul</th></tr>
<tr><td>Marge</td><td>prix de vente HT − prix d'achat</td></tr>
<tr><td>Taux de marge</td><td>marge ÷ prix d'<b>achat</b></td></tr>
<tr><td>Taux de marque</td><td>marge ÷ prix de <b>vente</b></td></tr>
<tr><td>Coefficient multiplicateur</td><td>prix de vente ÷ prix d'achat</td></tr>
</table></div>
<div class="ex"><b>Exemple</b><span>Prix d'achat 80 €, prix de vente 100 € : marge = 20 €.</span><span>Taux de marge = 20 ÷ 80 = <b>25 %</b>. Taux de marque = 20 ÷ 100 = <b>20 %</b>.</span></div>
<div class="trap"><b>Piège n°1 :</b> le taux de marge se calcule sur le prix d'ACHAT, le taux de marque sur le prix de VENTE. Ils ne sont jamais égaux.</div>
<div class="formula">PV = PA × (1 + taux de marge)<br>PA = PV × (1 − taux de marque)<br>taux de marque = ${F('taux de marge', '1 + taux de marge')}</div>
<p>Exemple de conversion : un taux de marge de 25 % donne un taux de marque de 0,25 ÷ 1,25 = 20 %.</p>
<h3><span class="hl">2. Le chiffre d'affaires</span></h3>
<div class="formula">CA = prix × quantité</div>
<p>Si le prix augmente de 10 % et que la quantité vendue baisse de 10 %, le CA est multiplié par 1,1 × 0,9 = 0,99 : il <b>baisse</b> de 1 %.</p>
<div class="trap"><b>Piège n°2 :</b> +10 % et −10 % ne se compensent pas. On multiplie les coefficients, comme pour les évolutions successives.</div>
<h3><span class="hl">3. Coûts, bénéfice et seuil de rentabilité</span></h3>
<div class="formula">coûts totaux = coûts fixes + coût variable unitaire × quantité<br>bénéfice = CA − coûts totaux<br>seuil de rentabilité (en unités) = ${F('coûts fixes', 'prix de vente − coût variable unitaire')}</div>
<div class="ex"><b>Exemple</b><span>Coûts fixes 12 000 €, prix de vente 50 €, coût variable 30 € par unité.</span><span>Chaque unité rapporte 50 − 30 = 20 € de marge. Il faut vendre 12 000 ÷ 20 = <b>600 unités</b> pour couvrir les coûts fixes.</span></div>`,
});

gen('com.marge', { sub: 'calcul', ch: 'com', name: 'Marge, taux de marge et taux de marque', target: 60 }, (R, d) => {
  if (d === 1) {
    const t = R.pick([10, 20, 25, 40, 50]), PA = R.int(2, 30) * 20, PV = round(PA * (1 + t / 100), 2);
    const m = mcq(R, PV, [round(PA + t, 2), round(PA / (1 - t / 100), 2), round(PA * t / 100, 2), round(PV + PA * 0.05, 2)], { render: eur2 });
    return { q: P(`Un commerçant achète un article ${eur(PA)} et applique un taux de marge de ${pc(t)}. À quel prix le revend-il (hors taxes) ?`), ...m, expl: steps(`Le taux de marge porte sur le prix d'achat : marge = ${pc(t)} de ${fmt(PA)} = ${eur2(PA * t / 100)}.`, `Prix de vente = ${fmt(PA)} ${X} ${fmt(1 + t / 100)} = ${eur2(PV)}.`) + res(eur2(PV)) };
  }
  if (d === 2) {
    const [PA, PV] = R.pick([[80, 100], [60, 75], [120, 150], [40, 50], [200, 250], [75, 100], [150, 200], [50, 75]]);
    const askMarge = R.chance(0.5);
    const tm = round((PV - PA) / PA * 100, 2), tq = round((PV - PA) / PV * 100, 2);
    const val = askMarge ? tm : tq;
    const m = mcq(R, val, [askMarge ? tq : tm, PV - PA, round(PA / PV * 100, 2), round(val + 5, 2)], { render: pc });
    return { q: P(`Un article acheté ${eur(PA)} est revendu ${eur(PV)} hors taxes. Quel est le <b>taux de ${askMarge ? 'marge' : 'marque'}</b> ?`), ...m, expl: steps(`Marge = ${PV} ${MINUS} ${PA} = ${PV - PA} €.`, askMarge ? `Taux de marge = marge ${DV} prix d'ACHAT = ${PV - PA} ${DV} ${PA} = ${fmt(tm / 100)}, soit ${pc(tm)}.` : `Taux de marque = marge ${DV} prix de VENTE = ${PV - PA} ${DV} ${PV} = ${fmt(tq / 100)}, soit ${pc(tq)}.`) + res(pc(val)), trap: `<b>Piège :</b> le taux de ${askMarge ? 'marque' : 'marge'} vaut ${pc(askMarge ? tq : tm)}, ce n'est pas ce qu'on demande.` };
  }
  if (R.chance(0.5)) {
    const [tm, tq] = R.pick([[25, 20], [50, 100 / 3], [100, 50], [20, 100 / 6], [60, 37.5], [150, 60], [300, 75]]);
    const fromMarge = R.chance(0.5);
    const val = round(fromMarge ? tq : tm, 1), giv = fromMarge ? tm : tq;
    const approx = !Number.isInteger(round(val * 10, 6) / 10) || !Number.isInteger(val);
    const rend = (v) => (approx && !Number.isInteger(v) ? '≈ ' : '') + pc(round(v, 1));
    const m = mcq(R, val, [giv, round(fromMarge ? giv * 0.9 : giv * 1.1, 1), round(100 - giv, 1), round(val + 5, 1)], { render: rend });
    return { q: P(`Un produit est vendu avec un taux de ${fromMarge ? 'marge' : 'marque'} de ${pc(round(giv, 2))}. Quel est son taux de ${fromMarge ? 'marque' : 'marge'} ?`), ...m, expl: steps(`Prenons un prix ${fromMarge ? 'd\'achat de 100 €' : 'de vente de 100 €'}.`, fromMarge ? `Marge = ${fmt(giv)} €, donc prix de vente = ${fmt(100 + giv)} €.` : `Marge = ${fmt(round(giv, 2))} €, donc prix d'achat = ${fmt(round(100 - giv, 2))} €.`, fromMarge ? `Taux de marque = ${fmt(giv)} ${DV} ${fmt(100 + giv)} ≈ ${pc(round(val, 1))}.` : `Taux de marge = ${fmt(round(giv, 2))} ${DV} ${fmt(round(100 - giv, 2))} = ${pc(round(val, 1))}.`) + res(rend(val)), tip: '<b>Méthode :</b> raisonne sur un prix de 100 €, tout devient concret.' };
  }
  const tq = R.pick([20, 25, 40, 50]), PV = R.int(2, 25) * 20, PA = round(PV * (1 - tq / 100), 2);
  const m = mcq(R, PA, [round(PV / (1 + tq / 100), 2), round(PV - tq, 2), round(PV * tq / 100, 2), round(PA + 10, 2)], { render: eur2 });
  return { q: P(`Un article est vendu ${eur(PV)} hors taxes avec un taux de marque de ${pc(tq)}. Quel était son prix d'achat ?`), ...m, expl: steps(`Le taux de marque porte sur le prix de vente : marge = ${pc(tq)} de ${fmt(PV)} = ${eur2(PV * tq / 100)}.`, `Prix d'achat = ${fmt(PV)} ${MINUS} ${fmt(PV * tq / 100)} = ${eur2(PA)}.`) + res(eur2(PA)), trap: `<b>Piège :</b> diviser ${fmt(PV)} par ${fmt(1 + tq / 100)} reviendrait à traiter ${pc(tq)} comme un taux de marge.` };
});
gen('com.ca', { sub: 'calcul', ch: 'com', name: 'Chiffre d\'affaires', target: 55 }, (R, d) => {
  if (d === 1) {
    const p = R.pick([12, 15, 20, 25, 8, 40]), q = R.int(3, 40) * 10, ca = p * q;
    const m = mcq(R, ca, [p + q, ca / 10, ca * 10, ca + p * 10], { render: eur });
    return { q: P(`Une boutique vend ${fmt(q)} articles à ${eur(p)} l'unité. Quel est son chiffre d'affaires ?`), ...m, expl: steps(`CA = prix ${X} quantité = ${p} ${X} ${fmt(q)} = ${eur(ca)}.`) + res(eur(ca)) };
  }
  if (d === 2) {
    const [a, b] = R.pick([[10, -10], [20, -10], [-20, 25], [10, 10], [25, -20], [-10, 20], [30, -20], [50, -40]]);
    const tot = round(((1 + a / 100) * (1 + b / 100) - 1) * 100, 2);
    const m = mcq(R, tot, [a + b, round(tot + 2, 2), -tot, round((a + b) / 2, 2)], { render: sgnPc, positive: false });
    return { q: P(`Le prix d'un produit évolue de ${sgnPc(a)} et la quantité vendue de ${sgnPc(b)}. De combien varie le chiffre d'affaires ?`), ...m, expl: steps(`CA = prix ${X} quantité : on multiplie les coefficients.`, `${fmt(1 + a / 100)} ${X} ${fmt(1 + b / 100)} = ${fmt(round((1 + a / 100) * (1 + b / 100), 4))}.`, `Soit ${sgnPc(tot)}.`) + res(sgnPc(tot)), trap: `<b>Piège :</b> additionner (${sgnPc(a + b)}).` };
  }
  const [a, need] = R.pick([[25, -20], [-20, 25], [50, -33.33], [100, -50], [-50, 100], [60, -37.5], [-25, 33.33]]);
  const val = round(need, 2), approx = !Number.isInteger(val);
  const rend = (v) => (approx ? '≈ ' : '') + sgnPc(round(v, 1));
  const m = mcq(R, round(val, 1), [-a, round(-a * 0.8, 1), round(val + (val > 0 ? 10 : -10), 1), round(val / 2, 1)], { render: rend, positive: false });
  return { q: P(`Une entreprise augmente ou baisse son prix de ${sgnPc(a)}. De combien doit varier la quantité vendue pour que le chiffre d'affaires reste identique ?`), ...m, expl: steps(`Il faut ${fmt(1 + a / 100)} ${X} CM(quantité) = 1.`, `CM(quantité) = 1 ${DV} ${fmt(1 + a / 100)} = ${fmt(round(1 / (1 + a / 100), 4))}.`, `Soit ${rend(val)}.`) + res(rend(val)), trap: `<b>Piège :</b> répondre ${sgnPc(-a)} (c'est l'évolution réciproque qu'il faut).` };
});
gen('com.seuil', { sub: 'calcul', ch: 'com', name: 'Seuil de rentabilité', target: 65 }, (R, d) => {
  const mu = R.pick([5, 8, 10, 12, 15, 20, 25, 40]), units = R.int(2, 30) * (d === 1 ? 50 : 20), CF = mu * units;
  const cv = R.pick([10, 15, 20, 30, 35, 45]), pv = cv + mu;
  if (d === 1) {
    const m = mcq(R, units, [CF / pv, CF / cv, units * 2, units + mu], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Une entreprise a ${eur(CF)} de coûts fixes. Chaque produit vendu lui rapporte une marge de ${eur(mu)}. Combien de produits doit-elle vendre pour couvrir ses coûts fixes ?`), ...m, expl: steps(`Seuil = coûts fixes ${DV} marge unitaire = ${fmt(CF)} ${DV} ${mu} = ${fmt(units)}.`) + res(fmt(units) + ' produits') };
  }
  if (d === 2) {
    const m = mcq(R, units, [Math.round(CF / pv), Math.round(CF / cv), units * 2, Math.round(units * 1.5)], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Coûts fixes : ${eur(CF)}. Prix de vente : ${eur(pv)} par unité. Coût variable : ${eur(cv)} par unité. Quel est le seuil de rentabilité, en nombre d'unités ?`), ...m, expl: steps(`Marge par unité : ${pv} ${MINUS} ${cv} = ${mu} €.`, `Seuil = ${fmt(CF)} ${DV} ${mu} = ${fmt(units)} unités.`) + res(fmt(units) + ' unités'), trap: `<b>Piège :</b> diviser par le prix de vente (${pv} €) oublie le coût variable.` };
  }
  const B = mu * R.int(2, 20) * 10, q = (CF + B) / mu;
  const m = mcq(R, q, [units, CF / mu + B / pv, q + units, Math.round(B / mu)], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Coûts fixes : ${eur(CF)}. Prix de vente : ${eur(pv)} par unité. Coût variable : ${eur(cv)} par unité. Combien d'unités faut-il vendre pour réaliser un bénéfice de ${eur(B)} ?`), ...m, expl: steps(`Marge par unité : ${pv} ${MINUS} ${cv} = ${mu} €.`, `Il faut couvrir les coûts fixes ET dégager le bénéfice : ${fmt(CF)} + ${fmt(B)} = ${fmt(CF + B)} €.`, `${fmt(CF + B)} ${DV} ${mu} = ${fmt(q)} unités.`) + res(fmt(q) + ' unités') };
});
gen('com.benef', { sub: 'calcul', ch: 'com', name: 'Coûts et bénéfice', target: 60 }, (R, d) => {
  const q = R.int(5, 40) * 10, cv = R.pick([6, 8, 12, 15, 18, 25]), pv = cv + R.pick([4, 5, 7, 10, 12]), CF = R.int(5, 40) * 100;
  const ben = q * (pv - cv) - CF;
  if (d === 1) {
    const ca = q * pv, ct = CF + q * cv;
    const m = mcq(R, ben, [ca - CF, ca - q * cv, ct - ca, ben + CF / 2], { positive: false, render: eur });
    return { q: P(`Une entreprise vend ${fmt(q)} unités à ${eur(pv)}. Ses coûts fixes sont de ${eur(CF)} et chaque unité lui coûte ${eur(cv)} à produire. Quel est son bénéfice ?`), ...m, expl: steps(`CA = ${fmt(q)} ${X} ${pv} = ${eur(ca)}.`, `Coûts totaux = ${fmt(CF)} + ${fmt(q)} ${X} ${cv} = ${eur(ct)}.`, `Bénéfice = ${fmt(ca)} ${MINUS} ${fmt(ct)} = ${eur(ben)}.`) + res(eur(ben)) };
  }
  const target = R.int(2, 20) * 100, needPV = round(cv + (CF + target) / q, 2);
  const m = mcq(R, needPV, [round((CF + target) / q, 2), round(cv + CF / q, 2), round(needPV + 1, 2), round(cv + target / q, 2)], { render: eur2 });
  return { q: P(`Une entreprise prévoit de vendre ${fmt(q)} unités. Coûts fixes : ${eur(CF)} ; coût variable : ${eur(cv)} par unité. À quel prix doit-elle vendre pour faire un bénéfice de ${eur(target)} ?`), ...m, expl: steps(`Il faut couvrir ${fmt(CF)} + ${fmt(target)} = ${fmt(CF + target)} € en plus des coûts variables.`, `Par unité : ${fmt(CF + target)} ${DV} ${fmt(q)} = ${eur2((CF + target) / q)}.`, `Prix = ${cv} + ${fmt(round((CF + target) / q, 2))} = ${eur2(needPV)}.`) + res(eur2(needPV)) };
});

/* ---- 35-drills.js ---- */
/* ===== Calcul mental : séries chronométrées à réponse tapée ===== */
function drill(id, meta, make) { TM.drills[id] = Object.assign({ id, sub: 'calcul', kb: 'num', make }, meta); }
const cn = (x) => String(round(x, 6)).replace('.', ',');
function normAns(s) {
  let t = String(s || '').trim().replace(/\s/g, '').replace(/\./g, ',').replace(/−/g, '-').replace(/^\+/, '').toUpperCase();
  if (/^-?,/.test(t)) t = t.replace(',', '0,');
  if (t.includes(',')) t = t.replace(/0+$/, '').replace(/,$/, '');
  if (/^-?0\d/.test(t)) t = t.replace(/^(-?)0+(\d)/, '$1$2');
  return t;
}

drill('dr.add', { name: 'Additions', desc: 'Poser de tête, de gauche à droite' }, (R, l) => {
  const a = l === 1 ? R.int(12, 89) : l === 2 ? R.int(23, 99) : R.int(123, 899), b = l === 1 ? R.int(3, 19) : l === 2 ? R.int(17, 89) : R.int(108, 799);
  return { p: `${a} + ${b}`, a: cn(a + b) };
});
drill('dr.sub', { name: 'Soustractions', desc: 'Compléter jusqu\'au nombre rond' }, (R, l) => {
  if (l === 3 && R.chance(0.4)) { const b = R.int(101, 899); return { p: `1${NB}000 ${MINUS} ${b}`, a: cn(1000 - b) }; }
  const a = l === 1 ? R.int(21, 99) : l === 2 ? R.int(51, 199) : R.int(301, 999), b = l === 1 ? R.int(3, 9) + (R.chance(0.5) ? 10 : 0) : l === 2 ? R.int(18, a - 10) : R.int(108, a - 50);
  return { p: `${a} ${MINUS} ${b}`, a: cn(a - b) };
});
drill('dr.tables', { name: 'Tables de multiplication', desc: 'Jusqu\'à 12, puis au-delà' }, (R, l) => {
  const a = l === 3 ? R.int(11, 19) : R.int(2, l === 1 ? 9 : 12), b = R.int(2, l === 1 ? 9 : 12);
  if (l >= 2 && R.chance(0.35)) return { p: `${a * b} = ${a} ${X} ?`, a: cn(b) };
  return { p: `${a} ${X} ${b}`, a: cn(a * b) };
});
drill('dr.mul', { name: 'Multiplications', desc: 'Décomposer : 23 × 14 = 230 + 92' }, (R, l) => {
  if (l === 1) { const a = R.int(12, 99), b = R.int(2, 9); return { p: `${a} ${X} ${b}`, a: cn(a * b) }; }
  if (l === 2) { const a = R.int(11, 49), b = R.pick([11, 12, 15, 20, 21, 25, 30]); return { p: `${a} ${X} ${b}`, a: cn(a * b) }; }
  const a = R.int(13, 79), b = R.int(13, 49); return { p: `${a} ${X} ${b}`, a: cn(a * b) };
});
drill('dr.div', { name: 'Divisions exactes', desc: 'Retrouver le facteur manquant' }, (R, l) => {
  const b = l === 3 ? R.int(11, 25) : R.int(2, 9), q = l === 1 ? R.int(2, 12) : R.int(12, l === 2 ? 99 : 40);
  return { p: `${fmt(b * q)} ${DV} ${b}`, a: cn(q) };
});
drill('dr.sq', { name: 'Carrés et racines', desc: 'Connaître 1² à 25² par cœur' }, (R, l) => {
  if (l === 3) { const t = R.int(0, 2); if (t === 0) { const n = R.int(11, 30); return { p: SQ(fmt(n * n)), a: cn(n) }; } if (t === 1) { const n = R.int(2, 10); return { p: PW(n, 3), a: cn(n ** 3) }; } const n = R.int(16, 30); return { p: PW(n, 2), a: cn(n * n) }; }
  const n = l === 1 ? R.int(2, 15) : R.int(11, 25);
  return { p: PW(n, 2), a: cn(n * n) };
});
drill('dr.pct', { name: 'Pourcentages de tête', desc: '10 %, 5 %, 25 %…' }, (R, l) => {
  const t = R.pick(l === 1 ? [10, 20, 25, 50] : l === 2 ? [5, 15, 30, 75, 12.5, 40] : [35, 45, 2.5, 17.5, 60, 8]);
  const unitN = 100 / gcd(Math.round(t * 10), 1000) * 10;
  const N = Math.round(unitN) * R.int(2, 12);
  return { p: `${pc(t)} de ${fmt(N)}`, a: cn(N * t / 100) };
});
drill('dr.frac', { name: 'Fractions → décimaux', desc: 'Le tableau à connaître par cœur' }, (R, l) => {
  const pool = l === 1 ? [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10]] : l === 2 ? [[1, 8], [3, 8], [5, 8], [7, 8], [1, 20], [3, 20], [7, 20], [9, 20], [1, 25], [3, 25]] : [[1, 16], [3, 16], [1, 40], [3, 40], [7, 25], [11, 20], [13, 25], [9, 8], [5, 4], [7, 5]];
  const [n, d] = R.pick(pool);
  return { p: F(n, d), a: cn(n / d) };
});
drill('dr.trick', { name: 'Astuces ×5 ×25 ×9 ×11', desc: 'Les raccourcis du cours' }, (R, l) => {
  const t = R.pick(l === 1 ? ['x5', 'x25', 'x10'] : l === 2 ? ['x9', 'x11', 'x15', 'x5'] : ['x99', 'x11', 'x25', 'x101']);
  const a = t === 'x11' ? R.int(12, 98) : t === 'x101' ? R.int(11, 99) : R.int(12, 96);
  const k = { x5: 5, x25: 25, x10: 10, x9: 9, x11: 11, x15: 15, x99: 99, x101: 101 }[t];
  return { p: `${a} ${X} ${k}`, a: cn(a * k) };
});
drill('dr.half', { name: 'Moitiés et doubles', desc: 'La base des pourcentages' }, (R, l) => {
  if (l === 1) { const n = 2 * R.int(11, 249); return R.chance(0.5) ? { p: `La moitié de ${n}`, a: cn(n / 2) } : { p: `Le double de ${n / 2}`, a: cn(n) }; }
  if (l === 2) { const n = R.int(51, 499) | 1; return { p: `La moitié de ${n}`, a: cn(n / 2) }; }
  const x = R.int(11, 99) / 10; return R.chance(0.5) ? { p: `La moitié de ${fmt(x)}`, a: cn(x / 2) } : { p: `Le double de ${fmt(x)}`, a: cn(x * 2) };
});
drill('dr.time', { name: 'Heures ↔ minutes', desc: '1,25 h = 75 min' }, (R, l) => {
  const t = R.int(0, l === 1 ? 0 : 1);
  if (t === 0) { const x = R.pick(l === 1 ? [0.5, 0.25, 0.75, 1.5, 1.25, 2.5, 0.1, 0.2] : [1.2, 2.4, 0.4, 1.75, 2.25, 0.6, 0.3, 1.8, 3.5]); return { p: `${fmt(x)}${NB}h = ? min`, a: cn(Math.round(x * 60)) }; }
  const m = R.pick([15, 30, 45, 12, 18, 24, 36, 42, 48, 54, 6, 90, 75, 105, 72]); return { p: `${m}${NB}min = ? h`, a: cn(round(m / 60, 4)) };
});
drill('dr.speed', { name: 'Vitesses express', desc: 'km/h, minutes, distances' }, (R, l) => {
  const t = R.int(0, l === 1 ? 0 : 2);
  if (t === 0) { const v = R.pick([60, 90, 120, 30, 45, 75, 80]), m = R.pick([20, 30, 40, 15, 45, 10]); if (!Number.isInteger(v * m / 60)) return { p: `60${NB}km/h pendant ${m}${NB}min = ? km`, a: cn(m) }; return { p: `${v}${NB}km/h pendant ${m}${NB}min = ? km`, a: cn(v * m / 60) }; }
  if (t === 1) { const [d, m] = R.pick([[60, 45], [40, 30], [50, 40], [30, 20], [90, 45], [20, 15], [100, 75], [45, 30]]); return { p: `${d}${NB}km en ${m}${NB}min = ? km/h`, a: cn(d * 60 / m) }; }
  const [d, v] = R.pick([[120, 80], [90, 60], [150, 100], [45, 90], [100, 80], [30, 40], [75, 50]]); return { p: `${d}${NB}km à ${v}${NB}km/h = ? min`, a: cn(d / v * 60) };
});
drill('dr.dec', { name: 'Décimaux', desc: 'Placer la virgule sans hésiter' }, (R, l) => {
  const t = R.int(0, 2);
  if (t === 0) { const a = R.int(2, 9), b = R.int(2, 9); return l === 1 ? { p: `0,${a} ${X} ${b}`, a: cn(a * b / 10) } : { p: `0,${a} ${X} 0,${b}`, a: cn(a * b / 100) }; }
  if (t === 1) { const dv = R.pick(l === 1 ? [0.5, 0.1] : [0.5, 0.25, 0.2, 0.05]), q = R.int(2, 40); const x = round(q * dv, 4); return { p: `${fmt(x)} ${DV} ${fmt(dv)}`, a: cn(q) }; }
  const k = R.pick([0.25, 0.5, 0.75, 0.2, 1.5]), n = R.int(2, 20) * 4; return { p: `${fmt(k)} ${X} ${n}`, a: cn(k * n) };
});
drill('dr.pow', { name: 'Puissances', desc: '2¹⁰ = 1 024, 3⁵ = 243…' }, (R, l) => {
  const [b, e] = R.pick(l === 1 ? [[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [5, 2], [10, 3], [4, 2]] : l === 2 ? [[2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [3, 4], [5, 3], [4, 3], [6, 2]] : [[2, 11], [2, 12], [3, 5], [3, 6], [5, 4], [7, 3], [4, 4], [6, 3], [9, 3]]);
  return { p: PW(b, e), a: cn(b ** e) };
});
drill('dr.mix', { name: 'Grand mélange', desc: 'Tout le calcul mental à la fois' }, (R, l) => {
  const ids = ['dr.add', 'dr.sub', 'dr.tables', 'dr.mul', 'dr.div', 'dr.sq', 'dr.pct', 'dr.frac', 'dr.trick', 'dr.half', 'dr.time', 'dr.dec', 'dr.pow'];
  return TM.drills[R.pick(ids)].make(R, l);
});
drill('dr.alpha', { name: 'Rang des lettres', desc: 'A = 1, B = 2… indispensable en logique', sub: 'logique' }, (R, l) => {
  if (l === 1) { const i = R.int(0, 12); return { p: ALPHA[i], a: cn(i + 1) }; }
  if (l === 2) { const i = R.int(0, 25); return { p: ALPHA[i], a: cn(i + 1) }; }
  const i = R.int(0, 25); return { p: `Lettre n°${i + 1}`, a: ALPHA[i], kb: 'alpha' };
});
drill('dr.suites', { name: 'Termes suivants', desc: 'Repérer l\'écart en un coup d\'œil', sub: 'logique' }, (R, l) => {
  const t = R.int(0, l === 1 ? 1 : 3);
  if (t === 0) { const a = R.int(1, 30), r = R.int(2, 9) * R.sign(); const s = [0, 1, 2, 3].map((i) => a + 20 + i * r); return { p: s.join(', ') + ', ?', a: cn(a + 20 + 4 * r) }; }
  if (t === 1) { const a = R.int(1, 5), q = R.pick([2, 3]); const s = [0, 1, 2, 3].map((i) => a * q ** i); return { p: s.join(', ') + ', ?', a: cn(a * q ** 4) }; }
  if (t === 2) { const a = R.int(1, 10), d0 = R.int(1, 4); const s = [a]; for (let i = 1; i < 5; i++) s.push(s[i - 1] + d0 + (i - 1)); return { p: s.slice(0, 4).join(', ') + ', ?', a: cn(s[4]) }; }
  const a = R.int(1, 5), b = R.int(1, 5); const s = [a, b]; for (let i = 2; i < 6; i++) s.push(s[i - 1] + s[i - 2]); return { p: s.slice(0, 5).join(', ') + ', ?', a: cn(s[5]) };
});

/* ---- 36-guides.js ---- */
/* ===== Exercices guidés pas à pas (calcul) ===== */
TM.guides = {};
function guide(id, meta, make) { TM.guides[id] = Object.assign({ id, make }, meta); }
const guidesOf = (chId) => Object.values(TM.guides).filter((g) => g.ch === chId);
function parseNum(s) {
  const t = normAns(s);
  if (!t) return NaN;
  if (t.includes('/')) { const [a, b] = t.split('/'); const x = parseFloat(a.replace(',', '.')), y = parseFloat((b || '').replace(',', '.')); return y ? x / y : NaN; }
  return /^-?\d+(,\d+)?$/.test(t) ? Number(t.replace(',', '.')) : NaN;
}
function sameAns(inp, exp) {
  const a = parseNum(inp), b = parseNum(exp);
  if (isFinite(a) && isFinite(b)) return Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
  return normAns(inp) === normAns(exp);
}
const divHint = (d, t) => (Number.isInteger(t * 4) && !Number.isInteger(t) ? `Pour diviser par ${fmt(t)}, multiplie les deux nombres par 4 : ${fmt(d)} ${DV} ${fmt(t)} = ${fmt(d * 4)} ${DV} ${fmt(t * 4)}.` : `Pose la division ${fmt(d)} ${DV} ${fmt(t)}.`);

guide('g.vit.duree', { ch: 'vit', name: 'Convertir une durée puis trouver la vitesse' }, (R) => {
  const [h, m] = R.pick([[1, 15], [1, 30], [0, 45], [2, 15], [1, 45], [2, 30], [0, 30], [3, 15]]);
  const t = h + m / 60;
  let v, d; do { v = R.int(4, 26) * 5; d = round(v * t, 6); } while (!Number.isInteger(d));
  const who = v <= 35 ? 'Un cycliste' : 'Une voiture';
  return {
    q: `${who} parcourt ${unit(d, 'km')} en ${hm(t)}. Quelle est sa vitesse moyenne ?`,
    steps: [
      { p: `Convertis ${m} minutes en heure décimale (minutes ${DV} 60).`, a: cn(m / 60), u: 'h', hint: `${m} ${DV} 60 = ${F(m, 60)} = ${frH(m, 60)} d'heure. Écris-le en décimal.` },
      h ? { p: `Donc ${hm(t)} correspond à combien d'heures ?`, a: cn(t), u: 'h', hint: `${h} h + ${fmt(m / 60)} h.` } : null,
      { p: `Vitesse = distance ${DV} temps. Calcule ${fmt(d)} ${DV} ${fmt(t)}.`, a: cn(v), u: 'km/h', hint: divHint(d, t) },
    ].filter(Boolean),
    end: `La vitesse moyenne est de <b>${v} km/h</b>. À retenir : ${hm(t)} = <b>${fmt(t)} h</b>, et non ${h},${String(m).padStart(2, '0')} h.`,
  };
});
guide('g.vit.moy', { ch: 'vit', name: 'Vitesse moyenne d\'un aller-retour' }, (R) => {
  const [v1, v2] = R.shuffle(R.pick([[60, 40], [90, 60], [120, 80], [30, 20], [100, 150], [50, 75], [45, 90], [60, 90]]));
  const D = lcm(v1, v2), t1 = D / v1, t2 = D / v2, T = t1 + t2, vm = 2 * D / T;
  return {
    q: `Un automobiliste fait l'aller (${D} km) à ${v1} km/h, puis le retour (${D} km) à ${v2} km/h. Quelle est sa vitesse moyenne sur l'aller-retour ?`,
    steps: [
      { p: `Durée de l'aller : ${D} ${DV} ${v1} = ?`, a: cn(t1), u: 'h', hint: 'temps = distance ÷ vitesse' },
      { p: `Durée du retour : ${D} ${DV} ${v2} = ?`, a: cn(t2), u: 'h', hint: 'temps = distance ÷ vitesse' },
      { p: 'Distance totale parcourue (aller + retour) ?', a: cn(2 * D), u: 'km', hint: `${D} + ${D}` },
      { p: 'Durée totale ?', a: cn(T), u: 'h', hint: `${t1} + ${t2}` },
      { p: 'Vitesse moyenne = distance totale ÷ durée totale = ?', a: cn(vm), u: 'km/h', hint: `${2 * D} ${DV} ${T}` },
    ],
    end: `La vitesse moyenne est de <b>${vm} km/h</b>, et non ${fmt((v1 + v2) / 2)} km/h. On passe plus de temps à la vitesse la plus lente, donc la moyenne penche de son côté. Raccourci : ${F(`2 ${X} ${v1} ${X} ${v2}`, `${v1} + ${v2}`)} = ${vm}.`,
  };
});
guide('g.vit.croise', { ch: 'vit', name: 'Deux véhicules qui se croisent' }, (R) => {
  const t = R.pick([1.5, 2, 2.5, 3, 0.5, 1]);
  let v1, v2; do { v1 = R.int(4, 12) * 10; v2 = R.int(4, 12) * 10; } while (v1 === v2 || !Number.isInteger(round((v1 + v2) * t, 6)));
  const D = (v1 + v2) * t;
  return {
    q: `A et B sont distantes de ${unit(D, 'km')}. Une voiture part de A vers B à ${v1} km/h ; au même moment, une autre part de B vers A à ${v2} km/h. À quelle distance de A se croisent-elles ?`,
    steps: [
      { p: 'De combien de kilomètres se rapprochent-elles chaque heure ?', a: cn(v1 + v2), u: 'km/h', hint: 'Elles roulent l\'une vers l\'autre : on additionne les vitesses.' },
      { p: `Au bout de combien d'heures se croisent-elles ? (${fmt(D)} ${DV} ${v1 + v2})`, a: cn(t), u: 'h', hint: 'temps = distance ÷ vitesse de rapprochement' },
      { p: `Quelle distance a parcourue la voiture partie de A ? (${v1} ${X} ${fmt(t)})`, a: cn(v1 * t), u: 'km', hint: 'distance = vitesse × temps' },
    ],
    end: `Elles se croisent à <b>${fmt(v1 * t)} km de A</b>, au bout de ${hm(t)}. Vérification : l'autre a parcouru ${v2} ${X} ${fmt(t)} = ${fmt(v2 * t)} km, et ${fmt(v1 * t)} + ${fmt(v2 * t)} = ${fmt(D)} km ✔.`,
  };
});
guide('g.vit.rattrape', { ch: 'vit', name: 'Rattraper un véhicule' }, (R) => {
  const [v1, v2, lag] = R.pick([[60, 90, 1], [40, 60, 0.5], [80, 120, 1], [50, 75, 1], [90, 120, 0.5], [15, 20, 1], [70, 105, 1]]);
  const adv = v1 * lag, tc = adv / (v2 - v1);
  return {
    q: `Une voiture part à ${v1} km/h. ${hm(lag)} plus tard, une seconde voiture part du même endroit, sur la même route, à ${v2} km/h. Au bout de combien de temps (après son départ) la seconde rattrape-t-elle la première ?`,
    steps: [
      { p: `Quelle avance a la première voiture au départ de la seconde ? (${v1} ${X} ${fmt(lag)})`, a: cn(adv), u: 'km', hint: 'distance = vitesse × temps' },
      { p: 'De combien de kilomètres la seconde se rapproche-t-elle chaque heure ?', a: cn(v2 - v1), u: 'km/h', hint: 'Même sens : on soustrait les vitesses.' },
      { p: `Temps pour combler l'avance, en heures (${fmt(adv)} ${DV} ${v2 - v1}) ?`, a: cn(tc), u: 'h', hint: 'temps = avance ÷ vitesse de rapprochement' },
      { p: 'Ce temps, en minutes ?', a: cn(tc * 60), u: 'min', hint: `${fmt(tc)} ${X} 60` },
    ],
    end: `La seconde voiture rattrape la première au bout de <b>${hm(tc)}</b>.`,
  };
});
guide('g.pct.evol', { ch: 'pct', name: 'Calculer un taux d\'évolution' }, (R) => {
  const t = R.pick([10, 20, 25, 15, 40, -10, -20, -25, -15, -40, 50]);
  let V1; do { V1 = R.int(2, 40) * 10; } while (!Number.isInteger(round(V1 * (1 + t / 100), 6)));
  const V2 = round(V1 * (1 + t / 100), 4);
  return {
    q: `Le prix d'un abonnement passe de ${eur(V1)} à ${eur(V2)}. Quel est le taux d'évolution ?`,
    steps: [
      { p: 'Quelle est la variation (prix final − prix initial) ?', a: cn(V2 - V1), u: '€', hint: `${fmt(V2)} ${MINUS} ${fmt(V1)} (le résultat peut être négatif)` },
      { p: `Divise cette variation par le prix de DÉPART (${fmt(V1)}).`, a: cn(round((V2 - V1) / V1, 6)), u: '', hint: `${fmt(V2 - V1)} ${DV} ${fmt(V1)}` },
      { p: 'Exprime ce nombre en pourcentage (× 100).', a: cn(t), u: '%', hint: 'Décale la virgule de 2 rangs vers la droite.' },
    ],
    end: `Le taux d'évolution est de <b>${sgnPc(t)}</b>. On divise TOUJOURS par la valeur de départ.`,
  };
});
guide('g.pct.succ', { ch: 'pct', name: 'Enchaîner deux évolutions' }, (R) => {
  const [t1, t2] = R.pick([[20, -20], [10, 10], [25, -20], [50, -20], [30, -30], [-10, -10], [40, -25], [20, 20]]);
  const c1 = round(1 + t1 / 100, 4), c2 = round(1 + t2 / 100, 4), c = round(c1 * c2, 6), tot = round((c - 1) * 100, 4);
  return {
    q: `Un prix évolue de ${sgnPc(t1)}, puis de ${sgnPc(t2)}. Quelle est l'évolution globale ?`,
    steps: [
      { p: `Coefficient multiplicateur de la 1re évolution (${sgnPc(t1)}) ?`, a: cn(c1), u: '', hint: `1 ${t1 > 0 ? '+' : MINUS} ${fmt(Math.abs(t1) / 100)}` },
      { p: `Coefficient de la 2e évolution (${sgnPc(t2)}) ?`, a: cn(c2), u: '', hint: `1 ${t2 > 0 ? '+' : MINUS} ${fmt(Math.abs(t2) / 100)}` },
      { p: 'Coefficient global = produit des deux ?', a: cn(c), u: '', hint: `${fmt(c1)} ${X} ${fmt(c2)}` },
      { p: 'Évolution globale en % ? (tape un nombre négatif pour une baisse)', a: cn(tot), u: '%', hint: `(${fmt(c)} ${MINUS} 1) ${X} 100` },
    ],
    end: `L'évolution globale est de <b>${sgnPc(tot)}</b>, et non ${sgnPc(t1 + t2)}. Les pourcentages qui s'enchaînent se MULTIPLIENT.`,
  };
});
guide('g.pct.init', { ch: 'pct', name: 'Retrouver un prix avant remise' }, (R) => {
  const t = R.pick([10, 20, 25, 40, 30]);
  let V0; do { V0 = R.int(4, 60) * 10; } while (!Number.isInteger(round(V0 * (1 - t / 100), 6)));
  const V = round(V0 * (1 - t / 100), 4), c = round(1 - t / 100, 4);
  return {
    q: `Après une remise de ${pc(t)}, un manteau coûte ${eur(V)}. Quel était son prix avant la remise ?`,
    steps: [
      { p: `Coefficient multiplicateur d'une baisse de ${pc(t)} ?`, a: cn(c), u: '', hint: `1 ${MINUS} ${fmt(t / 100)}` },
      { p: `Prix initial ${X} ${fmt(c)} = ${fmt(V)}. Donc prix initial = ${fmt(V)} ${DV} ${fmt(c)} = ?`, a: cn(V0), u: '€', hint: `Pour diviser par ${fmt(c)}, multiplie les deux nombres par ${Math.pow(10, decs(c))} : ${fmt(V * Math.pow(10, decs(c)))} ${DV} ${fmt(round(c * Math.pow(10, decs(c)), 6))}.` },
    ],
    end: `Le prix initial était de <b>${eur(V0)}</b>. Vérification : ${fmt(V0)} ${X} ${fmt(c)} = ${fmt(V)} ✔. Erreur classique : ${fmt(V)} ${X} ${fmt(1 + t / 100)} = ${fmt(round(V * (1 + t / 100), 2))}, faux !`,
  };
});
guide('g.frac.add', { ch: 'frac', name: 'Additionner deux fractions' }, (R) => {
  let b, d2; do { b = R.int(2, 9); d2 = R.int(2, 9); } while (b === d2);
  const cop = (dd) => { let n; do { n = R.int(1, dd - 1); } while (gcd(n, dd) !== 1); return n; };
  const a = cop(b), c = cop(d2), L = lcm(b, d2), n1 = a * L / b, n2 = c * L / d2, s = new Fr(n1 + n2, L);
  return {
    q: `Calcule ${F(a, b)} + ${F(c, d2)}.`,
    steps: [
      { p: `Quel est le plus petit multiple commun de ${b} et ${d2} (le dénominateur commun) ?`, a: cn(L), u: '', hint: `Liste les multiples de ${Math.max(b, d2)} : ${[1, 2, 3, 4].map((k) => k * Math.max(b, d2)).join(', ')}… et prends le premier divisible par ${Math.min(b, d2)}.` },
      { p: `${F(a, b)} = ${F('?', L)} : quel numérateur ?`, a: cn(n1), u: '', hint: `On a multiplié ${b} par ${L / b} : fais pareil avec ${a}.` },
      { p: `${F(c, d2)} = ${F('?', L)} : quel numérateur ?`, a: cn(n2), u: '', hint: `On a multiplié ${d2} par ${L / d2} : fais pareil avec ${c}.` },
      { p: `Somme des numérateurs : ${n1} + ${n2} = ?`, a: cn(n1 + n2), u: '', hint: 'On additionne les numérateurs, on garde le dénominateur.' },
      { p: `Écris le résultat sous forme de fraction simplifiée (touche « / »).`, a: s.txt(), u: '', hint: `${F(n1 + n2, L)} : divise le haut et le bas par ${gcd(n1 + n2, L)}${gcd(n1 + n2, L) === 1 ? ' (elle est déjà simplifiée)' : ''}.` },
    ],
    end: `${F(a, b)} + ${F(c, d2)} = ${F(n1, L)} + ${F(n2, L)} = ${s.html()}. Jamais ${F(a + c, b + d2)} !`,
  };
});
guide('g.moy.manque', { ch: 'moy', name: 'Trouver la note manquante' }, (R) => {
  const n = R.int(3, 4), target = R.int(11, 14);
  let notes, miss; do { notes = Array.from({ length: n }, () => R.int(7, 18)); miss = target * (n + 1) - notes.reduce((x, y) => x + y, 0); } while (miss < 5 || miss > 20);
  const S0 = notes.reduce((x, y) => x + y, 0);
  return {
    q: `Inès a eu ${notes.join(', ')}. Quelle note doit-elle avoir au prochain devoir pour obtenir exactement ${target} de moyenne ?`,
    steps: [
      { p: `Avec ${n + 1} notes, quelle somme faut-il pour avoir ${target} de moyenne ?`, a: cn(target * (n + 1)), u: 'points', hint: `somme = moyenne ${X} nombre de notes = ${target} ${X} ${n + 1}` },
      { p: 'Quelle est la somme de ses notes actuelles ?', a: cn(S0), u: 'points', hint: notes.join(' + ') },
      { p: 'Quelle note lui manque-t-il ?', a: cn(miss), u: '', hint: `${target * (n + 1)} ${MINUS} ${S0}` },
    ],
    end: `Elle doit avoir <b>${miss}</b>. La clé : <b>somme = moyenne × nombre</b>.`,
  };
});
guide('g.moy.groupes', { ch: 'moy', name: 'Moyenne de deux groupes' }, (R) => {
  let n1, n2, m1, m2, avg; do { n1 = R.int(5, 25); n2 = R.int(5, 25); m1 = R.int(8, 16); m2 = R.int(8, 16); avg = (n1 * m1 + n2 * m2) / (n1 + n2); } while (m1 === m2 || !Number.isInteger(avg));
  return {
    q: `Dans une classe, les ${n1} filles ont ${m1} de moyenne et les ${n2} garçons ont ${m2}. Quelle est la moyenne de la classe ?`,
    steps: [
      { p: 'Total des points des filles ?', a: cn(n1 * m1), u: 'points', hint: `${n1} ${X} ${m1}` },
      { p: 'Total des points des garçons ?', a: cn(n2 * m2), u: 'points', hint: `${n2} ${X} ${m2}` },
      { p: 'Total des points de la classe ?', a: cn(n1 * m1 + n2 * m2), u: 'points', hint: 'On additionne les deux totaux.' },
      { p: 'Nombre d\'élèves ?', a: cn(n1 + n2), u: '', hint: `${n1} + ${n2}` },
      { p: 'Moyenne de la classe ?', a: cn(avg), u: '', hint: `${n1 * m1 + n2 * m2} ${DV} ${n1 + n2}` },
    ],
    end: `La moyenne est <b>${avg}</b>, et non ${fmt((m1 + m2) / 2)} : le groupe le plus nombreux pèse plus lourd.`,
  };
});
guide('g.pb.tirage', { ch: 'proba', name: 'Deux tirages sans remise' }, (R) => {
  const r = R.int(3, 7), b = R.int(2, 6), n = r + b, p = new Fr(r * (r - 1), n * (n - 1));
  return {
    q: `Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire deux jetons, l'un après l'autre, sans remise. Quelle est la probabilité que les deux soient rouges ?`,
    steps: [
      { p: 'Probabilité que le 1er jeton soit rouge ? (écris une fraction, touche « / »)', a: `${r}/${n}`, u: '', hint: `cas favorables ÷ cas possibles = ${r} ÷ ${n}` },
      { p: 'Le 1er était rouge. Probabilité que le 2e soit rouge aussi ?', a: `${r - 1}/${n - 1}`, u: '', hint: `Il reste ${r - 1} rouges sur ${n - 1} jetons.` },
      { p: 'Probabilité des deux à la suite (on multiplie) ?', a: p.txt(), u: '', hint: `${F(r, n)} ${X} ${F(r - 1, n - 1)} = ${F(r * (r - 1), n * (n - 1))}, puis simplifie.` },
    ],
    end: `La probabilité vaut <b>${p.html()}</b>. Sans remise, le 2e tirage a un jeton de moins : les deux fractions changent.`,
  };
});
guide('g.trav.rob', { ch: 'trav', name: 'Deux robinets ensemble' }, (R) => {
  const [a, b] = R.shuffle(R.pick([[3, 6], [2, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [6, 3]]));
  const s = new Fr(1, a).add(new Fr(1, b)), t = a * b / (a + b);
  return {
    q: `Un robinet remplit une cuve en ${a} heures, un autre en ${b} heures. En combien de temps la remplissent-ils ensemble ?`,
    steps: [
      { p: 'Quelle fraction de la cuve le 1er robinet remplit-il en 1 heure ?', a: `1/${a}`, u: '', hint: `Il lui faut ${a} heures pour une cuve entière.` },
      { p: 'Et le 2e robinet, en 1 heure ?', a: `1/${b}`, u: '', hint: `Il lui faut ${b} heures.` },
      { p: 'Ensemble, quelle fraction de la cuve en 1 heure ?', a: s.txt(), u: '', hint: `${F(1, a)} + ${F(1, b)} : mets au même dénominateur (${lcm(a, b)}).` },
      { p: 'Combien d\'heures pour remplir la cuve entière ?', a: cn(t), u: 'h', hint: `Si on remplit ${s.html()} par heure, il faut ${s.inv().html()} heures.` },
    ],
    end: `Ensemble, il faut <b>${hm(t)}</b>. Formule rapide : ${F(`${a} ${X} ${b}`, `${a} + ${b}`)} = ${fmt(t)}. Toujours moins que le plus rapide seul !`,
  };
});
guide('g.prop.trois', { ch: 'prop', name: 'Règle de trois' }, (R) => {
  const p = R.pick([1.2, 1.5, 2.4, 1.6, 2.5, 0.8, 3.5]), q1 = R.int(3, 9); let q2; do { q2 = R.int(2, 15); } while (q2 === q1);
  const t1 = round(p * q1, 2), t2 = round(p * q2, 2);
  return {
    q: `${q1} kg de pommes coûtent ${eur2(t1)}. Combien coûtent ${q2} kg ?`,
    steps: [
      { p: 'Prix d\'un seul kilo ?', a: cn(p), u: '€', hint: `${fmt(t1)} ${DV} ${q1}` },
      { p: `Prix de ${q2} kg ?`, a: cn(t2), u: '€', hint: `${q2} ${X} ${fmt(p)}` },
    ],
    end: `${q2} kg coûtent <b>${eur2(t2)}</b>. Passer par l'unité est la méthode la plus sûre.`,
  };
});
guide('g.com.marge', { ch: 'com', name: 'Marge, taux de marge et de marque' }, (R) => {
  const [PA, PV] = R.pick([[80, 100], [120, 150], [50, 100], [40, 100], [50, 80], [100, 160], [80, 200], [200, 250], [25, 40]]);
  const mg = PV - PA;
  return {
    q: `Un article acheté ${eur(PA)} est revendu ${eur(PV)} hors taxes. Calcule la marge, le taux de marge et le taux de marque.`,
    steps: [
      { p: 'Marge = prix de vente − prix d\'achat = ?', a: cn(mg), u: '€', hint: `${PV} ${MINUS} ${PA}` },
      { p: 'Taux de marge = marge ÷ prix d\'ACHAT, en % ?', a: cn(round(mg / PA * 100, 4)), u: '%', hint: `${mg} ${DV} ${PA}, puis × 100` },
      { p: 'Taux de marque = marge ÷ prix de VENTE, en % ?', a: cn(round(mg / PV * 100, 4)), u: '%', hint: `${mg} ${DV} ${PV}, puis × 100` },
    ],
    end: `Marge ${mg} € · taux de marge <b>${pc(round(mg / PA * 100, 2))}</b> · taux de marque <b>${pc(round(mg / PV * 100, 2))}</b>. Même marge, deux taux différents selon le prix de référence.`,
  };
});

/* ---- 37-cards.js ---- */
/* ===== Fiches mémo (cartes recto/verso, répétition espacée) ===== */
TM.decks = [];
function deck(id, sub, name, desc, cards) { TM.decks.push({ id, sub, name, desc, cards: cards.map(([f, b], i) => ({ id: id + ':' + i, f, b })) }); }

deck('m.frac', 'calcul', 'Fractions, décimaux, %', 'Le tableau de conversion à connaître par cœur', [
  [F(1, 2), '0,5 = 50 %'], [F(1, 4), '0,25 = 25 %'], [F(3, 4), '0,75 = 75 %'], [F(1, 5), '0,2 = 20 %'], [F(2, 5), '0,4 = 40 %'],
  [F(3, 5), '0,6 = 60 %'], [F(4, 5), '0,8 = 80 %'], [F(1, 8), '0,125 = 12,5 %'], [F(3, 8), '0,375 = 37,5 %'], [F(5, 8), '0,625 = 62,5 %'],
  [F(7, 8), '0,875 = 87,5 %'], [F(1, 3), '≈ 0,333 = 33,3 %'], [F(2, 3), '≈ 0,667 = 66,7 %'], [F(1, 6), '≈ 0,167 = 16,7 %'], [F(1, 9), '≈ 0,111 = 11,1 %'],
  [F(1, 10), '0,1 = 10 %'], [F(1, 20), '0,05 = 5 %'], [F(1, 25), '0,04 = 4 %'], [F(1, 40), '0,025 = 2,5 %'], [F(1, 50), '0,02 = 2 %'],
  ['12,5 %', F(1, 8)], ['37,5 %', F(3, 8)], ['0,75', F(3, 4)], ['35 %', F(7, 20)], ['0,04', F(1, 25)],
]);
deck('m.carres', 'calcul', 'Carrés, puissances, racines', 'Gagne des secondes sur chaque calcul', [
  ['11²', '121'], ['12²', '144'], ['13²', '169'], ['14²', '196'], ['15²', '225'], ['16²', '256'], ['17²', '289'], ['18²', '324'], ['19²', '361'], ['21²', '441'], ['24²', '576'], ['25²', '625'],
  [PW(2, 5), '32'], [PW(2, 6), '64'], [PW(2, 7), '128'], [PW(2, 8), '256'], [PW(2, 9), '512'], [PW(2, 10), '1 024'], [PW(3, 3), '27'], [PW(3, 4), '81'], [PW(3, 5), '243'], [PW(5, 3), '125'], [PW(5, 4), '625'],
  [SQ(169), '13'], [SQ(256), '16'], [SQ(324), '18'], [SQ(0.49).replace('0.49', '0,49'), '0,7'], [SQ(2) + ' ≈ ?', '1,41'], [SQ(3) + ' ≈ ?', '1,73'],
]);
deck('m.formules', 'calcul', 'Formules essentielles', 'Toutes les formules du calcul en une seule pile', [
  ['Vitesse', 'v = distance ÷ temps'], ['Distance', 'd = vitesse × temps'], ['Temps', 't = distance ÷ vitesse'],
  ['Vitesse moyenne d\'un aller-retour (v₁, v₂)', F('2 × v₁ × v₂', 'v₁ + v₂') + ' (jamais la moyenne simple)'], ['km/h → m/s', 'diviser par 3,6'],
  ['Aire d\'un triangle', F('base × hauteur', 2)], ['Aire d\'un trapèze', F('(B + b) × h', 2)], ['Aire d\'un disque', 'π × r²'], ['Périmètre d\'un cercle', '2 × π × r'],
  ['Pythagore', 'hypoténuse² = a² + b²'], ['Triplets de Pythagore', '3-4-5 · 5-12-13 · 8-15-17 · 7-24-25'], ['Diagonale d\'un carré de côté a', 'a' + SQ(2)], ['Volume d\'un cylindre', 'π × r² × h'],
  ['Somme 1 + 2 + … + n', F('n × (n + 1)', 2)], ['Nombre de termes de a à b (pas r)', F('b − a', 'r') + ' + 1'], ['Intérêts composés', 'C × (1 + t)<sup>n</sup>'],
  ['Hausse de t %', '× (1 + t/100)'], ['Baisse de t %', '× (1 − t/100)'], ['Taux d\'évolution', F('final − initial', 'initial')],
  ['Moyenne', 'somme ÷ nombre, donc somme = moyenne × nombre'], ['Deux robinets (a h et b h)', F('a × b', 'a + b') + ' heures'], ['Produit pur d\'un mélange', 'volume × concentration'],
  ['P(au moins un)', '1 − P(aucun)'], ['Choisir 2 parmi n', F('n × (n − 1)', 2)], ['Ranger n objets', 'n! = n × (n − 1) × … × 1'],
  ['PGCD ou PPCM ? Bus qui repartent ensemble', 'PPCM'], ['PGCD ou PPCM ? Bouquets identiques', 'PGCD'], ['Seuil de rentabilité', F('coûts fixes', 'PV − CV unitaire')], ['Taux de marge / de marque', 'marge ÷ prix d\'achat / marge ÷ prix de vente'],
]);
deck('m.pct', 'calcul', 'Pourcentages réflexes', 'Les évolutions qu\'il faut reconnaître sans calculer', [
  ['+20 % puis −20 %', '−4 % (1,2 × 0,8 = 0,96)'], ['+10 % puis +10 %', '+21 %'], ['+25 % puis −20 %', '0 % (1,25 × 0,8 = 1)'], ['+50 % puis −50 %', '−25 %'], ['−50 % puis +100 %', '0 %'],
  ['Pour annuler +25 %', '−20 %'], ['Pour annuler −20 %', '+25 %'], ['Pour annuler +50 %', '≈ −33,3 %'], ['Pour annuler −50 %', '+100 %'], ['Pour annuler +100 %', '−50 %'],
  ['De 8 % à 10 %', '+2 points, soit +25 %'], ['TTC → HT (TVA 20 %)', 'diviser par 1,2'], ['15 % de N', '10 % + 5 % (la moitié de 10 %)'], ['8 % de 50', '= 50 % de 8 = 4'], ['Après −20 %, prix 64 €. Avant ?', '64 ÷ 0,8 = 80 €'],
]);
deck('m.durees', 'calcul', 'Durées et vitesses', 'Heures décimales et conversions express', [
  ['0,1 h', '6 min'], ['0,2 h', '12 min'], ['0,25 h', '15 min'], ['0,4 h', '24 min'], ['0,75 h', '45 min'], ['1,2 h', '1 h 12'], ['2,4 h', '2 h 24'],
  ['20 min', F(1, 3) + ' h'], ['40 min', F(2, 3) + ' h'], ['1 h 15', '1,25 h'], ['1 h 45', '1,75 h'], ['36 min', '0,6 h'],
  ['60 km/h', '1 km par minute'], ['90 km/h', '1,5 km par minute'], ['120 km/h', '2 km par minute'], ['72 km/h', '20 m/s'], ['90 km/h en m/s', '25 m/s'], ['36 km/h', '10 m/s'],
]);
deck('m.cm', 'cm', 'Conditions minimales', 'Les 5 réponses et les pièges', [
  ['Réponse A', '(1) seule suffit, pas (2) seule'], ['Réponse B', '(2) seule suffit, pas (1) seule'], ['Réponse C', 'Les deux ensemble, aucune seule'], ['Réponse D', 'Chacune suffit seule'], ['Réponse E', 'Même ensemble, ça ne suffit pas'],
  ['Ordre de la méthode', '(1) seule → (2) seule → ensemble'], ['x² = 16 suffit-il pour x ?', 'Non : x = 4 ou x = −4'], ['« x + y = 10 » et « 2x + 2y = 20 »', 'Une seule équation : ensemble, ça ne suffit pas'],
  ['Pour connaître a/b', 'Une relation comme 2a = 3b suffit, pas besoin de a et b'], ['Question oui / non', 'Un « non » certain est une réponse : la condition suffit'], ['Faut-il finir le calcul ?', 'Non, savoir qu\'on PEUT trouver suffit'], ['Effectifs inconnus, proportion connue', 'Suffit pour une moyenne pondérée'],
]);
deck('m.log', 'logique', 'Logique : repères', 'Rangs des lettres et schémas fréquents', [
  ['E', '5'], ['J', '10'], ['O', '15'], ['T', '20'], ['Y', '25'], ['H', '8'], ['M', '13'], ['R', '18'], ['W', '23'], ['K', '11'], ['P', '16'], ['U', '21'],
  ['Dominos : après 6 ?', '0 (on compte modulo 7)'], ['Cartes : valeurs', 'As 1 · Valet 11 · Dame 12 · Roi 13'], ['Suite bloquée ?', 'Regarde une case sur deux'], ['2, 3, 5, 8, 13…', 'Fibonacci : somme des deux précédents'], ['1, 3, 7, 15, 31…', '× 2 + 1'], ['3, 5, 9, 15, 23…', 'Écarts +2, +4, +6, +8 → 33'],
]);
deck('m.ra', 'ra', 'Logique et sophismes', 'Raisonnement & Argumentation', [
  ['« Si A alors B » : contraposée', 'Si non B, alors non A (toujours vraie)'], ['« Si A alors B » : réciproque', 'Si B alors A (pas forcément vraie)'], ['Condition nécessaire', 'Sans elle, impossible ; mais elle ne garantit rien'], ['Condition suffisante', 'Elle garantit le résultat'],
  ['« Tous les A sont B »', 'Ne veut pas dire que tous les B sont A'], ['Hypothèse implicite : le test', 'Nier la réponse : si l\'argument s\'effondre, c\'est la bonne'],
  ['Corrélation ≠ causalité', 'Deux choses liées n\'impliquent pas que l\'une cause l\'autre'], ['Généralisation hâtive', 'Conclure à partir de trop peu de cas'], ['Faux dilemme', 'Présenter deux options comme les seules possibles'], ['Pente glissante', 'Enchaîner des conséquences de plus en plus graves sans preuve'],
  ['Ad hominem', 'Attaquer la personne au lieu de l\'argument'], ['Appel à l\'autorité', 'S\'appuyer sur quelqu\'un qui n\'est pas compétent'], ['Raisonnement circulaire', 'Utiliser la conclusion comme preuve'], ['Biais de sélection', 'Comparer des groupes qui n\'étaient pas comparables au départ'], ['Homme de paille', 'Déformer la position de l\'autre pour la réfuter plus facilement'], ['« Seuls les X ont Y »', 'Avoir Y implique être X (condition nécessaire)'],
]);
deck('m.paro', 'expr', 'Paronymes', 'Les mots qui se ressemblent', [
  ['éminent / imminent', 'remarquable / qui va arriver bientôt'], ['effraction / infraction', 'entrée en forçant / violation d\'une règle'], ['conjecture / conjoncture', 'hypothèse / situation du moment'], ['perpétrer / perpétuer', 'commettre / faire durer'],
  ['prodige / prodigue', 'surdoué, miracle / dépensier'], ['recouvrer / recouvrir', 'retrouver / couvrir entièrement'], ['acception / acceptation', 'sens d\'un mot / fait d\'accepter'], ['partial / partiel', 'injuste / incomplet'],
  ['opprimer / oppresser', 'tyranniser / gêner la respiration'], ['émigrer / immigrer', 'quitter son pays / s\'installer dans un pays'], ['compréhensif / compréhensible', 'indulgent / qu\'on peut comprendre'], ['avènement / événement', 'arrivée au pouvoir / fait marquant'],
  ['collision / collusion', 'choc / entente secrète'], ['inclinaison / inclination', 'pente / penchant, goût'], ['allocution / allocation', 'discours / somme versée'], ['éruption / irruption', 'sortie brutale (volcan) / entrée brutale'],
]);
deck('m.vocab', 'expr', 'Vocabulaire soutenu', 'Les mots qui tombent', [
  ['laconique', 'bref, concis'], ['prolixe', 'trop long, bavard'], ['éphémère', 'qui dure peu'], ['pérenne', 'durable'], ['fortuit', 'dû au hasard'], ['vétuste', 'abîmé par le temps'], ['sibyllin', 'obscur, énigmatique'],
  ['pusillanime', 'qui manque de courage'], ['acerbe', 'mordant, agressif'], ['exhaustif', 'complet'], ['idoine', 'approprié'], ['véhément', 'fougueux, emporté'], ['ubuesque', 'absurde et grotesque'], ['obsolète', 'dépassé'],
  ['prosaïque', 'banal, terre à terre'], ['dithyrambique', 'extrêmement élogieux'], ['gageure', 'action très difficile à réussir'], ['abscons', 'difficile à comprendre'], ['inique', 'très injuste'], ['probe', 'honnête, intègre'],
]);
deck('m.regles', 'expr', 'Règles de grammaire', 'Accords, modes et constructions', [
  ['Participe passé avec avoir', 'Accord avec le COD seulement s\'il est AVANT'], ['« Elles se sont lavé les mains »', 'Pas d\'accord : le COD (les mains) est après'], ['« Ils se sont parlé »', 'Pas d\'accord : on parle À quelqu\'un (COI)'], ['« Fait » + infinitif', 'Toujours invariable'],
  ['Après « bien que »', 'Subjonctif'], ['Après « après que »', 'Indicatif'], ['Après « avant que »', 'Subjonctif'], ['« Si j\'… su »', 'avais (jamais de conditionnel après si)'],
  ['Se rappeler / se souvenir', 'se rappeler QUELQUE CHOSE / se souvenir DE quelque chose'], ['Pallier', 'pallier un problème (sans « à »)'], ['« Malgré que »', 'Fautif : écrire « bien que »'], ['Des chaussures marron', 'Couleur issue d\'un nom : invariable'],
  ['« Tout » + adjectif féminin à consonne', 's\'accorde : elles sont toutes honteuses'], ['Midi et demi / une heure et demie', 'demi s\'accorde avec le nom qui précède'], ['Je vous … gré', 'saurais (verbe savoir)'], ['Davantage / d\'avantage', 'davantage = plus'],
]);
function deckStats(dk) {
  const C = Store.S.cards || {}, now = Date.now();
  let seen = 0, mastered = 0, due = 0;
  dk.cards.forEach((c) => { const s = C[c.id]; if (s) { seen++; if (s.box >= 4) mastered++; if (s.due <= now) due++; } });
  return { seen, mastered, due, total: dk.cards.length, fresh: dk.cards.length - seen };
}
function cardQueue(deckIds, max = 15) {
  const C = Store.S.cards || {}, now = Date.now();
  const decks = TM.decks.filter((d) => !deckIds || deckIds.includes(d.id));
  const all = [].concat(...decks.map((d) => d.cards.map((c) => Object.assign({ deck: d }, c))));
  const due = all.filter((c) => C[c.id] && C[c.id].due <= now).sort((a, b) => C[a.id].due - C[b.id].due);
  const fresh = all.filter((c) => !C[c.id]);
  const R = makeRng(newSeed());
  return due.concat(R.shuffle(fresh)).slice(0, max);
}
function rateCard(id, knew) {
  const C = Store.S.cards || (Store.S.cards = {});
  const s = C[id] || { box: 0, due: 0 };
  s.box = knew ? Math.min(5, s.box + 1) : 1;
  s.due = Date.now() + (knew ? [0, 1, 3, 7, 16, 35][s.box] * DAY_MS : 10 * 60000);
  C[id] = s;
}

/* ---- 40-cm.js ---- */
/* ===== CONDITIONS MINIMALES ===== */
chapter({
  id: 'cm-methode', sub: 'cm', order: 1, title: 'La méthode des Conditions minimales', short: 'Méthode',
  lesson: `
<p>Ici, tu ne dois <b>pas</b> trouver la réponse à la question : tu dois dire si les informations <b>suffisent</b> pour la trouver. C'est le sous-test où l'on perd le plus de temps à calculer pour rien.</p>
<h3><span class="hl">1. Les 5 réponses (toujours les mêmes)</span></h3>
<div class="tablewrap"><table>
<tr><th>A</th><td>(1) seule suffit, mais pas (2) seule</td></tr>
<tr><th>B</th><td>(2) seule suffit, mais pas (1) seule</td></tr>
<tr><th>C</th><td>Il faut (1) ET (2) ensemble ; aucune ne suffit seule</td></tr>
<tr><th>D</th><td>Chacune suffit seule</td></tr>
<tr><th>E</th><td>Même ensemble, elles ne suffisent pas</td></tr>
</table></div>
<h3><span class="hl">2. La méthode en 3 temps</span></h3>
<ol><li>Lis la question et demande-toi : <b>de quoi aurais-je besoin</b> pour répondre ?</li><li>Teste (1) <b>seule</b>, en oubliant (2). Puis (2) <b>seule</b>, en oubliant complètement (1).</li><li>Seulement si aucune ne suffit seule, teste les deux <b>ensemble</b>.</li></ol>
<div class="formula">(1) OUI et (2) OUI → D<br>(1) OUI et (2) NON → A<br>(1) NON et (2) OUI → B<br>(1) NON, (2) NON, ensemble OUI → C<br>(1) NON, (2) NON, ensemble NON → E</div>
<h3><span class="hl">3. Les pièges classiques</span></h3>
<ul>
<li><b>Ne calcule pas jusqu'au bout.</b> Savoir qu'on PEUT trouver suffit. Deux équations différentes à deux inconnues → on peut résoudre, inutile de le faire.</li>
<li><b>Questions oui/non :</b> un « non » certain est une réponse ! Si (1) permet d'affirmer que n n'est PAS pair, (1) suffit.</li>
<li><b>Deux conditions qui disent la même chose :</b> « x + y = 10 » et « 2x + 2y = 20 » ne font qu'UNE équation → souvent E.</li>
<li><b>Les signes :</b> x² = 16 donne x = 4 OU x = −4. Ne suppose jamais qu'un nombre est positif ou entier si ce n'est pas dit.</li>
<li><b>Les ratios :</b> pour connaître ${F('a', 'b')}, pas besoin de connaître a et b. « a = 3k et b = 4k » suffit.</li>
<li><b>Les informations « décor » :</b> « le prix a été fixé pendant les soldes » n'apporte rien de chiffré.</li>
</ul>
<div class="tip"><b>Astuce des deux exemples :</b> quand tu hésites, trouve deux exemples de nombres qui respectent la condition. S'ils donnent deux réponses différentes à la question, la condition ne suffit pas.</div>
<div class="ex"><b>Exemple corrigé</b><span>Quelle est l'aire d'un rectangle ? (1) Son périmètre vaut 20 cm. (2) Sa diagonale vaut ${SQ(52)} cm.</span><span>(1) seule : 1 × 9 ou 4 × 6 → aires différentes, ne suffit pas. (2) seule : non plus.</span><span>Ensemble : a + b = 10 et a² + b² = 52. Or (a + b)² = a² + b² + 2ab, donc 100 = 52 + 2ab → ab = 24. Réponse <b>C</b>.</span></div>`,
});

/* Tire d'abord une lettre (A à E) au hasard, puis une variante qui donne cette lettre */
function cmPick(R, variants) {
  const letters = [...new Set(variants.map((v) => v[0]))];
  const L0 = R.pick(letters);
  return R.pick(variants.filter((v) => v[0] === L0));
}
function cmQ(q, s1, s2, letter, why1, why2, whyBoth, tip) {
  const ans = CM_LETTER[letter];
  const parts = [`<b>(1) seule :</b> ${why1}`, `<b>(2) seule :</b> ${why2}`];
  if (whyBoth) parts.push(`<b>Ensemble :</b> ${whyBoth}`);
  return { q: P(q), stmts: [s1, s2], choices: CM_CHOICES.slice(), answer: ans, cm: true, expl: steps(...parts) + res(`${letter} — ${CM_CHOICES[ans]}`), tip: tip || '' };
}
const OK = '<b>suffit</b>', KO = '<b>ne suffit pas</b>';

gen('cm.lin', { sub: 'cm', ch: 'cm-methode', name: 'Valeur d\'une inconnue', target: 75 }, (R, d) => {
  const x = R.int(2, 15), y = R.int(1, 12), a = R.int(2, 7), b = R.int(1, 20);
  const v = cmPick(R, d === 1 ? ['C', 'A', 'B', 'D'] : ['C', 'A', 'B', 'D', 'E', 'Csq']);
  const Q = 'Quelle est la valeur de x ?';
  if (v === 'C') return cmQ(Q, `x + y = ${x + y}`, `x ${MINUS} y = ${x - y}`, 'C', `une équation à deux inconnues a une infinité de solutions : ${KO}.`, `même problème : ${KO}.`, `en additionnant, 2x = ${2 * x}, donc x = ${x} : ça ${OK}.`);
  if (v === 'A') return cmQ(Q, `${a}x + ${b} = ${a * x + b}`, `x + y = ${x + y}`, 'A', `${a}x = ${a * x}, donc x = ${x} : ${OK}.`, `y est inconnu : ${KO}.`);
  if (v === 'B') return cmQ(Q, `x + y = ${x + y}`, `${a}x ${MINUS} ${b} = ${a * x - b}`, 'B', `deux inconnues, une équation : ${KO}.`, `${a}x = ${a * x}, donc x = ${x} : ${OK}.`);
  if (v === 'D') return cmQ(Q, `${a}x ${MINUS} ${b} = ${a * x - b}`, `${F('x', a)} = ${fmt(x / a)}`, 'D', `x = ${x} : ${OK}.`, `x = ${fmt(x / a)} ${X} ${a} = ${x} : ${OK}.`);
  if (v === 'E') return cmQ(Q, `x + y = ${x + y}`, `${a}x + ${a}y = ${a * (x + y)}`, 'E', `${KO}.`, `c'est la même équation multipliée par ${a} : ${KO}.`, `toujours une seule vraie équation pour deux inconnues : ${KO}.`, '<b>Piège :</b> deux conditions qui disent la même chose ne font qu\'une seule information.');
  return cmQ(Q, `x² = ${x * x}`, `x &lt; 0`, 'C', `x = ${x} ou x = ${MINUS}${x} : ${KO}.`, `infinité de nombres négatifs : ${KO}.`, `x = ${MINUS}${x} : ça ${OK}.`, '<b>Piège :</b> un carré a toujours deux racines possibles, positive et négative.');
});
gen('cm.parite', { sub: 'cm', ch: 'cm-methode', name: 'Parité (questions oui/non)', target: 70, diffs: [2, 3] }, (R) => {
  const v = cmPick(R, ['D', 'A', 'B', 'E', 'C']);
  const Q = 'n est un entier. n est-il pair ?';
  if (v === 'D') return cmQ(Q, 'n + 1 est impair.', '3n est pair.', 'D', `n + 1 impair ⇒ n pair : ${OK}.`, `3 est impair, donc 3n pair ⇒ n pair : ${OK}.`);
  if (v === 'A') return cmQ(Q, 'n² est pair.', 'n est un multiple de 3.', 'A', `si n était impair, n² serait impair ; donc n est pair : ${OK}.`, `3 (impair) et 6 (pair) sont des multiples de 3 : ${KO}.`);
  if (v === 'B') return cmQ(Q, '2n est pair.', 'n + 3 est impair.', 'B', `2n est pair pour TOUT entier n : ${KO}.`, `n + 3 impair ⇒ n pair : ${OK}.`, null, '<b>Piège :</b> une condition toujours vraie n\'apporte aucune information.');
  if (v === 'E') return cmQ(Q, 'n est un multiple de 3.', 'n est un multiple de 5.', 'E', `${KO} (3 ou 6).`, `${KO} (5 ou 10).`, `n est un multiple de 15 : 15 est impair, 30 est pair : ${KO}.`);
  return cmQ(Q, 'n est la somme d\'un nombre impair et d\'un entier m.', 'm est impair.', 'C', `tout dépend de m : ${KO}.`, `on ne sait rien de n : ${KO}.`, `impair + impair = pair, donc n est pair : ça ${OK}.`);
});
gen('cm.prix', { sub: 'cm', ch: 'cm-methode', name: 'Prix et pourcentages', target: 70, diffs: [1, 2] }, (R) => {
  const t = R.pick([10, 20, 25, 50]), P0 = R.int(2, 20) * 20, P1 = P0 * (1 + t / 100);
  const v = cmPick(R, ['D', 'C', 'E', 'A', 'B']);
  const Q = 'Quel était le prix initial de cet article ?';
  if (v === 'D') return cmQ(Q, `Après une hausse de ${pc(t)}, il coûte ${eur(P1)}.`, `La hausse représente ${eur(P1 - P0)}, soit ${pc(t)} du prix initial.`, 'D', `prix initial = ${fmt(P1)} ${DV} ${fmt(1 + t / 100)} = ${eur(P0)} : ${OK}.`, `${pc(t)} du prix = ${fmt(P1 - P0)} €, donc prix = ${eur(P0)} : ${OK}.`);
  if (v === 'C') return cmQ(Q, `Son prix a augmenté de ${pc(t)}.`, `Son nouveau prix est de ${eur(P1)}.`, 'C', `sans aucun montant : ${KO}.`, `sans connaître la hausse : ${KO}.`, `prix initial = ${fmt(P1)} ${DV} ${fmt(1 + t / 100)} = ${eur(P0)} : ça ${OK}.`);
  if (v === 'E') return cmQ(Q, `Son prix a augmenté de ${pc(t)}.`, `Il a ensuite baissé de ${pc(t)}.`, 'E', `${KO}.`, `${KO}.`, `on connaît l'évolution globale (${sgnPc(round(((1 + t / 100) * (1 - t / 100) - 1) * 100, 2))}) mais aucun montant : ${KO}.`, '<b>Piège :</b> des pourcentages sans aucun montant ne donnent jamais un prix.');
  if (v === 'A') return cmQ(Q, `Après une remise de ${pc(t)}, l'article coûte ${eur(P0 * (1 - t / 100))}.`, 'La remise a été accordée pendant les soldes.', 'A', `prix = ${fmt(P0 * (1 - t / 100))} ${DV} ${fmt(1 - t / 100)} = ${eur(P0)} : ${OK}.`, `information sans chiffre : ${KO}.`);
  return cmQ(Q, `Le prix a augmenté de ${eur(P1 - P0)}.`, `${eur(P1 - P0)} représentent ${pc(t)} du prix initial.`, 'B', `on ne sait pas ce que représentent ces ${fmt(P1 - P0)} € : ${KO}.`, `${pc(t)} du prix = ${fmt(P1 - P0)} € → prix = ${eur(P0)} : ${OK}.`);
});
gen('cm.rect', { sub: 'cm', ch: 'cm-methode', name: 'Géométrie : aire d\'un rectangle', target: 80, diffs: [2, 3] }, (R) => {
  const [a, b, c] = R.pick([[6, 8, 10], [5, 12, 13], [8, 15, 17], [3, 4, 5], [9, 12, 15]]);
  const v = cmPick(R, ['C', 'C2', 'E', 'A', 'D', 'B']);
  const Q = 'Quelle est l\'aire de ce rectangle ?';
  if (v === 'C') return cmQ(Q, `Son périmètre vaut ${2 * (a + b)} cm.`, `Sa diagonale mesure ${c} cm.`, 'C', `plusieurs rectangles ont ce périmètre : ${KO}.`, `${KO}.`, `L + l = ${a + b} et L² + l² = ${c * c}. Comme (L + l)² = L² + l² + 2Ll, on obtient 2Ll = ${(a + b) ** 2 - c * c}, donc l'aire Ll = ${a * b} : ça ${OK}.`, '<b>Astuce :</b> pas besoin de trouver L et l séparément.');
  if (v === 'C2') { const l = R.int(2, 9), k = R.int(2, 3); return cmQ(Q, `Sa longueur vaut ${k} fois sa largeur.`, `Son périmètre vaut ${2 * (k + 1) * l} cm.`, 'C', `${KO} (aucune longueur connue).`, `${KO}.`, `${2 * (k + 1)}l = ${2 * (k + 1) * l} → l = ${l}, L = ${k * l}, aire ${k * l * l} cm² : ça ${OK}.`); }
  if (v === 'E') return cmQ(Q, `Son périmètre vaut ${2 * (a + b)} cm.`, 'Sa longueur est supérieure à sa largeur.', 'E', `${KO}.`, `${KO}.`, `par exemple ${a + b - 1} × 1 ou ${b} × ${a} : aires différentes, ${KO}.`);
  if (v === 'A') return cmQ(Q, `Sa longueur mesure ${b} cm et sa diagonale ${c} cm.`, `Son périmètre est supérieur à 10 cm.`, 'A', `largeur = ${SQ(`${c}² ${MINUS} ${b}²`)} = ${a} cm, aire ${a * b} cm² : ${OK}.`, `${KO}.`);
  if (v === 'D') { const s = R.int(3, 9); return cmQ(Q, `C'est un carré de périmètre ${4 * s} cm.`, `C'est un carré dont la diagonale mesure ${s}${SQ(2)} cm.`, 'D', `côté ${s} cm : ${OK}.`, `côté = diagonale ${DV} ${SQ(2)} = ${s} cm : ${OK}.`); }
  const l = R.int(3, 9), e = R.int(1, 5);
  return cmQ(Q, 'Sa longueur est le double de sa largeur.', `Sa largeur mesure ${l} cm et sa longueur ${e} cm de plus.`, 'B', `aucune mesure : ${KO}.`, `${l} × ${l + e} : ${OK}.`);
});
gen('cm.moy', { sub: 'cm', ch: 'cm-methode', name: 'Moyennes', target: 75, diffs: [2, 3] }, (R) => {
  const n = R.int(12, 30), avg = R.int(9, 15);
  const v = cmPick(R, ['C', 'C2', 'E', 'D', 'A', 'B']);
  const Q = 'Quelle est la moyenne de cette classe au dernier devoir ?';
  if (v === 'B') return cmQ(Q, `La moitié des élèves a eu plus de ${avg}.`, `Les ${n} élèves ont totalisé ${n * avg} points.`, 'B', `${KO}.`, `${n * avg} ${DV} ${n} = ${avg} : ${OK}.`);
  if (v === 'C') return cmQ(Q, `La somme de toutes les notes vaut ${n * avg}.`, `La classe compte ${n} élèves.`, 'C', `${KO} (combien d'élèves ?).`, `${KO}.`, `${n * avg} ${DV} ${n} = ${avg} : ça ${OK}.`);
  if (v === 'C2') return cmQ(Q, 'Les filles ont 14 de moyenne et les garçons 11.', 'Il y a deux fois plus de filles que de garçons.', 'C', `${KO} (tout dépend des effectifs).`, `${KO}.`, `sur 3 élèves, 2 filles et 1 garçon : (2 × 14 + 11) ÷ 3 = 13. Pas besoin des effectifs exacts : ça ${OK}.`, '<b>Astuce :</b> une proportion suffit pour une moyenne pondérée.');
  if (v === 'E') return cmQ(Q, 'Les filles ont 14 de moyenne et les garçons 11.', `La classe compte ${n} élèves.`, 'E', `${KO}.`, `${KO}.`, `on ne sait pas combien il y a de filles : ${KO}.`);
  if (v === 'D') return cmQ(Q, `Les ${n} élèves ont totalisé ${n * avg} points.`, `Si un élève supplémentaire avait eu ${avg}, la moyenne n'aurait pas changé.`, 'D', `${n * avg} ${DV} ${n} = ${avg} : ${OK}.`, `ajouter une note égale à la moyenne ne la change pas, et c'est le seul cas : la moyenne vaut ${avg}, ${OK}.`);
  return cmQ(Q, `Les ${n} élèves ont totalisé ${n * avg} points.`, `La moitié des élèves a eu plus de ${avg}.`, 'A', `${OK}.`, `${KO}.`);
});
gen('cm.age', { sub: 'cm', ch: 'cm-methode', name: 'Âges', target: 70, diffs: [1, 2] }, (R) => {
  const p = R.int(20, 40), m = p - R.int(2, 8);
  const v = cmPick(R, ['A', 'C', 'E', 'B', 'D']);
  const Q = 'Quel âge a Paul ?';
  if (v === 'D') { const dad = p + R.int(24, 34), k = R.int(3, 12); return cmQ(Q, `Paul a ${dad - p} ans de moins que son père, qui a ${dad} ans.`, `Dans ${k} ans, Paul aura ${p + k} ans.`, 'D', `${dad} ${MINUS} ${dad - p} = ${p} : ${OK}.`, `${p + k} ${MINUS} ${k} = ${p} : ${OK}.`); }
  if (v === 'A') {
    const back = R.int(5, 12), fwd = p - 2 * back;
    if (fwd > 0) return cmQ(Q, `Dans ${fwd} ans, Paul aura le double de l'âge qu'il avait il y a ${back} ans.`, 'Paul est plus âgé que Marie.', 'A', `p + ${fwd} = 2(p ${MINUS} ${back}) → p = ${fwd} + ${2 * back} = ${p} : ${OK}.`, `${KO}.`);
  }
  if (v === 'C') return cmQ(Q, `Paul a ${p - m} ans de plus que Marie.`, `La somme de leurs âges vaut ${p + m}.`, 'C', `${KO}.`, `${KO}.`, `p ${MINUS} m = ${p - m} et p + m = ${p + m} → 2p = ${2 * p}, p = ${p} : ça ${OK}.`);
  if (v === 'E') return cmQ(Q, `Paul a ${p - m} ans de plus que Marie.`, `Dans 3 ans, Paul aura toujours ${p - m} ans de plus que Marie.`, 'E', `${KO}.`, `c'est la même information (l'écart d'âge ne change jamais) : ${KO}.`, `${KO}.`, '<b>Piège :</b> l\'écart d\'âge entre deux personnes est constant.');
  const ago = R.int(3, 10);
  return cmQ(Q, `Paul et Marie ont ensemble ${p + m} ans.`, `Il y a ${ago} ans, Paul avait ${p - ago} ans.`, 'B', `${KO}.`, `p = ${p - ago} + ${ago} = ${p} : ${OK}.`);
});
gen('cm.ineq', { sub: 'cm', ch: 'cm-methode', name: 'Inégalités : x > y ?', target: 80, diffs: [2, 3] }, (R) => {
  const v = cmPick(R, ['A', 'C', 'C2', 'E', 'D', 'B']);
  const Q = 'x et y sont des nombres réels. A-t-on x &gt; y ?';
  if (v === 'A') return cmQ(Q, 'x ' + MINUS + ' y &gt; 0', 'x &gt; 0', 'A', `x ${MINUS} y &gt; 0 ⇔ x &gt; y : ${OK}.`, `on ne sait rien de y : ${KO}.`);
  if (v === 'C') return cmQ(Q, 'x² &gt; y²', 'x &gt; 0 et y &gt; 0', 'C', `x = ${MINUS}3, y = 1 : x² &gt; y² mais x &lt; y ; x = 3, y = 1 : x &gt; y. ${KO}.`, `${KO}.`, `pour des nombres positifs, x² &gt; y² ⇔ x &gt; y : ça ${OK}.`, '<b>Astuce des deux exemples :</b> un exemple avec des négatifs casse souvent la condition.');
  if (v === 'C2') return cmQ(Q, `${F('x', 'y')} &gt; 1`, 'y &gt; 0', 'C', `si y &lt; 0, x/y &gt; 1 donne x &lt; y (ex. x = ${MINUS}4, y = ${MINUS}2) : ${KO}.`, `${KO}.`, `y &gt; 0, on multiplie par y sans changer le sens : x &gt; y, ça ${OK}.`);
  if (v === 'E') return cmQ(Q, 'x &gt; 0', 'y &lt; 10', 'E', `${KO}.`, `${KO}.`, `x = 1, y = 5 ou x = 20, y = 5 : ${KO}.`);
  if (v === 'D') return cmQ(Q, 'x = y + 2', 'x ' + MINUS + ' 3 &gt; y', 'D', `x vaut y + 2, donc x &gt; y : ${OK}.`, `x &gt; y + 3 &gt; y : ${OK}.`);
  return cmQ(Q, 'x + y &gt; 0', 'y ' + MINUS + ' x &lt; 0', 'B', `x = 1, y = 5 : non ; x = 5, y = 1 : oui. ${KO}.`, `y ${MINUS} x &lt; 0 ⇔ y &lt; x : ${OK}.`);
});
gen('cm.vit', { sub: 'cm', ch: 'cm-methode', name: 'Vitesses et distances', target: 75 }, (R, d) => {
  const v0 = R.pick([60, 80, 90, 100, 120]), t0 = R.pick([1.5, 2, 2.5, 3]);
  const v = cmPick(R, d === 1 ? ['C', 'D'] : ['C', 'A', 'E', 'D', 'B']);
  const Q = 'Quelle est la distance entre les villes A et B ?';
  if (v === 'B') { const [a, b, dd] = R.pick([[60, 90, 180], [40, 60, 120], [80, 120, 240], [50, 75, 150]]); return cmQ(Q, 'Le trajet dure moins de 3 heures en voiture.', `À ${a} km/h, le trajet dure 1 h de plus qu'à ${b} km/h.`, 'B', `${KO}.`, `${F('d', a)} ${MINUS} ${F('d', b)} = 1 donne une seule valeur, d = ${dd} km : ${OK}.`); }
  if (v === 'C') return cmQ(Q, `Un train relie A à B en ${hm(t0)}.`, `Ce train roule à ${unit(v0, 'km/h')} de moyenne.`, 'C', `${KO} (vitesse inconnue).`, `${KO} (durée inconnue).`, `d = ${v0} ${X} ${fmt(t0)} = ${fmt(v0 * t0)} km : ça ${OK}.`);
  if (v === 'A') { const [a, b, dd] = R.pick([[60, 90, 180], [40, 60, 120], [80, 120, 240], [50, 75, 150]]); return cmQ(Q, `À ${a} km/h, le trajet dure 1 h de plus qu'à ${b} km/h.`, 'Le trajet dure moins de 3 heures en voiture.', 'A', `${F('d', a)} ${MINUS} ${F('d', b)} = 1 donne une seule valeur, d = ${dd} km : ${OK}.`, `${KO}.`, null, '<b>Rappel :</b> une équation à une inconnue suffit, inutile de la résoudre.'); }
  if (v === 'E') return cmQ(Q, `Une voiture fait le trajet à ${unit(v0, 'km/h')}.`, 'Un camion met 30 minutes de plus que la voiture.', 'E', `${KO}.`, `${KO}.`, `il manque la vitesse du camion (ou une durée) : ${KO}.`);
  const dd = v0 * t0, v2 = v0 * 1.5;
  return cmQ(Q, `À ${unit(v0, 'km/h')}, le trajet dure ${hm(t0)}.`, `À ${unit(v2, 'km/h')}, le trajet dure ${hm(dd / v2)}.`, 'D', `d = ${fmt(dd)} km : ${OK}.`, `d = ${fmt(v2)} ${X} ${fmt(round(dd / v2, 4))} = ${fmt(dd)} km : ${OK}.`);
});
gen('cm.div', { sub: 'cm', ch: 'cm-methode', name: 'Divisibilité', target: 65, diffs: [1, 2] }, (R) => {
  const v = cmPick(R, ['C', 'A', 'E', 'B', 'D']);
  const Q = 'n est un entier positif. n est-il divisible par 6 ?';
  if (v === 'C') return cmQ(Q, 'n est divisible par 3.', 'n est pair.', 'C', `3 ou 6 : ${KO}.`, `2 ou 6 : ${KO}.`, `divisible par 2 et par 3 ⇔ divisible par 6 : ça ${OK}.`);
  if (v === 'A') return cmQ(Q, 'n est divisible par 12.', 'n est divisible par 4.', 'A', `12 = 6 × 2, donc oui : ${OK}.`, `4 (non) ou 12 (oui) : ${KO}.`);
  if (v === 'E') return cmQ(Q, 'n est divisible par 2.', 'n est divisible par 4.', 'E', `${KO}.`, `${KO}.`, `n = 4 (non) ou n = 12 (oui) : ${KO}.`);
  if (v === 'B') return cmQ(Q, 'n est divisible par 3.', 'n est divisible par 18.', 'B', `${KO}.`, `18 = 6 × 3 : ${OK}.`);
  return cmQ(Q, 'n est divisible par 30.', 'n est divisible par 42.', 'D', `30 = 6 × 5 : ${OK}.`, `42 = 6 × 7 : ${OK}.`);
});
gen('cm.effectif', { sub: 'cm', ch: 'cm-methode', name: 'Effectifs et proportions', target: 70, diffs: [1, 2] }, (R) => {
  const T = R.pick([20, 25, 30, 40, 50]), pf = R.pick([20, 40, 60]), f = T * pf / 100, g = T - f;
  const v = cmPick(R, ['C', 'C2', 'E', 'A', 'B', 'D']);
  const Q = 'Combien d\'élèves compte cette classe ?';
  if (v === 'B') { const k = R.int(2, 6); return cmQ(Q, 'Il y a plus de filles que de garçons.', `Si ${k} élèves partaient, il en resterait ${T - k}.`, 'B', `${KO}.`, `${T - k} + ${k} = ${T} : ${OK}.`); }
  if (v === 'D') { const k = R.int(2, 6); return cmQ(Q, `Si ${k} élèves partaient, il en resterait ${T - k}.`, `Les ${f} filles représentent ${pc(pf)} de la classe.`, 'D', `${T - k} + ${k} = ${T} : ${OK}.`, `${f} ${DV} ${fmt(pf / 100)} = ${T} : ${OK}.`); }
  if (v === 'C') return cmQ(Q, `Il y a ${f} filles.`, `Les filles représentent ${pc(pf)} de la classe.`, 'C', `${KO}.`, `${KO}.`, `${f} ${DV} ${fmt(pf / 100)} = ${T} : ça ${OK}.`);
  if (v === 'C2' && g !== f) { const dlt = Math.abs(g - f); return cmQ(Q, `Il y a ${dlt} ${g > f ? 'garçons de plus que de filles' : 'filles de plus que de garçons'}.`, `Les garçons représentent ${pc(100 - pf)} de la classe.`, 'C', `${KO}.`, `${KO}.`, `l'écart de ${dlt} élèves représente ${pc(Math.abs(100 - 2 * pf))} de la classe → ${dlt} ${DV} ${fmt(Math.abs(100 - 2 * pf) / 100)} = ${T} : ça ${OK}.`); }
  if (v === 'E') return cmQ(Q, `Les filles représentent ${pc(pf)} de la classe.`, `Les garçons représentent ${pc(100 - pf)} de la classe.`, 'E', `${KO}.`, `c'est la même information : ${KO}.`, `aucun nombre d'élèves : ${KO}.`);
  const k = R.int(2, 6);
  return cmQ(Q, `Si ${k} élèves partaient, il en resterait ${T - k}.`, 'Il y a plus de filles que de garçons.', 'A', `${T - k} + ${k} = ${T} : ${OK}.`, `${KO}.`);
});
gen('cm.tri', { sub: 'cm', ch: 'cm-methode', name: 'Triangles', target: 75, diffs: [2, 3] }, (R) => {
  const v = cmPick(R, ['C', 'A', 'D', 'E', 'B']);
  const Q = 'Le triangle ABC est-il rectangle ?';
  const [a, b, c] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
  if (v === 'B') return cmQ(Q, `AB = ${c} cm.`, 'Les angles  et B̂ mesurent 40° et 50°.', 'B', `${KO}.`, `Ĉ = 180 ${MINUS} 40 ${MINUS} 50 = 90° : ${OK}.`);
  if (v === 'C') return cmQ(Q, `AB = ${a} cm et BC = ${b} cm.`, `AC = ${c} cm.`, 'C', `le 3e côté est inconnu : ${KO}.`, `${KO}.`, `${a}² + ${b}² = ${a * a + b * b} = ${c}² : rectangle en B (réciproque de Pythagore), ça ${OK}.`);
  if (v === 'A') return cmQ(Q, 'Les angles  et B̂ mesurent 35° et 55°.', `AB = ${c} cm.`, 'A', `Ĉ = 180 ${MINUS} 35 ${MINUS} 55 = 90° : ${OK}.`, `${KO}.`);
  if (v === 'D') return cmQ(Q, ' + B̂ = 90°', 'AB² = AC² + BC²', 'D', `Ĉ = 180 ${MINUS} 90 = 90° : ${OK}.`, `réciproque de Pythagore : rectangle en C, ${OK}.`);
  return cmQ(Q, `AB = ${a} cm.`, `BC = ${b} cm.`, 'E', `${KO}.`, `${KO}.`, `sans le 3e côté ni aucun angle : ${KO}.`);
});
gen('cm.travail', { sub: 'cm', ch: 'cm-methode', name: 'Travail en commun', target: 75, diffs: [2, 3] }, (R) => {
  const [a, b, t] = R.pick([[6, 12, 4], [3, 6, 2], [10, 15, 6], [4, 12, 3], [12, 24, 8]]);
  const v = cmPick(R, ['C', 'E', 'A', 'B', 'D']);
  const Q = 'Combien de temps faudrait-il à Anna, seule, pour faire ce travail ?';
  const third = a / 3 === Math.round(a / 3);
  const anna = `En ${third ? a / 3 : 1} h, Anna fait ${third ? 'le tiers' : F(1, a)} du travail.`;
  if (v === 'B') return cmQ(Q, `Bruno, seul, mettrait ${b} h.`, anna, 'B', `on ne sait rien du rythme d'Anna : ${KO}.`, `Anna travaille à rythme constant : ${a} h, ${OK}.`);
  if (v === 'D') return cmQ(Q, `Anna et Bruno mettent ${t} h ensemble, et Bruno seul mettrait ${b} h.`, anna, 'D', `${F(1, t)} ${MINUS} ${F(1, b)} = ${F(1, a)} par heure, donc ${a} h : ${OK}.`, `${a} h : ${OK}.`);
  if (v === 'C') return cmQ(Q, `Anna et Bruno, ensemble, mettent ${t} h.`, `Bruno, seul, mettrait ${b} h.`, 'C', `${KO}.`, `${KO}.`, `Anna : ${F(1, t)} ${MINUS} ${F(1, b)} = ${F(1, a)} du travail par heure, donc ${a} h : ça ${OK}.`);
  if (v === 'E') return cmQ(Q, `Anna et Bruno, ensemble, mettent ${t} h.`, 'Bruno travaille plus vite qu\'Anna.', 'E', `${KO}.`, `${KO}.`, `une inégalité ne donne pas le rythme de Bruno : ${KO}.`);
  return cmQ(Q, `En ${a / 3 === Math.round(a / 3) ? a / 3 : 1} h, Anna fait ${a / 3 === Math.round(a / 3) ? 'le tiers' : `${F(1, a)}`} du travail.`, `Bruno, seul, mettrait ${b} h.`, 'A', `Anna travaille à rythme constant : ${a} h, ${OK}.`, `on ne connaît rien du rythme d'Anna : ${KO}.`);
});
gen('cm.ratio', { sub: 'cm', ch: 'cm-methode', name: 'Rapports et proportions', target: 70, diffs: [2, 3] }, (R) => {
  const p = R.int(2, 5), q = R.intNot(2, 7, [p]);
  const v = cmPick(R, ['A', 'D', 'C', 'E', 'B']);
  const Q = `a et b sont deux nombres non nuls. Quelle est la valeur de ${F('a', 'b')} ?`;
  if (v === 'A') return cmQ(Q, `a = ${p}k et b = ${q}k, où k est un nombre non nul.`, `a + b = ${(p + q) * R.int(1, 4)}`, 'A', `${F('a', 'b')} = ${F(p + 'k', q + 'k')} = ${F(p, q)} quel que soit k : ${OK}.`, `${KO}.`, null, '<b>Piège :</b> on n\'a pas besoin de connaître k pour obtenir le rapport.');
  if (v === 'D') return cmQ(Q, `${q}a = ${p}b`, `${2 * q}a ${MINUS} ${2 * p}b = 0`, 'D', `${F('a', 'b')} = ${F(p, q)} : ${OK}.`, `même relation multipliée par 2 : ${OK}.`, null, '<b>Attention :</b> ici, deux conditions équivalentes suffisent CHACUNE (réponse D, pas E).');
  if (v === 'C') { const k = R.int(1, 5); const A = p * k, B = q * k; return cmQ(Q, `a ${MINUS} b = ${A - B}`, `a + b = ${A + B}`, 'C', `${KO}.`, `${KO}.`, `a = ${A} et b = ${B} : ça ${OK}.`); }
  if (v === 'E') return cmQ(Q, 'a &gt; b', `a + b = ${R.int(8, 20)}`, 'E', `${KO}.`, `${KO}.`, `une infinité de couples possibles : ${KO}.`);
  return cmQ(Q, `a + b = ${(p + 1) * R.int(2, 5)}`, `a = ${p}b`, 'B', `${KO}.`, `${F('a', 'b')} = ${p} : ${OK}.`);
});
gen('cm.venn', { sub: 'cm', ch: 'cm-methode', name: 'Ensembles', target: 75, diffs: [2, 3] }, (R) => {
  const both = R.int(3, 8), onlyF = R.int(5, 15), onlyT = R.int(4, 12), none = R.int(2, 10), F0 = onlyF + both, T0 = onlyT + both, N = onlyF + onlyT + both + none;
  const v = cmPick(R, ['C', 'E', 'C2', 'A', 'B']);
  const Q = 'Combien d\'élèves de cette classe pratiquent à la fois le foot et le tennis ?';
  const full = `La classe compte ${N} élèves : ${F0} font du foot, ${T0} du tennis et ${none} ne font aucun des deux.`, vague = 'Certains élèves pratiquent les deux sports.';
  const why = `au moins un sport : ${N} ${MINUS} ${none} = ${N - none}, donc les deux : ${F0} + ${T0} ${MINUS} ${N - none} = ${both}`;
  if (v === 'A') return cmQ(Q, full, vague, 'A', `${why} : ${OK}.`, `${KO}.`);
  if (v === 'B') return cmQ(Q, vague, full, 'B', `${KO}.`, `${why} : ${OK}.`);
  if (v === 'C') return cmQ(Q, `${N - none} élèves pratiquent au moins l'un des deux sports.`, `${F0} élèves font du foot et ${T0} du tennis.`, 'C', `${KO}.`, `${KO}.`, `${F0} + ${T0} ${MINUS} ${N - none} = ${both} : ça ${OK}.`);
  if (v === 'E') return cmQ(Q, `${F0} élèves font du foot et ${T0} du tennis.`, `La classe compte ${N} élèves.`, 'E', `${KO}.`, `${KO}.`, `il manque le nombre d'élèves qui ne font aucun des deux : ${KO}.`);
  return cmQ(Q, `La classe compte ${N} élèves, dont ${F0} font du foot et ${T0} du tennis.`, `${none} élèves ne pratiquent aucun de ces deux sports.`, 'C', `${KO}.`, `${KO}.`, `au moins un sport : ${N} ${MINUS} ${none} = ${N - none}, donc les deux : ${F0} + ${T0} ${MINUS} ${N - none} = ${both}. Ça ${OK}.`);
});
gen('cm.ent', { sub: 'cm', ch: 'cm-methode', name: 'Trouver un entier', target: 65 }, (R) => {
  const v = cmPick(R, ['C', 'A', 'E', 'B', 'D']);
  const Q = 'Quelle est la valeur de l\'entier n ?';
  if (v === 'D') return cmQ(Q, 'n est un nombre premier pair.', 'n est un entier positif dont le carré vaut 4.', 'D', `le seul nombre premier pair est 2 : ${OK}.`, `n = 2 : ${OK}.`);
  if (v === 'C') return cmQ(Q, 'n est un multiple de 7 compris entre 20 et 40.', 'n est pair.', 'C', `21, 28 ou 35 : ${KO}.`, `${KO}.`, `seul 28 est pair : ça ${OK}.`);
  if (v === 'A') return cmQ(Q, 'n est un nombre premier compris entre 24 et 30.', 'n est impair.', 'A', `seul 29 convient : ${OK}.`, `${KO}.`);
  if (v === 'E') return cmQ(Q, 'n est un multiple de 5 compris entre 10 et 40.', 'n est impair.', 'E', `${KO}.`, `${KO}.`, `15, 25 ou 35 : ${KO}.`);
  return cmQ(Q, 'n est impair.', 'n est le carré d\'un entier et 40 &lt; n &lt; 60.', 'B', `${KO}.`, `seul 49 = 7² convient : ${OK}.`);
});
gen('cm.suite', { sub: 'cm', ch: 'cm-methode', name: 'Suites', target: 70, diffs: [2, 3] }, (R) => {
  const u1 = R.int(1, 12), r = R.int(2, 9), u = (k) => u1 + (k - 1) * r;
  const v = cmPick(R, ['C', 'A', 'B', 'D', 'E']);
  const Q = 'On considère une suite arithmétique (on ajoute toujours le même nombre). Quel est son 10e terme ?';
  const both = `u<sub>10</sub> = ${u1} + 9 ${X} ${r} = ${u(10)}`;
  if (v === 'C') return cmQ(Q, `Son premier terme vaut ${u1}.`, `On ajoute ${r} à chaque étape.`, 'C', `la raison est inconnue : ${KO}.`, `le point de départ est inconnu : ${KO}.`, `${both} : ça ${OK}.`);
  const two = `Son 2e terme vaut ${u(2)} et son 5e terme vaut ${u(5)}.`, two2 = `de u<sub>2</sub> à u<sub>5</sub>, on ajoute 3 fois la raison : r = (${u(5)} ${MINUS} ${u(2)}) ${DV} 3 = ${r}, donc u<sub>1</sub> = ${u1} et ${both}`;
  if (v === 'A') return cmQ(Q, two, 'Tous ses termes sont positifs.', 'A', `${two2} : ${OK}.`, `${KO}.`);
  if (v === 'B') return cmQ(Q, 'Tous ses termes sont positifs.', two, 'B', `${KO}.`, `${two2} : ${OK}.`);
  if (v === 'D') return cmQ(Q, `Son 1er terme vaut ${u1} et son 4e vaut ${u(4)}.`, `Son 3e terme vaut ${u(3)} et on ajoute ${r} à chaque étape.`, 'D', `r = (${u(4)} ${MINUS} ${u1}) ${DV} 3 = ${r} : ${OK}.`, `on remonte à u<sub>1</sub> = ${u1} : ${OK}.`);
  return cmQ(Q, `On ajoute ${r} à chaque étape.`, 'Tous ses termes sont positifs.', 'E', `${KO}.`, `${KO}.`, `le premier terme reste inconnu : ${KO}.`);
});
gen('cm.benef', { sub: 'cm', ch: 'cm-methode', name: 'Chiffre d\'affaires et bénéfice', target: 70, diffs: [1, 2] }, (R) => {
  const q = R.int(5, 30) * 20, mu = R.pick([5, 8, 10, 12, 15]), CF = Math.max(100, Math.round(q * mu * R.pick([0.3, 0.4, 0.5, 0.6]) / 100) * 100), cv = R.pick([10, 12, 15, 20]);
  const pv = cv + mu, CA = q * pv, ben = q * mu - CF, CT = CA - ben;
  const v = cmPick(R, ['C', 'A', 'B', 'E', 'D']);
  const Q = 'Quel bénéfice l\'entreprise a-t-elle réalisé ce mois-ci ?';
  const full = `Elle a vendu ${fmt(q)} unités, chacune lui rapportant ${mu} € de marge, et ses coûts fixes sont de ${fmt(CF)} €.`;
  if (v === 'C') return cmQ(Q, `Son chiffre d'affaires est de ${fmt(CA)} €.`, `Ses coûts totaux s'élèvent à ${fmt(CT)} €.`, 'C', `${KO}.`, `${KO}.`, `bénéfice = ${fmt(CA)} ${MINUS} ${fmt(CT)} = ${fmt(ben)} € : ça ${OK}.`);
  if (v === 'A') return cmQ(Q, full, 'Son chiffre d\'affaires a augmenté de 10 % par rapport au mois précédent.', 'A', `${fmt(q)} ${X} ${mu} ${MINUS} ${fmt(CF)} = ${fmt(ben)} € : ${OK}.`, `${KO}.`);
  if (v === 'B') return cmQ(Q, 'Son chiffre d\'affaires a augmenté de 10 % par rapport au mois précédent.', full, 'B', `${KO}.`, `${fmt(q)} ${X} ${mu} ${MINUS} ${fmt(CF)} = ${fmt(ben)} € : ${OK}.`);
  if (v === 'E') return cmQ(Q, `Son chiffre d'affaires est de ${fmt(CA)} €.`, `Ses coûts fixes sont de ${fmt(CF)} €.`, 'E', `${KO}.`, `${KO}.`, `il manque les coûts variables : ${KO}.`);
  return cmQ(Q, `Ses coûts totaux s'élèvent à ${fmt(CT)} € pour un chiffre d'affaires de ${fmt(CA)} €.`, full, 'D', `${fmt(CA)} ${MINUS} ${fmt(CT)} = ${fmt(ben)} € : ${OK}.`, `${fmt(q)} ${X} ${mu} ${MINUS} ${fmt(CF)} = ${fmt(ben)} € : ${OK}.`);
});

/* ---- 50-logique.js ---- */
/* ===== LOGIQUE : suites, dominos, cartes, grilles, figures, horloges ===== */
chapter({
  id: 'log-suites', sub: 'logique', order: 1, title: 'Suites de nombres et de lettres', short: 'Suites',
  lesson: `
<p>Le sous-test de Logique te présente des séries : il faut trouver l'élément manquant. 15 questions en 20 minutes : l'enjeu est de <b>reconnaître les schémas</b> très vite.</p>
<h3><span class="hl">1. Le réflexe des écarts</span></h3>
<p>Écris l'écart entre deux termes consécutifs. Si ce n'est pas constant, écris les écarts des écarts.</p>
<div class="ex"><b>Exemple</b><span>3, 5, 9, 15, 23, ? → écarts +2, +4, +6, +8 → le prochain est +10 → <b>33</b>.</span></div>
<h3><span class="hl">2. Les schémas qui reviennent</span></h3>
<div class="tablewrap"><table>
<tr><th>Schéma</th><th>Exemple</th></tr>
<tr><td>Écart constant</td><td>7, 11, 15, 19 → +4</td></tr>
<tr><td>Multiplication constante</td><td>3, 6, 12, 24 → × 2</td></tr>
<tr><td>Écarts qui augmentent</td><td>2, 3, 5, 8, 12 → +1, +2, +3, +4</td></tr>
<tr><td>Deux opérations alternées</td><td>2, 5, 10, 13, 26 → +3, × 2, +3, × 2</td></tr>
<tr><td>Deux suites entrelacées</td><td>1, 20, 3, 18, 5, 16 → une case sur deux</td></tr>
<tr><td>Carrés, cubes</td><td>1, 4, 9, 16, 25 · 2, 5, 10, 17 (n² + 1)</td></tr>
<tr><td>Fibonacci</td><td>2, 3, 5, 8, 13 → somme des deux précédents</td></tr>
<tr><td>× 2 + 1</td><td>1, 3, 7, 15, 31</td></tr>
<tr><td>Nombres premiers</td><td>7, 11, 13, 17, 19, 23</td></tr>
</table></div>
<div class="tip"><b>Si rien ne marche :</b> regarde une case sur deux. C'est le schéma le plus souvent raté.</div>
<h3><span class="hl">3. Les lettres : pense en nombres</span></h3>
<p>Convertis chaque lettre en son rang : A = 1, B = 2… Z = 26. Repères à connaître : <b>E = 5, J = 10, O = 15, T = 20, Y = 25</b>. Après Z, on revient à A.</p>
<div class="formula">A1 B2 C3 D4 E5 F6 G7 H8 I9 J10 K11 L12 M13<br>N14 O15 P16 Q17 R18 S19 T20 U21 V22 W23 X24 Y25 Z26</div>
<div class="ex"><b>Exemple</b><span>B, E, H, K, ? → 2, 5, 8, 11 → +3 → 14 = <b>N</b>.</span></div>
<p>Entraîne-toi avec la série « Rang des lettres » : elle te fera gagner de précieuses secondes.</p>`,
});
chapter({
  id: 'log-dominos', sub: 'logique', order: 2, title: 'Dominos et cartes', short: 'Dominos & cartes',
  lesson: `
<h3><span class="hl">1. Les dominos</span></h3>
<p>Chaque domino a deux moitiés de <b>0 à 6 points</b>. On analyse <b>séparément</b> la moitié haute et la moitié basse.</p>
<p>Les valeurs tournent en boucle : après 6 vient 0 (on compte « modulo 7 »). Donc 5 + 3 = 1, et 1 − 2 = 6.</p>
<div class="ex"><b>Exemple</b><span>Haut : 1, 2, 3, 4 → +1 → 5. Bas : 5, 3, 1, 6 → −2 à chaque fois (1 − 2 = 6) → 4.</span></div>
<p><b>Autres schémas fréquents :</b></p>
<ul><li>Une moitié reste fixe pendant que l'autre avance.</li><li>Le haut d'un domino reprend le bas du précédent (effet « chaîne »).</li><li>Les écarts s'accélèrent : +1, +2, +3…</li><li>La somme des deux moitiés est constante.</li></ul>
<h3><span class="hl">2. Les cartes</span></h3>
<p><b>Valeur</b> : As = 1, Valet = 11, Dame = 12, Roi = 13, puis on revient à l'As. <b>Couleur</b> : souvent un cycle (♠ ♥ ♦ ♣) ou une alternance rouge / noir.</p>
<div class="tip"><b>Méthode :</b> traite la valeur et la couleur comme deux suites indépendantes, puis élimine les réponses qui ne respectent pas l'une ou l'autre.</div>`,
});
chapter({
  id: 'log-figures', sub: 'logique', order: 3, title: 'Figures, grilles et horloges', short: 'Figures',
  lesson: `
<h3><span class="hl">1. Les figures</span></h3>
<p>Isole chaque caractéristique, une par une :</p>
<ul><li><b>Rotation</b> : de combien de degrés ? Dans quel sens ? (90° = un quart de tour, 45° = un huitième)</li><li><b>Couleur</b> : alternance plein / vide ?</li><li><b>Position</b> d'un petit élément : tourne-t-il d'un coin à l'autre ?</li><li><b>Nombre de côtés</b> : triangle, carré, pentagone…</li></ul>
<div class="tip"><b>Élimination :</b> vérifie une caractéristique à la fois et barre les réponses qui ne la respectent pas. Deux caractéristiques suffisent souvent.</div>
<h3><span class="hl">2. Les grilles de nombres</span></h3>
<p>Cherche une relation qui marche sur <b>chaque ligne</b> (ou chaque colonne) : a + b = c, a × b = c, a − b = c, 2 × (a + b) = c… Vérifie-la sur deux lignes avant de l'appliquer.</p>
<h3><span class="hl">3. Les horloges</h3>
<p>Convertis chaque horloge en heure, puis calcule l'écart en minutes entre deux horloges. Attention : l'écart peut augmenter (+10, +20, +30 min…).</p>`,
});

/* ---------- Rendu SVG ---------- */
const PIPS = { 0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function pipsSVG(n, oy) { return PIPS[n].map((i) => `<circle class="pip" cx="${[12, 23, 34][i % 3]}" cy="${oy + [11, 22, 33][Math.floor(i / 3)]}" r="4.1"/>`).join(''); }
function domSVG(t, b, w = 38) {
  return `<svg class="dom" viewBox="0 0 46 88" width="${w}" height="${Math.round(w * 88 / 46)}" role="img" aria-label="domino ${t} et ${b}"><rect class="face" x="1" y="1" width="44" height="86" rx="7"/><line class="mid" x1="6" y1="44" x2="40" y2="44" stroke-width="1.5"/>${pipsSVG(t, 0)}${pipsSVG(b, 44)}</svg>`;
}
function domQ(w = 38) { return `<svg class="dom qm" viewBox="0 0 46 88" width="${w}" height="${Math.round(w * 88 / 46)}"><rect class="face" x="1" y="1" width="44" height="86" rx="7"/><text x="23" y="52" text-anchor="middle" font-size="24">?</text></svg>`; }
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = { 1: 'A', 11: 'V', 12: 'D', 13: 'R' };
const rankTxt = (v) => RANKS[v] || String(v);
const cardH = (v, s) => `<div class="pcard${s === 1 || s === 2 ? ' red' : ''}" aria-label="${rankTxt(v)} ${SUITS[s]}"><span class="rk">${rankTxt(v)}</span><span class="st">${SUITS[s]}</span></div>`;
const cardQ = '<div class="pcard q">?</div>';
function clockSVG(min, w = 64) {
  const m = ((min % 720) + 720) % 720, h = Math.floor(m / 60), mm = m % 60;
  const ah = (h * 30 + mm * 0.5) * Math.PI / 180, am = mm * 6 * Math.PI / 180;
  let ticks = '';
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180, r1 = i % 3 === 0 ? 22 : 25; ticks += `<line class="tick" x1="${32 + r1 * Math.sin(a)}" y1="${32 - r1 * Math.cos(a)}" x2="${32 + 28 * Math.sin(a)}" y2="${32 - 28 * Math.cos(a)}"/>`; }
  return `<svg class="clk" viewBox="0 0 64 64" width="${w}" height="${w}" role="img" aria-label="horloge"><circle class="face" cx="32" cy="32" r="30"/>${ticks}<line class="h" x1="32" y1="32" x2="${32 + 14 * Math.sin(ah)}" y2="${32 - 14 * Math.cos(ah)}"/><line class="m" x1="32" y1="32" x2="${32 + 22 * Math.sin(am)}" y2="${32 - 22 * Math.cos(am)}"/><circle class="c" cx="32" cy="32" r="2.6"/></svg>`;
}
const clockQ = (w = 64) => `<svg class="dom qm" viewBox="0 0 64 64" width="${w}" height="${w}"><rect class="face" x="2" y="2" width="60" height="60" rx="30"/><text x="32" y="41" text-anchor="middle" font-size="24">?</text></svg>`;
const CORNERS = [[12, 12], [52, 12], [52, 52], [12, 52]];
function figSVG(f, w = 64) {
  let shape;
  if (f.kind === 'arrow') shape = `<path class="shape${f.fill ? ' full' : ''}" d="M32 13 L45 29 L37 29 L37 51 L27 51 L27 29 L19 29 Z" transform="rotate(${f.rot} 32 32)"/>`;
  else { const pts = []; for (let i = 0; i < f.sides; i++) { const a = (-90 + f.rot + i * 360 / f.sides) * Math.PI / 180; pts.push((32 + 17 * Math.cos(a)).toFixed(1) + ',' + (32 + 17 * Math.sin(a)).toFixed(1)); } shape = `<polygon class="shape${f.fill ? ' full' : ''}" points="${pts.join(' ')}"/>`; }
  const dot = f.dot == null ? '' : `<circle class="dotm" cx="${CORNERS[f.dot][0]}" cy="${CORNERS[f.dot][1]}" r="5"/>`;
  return `<svg class="fig" viewBox="0 0 64 64" width="${w}" height="${w}" role="img" aria-label="figure"><rect class="frame" x="1" y="1" width="62" height="62" rx="9"/>${shape}${dot}</svg>`;
}
const figQ = (w = 64) => `<svg class="dom qm" viewBox="0 0 64 64" width="${w}" height="${w}"><rect class="face" x="1" y="1" width="62" height="62" rx="9"/><text x="32" y="41" text-anchor="middle" font-size="24">?</text></svg>`;
const seqRow = (items) => `<div class="seq">${items.join('')}</div>`;
const cell = (x) => `<span class="cell">${x}</span>`;
const cellQ = '<span class="cell q">?</span>';
const sgn = (r) => (r >= 0 ? '+' : MINUS) + Math.abs(r);

/* ---------- Suites de nombres ---------- */
gen('log.num', { sub: 'logique', ch: 'log-suites', name: 'Suites de nombres', target: 60 }, (R, d) => {
  const t = R.pick(d === 1 ? ['arith', 'geom', 'diff'] : d === 2 ? ['diff', 'alt', 'inter', 'sq', 'fib', 'geom'] : ['alt', 'inter', 'x2p1', 'diffgeom', 'prime', 'fib', 'sq']);
  let s = [], rule = '', wrong = [];
  if (t === 'arith') { const r = R.pick([3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15]) * R.sign(), a = r > 0 ? R.int(1, 40) : R.int(90, 140); for (let i = 0; i < 6; i++) s.push(a + i * r); rule = `On ajoute ${fmt(r)} à chaque fois (écart constant ${sgn(r)}).`; wrong = [s[5] + r, s[5] - 1, s[5] + 1, s[4] + 2 * r]; }
  else if (t === 'geom') { const q = d === 1 ? 2 : R.pick([2, 3]), a = R.int(1, 6); for (let i = 0; i < 6; i++) s.push(a * q ** i); rule = `On multiplie par ${q} à chaque fois.`; wrong = [s[4] + 2 * (s[4] - s[3]), s[5] + a, s[5] - a, s[4] * (q + 1)]; }
  else if (t === 'diff') { const d0 = R.int(1, 5), c = R.pick([1, 2, 3]), a = R.int(1, 20); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + d0 + (i - 1) * c); const ds = s.slice(1).map((x, i) => x - s[i]); rule = `Les écarts augmentent de ${c} : ${ds.map(sgn).join(', ')}.`; wrong = [s[4] + ds[3], s[5] + c, s[5] - c, s[5] + 1]; }
  else if (t === 'alt') { const a = R.int(1, 6), p = R.int(2, 7), m = R.pick([2, 3]); s = [a]; for (let i = 1; i < 7; i++) s.push(i % 2 ? s[i - 1] + p : s[i - 1] * m); rule = `On alterne deux opérations : +${p}, puis × ${m}, puis +${p}…`; wrong = [s[5] * m, s[5] + p + 1, s[6] + p, s[6] - p]; s = s.slice(0, 7); }
  else if (t === 'inter') { const a = R.int(1, 10), r1 = R.int(2, 6), b = R.int(30, 60), r2 = -R.int(2, 7); s = []; for (let i = 0; i < 7; i++) s.push(i % 2 === 0 ? a + (i / 2) * r1 : b + ((i - 1) / 2) * r2); rule = `Deux suites entrelacées : les cases impaires font ${sgn(r1)} (${[0, 2, 4, 6].map((i) => s[i]).join(', ')}), les cases paires font ${sgn(r2)}.`; wrong = [s[5] + r2, s[4] + r1 + 1, s[6] + r1, s[6] - 1]; }
  else if (t === 'sq') { const st = R.int(1, 6), k = d === 2 ? R.pick([0, 1, -1]) : R.pick([2, -2, 3]); for (let i = 0; i < 6; i++) s.push((st + i) ** 2 + k); rule = `Carrés${k ? ` ${k > 0 ? '+' : MINUS} ${Math.abs(k)}` : ''} : ${[0, 1, 2].map((i) => `${st + i}²${k ? (k > 0 ? '+' : MINUS) + Math.abs(k) : ''}`).join(', ')}…`; wrong = [s[5] + 2, s[4] + (s[4] - s[3]), (st + 5) ** 2, s[5] + 1]; }
  else if (t === 'fib') { const a = R.int(1, 5), b = R.int(a, 8); s = [a, b]; for (let i = 2; i < 7; i++) s.push(s[i - 1] + s[i - 2]); rule = 'Chaque terme est la somme des deux précédents.'; wrong = [s[5] + (s[5] - s[4]), s[6] + 1, s[6] - 1, s[5] * 2]; s = s.slice(0, 7); }
  else if (t === 'x2p1') { const m = R.pick([2, 3]), c = m === 2 ? R.pick([1, -1, 2]) : R.pick([-1, 1]), a = R.int(1, 4); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] * m + c); rule = `On multiplie par ${m} puis on ${c > 0 ? 'ajoute' : 'retire'} ${Math.abs(c)}.`; wrong = [s[5] + 2, s[4] * m, s[5] - 2, s[4] * m + 2 * c]; }
  else if (t === 'diffgeom') { const d0 = R.int(1, 3), a = R.int(1, 10); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + d0 * 2 ** (i - 1)); rule = `Les écarts doublent : ${s.slice(1).map((x, i) => sgn(x - s[i])).join(', ')}.`; wrong = [s[4] + 2 * (s[4] - s[3]) + 1, s[5] + d0, s[5] - 2, s[4] + 3 * (s[4] - s[3])]; }
  else { const pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]; const st = R.int(0, 9); s = pr.slice(st, st + 6); rule = 'Ce sont les nombres premiers successifs.'; wrong = [s[5] + 2, s[5] - 2, s[5] + 4, s[5] + 1].filter((x) => !isPrime(x)); }
  let h = s.length - 1;
  if (d === 3 && R.chance(0.35)) h = R.int(2, s.length - 2);
  const ans = s[h];
  const ex = steps(rule, `L'élément manquant est donc ${fmt(ans)}.`);
  if (h !== s.length - 1) wrong = [ans + 1, ans - 1, ans + 2, ans - 3];
  const m = mcq(R, ans, wrong, { positive: false, valid: Number.isInteger });
  return { q: P('Quel nombre remplace le point d\'interrogation ?'), visual: seqRow(s.map((x, i) => (i === h ? cellQ : cell(fmt(x))))), ...m, expl: ex + res(fmt(ans)), tip: '<b>Réflexe :</b> écris les écarts. Si ça ne donne rien, regarde une case sur deux.' };
});

/* ---------- Suites de lettres ---------- */
gen('log.let', { sub: 'logique', ch: 'log-suites', name: 'Suites de lettres', target: 55 }, (R, d) => {
  const L = (i) => ALPHA[((i % 26) + 26) % 26];
  const rk = (i) => `${L(i)}(${(((i % 26) + 26) % 26) + 1})`;
  const t = R.pick(d === 1 ? ['step', 'step', 'pairs'] : d === 2 ? ['alt', 'dec', 'pairs', 'step'] : ['inter', 'wrap', 'mirror', 'alt']);
  let idx = [], rule = '', ansTxt, wrongTxt = [], items;
  if (t === 'step' || t === 'wrap') {
    const k = R.int(2, 5), s0 = t === 'wrap' ? R.int(26 - 4 * k, 24) : R.int(0, 25 - 5 * k);
    for (let i = 0; i < 6; i++) idx.push(s0 + i * k);
    rule = `On avance de ${k} lettres à chaque fois : ${idx.slice(0, 4).map(rk).join(' → ')}…${t === 'wrap' ? ' Après Z, on repart à A.' : ''}`;
    ansTxt = L(idx[5]); wrongTxt = [L(idx[5] + 1), L(idx[5] - 1), L(idx[5] + k), L(idx[4] + k + 2)];
    items = idx.map((i) => L(i));
  } else if (t === 'alt') {
    const a = R.int(1, 3), b = R.int(a + 1, 5), s0 = R.int(0, 6); idx = [s0];
    for (let i = 1; i < 6; i++) idx.push(idx[i - 1] + (i % 2 ? a : b));
    rule = `Les écarts alternent : +${a}, +${b}, +${a}, +${b}… (${idx.map(rk).slice(0, 4).join(', ')}…)`;
    ansTxt = L(idx[5]); wrongTxt = [L(idx[4] + a), L(idx[5] + 1), L(idx[5] - 1), L(idx[4] + b + 1)];
    items = idx.map((i) => L(i));
  } else if (t === 'dec') {
    const s0 = R.int(22, 25); idx = [s0];
    for (let i = 1; i < 6; i++) idx.push(idx[i - 1] - i);
    rule = `On recule de 1, puis 2, puis 3… : ${idx.slice(0, 4).map(rk).join(' → ')}…`;
    ansTxt = L(idx[5]); wrongTxt = [L(idx[5] + 1), L(idx[5] - 1), L(idx[4] - 4), L(idx[5] - 2)];
    items = idx.map((i) => L(i));
  } else if (t === 'pairs') {
    const k = R.int(2, 4), s0 = R.int(0, 6); const pr = []; for (let i = 0; i < 5; i++) pr.push(L(s0 + i * (k + 1)) + L(s0 + i * (k + 1) + 1));
    rule = `Chaque groupe est formé de deux lettres consécutives, et chaque groupe commence ${k + 1} lettres après le précédent.`;
    ansTxt = pr[4]; const a0 = s0 + 4 * (k + 1); wrongTxt = [L(a0 + 1) + L(a0 + 2), L(a0 - 1) + L(a0), L(a0) + L(a0 + 2), L(a0 + k) + L(a0 + k + 1)];
    items = pr;
  } else if (t === 'mirror') {
    const s0 = R.int(0, 6); const pr = []; for (let i = 0; i < 5; i++) pr.push(L(s0 + i) + L(25 - s0 - i));
    rule = `La 1re lettre avance d'un rang (${L(s0)}, ${L(s0 + 1)}, ${L(s0 + 2)}…), la 2e recule d'un rang depuis la fin de l'alphabet (${L(25 - s0)}, ${L(24 - s0)}…).`;
    ansTxt = pr[4]; wrongTxt = [L(s0 + 4) + L(22 - s0), L(s0 + 5) + L(21 - s0), L(s0 + 4) + L(20 - s0), L(s0 + 3) + L(21 - s0)];
    items = pr;
  } else {
    const a = R.int(0, 5), b = R.int(14, 22), r1 = R.int(1, 3), r2 = R.int(1, 3); idx = [];
    for (let i = 0; i < 7; i++) idx.push(i % 2 === 0 ? a + (i / 2) * r1 : b - ((i - 1) / 2) * r2);
    rule = `Deux suites entrelacées : cases impaires +${r1} (${[0, 2, 4].map((i) => L(idx[i])).join(', ')}…), cases paires ${MINUS}${r2} (${[1, 3, 5].map((i) => L(idx[i])).join(', ')}…).`;
    ansTxt = L(idx[6]); wrongTxt = [L(idx[5] - r2), L(idx[6] + 1), L(idx[6] - 1), L(idx[4] + r1 + 1)];
    items = idx.map((i) => L(i));
  }
  const shown = items.slice(0, items.length - 1).map((x) => cell(x)).concat([cellQ]);
  const ar = ALPHA.indexOf(ansTxt[0]);
  const fillL = ansTxt.length === 1 ? (RR) => L(ar + RR.pick([-4, -3, -2, 2, 3, 4, 5])) : (RR) => { const sh = RR.pick([-3, -2, -1, 1, 2, 3]); return ansTxt.split('').map((ch, j) => L(ALPHA.indexOf(ch) + (j === 0 ? sh : RR.pick([sh, -sh, 1])))).join(''); };
  const m = mcq(R, ansTxt, wrongTxt, { sort: 'none', fill: fillL });
  return { q: P('Quelle lettre (ou groupe de lettres) complète la série ?'), visual: seqRow(shown), ...m, expl: steps(rule, `Réponse : ${ansTxt}.`) + res(ansTxt), tip: '<b>Repères :</b> E = 5, J = 10, O = 15, T = 20, Y = 25.' };
});

/* ---------- Dominos ---------- */
gen('log.domino', { sub: 'logique', ch: 'log-dominos', name: 'Dominos', target: 70 }, (R, d) => {
  const mv = (x) => ((x % 7) + 7) % 7;
  const t = R.pick(d === 1 ? ['indep', 'fix'] : d === 2 ? ['indep', 'accel', 'indep'] : ['chain', 'accel', 'sum', 'indep']);
  const n = 5;
  let doms = [], rT = '', rB = '';
  if (t === 'fix') { const a = R.pick([1, 2, -1]), t0 = R.int(0, 6), b0 = R.int(0, 6), fixTop = R.chance(0.5); for (let i = 0; i < n; i++) doms.push(fixTop ? [b0, mv(t0 + i * a)] : [mv(t0 + i * a), b0]); rT = fixTop ? `le haut reste à ${b0}` : `le haut fait ${sgn(a)} à chaque domino`; rB = fixTop ? `le bas fait ${sgn(a)} à chaque domino` : `le bas reste à ${b0}`; }
  else if (t === 'indep') { const a = R.pick(d === 1 ? [1, 2] : [1, 2, 3, -1, -2, -3]), b = R.pick(d === 1 ? [1, -1, 2] : [1, 2, -1, -2, 3]), t0 = R.int(0, 6), b0 = R.int(0, 6); for (let i = 0; i < n; i++) doms.push([mv(t0 + i * a), mv(b0 + i * b)]); rT = `le haut fait ${sgn(a)} à chaque domino`; rB = `le bas fait ${sgn(b)}`; }
  else if (t === 'accel') { const t0 = R.int(0, 6), b0 = R.int(0, 6), b = R.pick([1, -1, 2]); let tv = t0; for (let i = 0; i < n; i++) { doms.push([mv(tv), mv(b0 + i * b)]); tv += i + 1; } rT = 'le haut avance de +1, puis +2, puis +3, puis +4'; rB = `le bas fait ${sgn(b)} à chaque domino`; }
  else if (t === 'chain') { const k = R.pick([1, 2, 3, -1, -2]); let tv = R.int(0, 6); for (let i = 0; i < n; i++) { const bv = mv(tv + k); doms.push([mv(tv), bv]); tv = bv; } rT = 'le haut de chaque domino reprend le bas du domino précédent'; rB = `le bas vaut le haut ${sgn(k)}`; }
  else { const S = R.int(4, 9), a = R.pick([1, 2, -1]), t0 = R.int(0, 6); for (let i = 0; i < n; i++) { const tv = mv(t0 + i * a); doms.push([tv, mv(S - tv)]); } rT = `le haut fait ${sgn(a)} à chaque domino`; rB = `haut + bas = ${S % 7 === S ? S : S + ' (modulo 7 : ' + S % 7 + ')'} sur chaque domino`; }
  const h = d === 3 && R.chance(0.3) ? R.int(1, 3) : n - 1;
  const [ta, ba] = doms[h];
  const key = (x) => x[0] + '-' + x[1];
  const cand = [[ba, ta], [mv(ta + 1), ba], [ta, mv(ba + 1)], [mv(ta - 1), ba], [ta, mv(ba - 1)], [mv(ta + 1), mv(ba - 1)]];
  const m = mcq(R, [ta, ba], cand, { render: (x) => domSVG(x[0], x[1], 34), key, sort: 'none' });
  const visual = seqRow(doms.map((x, i) => (i === h ? domQ() : domSVG(x[0], x[1]))));
  const listT = doms.map((x, i) => (i === h ? '?' : x[0])).join(', '), listB = doms.map((x, i) => (i === h ? '?' : x[1])).join(', ');
  return { q: P('Quel domino remplace le point d\'interrogation ?'), visual, ...m, vis: true, expl: steps(`Moitiés hautes : ${listT} → ${rT}.`, `Moitiés basses : ${listB} → ${rB}.`, `On compte en boucle : après 6 vient 0, et avant 0 vient 6.`, `Le domino manquant est ${ta} / ${ba}.`) + res(`${ta} en haut, ${ba} en bas`), tip: '<b>Méthode :</b> analyse le haut et le bas séparément, en comptant modulo 7.' };
});

/* ---------- Cartes ---------- */
gen('log.cartes', { sub: 'logique', ch: 'log-dominos', name: 'Cartes à jouer', target: 65 }, (R, d) => {
  const mv13 = (x) => ((((x - 1) % 13) + 13) % 13) + 1;
  const step = d === 1 ? R.pick([1, 2]) : R.pick([2, 3, 4, -2, -3]);
  const v0 = R.int(1, 13), s0 = R.int(0, 3);
  const accel = d === 3 && R.chance(0.5);
  const suitMode = d === 1 ? 'const' : R.pick(['cycle', 'alt', 'cycle']);
  const alt2 = [s0, (s0 + 1) % 4];
  const cards = [];
  let v = v0;
  for (let i = 0; i < 5; i++) { const s = suitMode === 'const' ? s0 : suitMode === 'cycle' ? (s0 + i) % 4 : alt2[i % 2]; cards.push([mv13(v), s]); v += accel ? i + 1 : step; }
  const [va, sa] = cards[4];
  const key = (c) => c[0] + '-' + c[1];
  const cand = [[va, (sa + 1) % 4], [mv13(va + 1), sa], [mv13(va - 1), sa], [va, (sa + 2) % 4], [mv13(va + 1), (sa + 3) % 4]];
  const m = mcq(R, [va, sa], cand, { render: (c) => cardH(c[0], c[1]), key, sort: 'none' });
  const vals = cards.slice(0, 4).map((c) => `${rankTxt(c[0])} (${c[0]})`).join(', ');
  const ruleV = accel ? 'les écarts de valeur augmentent : +1, +2, +3, puis +4' : `la valeur fait ${sgn(step)} à chaque carte (après le Roi, on revient à l'As)`;
  const ruleS = suitMode === 'const' ? `la couleur reste ${SUITS[s0]}` : suitMode === 'cycle' ? 'la couleur suit le cycle ♠ → ♥ → ♦ → ♣' : `la couleur alterne ${SUITS[alt2[0]]} / ${SUITS[alt2[1]]}`;
  return { q: P('Quelle carte complète la série ?'), visual: seqRow(cards.slice(0, 4).map((c) => cardH(c[0], c[1])).concat([cardQ])), ...m, vis: true, expl: steps(`Valeurs : ${vals} → ${ruleV}.`, `Couleurs : ${ruleS}.`, `La carte manquante est ${rankTxt(va)} ${SUITS[sa]}.`) + res(`${rankTxt(va)} ${SUITS[sa]}`), tip: 'As = 1, Valet = 11, Dame = 12, Roi = 13.' };
});

/* ---------- Grilles ---------- */
gen('log.grille', { sub: 'logique', ch: 'log-figures', name: 'Grilles de nombres', target: 60 }, (R, d) => {
  const rules = d === 1 ? ['sum', 'prod'] : d === 2 ? ['sum', 'prod', 'diff', 'dbl'] : ['dbl', 'sqp', 'prodm', 'diff2'];
  const r = R.pick(rules);
  const f = { sum: (a, b) => a + b, prod: (a, b) => a * b, diff: (a, b) => a - b, dbl: (a, b) => 2 * (a + b), sqp: (a, b) => a * a + b, prodm: (a, b) => a * b - a, diff2: (a, b) => (a - b) * 2 }[r];
  const desc = { sum: 'a + b = c', prod: 'a × b = c', diff: 'a − b = c', dbl: '2 × (a + b) = c', sqp: 'a² + b = c', prodm: 'a × b − a = c', diff2: '2 × (a − b) = c' }[r];
  const rows = [];
  for (let i = 0; i < 3; i++) { let a, b; do { a = R.int(2, r === 'prod' || r === 'prodm' || r === 'sqp' ? 9 : 15); b = R.int(1, r === 'prod' || r === 'prodm' ? 9 : 12); } while ((r === 'diff' || r === 'diff2') && a <= b); rows.push([a, b, f(a, b)]); }
  const hc = d === 2 && R.chance(0.4) ? R.int(0, 1) : 2;
  const ans = rows[2][hc];
  const others = Object.entries({ sum: (a, b) => a + b, prod: (a, b) => a * b, diff: (a, b) => a - b, dbl: (a, b) => 2 * (a + b) }).filter(([k]) => k !== r).map(([, g]) => g(rows[2][0], rows[2][1]));
  const wrong = hc === 2 ? [...others, ans + 1, ans - 1] : [ans + 1, ans - 1, ans + 2, rows[2][2] - rows[2][1 - hc]];
  const m = mcq(R, ans, wrong, { positive: false, valid: Number.isInteger });
  const grid = `<div class="grid3">${rows.map((row, i) => row.map((x, j) => (i === 2 && j === hc ? '<div class="q">?</div>' : `<div>${fmt(x)}</div>`)).join('')).join('')}</div>`;
  return { q: P('Quel nombre remplace le point d\'interrogation ?'), visual: grid, ...m, expl: steps(`Sur chaque ligne (a, b, c) : ${desc}.`, `Ligne 1 : ${rows[0].join(', ')} ✔. Ligne 2 : ${rows[1].join(', ')} ✔.`, `Ligne 3 : ${rows[2].map((x, j) => (j === hc ? '?' : x)).join(', ')} → ? = ${fmt(ans)}.`) + res(fmt(ans)), tip: '<b>Vérifie ta règle sur deux lignes</b> avant de l\'appliquer à la troisième.' };
});

/* ---------- Figures ---------- */
gen('log.fig', { sub: 'logique', ch: 'log-figures', name: 'Figures en mouvement', target: 70 }, (R, d) => {
  const kind = d === 3 ? 'poly' : 'arrow';
  const rotStep = kind === 'arrow' ? R.pick(d === 1 ? [90, -90] : [45, -45, 90, 135]) : R.pick([0, 0, 15]);
  const fillAlt = d === 1 ? true : R.chance(0.6);
  const fill0 = R.chance(0.5);
  const dotStep = d === 1 ? 0 : R.pick([1, -1]);
  const r0 = kind === 'arrow' ? R.pick([0, 45, 90, 180, 270]) : 0, dot0 = R.int(0, 3), sides0 = 3;
  const mk = (i, o = {}) => ({ kind, sides: kind === 'poly' ? sides0 + i : 0, rot: r0 + i * rotStep, fill: fillAlt ? (i % 2 === 0 ? fill0 : !fill0) : fill0, dot: dotStep ? (((dot0 + i * dotStep) % 4) + 4) % 4 : null, ...o });
  const figs = [0, 1, 2, 3, 4].map((i) => mk(i));
  const c = figs[4];
  const norm = (rot) => ((rot % 360) + 360) % 360;
  const key = (f) => `${f.sides}|${kind === 'poly' ? norm(f.rot) % (360 / Math.max(1, f.sides)) : norm(f.rot)}|${f.fill}|${f.dot}`;
  const cand = [];
  if (kind === 'arrow') { cand.push({ ...c, rot: c.rot + rotStep }, { ...c, rot: c.rot - rotStep }, { ...c, rot: c.rot + 180 }); }
  else { cand.push({ ...c, sides: c.sides + 1 }, { ...c, sides: c.sides - 1 }); }
  cand.push({ ...c, fill: !c.fill });
  if (c.dot != null) cand.push({ ...c, dot: (c.dot + 1) % 4 }, { ...c, dot: (c.dot + 3) % 4 }, { ...c, dot: (c.dot + 2) % 4, fill: !c.fill });
  else cand.push({ ...c, fill: !c.fill, rot: c.rot + (kind === 'arrow' ? 90 : 0), sides: c.sides + (kind === 'poly' ? 1 : 0) });
  const m = mcq(R, c, R.shuffle(cand), { render: (f) => figSVG(f, 58), key, sort: 'none' });
  const dirTxt = rotStep > 0 ? 'dans le sens des aiguilles d\'une montre' : 'dans le sens inverse des aiguilles d\'une montre';
  const lines = [];
  if (kind === 'arrow') lines.push(`La flèche tourne de ${Math.abs(rotStep)}° ${dirTxt} à chaque étape.`);
  else lines.push(`Le nombre de côtés augmente de 1 à chaque étape : triangle, carré, pentagone, hexagone → <b>heptagone</b> (7 côtés).`);
  lines.push(fillAlt ? 'La couleur alterne : plein, vide, plein…' : `La couleur ne change pas (${fill0 ? 'pleine' : 'vide'}).`);
  if (c.dot != null) lines.push(`Le point tourne d'un coin à chaque étape, ${dotStep > 0 ? 'dans le sens des aiguilles d\'une montre' : 'dans le sens inverse'}.`);
  return { q: P('Quelle figure complète la série ?'), visual: seqRow(figs.slice(0, 4).map((f) => figSVG(f, 54)).concat([figQ(54)])), ...m, vis: true, expl: steps(...lines, 'On garde la seule réponse qui respecte toutes ces règles.') + res('la figure ' + LETTERS[m.answer]), tip: '<b>Une caractéristique à la fois :</b> élimine d\'abord avec la plus facile à voir.' };
});

/* ---------- Horloges ---------- */
gen('log.horloge', { sub: 'logique', ch: 'log-figures', name: 'Horloges', target: 65, diffs: [2, 3] }, (R, d) => {
  const t0 = R.int(0, 11) * 60 + R.pick([0, 15, 30, 45]);
  const accel = d === 3 && R.chance(0.6);
  const step = R.pick([75, 45, 130, 50, 105, 90]);
  const inc0 = R.pick([10, 15, 20]);
  const times = [t0];
  for (let i = 1; i < 5; i++) times.push(times[i - 1] + (accel ? inc0 * i : step));
  const ans = times[4];
  const mod = (x) => ((x % 720) + 720) % 720;
  const cand = [ans + 15, ans - 15, ans + 30, ans + 60, ans - 60].map(mod);
  const m = mcq(R, mod(ans), cand, { render: (x) => clockSVG(x, 58), key: (x) => String(mod(x)), sort: 'none' });
  const fmtT = (x) => { const mm = mod(x), h = Math.floor(mm / 60) || 12; return h + NB + 'h' + NB + String(mm % 60).padStart(2, '0'); };
  return { q: P('Quelle horloge complète la série ?'), visual: seqRow(times.slice(0, 4).map((x) => clockSVG(x, 56)).concat([clockQ(56)])), ...m, vis: true, expl: steps(`Lecture : ${times.slice(0, 4).map(fmtT).join(' → ')}.`, accel ? `Les écarts augmentent : +${inc0} min, +${2 * inc0} min, +${3 * inc0} min… le prochain est +${4 * inc0} min.` : `On avance de ${hm(step / 60)} à chaque horloge.`, `L'horloge manquante indique ${fmtT(ans)}.`) + res(fmtT(ans)) };
});

/* ---- 60-cdt.js ---- */
/* ===== COMPRÉHENSION DE TEXTES ===== */
chapter({
  id: 'cdt-methode', sub: 'cdt', order: 1, title: 'La méthode de lecture active', short: 'Méthode',
  lesson: `
<p>Tu as eu 14/15 à ton test : c'est ton point fort, et il doit rester une <b>banque de points</b> pour atteindre 400. L'objectif ici : viser 15/15 en allant plus vite.</p>
<h3><span class="hl">1. Lire « avec un crayon »</span></h3>
<ol><li><b>Survole les questions</b> (20 secondes) pour savoir ce que tu cherches.</li><li><b>Lis le texte une seule fois</b>, activement : repère la <b>thèse</b> (l'idée défendue), la <b>structure</b> (un paragraphe = une idée) et les <b>connecteurs</b> (mais, pourtant, en revanche, donc…).</li><li>Distingue <b>l'opinion de l'auteur</b> des opinions qu'il rapporte (« certains pensent que… »).</li><li>Pour chaque question, <b>retourne au passage précis</b> : ne réponds jamais de mémoire.</li></ol>
<h3><span class="hl">2. Les types de questions</span></h3>
<ul><li><b>Idée principale</b> : la bonne réponse couvre TOUT le texte, pas un seul paragraphe.</li><li><b>Détail</b> : retrouve la phrase exacte ; la bonne réponse la reformule.</li><li><b>Inférence</b> (« on peut déduire que… ») : ce n'est pas écrit mot pour mot, mais c'est forcément vrai d'après le texte.</li><li><b>Vocabulaire</b> : remplace le mot par chaque réponse dans la phrase et garde celle qui conserve le sens.</li><li><b>Position de l'auteur / rôle d'un exemple</b> : demande-toi « pourquoi l'auteur dit-il cela ici ? ».</li></ul>
<h3><span class="hl">3. Les pièges des mauvaises réponses</span></h3>
<div class="tablewrap"><table>
<tr><th>Piège</th><th>Comment le repérer</th></tr>
<tr><td>Vrai, mais pas dans le texte</td><td>« Est-ce que le texte le dit ? » Non → éliminer.</td></tr>
<tr><td>Trop fort</td><td>« toujours », « jamais », « tous », « seul » alors que le texte nuance.</td></tr>
<tr><td>Déformation</td><td>Mots du texte, mais sens inversé (cause ↔ conséquence).</td></tr>
<tr><td>Opinion rapportée</td><td>Une idée que l'auteur cite pour la critiquer.</td></tr>
<tr><td>Trop étroit</td><td>Pour l'idée principale : un détail exact mais partiel.</td></tr>
</table></div>
<div class="tip"><b>Gestion du temps :</b> environ 1 min 20 par question lecture comprise. Si tu bloques entre deux réponses, relis la phrase du texte : la bonne réponse est la plus fidèle, pas la plus séduisante.</div>`,
});

const CQ = (id, cat, q, c, e) => ({ id, cat, q: `<p><b>${q}</b></p>`, choices: c, answer: 0, expl: `<p>${e}</p>` });
TM.cdtTexts = [
  {
    id: 'cdt1', title: 'L\'économie de l\'attention',
    html: `<p>En 1971, l'économiste Herbert Simon formulait une intuition qui allait se révéler prophétique : dans un monde riche en informations, écrivait-il, l'abondance de l'information crée une pauvreté de l'attention. Autrement dit, ce qui devient rare n'est plus l'information elle-même, mais le temps et la concentration de ceux qui la reçoivent. Un demi-siècle plus tard, cette rareté est au cœur d'une industrie entière.</p>
<p>Les grandes plateformes numériques proposent pour la plupart leurs services gratuitement. Leur modèle économique repose sur la publicité : plus l'utilisateur reste longtemps, plus il voit d'annonces, et plus il fournit de données permettant de les cibler. Le temps passé devient ainsi la véritable monnaie de ces services. Pour l'augmenter, les concepteurs ont développé tout un arsenal : notifications qui rappellent l'utilisateur à l'ordre, défilement infini qui supprime tout point d'arrêt naturel, vidéos qui s'enchaînent automatiquement, recommandations ajustées en permanence aux goûts de chacun.</p>
<p>Les effets de ces dispositifs font l'objet de débats. Certains chercheurs observent une fragmentation de l'attention : nous passerions plus vite d'une tâche à l'autre et peinerions davantage à soutenir un effort de concentration prolongé. D'autres invitent à la prudence, rappelant que chaque génération a accusé un nouveau média de corrompre les esprits, du roman au XIX<sup>e</sup> siècle à la télévision au siècle dernier. Il serait en effet naïf de croire que l'attention n'a jamais été convoitée : la presse et la télévision vivaient déjà de la publicité. Ce qui est inédit, c'est l'échelle du phénomène et la finesse de la personnalisation, rendue possible par la collecte massive de données.</p>
<p>Face à ce constat, plusieurs pistes émergent. Les législateurs commencent à encadrer certaines pratiques, notamment à l'égard des mineurs. Des concepteurs militent pour un design « éthique », qui aiderait l'utilisateur à atteindre ses propres objectifs plutôt qu'à prolonger sa présence. Mais aucune règle ne remplacera une forme d'hygiène personnelle. Réapprendre à s'ennuyer, accepter les temps morts sans les combler aussitôt, c'est peut-être la condition pour retrouver une attention capable de se fixer durablement. L'attention, au fond, n'est pas seulement une ressource économique : c'est la matière même de notre vie intérieure.</p>`,
    qs: [
      CQ('cdt1-1', 'idee', 'Quelle est l\'idée principale du texte ?', ['L\'attention, devenue rare, est au cœur du modèle économique de nombreuses plateformes, ce qui pose des questions collectives et individuelles.', 'Les plateformes numériques ont rendu la population incapable de se concentrer.', 'La publicité est apparue avec Internet.', 'Il faut interdire les notifications sur les téléphones.', 'Herbert Simon a annoncé l\'invention des réseaux sociaux.'], 'Le texte part de la rareté de l\'attention (§1), décrit le modèle des plateformes (§2), nuance ses effets (§3) et propose des pistes (§4). La 2e réponse est trop forte : le texte présente un débat. La 3e est contredite (la presse vivait déjà de la publicité).'),
      CQ('cdt1-2', 'detail', 'Selon le texte, à quoi sert principalement le défilement infini ?', ['À supprimer les points d\'arrêt naturels pour prolonger le temps passé.', 'À afficher des contenus plus variés.', 'À réduire la quantité de données collectées.', 'À protéger les utilisateurs mineurs.', 'À améliorer la précision des recommandations.'], '§2 : « défilement infini qui supprime tout point d\'arrêt naturel », dans la liste des outils destinés à augmenter le temps passé.'),
      CQ('cdt1-3', 'inference', 'D\'après l\'auteur, qu\'est-ce qui distingue la situation actuelle de celle de la presse ou de la télévision ?', ['L\'ampleur du phénomène et la finesse de la personnalisation permise par les données.', 'Le recours à la publicité pour se financer.', 'Le fait que l\'attention soit convoitée.', 'L\'intérêt des chercheurs pour la question.', 'La gratuité des contenus proposés.'], '§3 : « Ce qui est inédit, c\'est l\'échelle du phénomène et la finesse de la personnalisation ». La publicité et la convoitise de l\'attention existaient déjà.'),
      CQ('cdt1-4', 'vocab', 'Dans le texte, le mot « convoitée » signifie :', ['désirée avec avidité', 'partagée équitablement', 'mesurée avec précision', 'méprisée', 'protégée par la loi'], '« Convoiter » = désirer ardemment ce que l\'on n\'a pas. L\'attention est recherchée par les médias.'),
      CQ('cdt1-5', 'auteur', 'Que suggère l\'auteur dans le dernier paragraphe ?', ['Que la régulation ne suffira pas sans un effort personnel, comme accepter l\'ennui.', 'Que le design « éthique » résoudra le problème à lui seul.', 'Que seuls les mineurs sont concernés.', 'Qu\'il faut renoncer définitivement au numérique.', 'Que l\'attention est avant tout une ressource économique.'], '« Aucune règle ne remplacera une forme d\'hygiène personnelle. Réapprendre à s\'ennuyer… ». La dernière réponse est contredite : l\'attention n\'est « pas seulement une ressource économique ».'),
    ],
  },
  {
    id: 'cdt2', title: 'Le télétravail, l\'heure du bilan',
    html: `<p>Longtemps cantonné à quelques professions et à quelques jours par mois, le télétravail est devenu, à la faveur de la crise sanitaire de 2020, une expérience de masse. Des millions de salariés ont découvert du jour au lendemain qu'une partie de leur travail pouvait s'accomplir depuis leur domicile. Quelques années plus tard, l'heure est au bilan, et celui-ci se révèle plus nuancé que les promesses du début.</p>
<p>Les avantages sont réels. Le premier est le temps gagné sur les trajets, qui peut atteindre plusieurs heures par semaine dans les grandes agglomérations. Beaucoup de salariés apprécient aussi l'autonomie que procure le travail à distance : organiser sa journée, s'isoler pour les tâches qui demandent de la concentration. Plusieurs études suggèrent d'ailleurs que, pour les tâches individuelles et bien définies, la productivité est au moins maintenue, voire améliorée.</p>
<p>Mais le tableau comporte des zones d'ombre. Les idées nouvelles naissent souvent d'échanges imprévus, d'une conversation à la machine à café ou d'une question posée en passant devant un bureau. Ces interactions informelles se raréfient à distance, au risque d'appauvrir la créativité et la transmission des savoirs, en particulier pour les nouveaux arrivants, qui apprennent beaucoup en observant leurs collègues. L'isolement pèse sur certains salariés, et la frontière entre vie professionnelle et vie privée tend à s'effacer. Enfin, le télétravail n'est pas accessible à tous : il suppose un logement adapté et un métier qui s'y prête, ce qui exclut une large part des travailleurs.</p>
<p>La plupart des organisations ont finalement opté pour des formules hybrides, alternant jours au bureau et jours à domicile. Cette solution de compromis déplace la question : il ne s'agit plus de savoir où l'on travaille, mais comment on s'organise. Si le domicile devient le lieu des tâches solitaires, le bureau doit se réinventer comme un lieu de rencontre et de coopération, sous peine de n'être plus qu'un décor que l'on traverse sans raison.</p>`,
    qs: [
      CQ('cdt2-1', 'idee', 'Quelle est l\'idée principale du texte ?', ['Le télétravail présente des avantages réels mais aussi des limites, qui obligent à repenser l\'organisation du travail.', 'Le télétravail augmente toujours la productivité des salariés.', 'Le télétravail doit être abandonné au profit du bureau.', 'Avant 2020, le télétravail était répandu dans toutes les professions.', 'Tous les salariés préfèrent travailler depuis chez eux.'], 'Le texte dresse un bilan nuancé (avantages §2, limites §3) et conclut sur l\'organisation hybride (§4). « Toujours » et « tous » sont trop forts.'),
      CQ('cdt2-2', 'detail', 'Selon le texte, qui souffre particulièrement de la raréfaction des échanges informels ?', ['Les nouveaux arrivants, qui apprennent en observant leurs collègues.', 'Les managers, qui perdent le contrôle de leurs équipes.', 'Les habitants des grandes agglomérations.', 'Les salariés chargés de tâches individuelles.', 'Les travailleurs dont le métier ne permet pas le télétravail.'], '§3 : « en particulier pour les nouveaux arrivants, qui apprennent beaucoup en observant leurs collègues ».'),
      CQ('cdt2-3', 'auteur', 'Quelle est l\'attitude de l\'auteur à l\'égard du télétravail ?', ['Nuancée : il en reconnaît les atouts tout en soulignant ses limites.', 'Enthousiaste : il y voit l\'avenir du travail.', 'Hostile : il le juge néfaste pour les entreprises.', 'Indifférente : il se contente de décrire les faits.', 'Ironique : il se moque des salariés qui télétravaillent.'], 'Dès le §1, le bilan est « plus nuancé que les promesses du début » ; l\'auteur présente avantages puis « zones d\'ombre ».'),
      CQ('cdt2-4', 'vocab', 'Dans la première phrase, le mot « cantonné » signifie :', ['limité, restreint', 'encouragé', 'interdit', 'généralisé', 'mieux rémunéré'], '« Cantonné à quelques professions » = maintenu dans des limites étroites, réservé à quelques professions.'),
      CQ('cdt2-5', 'inference', 'Selon l\'auteur, que doit devenir le bureau dans une organisation hybride ?', ['Un lieu de rencontre et de coopération.', 'Un espace réservé aux tâches qui demandent de la concentration.', 'Un lieu appelé à disparaître.', 'Un simple décor sans importance.', 'Un lieu de contrôle des horaires des salariés.'], '§4 : « le bureau doit se réinventer comme un lieu de rencontre et de coopération ». Le « décor » est justement ce qu\'il faut éviter ; la concentration est associée au domicile.'),
    ],
  },
  {
    id: 'cdt3', title: 'Les circuits courts, une solution miracle ?',
    html: `<p>Marchés de producteurs, paniers hebdomadaires, vente directe à la ferme : les circuits courts ont le vent en poupe. En France, on parle de circuit court lorsqu'il y a au plus un intermédiaire entre le producteur et le consommateur. Le succès de ces formules traduit une attente profonde : savoir d'où vient ce que l'on mange, et soutenir ceux qui le produisent.</p>
<p>Leurs atouts sont nombreux. En supprimant des intermédiaires, les producteurs récupèrent une part plus importante du prix payé par le consommateur, ce qui peut rendre viables de petites exploitations. Le lien direct favorise la confiance et la transparence : on peut interroger celui qui cultive, visiter parfois son exploitation. Les produits, cueillis plus près du moment de la vente, gagnent souvent en fraîcheur.</p>
<p>Une idée reçue mérite cependant d'être nuancée : celle selon laquelle acheter local serait forcément meilleur pour le climat. Le transport ne représente en réalité qu'une part minoritaire des émissions de gaz à effet de serre liées à notre alimentation ; l'essentiel se joue au moment de la production. Une tomate cultivée localement sous une serre chauffée en hiver peut ainsi émettre davantage qu'une tomate importée d'une région où elle pousse en plein champ. De même, une camionnette qui parcourt de nombreux kilomètres pour livrer quelques cagettes peut, rapportée au kilo transporté, polluer plus qu'un camion de grande distribution rempli à pleine charge.</p>
<p>Faut-il pour autant renoncer aux circuits courts ? Certainement pas. Leurs bénéfices économiques et sociaux sont bien réels, et ils encouragent souvent des pratiques plus respectueuses de l'environnement. Mais si l'on veut réduire l'empreinte de son assiette, le critère décisif reste ce que l'on mange et la manière dont c'est produit : privilégier les produits de saison et limiter les aliments les plus émetteurs pèse bien plus lourd que la distance parcourue.</p>`,
    qs: [
      CQ('cdt3-1', 'idee', 'Quelle est l\'idée principale du texte ?', ['Les circuits courts ont de vrais atouts, mais leur intérêt écologique dépend surtout de ce qui est produit et comment.', 'Les circuits courts sont mauvais pour l\'environnement.', 'Il vaut mieux acheter des produits importés.', 'Le transport est la principale source d\'émissions de l\'alimentation.', 'Les circuits courts ne profitent qu\'aux grandes exploitations.'], 'Le texte défend les circuits courts pour leurs bénéfices économiques et sociaux, tout en nuançant l\'idée reçue sur leur bilan climatique (§3-4).'),
      CQ('cdt3-2', 'detail', 'Selon le texte, qu\'est-ce qu\'un circuit court en France ?', ['Un mode de vente avec au plus un intermédiaire entre le producteur et le consommateur.', 'Un mode de vente où le produit parcourt moins de 100 km.', 'Une vente exclusivement réalisée à la ferme.', 'Une vente sans aucun intermédiaire.', 'Une vente de produits issus de l\'agriculture biologique.'], '§1 : « au plus un intermédiaire ». La définition porte sur le nombre d\'intermédiaires, pas sur la distance (piège classique).'),
      CQ('cdt3-3', 'auteur', 'Quel est le rôle de l\'exemple de la tomate cultivée sous serre chauffée ?', ['Montrer qu\'un produit local n\'est pas forcément moins émetteur qu\'un produit importé.', 'Prouver que les tomates importées ont meilleur goût.', 'Illustrer la fraîcheur des produits locaux.', 'Montrer que les serres chauffées sont interdites en hiver.', 'Critiquer les méthodes de la grande distribution.'], 'L\'exemple illustre l\'idée que « l\'essentiel se joue au moment de la production » : local ne veut pas dire moins émetteur.'),
      CQ('cdt3-4', 'vocab', 'L\'expression « avoir le vent en poupe » signifie :', ['connaître le succès', 'être menacé de disparition', 'être très ancien', 'être en déclin', 'être strictement réglementé'], 'La poupe est l\'arrière d\'un bateau : avec le vent dans le dos, il avance vite. L\'expression signifie être en pleine réussite.'),
      CQ('cdt3-5', 'inference', 'Que peut-on déduire du dernier paragraphe ?', ['Pour réduire l\'impact climatique de son alimentation, le choix des produits compte plus que leur provenance.', 'Les circuits courts devraient être abandonnés.', 'La saisonnalité des produits n\'a aucune importance.', 'La distance parcourue est le critère décisif.', 'Les petites exploitations polluent toujours plus que les grandes.'], '« Le critère décisif reste ce que l\'on mange et la manière dont c\'est produit […] pèse bien plus lourd que la distance parcourue. »'),
    ],
  },
];
TM.banks.cdt = [];
for (const t of TM.cdtTexts) for (const q of t.qs) TM.banks.cdt.push(Object.assign({}, q, { textId: t.id, passage: t.html, passageTitle: t.title }));
bankGen('cdt', 'idee', 'cdt-methode', 'Idée principale');
bankGen('cdt', 'detail', 'cdt-methode', 'Détails du texte');
bankGen('cdt', 'inference', 'cdt-methode', 'Inférences');
bankGen('cdt', 'vocab', 'cdt-methode', 'Vocabulaire en contexte');
bankGen('cdt', 'auteur', 'cdt-methode', 'Position de l\'auteur');

/* ---- 61-ra.js ---- */
/* ===== RAISONNEMENT & ARGUMENTATION ===== */
chapter({
  id: 'ra-types', sub: 'ra', order: 1, title: 'Les types de questions', short: 'Types de questions',
  lesson: `
<p>Chaque question présente un court raisonnement. Il faut identifier sa <b>structure</b> : des <b>prémisses</b> (les faits avancés) qui mènent à une <b>conclusion</b> (ce que l'auteur veut prouver).</p>
<div class="tip"><b>Mots qui annoncent la conclusion :</b> donc, ainsi, par conséquent, c'est pourquoi, on en déduit que, il faut. <b>Mots qui annoncent une prémisse :</b> car, puisque, en effet, étant donné que.</div>
<h3><span class="hl">1. Trouver la conclusion</span></h3>
<p>Cherche l'idée que tout le reste soutient. Élimine les réponses qui reprennent une prémisse, qui vont plus loin que le texte (« toujours », « il faut tout changer ») ou qui ajoutent une information.</p>
<h3><span class="hl">2. Trouver l'hypothèse implicite (le postulat)</span></h3>
<p>C'est ce que l'auteur suppose <b>sans le dire</b> et sans quoi son raisonnement s'effondre. <b>Test de la négation :</b> nie la réponse ; si l'argument ne tient plus, c'est le bon postulat.</p>
<h3><span class="hl">3. Affaiblir / Renforcer</span></h3>
<p>Repère le lien fragile entre prémisses et conclusion. La plupart du temps, l'auteur conclut à une cause (« A a provoqué B »). Pour <b>affaiblir</b> : une autre cause possible, un contre-exemple, un biais de sélection. Pour <b>renforcer</b> : éliminer une autre explication, montrer que l'effet apparaît seulement avec la cause.</p>
<h3><span class="hl">4. Expliquer un paradoxe</span></h3>
<p>Deux faits semblent contradictoires. La bonne réponse permet aux deux d'être vrais en même temps (souvent un facteur nouveau qui change la situation).</p>
<h3><span class="hl">5. Raisonnement parallèle</span></h3>
<p>Remplace les mots par des lettres : « Tous les A sont B ; X est A ; donc X est B ». Cherche la réponse qui a exactement la même structure, même si le sujet est différent.</p>`,
});
chapter({
  id: 'ra-logique', sub: 'ra', order: 2, title: 'Logique formelle et sophismes', short: 'Logique & failles',
  lesson: `
<h3><span class="hl">1. « Si A, alors B »</span></h3>
<div class="tablewrap"><table>
<tr><th>Ce qui est VRAI</th><th>Ce qui est FAUX (piège)</th></tr>
<tr><td><b>Contraposée</b> : si non B, alors non A</td><td><b>Réciproque</b> : si B, alors A</td></tr>
<tr><td>A est vrai → B est vrai</td><td>non A → non B</td></tr>
</table></div>
<div class="ex"><b>Exemple</b><span>« S'il pleut, la route est mouillée. » La route est sèche → il ne pleut pas (contraposée, vrai).</span><span>La route est mouillée → il pleut ? FAUX (un camion-citerne a pu passer).</span></div>
<h3><span class="hl">2. Nécessaire ou suffisant ?</span></h3>
<p>« Il faut un diplôme pour être embauché » : le diplôme est <b>nécessaire</b> (sans lui, pas d'embauche) mais pas <b>suffisant</b> (l'avoir ne garantit pas l'embauche).</p>
<h3><span class="hl">3. Tous, certains, aucun</span></h3>
<ul><li>« Tous les A sont B » ne veut pas dire que tous les B sont A.</li><li>« Certains A sont B » ⇔ « certains B sont A ».</li><li>« Aucun A n'est B » ⇔ « aucun B n'est A ».</li></ul>
<h3><span class="hl">4. Les failles classiques (sophismes)</span></h3>
<div class="tablewrap"><table>
<tr><th>Faille</th><th>Exemple</th></tr>
<tr><td>Corrélation ≠ causalité</td><td>Les pays qui mangent du chocolat ont plus de Nobel, donc le chocolat rend intelligent.</td></tr>
<tr><td>Généralisation hâtive</td><td>Mes deux voisins sont tombés en panne : cette marque n'est pas fiable.</td></tr>
<tr><td>Faux dilemme</td><td>Soit on augmente les impôts, soit les hôpitaux ferment.</td></tr>
<tr><td>Pente glissante</td><td>Si on autorise X, demain ce sera Y, puis le chaos.</td></tr>
<tr><td>Appel à une autorité non compétente</td><td>Un footballeur recommande ce placement.</td></tr>
<tr><td>Attaque personnelle (ad hominem)</td><td>Il a été condamné, donc son étude est fausse.</td></tr>
<tr><td>Raisonnement circulaire</td><td>Ce journal dit vrai puisqu'il l'affirme lui-même.</td></tr>
<tr><td>Biais de sélection</td><td>Seuls les meilleurs ont testé le télétravail, et ils sont productifs.</td></tr>
<tr><td>Homme de paille</td><td>Déformer la position de l'adversaire pour l'attaquer plus facilement.</td></tr>
<tr><td>Échantillon non représentatif</td><td>Sondage fait uniquement auprès des membres d'un club de golf.</td></tr>
</table></div>`,
});

const RAQ = (id, cat, arg, q, c, e) => ({ id, cat, q: `<p class="arg">${arg}</p><p><b>${q}</b></p>`, choices: c, answer: 0, expl: `<p>${e}</p>` });
TM.banks.ra = [
  RAQ('ra01', 'concl', 'Les entreprises qui investissent dans la formation de leurs salariés voient leur taux de démission baisser. Or, remplacer un salarié qui démissionne coûte en moyenne l\'équivalent de six mois de son salaire.', 'Quelle conclusion peut-on tirer de ces deux affirmations ?', ['Investir dans la formation peut permettre de réduire certains coûts liés au remplacement des salariés.', 'Toutes les entreprises devraient doubler leur budget de formation.', 'Les salariés formés sont plus productifs que les autres.', 'Le remplacement des salariés est la principale dépense des entreprises.', 'Une formation coûte toujours moins de six mois de salaire.'], 'Les deux prémisses relient formation → moins de démissions, et démission → coût élevé. La seule conclusion qui découle des deux sans rien ajouter est la première. Les autres sont trop fortes (« toutes », « doubler ») ou ajoutent des informations absentes (productivité, coût de la formation).'),
  RAQ('ra02', 'hyp', 'Depuis que la ville a installé des caméras dans le centre, les vols y ont diminué de 30 %. Les caméras sont donc efficaces contre la délinquance.', 'Sur quelle hypothèse implicite repose ce raisonnement ?', ['La baisse des vols n\'est pas due à un autre facteur apparu au même moment.', 'Les caméras ont coûté cher à la ville.', 'La délinquance a augmenté dans les autres quartiers.', 'Tous les vols commis dans le centre sont filmés.', 'Les habitants approuvent l\'installation des caméras.'], 'L\'auteur conclut à une cause (les caméras) à partir d\'une simple coïncidence dans le temps. Il suppose donc qu\'aucune autre cause n\'explique la baisse. Test de la négation : si un autre facteur expliquait la baisse, l\'argument tomberait.'),
  RAQ('ra03', 'aff', 'Depuis que la ville a installé des caméras dans le centre, les vols y ont diminué de 30 %. Le maire en conclut que les caméras sont efficaces contre la délinquance.', 'Quelle information affaiblit le plus ce raisonnement ?', ['Les vols ont diminué d\'environ 30 % dans tous les quartiers, y compris ceux sans caméras.', 'Les caméras filment en haute définition.', 'Les habitants du centre se sentent plus en sécurité.', 'Certains commerçants trouvent les caméras trop visibles.', 'L\'installation a été financée par la région.'], 'Si les vols baissent autant là où il n\'y a PAS de caméras, la baisse s\'explique par autre chose : le lien de cause à effet s\'effondre. Les autres informations sont neutres ou renforcent légèrement.'),
  RAQ('ra04', 'renf', 'Une étude montre que les élèves qui prennent un petit-déjeuner obtiennent de meilleures notes. Les auteurs en concluent que le petit-déjeuner améliore la concentration des élèves.', 'Quelle information renforce le plus cette conclusion ?', ['Parmi des élèves de même milieu social, ceux qui prennent un petit-déjeuner restent plus concentrés en fin de matinée.', 'Les élèves qui prennent un petit-déjeuner sont souvent issus de familles plus aisées.', 'Le petit-déjeuner est le repas préféré des Français.', 'Certains élèves ne prennent jamais de petit-déjeuner.', 'Les notes dépendent aussi de la qualité des professeurs.'], 'La bonne réponse élimine une explication concurrente (le milieu social) et montre un effet direct sur la concentration. La 2e réponse, au contraire, affaiblit l\'argument (le milieu social pourrait expliquer à la fois le petit-déjeuner et les notes).'),
  RAQ('ra05', 'faille', 'Les pays où l\'on consomme le plus de chocolat sont aussi ceux qui comptent le plus de prix Nobel par habitant. Manger du chocolat rend donc plus intelligent.', 'Quelle est la principale faille de ce raisonnement ?', ['Il confond une corrélation avec une relation de cause à effet.', 'Il généralise à partir d\'un seul cas.', 'Il s\'appuie sur une autorité non compétente.', 'Il attaque une personne au lieu d\'un argument.', 'Il ne présente que deux options possibles.'], 'Deux phénomènes qui évoluent ensemble ne sont pas forcément liés par une cause : la richesse des pays peut expliquer à la fois la consommation de chocolat et la recherche scientifique.'),
  RAQ('ra06', 'faille', 'Mes deux voisins qui roulent en voiture électrique sont tombés en panne cet hiver. Les voitures électriques ne sont donc pas fiables.', 'Quelle est la faille de ce raisonnement ?', ['Il tire une conclusion générale d\'un échantillon beaucoup trop petit.', 'Il confond la cause et la conséquence.', 'Il s\'appuie sur l\'avis d\'un expert reconnu.', 'Il utilise sa conclusion comme preuve.', 'Il attaque les constructeurs plutôt que leurs voitures.'], 'C\'est une généralisation hâtive : deux cas ne permettent pas de juger la fiabilité de millions de véhicules.'),
  RAQ('ra07', 'faille', 'Soit nous augmentons les impôts, soit les hôpitaux fermeront. Personne ne souhaite la fermeture des hôpitaux : il faut donc augmenter les impôts.', 'Quelle est la faille de ce raisonnement ?', ['Il présente deux options comme les seules possibles alors qu\'il en existe d\'autres.', 'Il repose sur une corrélation trompeuse.', 'Il généralise à partir d\'un cas particulier.', 'Il s\'appuie sur des chiffres inexacts.', 'Il ignore l\'avis des médecins.'], 'C\'est un faux dilemme : on pourrait aussi faire des économies ailleurs, réorganiser les hôpitaux, trouver d\'autres financements…'),
  RAQ('ra08', 'logique', 'Si un candidat obtient plus de 400 au test, il est convoqué à l\'oral. Julien n\'a pas été convoqué à l\'oral.', 'Que peut-on en déduire avec certitude ?', ['Julien n\'a pas obtenu plus de 400 au test.', 'Julien a obtenu moins de 300 au test.', 'Julien n\'a pas passé le test.', 'Tout candidat convoqué à l\'oral a obtenu plus de 400.', 'Julien repassera le test l\'an prochain.'], 'Contraposée : « si plus de 400 → convoqué » équivaut à « pas convoqué → pas plus de 400 ». La 4e réponse est la réciproque, qui n\'est pas garantie (on peut être convoqué pour une autre raison).'),
  RAQ('ra09', 'logique', 'Si une entreprise est cotée en Bourse, elle publie ses comptes. L\'entreprise Lumio publie ses comptes.', 'Que peut-on conclure ?', ['On ne peut pas savoir si Lumio est cotée en Bourse.', 'Lumio est cotée en Bourse.', 'Lumio n\'est pas cotée en Bourse.', 'Toutes les entreprises publient leurs comptes.', 'Lumio est une grande entreprise.'], 'Conclure que Lumio est cotée serait affirmer la réciproque (si elle publie, alors elle est cotée), ce qui est faux : d\'autres entreprises peuvent publier leurs comptes.'),
  RAQ('ra10', 'logique', 'Pour être admis dans ce master, il est nécessaire d\'avoir un dossier complet.', 'Laquelle de ces affirmations est forcément vraie ?', ['Un candidat admis avait forcément un dossier complet.', 'Tout candidat dont le dossier est complet est admis.', 'Un dossier incomplet peut suffire pour être admis.', 'Le dossier est le seul critère d\'admission.', 'Les candidats refusés avaient tous un dossier incomplet.'], 'Une condition nécessaire doit être remplie par tous les admis. Mais elle n\'est pas suffisante : un dossier complet ne garantit pas l\'admission (2e réponse fausse).'),
  RAQ('ra11', 'logique', 'Tous les consultants du cabinet parlent anglais. Certains consultants du cabinet parlent aussi espagnol.', 'Laquelle de ces affirmations est forcément vraie ?', ['Certaines personnes qui parlent espagnol parlent aussi anglais.', 'Toutes les personnes qui parlent anglais sont consultants.', 'Aucun consultant ne parle allemand.', 'Tous les consultants parlent espagnol.', 'Toutes les personnes qui parlent espagnol sont consultants.'], 'Les consultants hispanophones parlent forcément anglais (comme tous les consultants) : il existe donc des hispanophones qui parlent anglais. Les autres réponses inversent ou généralisent.'),
  RAQ('ra12', 'parad', 'Le nombre de parapluies vendus par une enseigne a augmenté de 20 % cette année, alors qu\'il a beaucoup moins plu que l\'année précédente.', 'Quelle information explique le mieux ce paradoxe ?', ['L\'enseigne a ouvert dix nouveaux magasins cette année.', 'Les parapluies sont plus chers qu\'avant.', 'Il avait beaucoup plu il y a deux ans.', 'Les concurrents vendent aussi des parapluies.', 'Les clients préfèrent les parapluies noirs.'], 'Plus de magasins = plus de clients, ce qui explique la hausse des ventes malgré une météo moins pluvieuse. Une hausse de prix, au contraire, ne ferait pas vendre plus d\'unités.'),
  RAQ('ra13', 'concl', 'Les livres numériques sont moins chers à produire que les livres papier. Pourtant, leur prix de vente reste proche de celui des livres papier. Les éditeurs souhaitent en effet ne pas fragiliser les libraires, qui vivent essentiellement du papier.', 'Quelle est la conclusion implicite de ce texte ?', ['Le prix des livres numériques résulte surtout d\'un choix des éditeurs.', 'Les livres numériques sont moins chers à produire.', 'Les libraires vendent surtout des livres papier.', 'Les éditeurs devraient baisser le prix des livres numériques.', 'Les livres papier vont bientôt disparaître.'], 'Tout le texte explique que le prix n\'est pas dicté par le coût mais par une stratégie. Les réponses 2 et 3 sont des prémisses ; la 4 est une recommandation que l\'auteur ne fait pas.'),
  RAQ('ra14', 'para', 'Tous les métaux conduisent l\'électricité. Le cuivre est un métal. Donc le cuivre conduit l\'électricité.', 'Quel raisonnement a exactement la même structure ?', ['Tous les mammifères respirent. La baleine est un mammifère. Donc la baleine respire.', 'Tous les oiseaux ont des plumes. Cet animal a des plumes. Donc c\'est un oiseau.', 'Certains fruits sont rouges. La fraise est rouge. Donc la fraise est un fruit.', 'Aucun poisson ne vole. Le pingouin ne vole pas. Donc le pingouin est un poisson.', 'Les chats aiment le lait. Mon chat n\'aime pas le lait. Donc ce n\'est pas un chat.'], 'Structure : Tous les A sont B ; X est A ; donc X est B. Seule la 1re réponse la reproduit. La 2e affirme la réciproque (X est B donc X est A), ce qui est invalide.'),
  RAQ('ra15', 'hyp', 'Pour réduire les embouteillages en centre-ville, la mairie propose de rendre les transports en commun gratuits.', 'Sur quelle hypothèse repose cette proposition ?', ['Une partie des automobilistes abandonnerait la voiture si les transports étaient gratuits.', 'Les transports en commun sont déjà saturés aux heures de pointe.', 'La gratuité coûterait cher à la ville.', 'Les embouteillages augmentent la pollution.', 'Tous les habitants possèdent une voiture.'], 'La proposition n\'a de sens que si la gratuité pousse des automobilistes à changer de mode de transport. Si personne ne changeait, les embouteillages resteraient identiques.'),
  RAQ('ra16', 'aff', 'Une entreprise a constaté que ses salariés en télétravail traitaient 15 % de dossiers en plus que ceux restés au bureau. Elle en conclut que le télétravail rend plus productif.', 'Quelle information affaiblit le plus cette conclusion ?', ['Seuls les salariés les plus expérimentés avaient été autorisés à télétravailler.', 'Le télétravail supprime les temps de transport.', 'Les salariés apprécient le télétravail.', 'Certains managers sont réticents au télétravail.', 'Les dossiers traités sont de nature variée.'], 'C\'est un biais de sélection : si les télétravailleurs étaient déjà les plus expérimentés, ils auraient sans doute traité plus de dossiers même au bureau.'),
  RAQ('ra17', 'renf', 'Une chaîne de cafés a baissé ses prix de 10 % et sa fréquentation a augmenté. Le directeur affirme que c\'est la baisse des prix qui a attiré de nouveaux clients.', 'Quelle information renforce le plus cette affirmation ?', ['La fréquentation a augmenté dans tous les cafés de la chaîne, alors qu\'elle a stagné chez les concurrents qui n\'ont pas baissé leurs prix.', 'Un concurrent a fermé à proximité de plusieurs cafés de la chaîne.', 'Le prix mondial du café a baissé.', 'La chaîne a aussi refait la décoration de ses cafés.', 'Les clients réguliers consomment autant qu\'avant.'], 'La comparaison avec les concurrents (même période, sans baisse de prix) isole l\'effet du prix. Les réponses 2 et 4 proposent au contraire d\'autres explications et affaiblissent l\'argument.'),
  RAQ('ra18', 'faille', 'Un célèbre footballeur recommande ce placement financier dans une publicité. C\'est donc un excellent investissement.', 'Quelle est la faille de ce raisonnement ?', ['Il s\'appuie sur l\'avis d\'une personne qui n\'est pas compétente dans ce domaine.', 'Il confond corrélation et causalité.', 'Il enchaîne des conséquences de plus en plus graves.', 'Il présente un faux dilemme.', 'Il généralise à partir d\'un cas.'], 'La célébrité d\'un sportif ne fait pas de lui un expert en finance : c\'est un appel à une autorité non compétente.'),
  RAQ('ra19', 'faille', 'Si on autorise les élèves à utiliser leur téléphone pendant la récréation, ils l\'utiliseront bientôt en classe, puis plus personne n\'écoutera les professeurs, et l\'école ne servira plus à rien.', 'Quelle est la faille de ce raisonnement ?', ['Il enchaîne des conséquences de plus en plus graves sans montrer qu\'elles sont probables.', 'Il s\'appuie sur une étude trop ancienne.', 'Il confond l\'école et la récréation.', 'Il attaque les élèves personnellement.', 'Il utilise sa conclusion comme prémisse.'], 'C\'est une « pente glissante » : chaque étape est présentée comme inévitable, sans aucune preuve.'),
  RAQ('ra20', 'logique', 'Dans cette école, tous les élèves admis en master ont obtenu plus de 14 de moyenne. Léa a obtenu 13 de moyenne.', 'Que peut-on en déduire avec certitude ?', ['Léa n\'a pas été admise en master.', 'Léa a échoué à ses examens.', 'Léa sera admise l\'an prochain.', 'Tous les élèves ayant plus de 14 sont admis en master.', 'Léa est la seule élève non admise.'], 'Si tous les admis ont plus de 14, quelqu\'un qui a 13 ne peut pas faire partie des admis. La 4e réponse est la réciproque, non garantie.'),
  RAQ('ra21', 'hyp', 'Notre nouveau dentifrice contient deux fois plus de fluor que celui de la marque leader. Il protège donc deux fois mieux vos dents.', 'Sur quelle hypothèse repose cette publicité ?', ['L\'efficacité d\'un dentifrice augmente proportionnellement à sa quantité de fluor.', 'La marque leader est la plus vendue.', 'Les dentistes recommandent ce dentifrice.', 'Ce dentifrice est moins cher que celui du leader.', 'Le fluor n\'a aucun effet secondaire.'], 'Pour passer de « deux fois plus de fluor » à « deux fois plus efficace », il faut supposer que l\'efficacité est proportionnelle à la dose, ce qui n\'a rien d\'évident.'),
  RAQ('ra22', 'renf', 'Une start-up affirme que son application fait baisser de 12 % la consommation d\'électricité des foyers qui l\'utilisent.', 'Quelle information serait la plus utile pour évaluer cette affirmation ?', ['La consommation d\'un groupe de foyers comparables n\'utilisant pas l\'application, sur la même période.', 'Le nombre de téléchargements de l\'application.', 'Le prix de l\'abonnement à l\'application.', 'Le nombre de salariés de la start-up.', 'L\'avis des utilisateurs sur le design de l\'application.'], 'Sans groupe de comparaison, impossible de savoir si la baisse vient de l\'application ou d\'autre chose (météo plus douce, hausse des prix de l\'électricité…).'),
  RAQ('ra23', 'logique', 'Aucun produit de la gamme Éco n\'est vendu en grande surface. Ce flacon de lessive est vendu en grande surface.', 'Que peut-on en déduire ?', ['Ce flacon n\'appartient pas à la gamme Éco.', 'Ce flacon appartient à la gamme Éco.', 'Les produits vendus en grande surface sont polluants.', 'La gamme Éco est vendue uniquement sur Internet.', 'On ne peut rien conclure.'], '« Aucun Éco n\'est en grande surface » équivaut à « aucun produit de grande surface n\'est Éco ». Le flacon n\'est donc pas de la gamme Éco.'),
  RAQ('ra24', 'parad', 'Depuis l\'ouverture d\'une nouvelle autoroute entre deux villes, le temps de trajet moyen en voiture entre ces villes n\'a pas diminué.', 'Quelle information explique le mieux ce constat ?', ['La nouvelle autoroute a attiré de nombreux voyageurs qui prenaient auparavant le train.', 'L\'autoroute est plus courte que l\'ancienne route.', 'Le péage de l\'autoroute est élevé.', 'Les voitures récentes sont plus rapides.', 'L\'autoroute a coûté très cher à construire.'], 'Plus de voitures sur la route = plus de bouchons, ce qui annule le gain de temps. La 2e réponse aggrave le paradoxe au lieu de l\'expliquer.'),
  RAQ('ra25', 'concl', 'Un bon manager doit savoir déléguer. Or Marc fait tout lui-même et ne confie aucune tâche à son équipe.', 'Quelle conclusion découle de ces affirmations ?', ['Selon ce critère, Marc n\'est pas un bon manager.', 'Marc est un mauvais employé.', 'Marc devrait démissionner.', 'Les bons managers ne travaillent pas eux-mêmes.', 'Marc ne fait pas confiance à son équipe.'], 'La seule conclusion logique : Marc ne remplit pas une condition nécessaire pour être un bon manager. La 5e réponse avance une explication que le texte ne donne pas.'),
  RAQ('ra26', 'faille', 'On ne peut pas croire l\'étude de ce chercheur sur le climat : il a été condamné l\'an dernier pour excès de vitesse.', 'Quelle est la faille de ce raisonnement ?', ['Il attaque la personne au lieu d\'examiner ses arguments.', 'Il confond corrélation et causalité.', 'Il généralise à partir d\'un cas.', 'Il présente un faux dilemme.', 'Il s\'appuie sur une autorité compétente.'], 'C\'est un argument « ad hominem » : un excès de vitesse n\'a aucun rapport avec la valeur scientifique d\'une étude.'),
  RAQ('ra27', 'faille', 'Ce journal dit toujours la vérité, puisqu\'il l\'affirme dans chacun de ses éditoriaux.', 'Quelle est la faille de ce raisonnement ?', ['Il utilise sa conclusion comme preuve.', 'Il généralise à partir de quelques éditoriaux.', 'Il s\'appuie sur une autorité extérieure.', 'Il enchaîne des conséquences improbables.', 'Il oppose deux options extrêmes.'], 'C\'est un raisonnement circulaire : la preuve (le journal se dit fiable) suppose déjà admise la conclusion (le journal est fiable).'),
  RAQ('ra28', 'aff', 'Les diplômés d\'écoles de commerce gagnent en moyenne 30 % de plus que les autres diplômés. Faire une école de commerce augmente donc le salaire.', 'Quelle information affaiblit le plus ce raisonnement ?', ['Les écoles de commerce recrutent des candidats qui avaient déjà de meilleures perspectives professionnelles avant d\'y entrer.', 'Les écoles de commerce coûtent cher.', 'Le salaire n\'est pas le seul critère de réussite.', 'Il existe de nombreuses écoles de commerce en France.', 'Les diplômés apprécient en général leur formation.'], 'Si les écoles sélectionnent des profils déjà favorisés, l\'écart de salaire peut venir de la sélection et non de la formation : c\'est un biais de sélection.'),
];
bankGen('ra', 'concl', 'ra-types', 'Trouver la conclusion');
bankGen('ra', 'hyp', 'ra-types', 'Hypothèse implicite');
bankGen('ra', 'aff', 'ra-types', 'Affaiblir');
bankGen('ra', 'renf', 'ra-types', 'Renforcer / évaluer');
bankGen('ra', 'parad', 'ra-types', 'Expliquer un paradoxe');
bankGen('ra', 'para', 'ra-types', 'Raisonnement parallèle');
bankGen('ra', 'logique', 'ra-logique', 'Logique formelle');
bankGen('ra', 'faille', 'ra-logique', 'Repérer la faille');

/* ---- 62-expr.js ---- */
/* ===== EXPRESSION : cours + banque de questions rédigées ===== */
chapter({
  id: 'expr-gram', sub: 'expr', order: 1, title: 'Accords et conjugaison', short: 'Grammaire',
  lesson: `
<p>L'Expression teste la langue « soutenue » : accords, conjugaison, orthographe, vocabulaire. Ce sont des points <b>rapides</b> à gagner : une question se traite en 30 à 60 secondes si la règle est connue.</p>
<h3><span class="hl">1. Le participe passé</span></h3>
<ul>
<li><b>Avec être</b> : accord avec le sujet. « Elles sont parties. »</li>
<li><b>Avec avoir</b> : accord avec le COD <b>seulement s'il est placé avant</b>. « Les lettres que j'ai écrit<b>es</b>. » mais « J'ai écrit des lettres. »</li>
<li><b>Verbes pronominaux</b> : on cherche le COD. « Elles se sont lavé<b>es</b> » (se = COD) mais « Elles se sont lavé les mains » (le COD « les mains » est après).</li>
<li>Si le pronom « se » est un COI (parler <b>à</b>, succéder <b>à</b>, plaire <b>à</b>, mentir <b>à</b>…), pas d'accord : « Ils se sont parlé », « Ils se sont succédé ».</li>
<li><b>Fait + infinitif</b> est toujours invariable : « la maison qu'il a fait construire ».</li>
<li><b>Verbes impersonnels</b> invariables : « la chaleur qu'il a fait ».</li>
</ul>
<h3><span class="hl">2. Les accords délicats</span></h3>
<ul>
<li><b>Couleurs</b> : un adjectif issu d'un nom (marron, orange, cerise) ou composé (bleu clair) reste invariable : « des chaussures marron », « des robes bleu clair ».</li>
<li><b>Tout</b> devant un adjectif : invariable (« elles sont tout étonnées »), SAUF devant un adjectif féminin commençant par une consonne ou un h aspiré (« elles sont toutes honteuses »).</li>
<li><b>Demi</b> : invariable devant le nom (« une demi-heure ») ; après, il s'accorde en genre (« une heure et demie », « midi et demi »).</li>
<li><b>Quel que</b> (+ être) s'accorde avec le sujet : « Quelles que soient vos raisons ». <b>Quelque</b> = environ est invariable : « quelque 300 km ».</li>
</ul>
<h3><span class="hl">3. Indicatif ou subjonctif ?</span></h3>
<div class="tablewrap"><table>
<tr><th>Subjonctif</th><th>Indicatif</th></tr>
<tr><td>bien que, quoique, pour que, afin que, avant que, à moins que, sans que, il faut que, je doute que, je ne pense pas que, quoi que</td><td><b>après que</b>, parce que, pendant que, je pense que, je crois que, il est certain que</td></tr>
</table></div>
<div class="trap"><b>Piège n°1 :</b> « après qu'il <b>est</b> parti » (indicatif), contrairement à « avant qu'il <b>soit</b> parti ».</div>
<div class="trap"><b>Piège n°2 :</b> « Si j'<b>avais</b> su » : jamais de conditionnel après « si » (« les si n'aiment pas les -rais »).</div>
<h3><span class="hl">4. Passés simples piégeux</span></h3>
<p>résoudre → il résolut · croire → ils crurent · vaincre → il vainquit · conclure → il conclut · naître → il naquit · coudre → il cousit · peindre → il peignit.</p>`,
});
chapter({
  id: 'expr-ortho', sub: 'expr', order: 2, title: 'Homophones et orthographe', short: 'Orthographe',
  lesson: `
<h3><span class="hl">Les homophones à maîtriser</span></h3>
<div class="tablewrap"><table>
<tr><th>Mot</th><th>Astuce</th></tr>
<tr><td>quand / quant / qu'en</td><td>quand = lorsque ; quant à = en ce qui concerne ; qu'en = que + en (« qu'en penses-tu ? »)</td></tr>
<tr><td>plus tôt / plutôt</td><td>plus tôt ≠ plus tard ; plutôt = de préférence</td></tr>
<tr><td>davantage / d'avantage</td><td>davantage = plus ; d'avantage = de bénéfice (rare)</td></tr>
<tr><td>leur / leurs</td><td>devant un verbe, « leur » ne prend jamais de s (« je leur parle »)</td></tr>
<tr><td>sans / s'en</td><td>s'en se place devant un verbe (« il s'en va »)</td></tr>
<tr><td>c'est / s'est / sait</td><td>c'est = cela est ; s'est = verbe pronominal ; sait = savoir</td></tr>
<tr><td>quel(le) / qu'elle</td><td>qu'elle = que + elle (on peut dire « qu'il »)</td></tr>
<tr><td>où / ou</td><td>où = lieu ou temps ; ou = ou bien</td></tr>
</table></div>
<h3><span class="hl">Mots souvent mal écrits</span></h3>
<p>dilemme (pas dilemne) · connexion · occurrence · parallèle · accueil · bizarre · mœurs · rémunération (pas rénumération) · infarctus · aéroport · hormis · exprès · à l'envi (= à volonté).</p>`,
});
chapter({
  id: 'expr-vocab', sub: 'expr', order: 3, title: 'Vocabulaire et paronymes', short: 'Vocabulaire',
  lesson: `
<h3><span class="hl">Les paronymes (mots qui se ressemblent)</span></h3>
<div class="tablewrap"><table>
<tr><td><b>éminent</b> : remarquable</td><td><b>imminent</b> : qui va arriver très bientôt</td></tr>
<tr><td><b>effraction</b> : entrée en forçant</td><td><b>infraction</b> : violation d'une règle</td></tr>
<tr><td><b>conjecture</b> : hypothèse</td><td><b>conjoncture</b> : situation du moment</td></tr>
<tr><td><b>perpétrer</b> : commettre (un crime)</td><td><b>perpétuer</b> : faire durer</td></tr>
<tr><td><b>prodige</b> : enfant surdoué, miracle</td><td><b>prodigue</b> : dépensier</td></tr>
<tr><td><b>recouvrer</b> : retrouver (la santé)</td><td><b>recouvrir</b> : couvrir entièrement</td></tr>
<tr><td><b>acception</b> : sens d'un mot</td><td><b>acceptation</b> : fait d'accepter</td></tr>
<tr><td><b>partial</b> : injuste, qui prend parti</td><td><b>partiel</b> : incomplet</td></tr>
<tr><td><b>opprimer</b> : tyranniser</td><td><b>oppresser</b> : gêner la respiration</td></tr>
<tr><td><b>émigrer</b> : quitter son pays</td><td><b>immigrer</b> : arriver dans un pays</td></tr>
<tr><td><b>compréhensif</b> : indulgent</td><td><b>compréhensible</b> : qu'on peut comprendre</td></tr>
</table></div>
<h3><span class="hl">Mots de vocabulaire soutenu fréquents</span></h3>
<p><b>laconique</b> (bref) · <b>prolixe</b> (trop long) · <b>éphémère</b> (qui dure peu) · <b>pérenne</b> (durable) · <b>fortuit</b> (dû au hasard) · <b>vétuste</b> (abîmé par le temps) · <b>sibyllin</b> (obscur) · <b>pusillanime</b> (lâche) · <b>acerbe</b> (mordant) · <b>exhaustif</b> (complet) · <b>idoine</b> (approprié) · <b>véhément</b> (fougueux) · <b>ubuesque</b> (absurde et grotesque) · <b>obsolète</b> (dépassé).</p>
<h3><span class="hl">Constructions et pléonasmes</span></h3>
<ul>
<li>se rappeler <b>quelque chose</b> (pas « de ») ; se souvenir <b>de</b> quelque chose.</li>
<li>pallier <b>un problème</b> (pas « à »).</li>
<li>« malgré que » est fautif → « bien que ».</li>
<li>« c'est de cela <b>qu'</b>il s'agit » (pas « dont »).</li>
<li>Je vous <b>saurais</b> gré (verbe savoir).</li>
<li>Pléonasmes à éviter : monter en haut, prévoir à l'avance, au jour d'aujourd'hui, collaborer ensemble, puis ensuite, voire même, réitérer à nouveau.</li>
</ul>`,
});

const EXQ = (id, cat, q, c, e) => ({ id, cat, q: `<p>${q}</p>`, choices: c, answer: 0, expl: `<p>${e}</p>` });
TM.banks.expr = [
  EXQ('ex01', 'accords', 'Complétez : « Les lettres que j\'ai ____ hier sont enfin arrivées. »', ['écrites', 'écrit', 'écrits', 'écrite', 'écrire'], 'Avec avoir, le participe s\'accorde avec le COD placé avant. « que » reprend « les lettres » (féminin pluriel) → <b>écrites</b>.'),
  EXQ('ex02', 'accords', 'Complétez : « Elles se sont ____ les mains avant de passer à table. »', ['lavé', 'lavées', 'lavés', 'lavée', 'laver'], 'Le COD est « les mains », placé APRÈS le verbe : pas d\'accord → <b>lavé</b>.'),
  EXQ('ex03', 'accords', 'Complétez : « Après la randonnée, elles se sont ____ dans la rivière. »', ['lavées', 'lavé', 'lavés', 'lavée', 'lavait'], '« se » (elles-mêmes) est COD, placé avant : accord avec le sujet féminin pluriel → <b>lavées</b>.'),
  EXQ('ex04', 'accords', 'Complétez : « Les deux candidats se sont ____ pendant tout le débat. »', ['parlé', 'parlés', 'parlées', 'parlée', 'parler'], 'On parle À quelqu\'un : « se » est COI. Pas de COD → participe invariable : <b>parlé</b>.'),
  EXQ('ex05', 'accords', 'Complétez : « La chaleur qu\'il a ____ cet été était accablante. »', ['fait', 'faite', 'faits', 'faites', 'faire'], '« il a fait » est ici impersonnel : le participe des verbes impersonnels est toujours invariable → <b>fait</b>.'),
  EXQ('ex06', 'accords', 'Complétez : « Cette maison, il l\'a ____ construire par un architecte célèbre. »', ['fait', 'faite', 'faits', 'faites', 'fais'], '« Fait » suivi d\'un infinitif est toujours invariable → <b>fait</b>.'),
  EXQ('ex07', 'accords', 'Complétez : « Ils se sont ____ des cadeaux pour Noël. »', ['offert', 'offerts', 'offertes', 'offerte', 'offrir'], 'Le COD « des cadeaux » est placé après le verbe : pas d\'accord → <b>offert</b>.'),
  EXQ('ex08', 'accords', 'Complétez : « Les fleurs qu\'elle s\'est ____ sont superbes. »', ['offertes', 'offert', 'offerts', 'offerte', 'offrir'], 'Le COD « qu\' » (les fleurs, féminin pluriel) est placé avant → <b>offertes</b>.'),
  EXQ('ex09', 'accords', 'Complétez : « Ils se sont vite ____ de leur erreur. »', ['aperçus', 'aperçu', 'aperçues', 'aperçue', 'apercevoir'], '« S\'apercevoir de » est un verbe essentiellement pronominal : il s\'accorde avec le sujet (ils) → <b>aperçus</b>.'),
  EXQ('ex10', 'accords', 'Complétez : « Les cantatrices que j\'ai ____ chanter hier étaient remarquables. »', ['entendues', 'entendu', 'entendus', 'entendue', 'entendre'], 'Participe suivi d\'un infinitif : on accorde si le COD fait l\'action. Ce sont les cantatrices qui chantent → <b>entendues</b>.'),
  EXQ('ex11', 'accords', 'Complétez : « Ils se sont ____ à la tribune pendant trois heures. »', ['succédé', 'succédés', 'succédées', 'succédée', 'succéder'], 'On succède À quelqu\'un : « se » est COI → invariable : <b>succédé</b>.'),
  EXQ('ex12', 'accords', 'Complétez : « Elle portait des chaussures ____. »', ['marron', 'marrons', 'marronnes', 'marronne', 'marronnées'], 'Un adjectif de couleur issu d\'un nom (le marron, le fruit) reste invariable → <b>marron</b>.'),
  EXQ('ex13', 'accords', 'Complétez : « Elle a acheté des robes ____. »', ['bleu clair', 'bleues claires', 'bleus clairs', 'bleue claire', 'bleues clair'], 'Un adjectif de couleur composé reste entièrement invariable → <b>bleu clair</b>.'),
  EXQ('ex14', 'accords', 'Complétez : « Après cette remarque, elles étaient ____ honteuses. »', ['toutes', 'tout', 'toute', 'tous', 'touts'], '« Tout » adverbe s\'accorde devant un adjectif féminin commençant par une consonne ou un h aspiré (honteux) → <b>toutes</b>.'),
  EXQ('ex15', 'accords', 'Complétez : « En apprenant la nouvelle, elles ont été ____ étonnées. »', ['tout', 'toutes', 'toute', 'tous', 'touts'], 'Devant un adjectif commençant par une voyelle, « tout » adverbe (= entièrement) reste invariable → <b>tout</b>.'),
  EXQ('ex16', 'accords', 'Complétez : « Il est rentré à minuit et ____. »', ['demi', 'demie', 'demis', 'demies', 'demi-'], 'Après le nom, « demi » s\'accorde en genre avec lui. « Minuit » est masculin → <b>demi</b> (mais « une heure et demie »).'),
  EXQ('ex17', 'accords', 'Complétez : « Nous avons attendu une ____-heure devant la porte. »', ['demi', 'demie', 'demis', 'demies', 'demy'], 'Placé devant le nom et relié par un trait d\'union, « demi » est invariable → <b>demi</b>-heure.'),
  EXQ('ex18', 'accords', 'Complétez : « ____ soient vos difficultés, ne renoncez pas. »', ['Quelles que', 'Quelque', 'Quelques', 'Quels que', 'Quel que'], '« Quel que » suivi de être s\'accorde avec le sujet (vos difficultés, féminin pluriel) → <b>Quelles que</b>.'),
  EXQ('ex19', 'accords', 'Complétez : « Il a parcouru ____ 300 kilomètres à vélo. »', ['quelque', 'quelques', 'quel que', 'quelle que', 'quels que'], 'Devant un nombre, « quelque » signifie « environ » : c\'est un adverbe invariable → <b>quelque</b>.'),
  EXQ('ex20', 'accords', 'Complétez : « ____ les documents demandés lors de notre entretien. »', ['Ci-joint', 'Ci-jointes', 'Ci-joints', 'Ci-jointe', 'Ci-joignez'], 'En tête de phrase, devant le nom, « ci-joint » est invariable → <b>Ci-joint</b>.'),
  EXQ('ex21', 'accords', 'Complétez : « Les résultats qu\'on a ____ cette année sont encourageants. »', ['obtenus', 'obtenu', 'obtenues', 'obtenue', 'obtenir'], 'COD « qu\' » (les résultats, masculin pluriel) placé avant, auxiliaire avoir → <b>obtenus</b>.'),
  EXQ('ex22', 'conjug', 'Complétez : « Bien qu\'il ____ malade, il est venu à la réunion. »', ['soit', 'est', 'était', 'sera', 'serait'], '« Bien que » est toujours suivi du subjonctif → <b>soit</b>.'),
  EXQ('ex23', 'conjug', 'Complétez : « Après qu\'il ____ parti, nous dînâmes en silence. »', ['fut', 'fût', 'soit', 'sera', 'serait'], '« Après que » se construit avec l\'INDICATIF (ici le passé antérieur) → <b>fut</b>, sans accent. « Fût » serait un subjonctif.'),
  EXQ('ex24', 'conjug', 'Complétez : « Partons avant qu\'il ne ____ trop tard. »', ['soit', 'est', 'sera', 'était', 'serait'], '« Avant que » est suivi du subjonctif → <b>soit</b>.'),
  EXQ('ex25', 'conjug', 'Complétez : « Si j\'____ su, je serais venu plus tôt. »', ['avais', 'aurais', 'ai', 'eus', 'aurai'], 'Après « si » de condition, jamais de conditionnel : si + plus-que-parfait → <b>avais</b>.'),
  EXQ('ex26', 'conjug', 'Complétez : « Je doute qu\'il ____ raison. »', ['ait', 'a', 'aura', 'avait', 'aie'], '« Douter que » exprime une incertitude → subjonctif, 3e personne : <b>ait</b> (« aie » est la 1re personne).'),
  EXQ('ex27', 'conjug', 'Complétez : « Il faut que vous ____ à l\'heure demain. »', ['soyez', 'êtes', 'soyiez', 'serez', 'étiez'], '« Il faut que » + subjonctif : que vous <b>soyez</b> (sans i : « soyiez » n\'existe pas).'),
  EXQ('ex28', 'conjug', 'Complétez : « Nous voulions que vous ____ avec nous au salon. »', ['veniez', 'venez', 'viendrez', 'venions', 'veniiez'], '« Vouloir que » + subjonctif : que vous <b>veniez</b>.'),
  EXQ('ex29', 'conjug', 'Complétez : « Quoi qu\'il ____, il garde toujours son calme. »', ['arrive', 'arrivera', 'arrivait', 'arrivé', 'arriverait'], '« Quoi que » (= quelle que soit la chose qui) est suivi du subjonctif → <b>arrive</b>.'),
  EXQ('ex30', 'conjug', 'Complétez : « Je crois qu\'il ____ raison sur ce point. »', ['a', 'ait', 'aie', 'eût', 'avoir'], '« Croire que » à la forme affirmative exprime une certitude → indicatif : <b>a</b>.'),
  EXQ('ex31', 'conjug', 'Complétez : « Je ne pense pas qu\'il ____ venir ce soir. »', ['puisse', 'peut', 'pourra', 'pouvait', 'pourrait'], 'À la forme négative, « penser que » exprime un doute → subjonctif : <b>puisse</b>.'),
  EXQ('ex32', 'conjug', 'Complétez au passé simple : « Hier, il ____ le problème en dix minutes. »', ['résolut', 'résolva', 'résoluta', 'résoudit', 'résolvit'], 'Résoudre au passé simple : je résolus, il <b>résolut</b>.'),
  EXQ('ex33', 'conjug', 'Complétez : « Demain, je ____ à Lyon pour le salon, c\'est prévu depuis un mois. »', ['serai', 'serais', 'sois', 'serait', 'fusse'], 'Action future certaine → futur de l\'indicatif : je <b>serai</b> (le conditionnel « serais » exprime une hypothèse).'),
  EXQ('ex34', 'conjug', 'Complétez au passé simple : « En voyant les résultats, ils ____ que tout était fini. »', ['crurent', 'croyèrent', 'croirent', 'crûrent', 'cruèrent'], 'Croire au passé simple : ils <b>crurent</b>.'),
  EXQ('ex35', 'conjug', 'Complétez : « Je vous ____ gré de bien vouloir me répondre rapidement. »', ['saurais', 'serais', 'serai', 'saurez', 'serions'], 'L\'expression est « savoir gré » : je vous <b>saurais</b> gré (conditionnel de politesse de savoir).'),
  EXQ('ex36', 'conjug', 'Complétez au passé simple : « L\'armée ____ l\'ennemi en une seule bataille. »', ['vainquit', 'vainqua', 'vaincut', 'vainquut', 'vaincit'], 'Vaincre au passé simple : il <b>vainquit</b>.'),
  EXQ('ex37', 'homo', 'Complétez : « Il y a ____ de candidats cette année que l\'an dernier. »', ['davantage', 'd\'avantage', 'd\'avantages', 'davantages', 'da vantage'], '« Davantage » (en un mot) signifie « plus » → <b>davantage</b>.'),
  EXQ('ex38', 'homo', 'Complétez : « ____ à moi, je refuse de signer ce contrat. »', ['Quant', 'Quand', 'Qu\'en', 'Quan', 'Kant'], '« Quant à » signifie « en ce qui concerne » → <b>Quant</b>.'),
  EXQ('ex39', 'homo', 'Complétez : « ____ penses-tu sincèrement ? »', ['Qu\'en', 'Quand', 'Quant', 'Quan', 'Q\'en'], 'On peut décomposer : « Que penses-tu de cela ? » → que + en = <b>Qu\'en</b>.'),
  EXQ('ex40', 'homo', 'Complétez : « Le train est arrivé ____ que prévu. »', ['plus tôt', 'plutôt', 'plutot', 'plus-tôt', 'plus tot'], 'Le contraire de « plus tard » → <b>plus tôt</b> (en deux mots).'),
  EXQ('ex41', 'homo', 'Complétez : « Je préfère ____ le thé au café. »', ['plutôt', 'plus tôt', 'plutot', 'plus-tôt', 'plu tôt'], '« Plutôt » (en un mot) signifie « de préférence ».'),
  EXQ('ex42', 'homo', 'Complétez : « Les élèves ont rendu ____ copies au professeur. »', ['leurs', 'leur', 'leurent', 'l\'heure', 'leurres'], 'Déterminant possessif devant un nom pluriel (copies) → <b>leurs</b>.'),
  EXQ('ex43', 'homo', 'Complétez : « Je ____ ai dit toute la vérité. »', ['leur', 'leurs', 'l\'heure', 'leure', 'leures'], 'Devant un verbe, « leur » est un pronom (= à eux) et ne prend jamais de s → <b>leur</b>.'),
  EXQ('ex44', 'homo', 'Complétez : « Il est parti ____ dire au revoir. »', ['sans', 's\'en', 'sent', 'cent', 'sang'], '« Sans » = préposition marquant l\'absence → <b>sans</b>.'),
  EXQ('ex45', 'homo', 'Complétez : « Il ____ est allé sans un regard. »', ['s\'en', 'sans', 'sens', 'cent', 'sent'], 'Verbe pronominal « s\'en aller » → <b>s\'en</b>.'),
  EXQ('ex46', 'homo', 'Complétez : « ____ en forgeant qu\'on devient forgeron. »', ['C\'est', 'S\'est', 'Ces', 'Ses', 'Sait'], '« C\'est » = cela est → <b>C\'est</b>.'),
  EXQ('ex47', 'homo', 'Complétez : « Je me demande ____ elle reviendra. »', ['quand', 'quant', 'qu\'en', 'camp', 'quan'], '« Quand » = à quel moment.'),
  EXQ('ex48', 'homo', 'Complétez : « Je pense ____ viendra demain. »', ['qu\'elle', 'quelle', 'quel', 'quelles', 'qu\'el'], 'On peut remplacer par « qu\'il » → que + elle = <b>qu\'elle</b>.'),
  EXQ('ex49', 'homo', 'Complétez : « ____ que soit la décision, je l\'accepterai. »', ['Quelle', 'Quel', 'Quelque', 'Quelles', 'Qu\'elle'], '« Quel que » s\'accorde avec le sujet « la décision » (féminin singulier) → <b>Quelle</b> que soit.'),
  EXQ('ex50', 'homo', 'Complétez : « C\'est une question à ____ il faut répondre avec prudence. »', ['laquelle', 'lequel', 'dont', 'qu\'', 'quoi'], 'On répond À une question (féminin) → à <b>laquelle</b>.'),
  EXQ('ex51', 'homo', 'Complétez : « Voici le livre ____ je t\'ai parlé. »', ['dont', 'que', 'où', 'qu\'', 'auquel'], 'On parle DE quelque chose → « dont » remplace un complément introduit par « de ».'),
  EXQ('ex52', 'homo', 'Quel mot est <b>mal</b> orthographié ?', ['dilemne', 'accueil', 'aujourd\'hui', 'parallèle', 'occurrence'], 'On écrit <b>dilemme</b> (deux m, comme « gemme »).'),
  EXQ('ex53', 'homo', 'Quel mot est correctement orthographié ?', ['connexion', 'conexion', 'connection', 'connéxion', 'conection'], 'En français : <b>connexion</b> (« connection » est l\'orthographe anglaise).'),
  EXQ('ex54', 'homo', 'Quel mot est correctement orthographié ?', ['rémunération', 'rénumération', 'rémunérassion', 'rémunnération', 'rénumérassion'], '<b>Rémunération</b> vient de « munus » (cadeau, charge) : ré-mu-né-ra-tion.'),
  EXQ('ex55', 'paro', 'Complétez : « Un danger ____ menace la ville : il faut évacuer. »', ['imminent', 'éminent', 'immanent', 'émanant', 'imminant'], '<b>Imminent</b> = qui va se produire très bientôt. « Éminent » = remarquable.'),
  EXQ('ex56', 'paro', 'Complétez : « C\'est un ____ spécialiste des maladies du cœur. »', ['éminent', 'imminent', 'immanent', 'émminent', 'éminant'], '<b>Éminent</b> = remarquable, supérieur.'),
  EXQ('ex57', 'paro', 'Complétez : « Le cambrioleur est entré par ____. »', ['effraction', 'infraction', 'fraction', 'réfraction', 'affliction'], '<b>Effraction</b> = entrée en forçant. « Infraction » = violation d\'une règle.'),
  EXQ('ex58', 'paro', 'Complétez : « Il a commis une ____ au code de la route. »', ['infraction', 'effraction', 'affliction', 'fraction', 'afflixion'], '<b>Infraction</b> = violation d\'une loi ou d\'un règlement.'),
  EXQ('ex59', 'paro', 'Complétez : « La ____ économique est défavorable aux investissements. »', ['conjoncture', 'conjecture', 'conjonction', 'conjecturation', 'injonction'], '<b>Conjoncture</b> = situation du moment. « Conjecture » = hypothèse.'),
  EXQ('ex60', 'paro', 'Complétez : « Ce n\'est qu\'une ____ : rien n\'est encore prouvé. »', ['conjecture', 'conjoncture', 'conjonction', 'injonction', 'conjuration'], '<b>Conjecture</b> = supposition, hypothèse.'),
  EXQ('ex61', 'paro', 'Complétez : « L\'homme a ____ un crime atroce. »', ['perpétré', 'perpétué', 'perpétuel', 'perturbé', 'pénétré'], '<b>Perpétrer</b> = commettre (un crime). « Perpétuer » = faire durer.'),
  EXQ('ex62', 'paro', 'Complétez : « Ce monument ____ la mémoire des soldats disparus. »', ['perpétue', 'perpètre', 'perpétre', 'perpétuité', 'perpétuelle'], '<b>Perpétuer</b> = faire durer, maintenir dans le temps.'),
  EXQ('ex63', 'paro', 'Complétez : « Le fils ____, après avoir tout dépensé, revint chez son père. »', ['prodigue', 'prodige', 'prodigué', 'prolixe', 'prodigieux'], '<b>Prodigue</b> = qui dépense sans compter. « Prodige » = enfant surdoué.'),
  EXQ('ex64', 'paro', 'Complétez : « Après un long repos, il a ____ la santé. »', ['recouvré', 'recouvert', 'recouvri', 'recouvrés', 'recouvrit'], '<b>Recouvrer</b> = retrouver, récupérer. « Recouvrir » = couvrir entièrement.'),
  EXQ('ex65', 'paro', 'Complétez : « Ce mot possède plusieurs ____. »', ['acceptions', 'acceptations', 'exceptions', 'acceptances', 'adoptions'], 'Une <b>acception</b> est un sens d\'un mot. Une « acceptation » est le fait d\'accepter.'),
  EXQ('ex66', 'paro', 'Complétez : « Un arbitre doit rester impartial, il ne peut pas être ____. »', ['partial', 'partiel', 'partielle', 'parcellaire', 'parti'], '<b>Partial</b> = qui prend parti injustement. « Partiel » = incomplet.'),
  EXQ('ex67', 'paro', 'Complétez : « Pendant des années, le dictateur a ____ son peuple. »', ['opprimé', 'oppressé', 'opressé', 'imprimé', 'supprimé'], '<b>Opprimer</b> = tyranniser. « Oppresser » = gêner la respiration, angoisser.'),
  EXQ('ex68', 'paro', 'Complétez : « Ne trouvant pas de travail, il ____ au Canada (il a quitté la France). »', ['a émigré', 'a immigré', 's\'est émigré', 'a émigrée', 'est immigré'], '<b>Émigrer</b> = quitter son pays (é- = hors de). « Immigrer » = s\'installer dans un pays.'),
  EXQ('ex69', 'paro', 'Complétez : « L\'____ du nouveau roi fut célébré dans tout le pays. »', ['avènement', 'avénement', 'événement', 'avenement', 'avancement'], '<b>Avènement</b> = arrivée au pouvoir.'),
  EXQ('ex70', 'paro', 'Complétez : « Ce professeur est très ____ avec ses élèves en difficulté. »', ['compréhensif', 'compréhensible', 'compressif', 'comprenable', 'compris'], '<b>Compréhensif</b> = indulgent, qui comprend les autres. « Compréhensible » = qu\'on peut comprendre.'),
  EXQ('ex71', 'vocab', 'Que signifie <b>laconique</b> ?', ['Qui s\'exprime en peu de mots', 'Qui parle beaucoup', 'Qui est d\'humeur triste', 'Qui manque de logique', 'Qui est très poli'], '<b>Laconique</b> : bref, concis (de la Laconie, région de Sparte réputée pour sa concision).'),
  EXQ('ex72', 'vocab', 'Que signifie <b>éphémère</b> ?', ['Qui dure très peu de temps', 'Qui se répète chaque jour', 'Qui est très léger', 'Qui est invisible', 'Qui est très ancien'], '<b>Éphémère</b> : de courte durée (du grec « qui dure un jour »).'),
  EXQ('ex73', 'vocab', 'Que signifie <b>prolixe</b> ?', ['Qui s\'exprime trop longuement', 'Qui est très précis', 'Qui travaille beaucoup', 'Qui a beaucoup d\'enfants', 'Qui est très généreux'], '<b>Prolixe</b> : trop long, bavard. Contraire : concis, laconique.'),
  EXQ('ex74', 'vocab', 'Que signifie <b>pusillanime</b> ?', ['Qui manque de courage', 'Qui a l\'esprit vif', 'Qui est très petit', 'Qui est d\'une grande bonté', 'Qui est rancunier'], '<b>Pusillanime</b> : craintif, qui manque d\'audace.'),
  EXQ('ex75', 'vocab', 'Que signifie <b>sibyllin</b> ?', ['Obscur, difficile à comprendre', 'Clair et limpide', 'Mélodieux', 'Moqueur', 'Très ancien'], '<b>Sibyllin</b> : énigmatique, comme les oracles de la Sibylle.'),
  EXQ('ex76', 'vocab', 'Que signifie <b>fortuit</b> ?', ['Qui arrive par hasard', 'Qui rapporte de l\'argent', 'Qui est solide', 'Qui est prévu de longue date', 'Qui est courageux'], '<b>Fortuit</b> : accidentel, dû au hasard (une rencontre fortuite).'),
  EXQ('ex77', 'vocab', 'Que signifie <b>vétuste</b> ?', ['Abîmé par le temps', 'Récent et moderne', 'Très spacieux', 'Mal situé', 'Luxueux'], '<b>Vétuste</b> : vieux et détérioré (un bâtiment vétuste).'),
  EXQ('ex78', 'vocab', 'Que signifie <b>pérenne</b> ?', ['Durable, qui se maintient', 'Provisoire', 'Coûteux', 'Annuel', 'Fragile'], '<b>Pérenne</b> : qui dure longtemps (un financement pérenne).'),
  EXQ('ex79', 'vocab', 'Que signifie <b>acerbe</b> ?', ['Mordant, agressif dans la critique', 'Doux et bienveillant', 'Très sucré', 'Indifférent', 'Hésitant'], '<b>Acerbe</b> : qui blesse par sa dureté (une critique acerbe).'),
  EXQ('ex80', 'vocab', 'Que signifie <b>exhaustif</b> ?', ['Complet, qui traite tous les aspects', 'Épuisant physiquement', 'Partiel', 'Exagéré', 'Rapide'], '<b>Exhaustif</b> : qui épuise le sujet, complet (une liste exhaustive).'),
  EXQ('ex81', 'vocab', 'Que signifie <b>idoine</b> ?', ['Approprié, qui convient parfaitement', 'Identique', 'Idiot', 'Idéaliste', 'Dangereux'], '<b>Idoine</b> : adapté à la situation (la personne idoine pour ce poste).'),
  EXQ('ex82', 'vocab', 'Que signifie <b>ubuesque</b> ?', ['Absurde et grotesque', 'Très heureux', 'Plein de sagesse', 'Silencieux', 'Généreux'], '<b>Ubuesque</b> : d\'une absurdité grotesque, comme le personnage d\'Ubu roi d\'Alfred Jarry.'),
  EXQ('ex83', 'vocab', 'Que signifie <b>obsolète</b> ?', ['Dépassé, qui n\'est plus utilisé', 'Obstiné', 'Évident', 'Obscur', 'Très solide'], '<b>Obsolète</b> : périmé, tombé en désuétude (une technologie obsolète).'),
  EXQ('ex84', 'vocab', 'Que signifie <b>véhément</b> ?', ['Plein de fougue et de violence dans l\'expression', 'Calme et posé', 'Très lent', 'Malhonnête', 'Timide'], '<b>Véhément</b> : ardent, emporté (un discours véhément).'),
  EXQ('ex85', 'synt', 'Quelle phrase est correcte ?', ['Je me rappelle cette histoire.', 'Je me rappelle de cette histoire.', 'Je m\'en rappelle de cette histoire.', 'Je me souviens cette histoire.', 'Je m\'en souviens de cette histoire.'], 'On dit « se rappeler <b>quelque chose</b> » (sans « de ») et « se souvenir <b>de</b> quelque chose ».'),
  EXQ('ex86', 'synt', 'Quelle phrase est correcte ?', ['Il faut pallier ce problème.', 'Il faut pallier à ce problème.', 'Il faut palier ce problème.', 'Il faut palier à ce problème.', 'Il faut pallié ce problème.'], '« Pallier » (deux l) est transitif direct : on pallie <b>quelque chose</b>, sans « à ».'),
  EXQ('ex87', 'synt', 'Quelle phrase est correcte ?', ['Bien qu\'il pleuve, nous sortons.', 'Malgré qu\'il pleuve, nous sortons.', 'Bien qu\'il pleut, nous sortons.', 'Malgré qu\'il pleut, nous sortons.', 'Bien qu\'il pleuvra, nous sortons.'], '« Malgré que » est considéré comme fautif ; on emploie « bien que » + subjonctif.'),
  EXQ('ex88', 'synt', 'Quelle phrase est correcte ?', ['C\'est de cela qu\'il s\'agit.', 'C\'est de cela dont il s\'agit.', 'C\'est cela dont il s\'agit de.', 'C\'est de cela que il s\'agit.', 'C\'est de ça dont qu\'il s\'agit.'], '« De cela » et « dont » font double emploi : on écrit « c\'est de cela <b>qu\'</b>il s\'agit » ou « c\'est cela dont il s\'agit ».'),
  EXQ('ex89', 'synt', 'Quelle phrase ne contient <b>pas</b> de pléonasme ?', ['Il est monté à l\'étage.', 'Il est monté en haut.', 'Il faut prévoir à l\'avance.', 'Au jour d\'aujourd\'hui, tout va vite.', 'Ils collaborent ensemble depuis dix ans.'], 'Monter en haut, prévoir à l\'avance, au jour d\'aujourd\'hui, collaborer ensemble : chaque fois, l\'idée est répétée inutilement.'),
  EXQ('ex90', 'synt', 'Choisissez le connecteur : « Il a beaucoup travaillé ; ____, il a échoué à l\'examen. »', ['pourtant', 'donc', 'ainsi', 'en effet', 'c\'est pourquoi'], 'Le résultat contredit ce qu\'on attendait : il faut un connecteur d\'opposition → <b>pourtant</b>.'),
  EXQ('ex91', 'synt', 'Choisissez le connecteur : « Les ventes ont chuté ; ____, l\'entreprise a réduit ses coûts. »', ['par conséquent', 'pourtant', 'néanmoins', 'en revanche', 'or'], 'La réduction des coûts est la conséquence de la chute des ventes → <b>par conséquent</b>.'),
  EXQ('ex92', 'synt', 'Choisissez le connecteur : « Il est sûrement malade : ____, il a beaucoup de fièvre. »', ['en effet', 'pourtant', 'cependant', 'en revanche', 'bien que'], 'La seconde partie justifie la première → connecteur d\'explication : <b>en effet</b>.'),
  EXQ('ex93', 'synt', 'Quelle phrase est correcte ?', ['Quelques efforts que vous fassiez, il reste du travail.', 'Quelque efforts que vous fassiez, il reste du travail.', 'Quels que efforts que vous fassiez, il reste du travail.', 'Quelques efforts que vous faites, il reste du travail.', 'Quelque soient vos efforts, il reste du travail.'], '« Quelque + nom + que » : quelque s\'accorde avec le nom (efforts) et le verbe est au subjonctif → <b>Quelques efforts que vous fassiez</b>.'),
];
bankGen('expr', 'accords', 'expr-gram', 'Accords et participes');
bankGen('expr', 'conjug', 'expr-gram', 'Conjugaison');
bankGen('expr', 'homo', 'expr-ortho', 'Homophones et orthographe');
bankGen('expr', 'paro', 'expr-vocab', 'Paronymes');
bankGen('expr', 'vocab', 'expr-vocab', 'Sens des mots');
bankGen('expr', 'synt', 'expr-vocab', 'Constructions et connecteurs');

/* ---- 63-verbal-plus.js ---- */
/* ===== Contenu verbal supplémentaire : textes, raisonnements, expression ===== */
[
  {
    id: 'cdt4', title: 'La semaine de quatre jours',
    html: `<p>Longtemps cantonnée à quelques expériences isolées, la semaine de quatre jours s'invite désormais dans le débat public. Plusieurs pays ont mené des expérimentations à grande échelle, et des entreprises de toutes tailles s'y essaient. Le principe paraît simple : travailler quatre jours au lieu de cinq. Mais derrière ce slogan se cachent deux modèles très différents, que l'on aurait tort de confondre.</p>
<p>Le premier consiste à <b>comprimer</b> le même nombre d'heures sur quatre jours. Les journées s'allongent, mais le salarié gagne un jour de repos. Le second, plus ambitieux, <b>réduit</b> réellement le temps de travail, par exemple 32 heures payées comme 35. Dans ce cas, l'entreprise parie que le gain de motivation et d'efficacité compensera les heures perdues.</p>
<p>Les partisans de la réforme mettent en avant des résultats encourageants : moins d'absentéisme, des salariés moins épuisés, une meilleure capacité à recruter dans des métiers en tension. La productivité serait parfois maintenue grâce à une chasse aux tâches inutiles, à commencer par les réunions interminables. Les critiques, eux, rappellent que le modèle ne convient pas à tous les secteurs : un hôpital, un commerce ou un service client doivent fonctionner six ou sept jours sur sept. Ils soulignent aussi le risque d'intensification : des journées plus denses peuvent devenir plus fatigantes que la semaine qu'elles remplacent.</p>
<p>Au fond, la question n'est peut-être pas le nombre de jours, mais la manière dont le travail est organisé. Là où la semaine de quatre jours réussit, elle s'accompagne d'une réflexion sur les priorités et d'une évaluation fondée sur les résultats plutôt que sur le temps de présence. Imposée sans cette réflexion, elle risque de n'être qu'un emploi du temps redessiné.</p>`,
    qs: [
      CQ('cdt4-1', 'idee', 'Quelle est l\'idée principale du texte ?', ['La semaine de quatre jours recouvre des modèles différents, et son succès dépend surtout de l\'organisation du travail.', 'La semaine de quatre jours augmente toujours la productivité.', 'La semaine de quatre jours doit être imposée à tous les secteurs.', 'Les salariés préfèrent travailler moins pour gagner moins.', 'Les réunions sont la principale cause de fatigue au travail.'], 'Le texte distingue deux modèles (§2), présente arguments et limites (§3) et conclut que tout dépend de l\'organisation (§4). « Toujours » et « à tous » sont trop forts.'),
      CQ('cdt4-2', 'detail', 'Selon le texte, en quoi consiste le modèle « comprimé » ?', ['Travailler le même nombre d\'heures sur quatre jours au lieu de cinq.', 'Travailler 32 heures payées comme 35.', 'Supprimer une journée de travail sans rien changer d\'autre.', 'Travailler quatre jours puis prendre quatre jours de repos.', 'Réduire le salaire de 20 %.'], '§2 : « comprimer le même nombre d\'heures sur quatre jours. Les journées s\'allongent ». Les 32 heures payées 35 correspondent au second modèle.'),
      CQ('cdt4-3', 'inference', 'Que peut-on déduire de la position de l\'auteur ?', ['Il juge la semaine de quatre jours utile à condition de repenser l\'organisation du travail.', 'Il y est totalement opposé.', 'Il pense qu\'elle résoudra tous les problèmes du travail.', 'Il estime qu\'elle ne concerne que les hôpitaux.', 'Il considère que le temps de présence est le meilleur indicateur.'], '§4 : « là où la semaine de quatre jours réussit, elle s\'accompagne d\'une réflexion sur les priorités ». L\'auteur est nuancé, ni hostile ni enthousiaste.'),
      CQ('cdt4-4', 'vocab', 'Dans le texte, le mot « intensification » désigne :', ['le fait que le travail devienne plus dense et plus soutenu', 'l\'augmentation des salaires', 'la multiplication des jours de repos', 'la baisse de la motivation', 'l\'allongement des vacances'], '« Des journées plus denses peuvent devenir plus fatigantes » : l\'intensification, c\'est faire autant (ou plus) en moins de temps.'),
      CQ('cdt4-5', 'auteur', 'Pourquoi l\'auteur cite-t-il l\'hôpital, le commerce et le service client ?', ['Pour montrer que le modèle ne convient pas à tous les secteurs.', 'Pour prouver que ces secteurs sont les plus productifs.', 'Pour montrer qu\'ils ont déjà adopté la semaine de quatre jours.', 'Pour illustrer le recrutement dans les métiers en tension.', 'Pour critiquer leurs conditions de travail.'], 'Ces exemples appuient l\'argument des critiques : ces activités doivent fonctionner « six ou sept jours sur sept ».'),
    ],
  },
  {
    id: 'cdt5', title: 'Le surtourisme',
    html: `<p>Ruelles saturées, files d'attente interminables devant les monuments, habitants qui désertent les centres historiques : dans plusieurs grandes destinations, le tourisme est devenu une source de tension. On parle désormais de « surtourisme » pour désigner cette situation où le nombre de visiteurs dépasse ce qu'un lieu peut accueillir sans se dégrader.</p>
<p>Le phénomène a plusieurs causes. Les vols à bas prix et les croisières ont rendu les voyages plus accessibles. Les plateformes de location de courte durée ont multiplié les hébergements touristiques au cœur des villes. Enfin, les réseaux sociaux concentrent les visiteurs sur les mêmes points de vue, devenus incontournables parce qu'ils sont photographiés par tous.</p>
<p>Les conséquences dépassent la simple gêne. Lorsque des logements entiers sont réservés aux touristes, les loyers augmentent et les habitants s'éloignent ; les commerces de proximité cèdent la place aux boutiques de souvenirs. Les sites naturels souffrent de l'érosion et des déchets. Pourtant, le tourisme fait vivre des millions de personnes, et nombre de villes ne sauraient s'en passer. C'est tout le dilemme : comment préserver un lieu sans renoncer à ce qui le fait vivre ?</p>
<p>Les réponses se multiplient : encadrement des locations de courte durée, quotas de visiteurs, réservations obligatoires, taxes pour les excursions à la journée. Mais la piste la plus prometteuse est sans doute de mieux répartir les visiteurs, dans l'espace comme dans le temps, en valorisant des destinations moins connues et des périodes moins fréquentées. L'objectif n'est pas d'avoir moins de touristes, mais un tourisme mieux réparti.</p>`,
    qs: [
      CQ('cdt5-1', 'idee', 'Quelle est l\'idée principale du texte ?', ['Le surtourisme a des causes et des effets multiples, et la solution passe surtout par une meilleure répartition des visiteurs.', 'Il faut interdire le tourisme dans les centres historiques.', 'Les réseaux sociaux sont la seule cause du surtourisme.', 'Le tourisme n\'apporte aucun bénéfice aux villes.', 'Les croisières sont plus polluantes que les avions.'], 'Le texte définit le phénomène (§1), ses causes (§2), ses effets et le dilemme (§3), puis les solutions, dont la meilleure répartition (§4).'),
      CQ('cdt5-2', 'detail', 'Quel rôle le texte attribue-t-il aux réseaux sociaux ?', ['Ils concentrent les visiteurs sur les mêmes lieux.', 'Ils permettent de mieux répartir les touristes.', 'Ils font baisser les prix des voyages.', 'Ils multiplient les locations de courte durée.', 'Ils incitent les habitants à quitter les centres-villes.'], '§2 : « les réseaux sociaux concentrent les visiteurs sur les mêmes points de vue ».'),
      CQ('cdt5-3', 'inference', 'Que peut-on déduire de la position de l\'auteur ?', ['Il ne souhaite pas réduire le tourisme mais mieux l\'organiser.', 'Il souhaite que les touristes restent chez eux.', 'Il pense que les taxes sont la meilleure solution.', 'Il juge le phénomène sans importance.', 'Il défend les plateformes de location.'], 'Dernière phrase : « L\'objectif n\'est pas d\'avoir moins de touristes, mais un tourisme mieux réparti. » Les taxes sont citées parmi d\'autres réponses, pas comme la meilleure.'),
      CQ('cdt5-4', 'vocab', 'Dans le texte, le mot « dilemme » désigne :', ['une situation où il faut choisir entre deux exigences difficiles à concilier', 'une solution simple et évidente', 'un conflit entre deux villes', 'une erreur de calcul', 'une loi qui encadre le tourisme'], 'Le dilemme oppose préserver un lieu et ne pas renoncer à ce qui le fait vivre : deux exigences contradictoires.'),
      CQ('cdt5-5', 'auteur', 'À quoi sert l\'exemple des commerces de proximité remplacés par des boutiques de souvenirs ?', ['À illustrer les conséquences du surtourisme sur la vie des habitants.', 'À montrer que le tourisme crée des emplois.', 'À critiquer les vols à bas prix.', 'À prouver que les loyers baissent.', 'À présenter une solution au surtourisme.'], 'Il fait partie des conséquences décrites au §3 : la ville se transforme au détriment de ceux qui y vivent.'),
    ],
  },
].forEach((t) => {
  TM.cdtTexts.push(t);
  t.qs.forEach((q) => TM.banks.cdt.push(Object.assign({}, q, { textId: t.id, passage: t.html, passageTitle: t.title })));
});

TM.banks.ra.push(
  RAQ('ra29', 'concl', 'En cinq ans, les ventes de vélos électriques ont doublé dans la ville, pendant que le nombre de pistes cyclables triplait. Or, d\'après les enquêtes, le manque de pistes sécurisées est le premier frein cité par ceux qui n\'utilisent pas le vélo.', 'Quelle conclusion ces informations soutiennent-elles le mieux ?', ['Le développement des pistes cyclables a probablement contribué à la hausse des ventes de vélos électriques.', 'Tous les habitants vont bientôt se déplacer à vélo.', 'Les vélos électriques sont devenus moins chers.', 'La ville devrait interdire les voitures.', 'Les pistes cyclables ont été financées par les ventes de vélos.'], 'Le premier frein (le manque de pistes) a été fortement réduit au moment où les ventes ont doublé : la 1re réponse est la conclusion prudente qui en découle. Les autres ajoutent des informations ou vont trop loin.'),
  RAQ('ra30', 'hyp', 'Cette start-up vient de lever 10 millions d\'euros auprès d\'investisseurs. Elle va donc forcément devenir rentable.', 'Sur quelle hypothèse repose ce raisonnement ?', ['Disposer de beaucoup de capitaux suffit pour devenir rentable.', 'Les investisseurs se trompent souvent.', 'La start-up a beaucoup de concurrents.', 'Les start-up ne lèvent jamais autant d\'argent.', 'La rentabilité dépend du secteur d\'activité.'], 'Pour passer de « elle a levé des fonds » à « elle sera rentable », il faut supposer que l\'argent suffit. Nier cette hypothèse fait tomber l\'argument.'),
  RAQ('ra31', 'aff', 'Le directeur affirme que la nouvelle cantine, plus équilibrée, a amélioré la santé des salariés : les arrêts maladie ont baissé de 15 % cette année.', 'Quelle information affaiblit le plus ce raisonnement ?', ['L\'année précédente, une épidémie de grippe avait fait exploser le nombre d\'arrêts maladie.', 'La nouvelle cantine propose des plats végétariens.', 'Les salariés apprécient la nouvelle cantine.', 'Le prix des repas a légèrement augmenté.', 'La cantine a été rénovée par une entreprise locale.'], 'Si l\'année de comparaison était exceptionnellement mauvaise, la baisse s\'explique par le retour à la normale, pas par la cantine.'),
  RAQ('ra32', 'renf', 'La mairie affirme que le remplacement de l\'éclairage public par des ampoules LED a fait baisser sa facture d\'électricité de 20 %.', 'Quelle information renforce le plus cette affirmation ?', ['Le prix du kilowattheure a augmenté pendant la même période.', 'Les ampoules LED durent plus longtemps.', 'Les habitants trouvent le nouvel éclairage agréable.', 'La mairie a aussi acheté des véhicules électriques.', 'D\'autres villes ont fait le même choix.'], 'Si la facture baisse alors que le prix de l\'électricité augmente, c\'est que la consommation a beaucoup baissé : l\'effet des LED en sort renforcé. Les véhicules électriques, eux, brouilleraient la comparaison.'),
  RAQ('ra33', 'logique', 'Aucun salarié en période d\'essai ne peut poser de congés. Clara a posé des congés la semaine dernière.', 'Que peut-on en déduire ?', ['Clara n\'est pas en période d\'essai.', 'Clara est en période d\'essai.', 'Clara a demandé l\'autorisation de son manager.', 'Tous les salariés posent des congés.', 'On ne peut rien conclure.'], '« Aucun salarié en période d\'essai ne pose de congés » équivaut à « quiconque pose des congés n\'est pas en période d\'essai ».'),
  RAQ('ra34', 'logique', 'Seuls les clients fidèles reçoivent le code promotionnel. Marc a reçu le code promotionnel.', 'Que peut-on en déduire avec certitude ?', ['Marc est un client fidèle.', 'Tous les clients fidèles ont reçu le code.', 'Marc a utilisé le code.', 'Marc n\'est pas un client fidèle.', 'Le code est valable pour tous les produits.'], '« Seuls les fidèles reçoivent le code » : recevoir le code implique d\'être fidèle. En revanche, rien ne dit que tous les fidèles l\'ont reçu.'),
  RAQ('ra35', 'faille', 'Un sondage réalisé sur le site internet d\'un club de golf montre que 80 % des répondants trouvent que le golf n\'est pas assez diffusé à la télévision. Les Français réclament donc davantage de golf à la télévision.', 'Quelle est la faille de ce raisonnement ?', ['L\'échantillon interrogé n\'est pas représentatif de la population.', 'Il confond la cause et la conséquence.', 'Il attaque les opposants au golf.', 'Il s\'appuie sur une autorité non compétente.', 'Il présente un faux dilemme.'], 'Les visiteurs du site d\'un club de golf aiment le golf : on ne peut pas étendre leur avis à tous les Français.'),
  RAQ('ra36', 'parad', 'Un restaurant a augmenté ses prix de 15 %, et pourtant son nombre de clients a augmenté.', 'Quelle information explique le mieux ce constat ?', ['Le restaurant a reçu au même moment une distinction dans un guide gastronomique réputé.', 'Les prix ont augmenté dans tous les restaurants.', 'Le restaurant a réduit la taille de ses portions.', 'Le chef a changé la couleur de la salle.', 'Les clients se plaignent des prix.'], 'Une distinction attire de nouveaux clients malgré la hausse des prix. Réduire les portions, au contraire, n\'explique pas l\'afflux.'),
  RAQ('ra37', 'para', 'Si une plante est trop arrosée, elle pourrit. Cette plante n\'a pas pourri. Donc elle n\'a pas été trop arrosée.', 'Quel raisonnement a exactement la même structure ?', ['Si un candidat triche, il est disqualifié. Ce candidat n\'a pas été disqualifié. Donc il n\'a pas triché.', 'Si un candidat triche, il est disqualifié. Ce candidat a été disqualifié. Donc il a triché.', 'Si un candidat triche, il est disqualifié. Ce candidat n\'a pas triché. Donc il n\'a pas été disqualifié.', 'Certains candidats trichent. Ce candidat est disqualifié. Donc il a triché.', 'Aucun candidat ne triche. Donc personne n\'est disqualifié.'], 'Structure : si A alors B ; non B ; donc non A (la contraposée, valide). La 2e réponse affirme la réciproque, la 3e nie l\'antécédent : deux erreurs classiques.'),
  RAQ('ra38', 'hyp', 'Les étudiants qui utilisent cette application de révision obtiennent de meilleures notes que les autres. L\'université devrait donc l\'offrir à tous ses étudiants pour améliorer leurs résultats.', 'Sur quelle hypothèse repose cette recommandation ?', ['C\'est l\'utilisation de l\'application qui améliore les notes, et non le fait que les meilleurs étudiants l\'utilisent davantage.', 'L\'application est gratuite.', 'Tous les étudiants ont un smartphone.', 'Les notes sont le seul indicateur de réussite.', 'L\'université a les moyens de payer l\'application.'], 'Le raisonnement suppose un lien de cause à effet. Si ce sont simplement les étudiants déjà sérieux qui utilisent l\'application, l\'offrir à tous ne changerait rien.'),
  RAQ('ra39', 'faille', 'Mon adversaire propose de réduire légèrement le budget de la défense. Il veut donc laisser notre pays sans aucune protection.', 'Quelle est la faille de ce raisonnement ?', ['Il déforme la position de l\'adversaire pour la rendre plus facile à attaquer.', 'Il s\'appuie sur une statistique erronée.', 'Il généralise à partir d\'un seul cas.', 'Il confond corrélation et causalité.', 'Il utilise sa conclusion comme preuve.'], 'C\'est un « homme de paille » : une légère réduction est transformée en abandon total de la défense, position que l\'adversaire n\'a jamais défendue.'),
  RAQ('ra40', 'concl', 'Toutes les entreprises du secteur qui ont généralisé le télétravail ont vu leurs coûts immobiliers baisser. L\'entreprise Novalia appartient à ce secteur et a généralisé le télétravail.', 'Que peut-on en conclure ?', ['Les coûts immobiliers de Novalia ont baissé.', 'Novalia a augmenté sa productivité.', 'Toutes les entreprises du secteur ont généralisé le télétravail.', 'Les salariés de Novalia sont satisfaits.', 'Novalia va déménager.'], 'C\'est une déduction directe : Novalia fait partie du groupe dont « toutes » les entreprises ont vu leurs coûts baisser.'),
);

TM.banks.expr.push(
  EXQ('ex94', 'accords', 'Complétez : « Les efforts qu\'il a ____ ont enfin porté leurs fruits. »', ['fournis', 'fourni', 'fournies', 'fournie', 'fournit'], 'Avec avoir, accord avec le COD placé avant : « qu\' » reprend « les efforts » (masculin pluriel) → <b>fournis</b>.'),
  EXQ('ex95', 'accords', 'Complétez : « Elle s\'est vite ____ de son erreur. »', ['rendu compte', 'rendue compte', 'rendus compte', 'rendues compte', 'rendu comptes'], 'Dans « se rendre compte », le COD est « compte » : le participe reste invariable → <b>rendu compte</b>.'),
  EXQ('ex96', 'accords', 'Complétez : « Veuillez trouver les factures ____. »', ['ci-jointes', 'ci-joint', 'ci-joints', 'ci-jointe', 'ci-joignées'], 'Placé APRÈS le nom, « ci-joint » s\'accorde avec lui : les factures → <b>ci-jointes</b>.'),
  EXQ('ex97', 'accords', 'Complétez : « Il a fait tous les efforts qu\'il a ____. »', ['dû', 'dus', 'due', 'dues', 'du'], 'Le COD de « devoir » est un infinitif sous-entendu (faire) : le participe reste invariable → <b>dû</b> (avec accent, pour ne pas le confondre avec l\'article « du »).'),
  EXQ('ex98', 'accords', 'Complétez : « Elle a les cheveux ____. »', ['châtains', 'châtain', 'châtaine', 'châtaines', 'châtainés'], '« Châtain » est un vrai adjectif de couleur : il s\'accorde en nombre avec « cheveux » → <b>châtains</b> (contrairement à « marron »).'),
  EXQ('ex99', 'conjug', 'Complétez : « Il faut que tu ____ ce dossier avant midi. »', ['finisses', 'finis', 'finiras', 'finissais', 'finirais'], '« Il faut que » est suivi du subjonctif : que tu <b>finisses</b>.'),
  EXQ('ex100', 'conjug', 'Complétez : « Pourvu qu\'il ____ beau demain ! »', ['fasse', 'fait', 'fera', 'faisait', 'ferait'], '« Pourvu que » exprime un souhait : subjonctif → <b>fasse</b>.'),
  EXQ('ex101', 'conjug', 'Complétez : « Bien que nous ____ tout essayé, rien n\'a fonctionné. »', ['ayons', 'avons', 'aurions', 'aurons', 'ayions'], '« Bien que » + subjonctif passé : que nous <b>ayons</b> essayé (sans i après le y).'),
  EXQ('ex102', 'conjug', 'Complétez au passé simple : « Le président ____ la séance à 18 heures. »', ['conclut', 'concluit', 'conclua', 'concluta', 'conclat'], 'Conclure au passé simple : il <b>conclut</b>.'),
  EXQ('ex103', 'conjug', 'Complétez au passé simple : « Les jumeaux ____ un matin de printemps. »', ['naquirent', 'naîtèrent', 'naissèrent', 'nacquirent', 'naîtrent'], 'Naître au passé simple : ils <b>naquirent</b>.'),
  EXQ('ex104', 'conjug', 'Complétez : « Quand vous ____ terminé, vous pourrez partir. »', ['aurez', 'auriez', 'avez', 'ayez', 'aviez'], 'Action antérieure à une autre action future : futur antérieur → vous <b>aurez</b> terminé.'),
  EXQ('ex105', 'homo', 'Complétez : « Je ne pensais pas arriver ____. »', ['aussi tôt', 'aussitôt', 'aussitot', 'aussi-tôt', 'ausitôt'], '« Aussi tôt » (en deux mots) = si tôt, le contraire de « aussi tard ».'),
  EXQ('ex106', 'homo', 'Complétez : « Il est reparti ____ après le repas. »', ['aussitôt', 'aussi tôt', 'aussitot', 'aussi-tôt', 'ausitôt'], '« Aussitôt » (en un mot) = immédiatement.'),
  EXQ('ex107', 'homo', 'Complétez : « ____ tu dises, je ne changerai pas d\'avis. »', ['Quoi que', 'Quoique', 'Quoi-que', 'Quoiqu\'', 'Quoique que'], '« Quoi que » (en deux mots) = quelle que soit la chose que. « Quoique » = bien que.'),
  EXQ('ex108', 'homo', 'Complétez : « ____ fatigué, il a terminé la course. »', ['Quoique', 'Quoi que', 'Quoi-que', 'Quoiqu\'il', 'Quoiqueque'], '« Quoique » (en un mot) = bien que, même s\'il était.'),
  EXQ('ex109', 'homo', 'Complétez : « Il ne l\'a pas fait ____ : c\'était un accident. »', ['exprès', 'express', 'exprés', 'expresse', 'exprèsse'], '« Exprès » = volontairement. « Express » = rapide (un train express).'),
  EXQ('ex110', 'homo', 'Complétez : « Il raconte cette anecdote à ____. »', ['l\'envi', 'l\'envie', 'l\'envis', 'l\'envies', 'lenvi'], '« À l\'envi » (sans e) signifie « à volonté, à qui mieux mieux ».'),
  EXQ('ex111', 'paro', 'Complétez : « La ____ entre les deux voitures a fait trois blessés. »', ['collision', 'collusion', 'coalition', 'collation', 'colision'], '<b>Collision</b> = choc. « Collusion » = entente secrète.'),
  EXQ('ex112', 'paro', 'Complétez : « Le ministre a prononcé une courte ____. »', ['allocution', 'allocation', 'élocution', 'locution', 'collocation'], 'Une <b>allocution</b> est un discours. Une « allocation » est une somme versée.'),
  EXQ('ex113', 'paro', 'Complétez : « Des manifestants ont fait ____ dans la salle du conseil. »', ['irruption', 'éruption', 'interruption', 'corruption', 'irrution'], 'Faire <b>irruption</b> = entrer brusquement. Une « éruption » est une sortie brutale (volcan).'),
  EXQ('ex114', 'paro', 'Complétez : « L\'____ du toit permet à la pluie de s\'écouler. »', ['inclinaison', 'inclination', 'déclinaison', 'inclinaisson', 'inclinaition'], 'L\'<b>inclinaison</b> est une pente. L\'« inclination » est un penchant, un goût.'),
  EXQ('ex115', 'paro', 'Complétez : « Elle a une vraie ____ pour la musique classique. »', ['inclination', 'inclinaison', 'déclinaison', 'indication', 'incantation'], 'Une <b>inclination</b> = un penchant, une préférence.'),
  EXQ('ex116', 'vocab', 'Que signifie <b>prosaïque</b> ?', ['Banal, terre à terre', 'Très poétique', 'Écrit en prose et en vers', 'Plein de prospérité', 'Prétentieux'], '<b>Prosaïque</b> : qui manque d\'idéal ou de poésie, ordinaire.'),
  EXQ('ex117', 'vocab', 'Que signifie <b>dithyrambique</b> ?', ['Extrêmement élogieux', 'Très critique', 'Rythmé et musical', 'Difficile à prononcer', 'Ennuyeux'], 'Une critique <b>dithyrambique</b> fait un éloge enthousiaste, voire excessif.'),
  EXQ('ex118', 'vocab', 'Que signifie <b>abscons</b> ?', ['Difficile à comprendre', 'Absent', 'Absolument certain', 'Abîmé', 'Très court'], '<b>Abscons</b> : obscur, hermétique (un discours abscons).'),
  EXQ('ex119', 'vocab', 'Que signifie <b>inique</b> ?', ['Profondément injuste', 'Unique en son genre', 'Sans importance', 'Très ancien', 'Naïf'], '<b>Inique</b> : contraire à l\'équité (une décision inique).'),
  EXQ('ex120', 'vocab', 'Que signifie <b>probe</b> ?', ['Honnête, intègre', 'Probable', 'Prudent', 'Fier', 'Problématique'], '<b>Probe</b> : d\'une honnêteté scrupuleuse (nom : la probité).'),
  EXQ('ex121', 'vocab', 'Que désigne une <b>gageure</b> ?', ['Une entreprise très difficile à réussir', 'Une somme d\'argent prêtée', 'Un salaire', 'Une garantie bancaire', 'Un pari perdu d\'avance'], 'Une <b>gageure</b> (prononcer « gajure ») est un défi presque impossible à relever.'),
  EXQ('ex122', 'accords', 'Complétez : « C\'est toi qui ____ raison. »', ['as', 'a', 'ai', 'avez', 'ont'], 'Après « c\'est toi qui », le verbe s\'accorde avec « toi » (2e personne du singulier) → tu <b>as</b>.'),
  EXQ('ex123', 'synt', 'Quelle expression est un <b>pléonasme</b> ?', ['Réitérer à nouveau sa demande', 'Réitérer sa demande', 'Renouveler sa demande', 'Répéter sa demande', 'Formuler de nouveau sa demande'], '« Réitérer » signifie déjà « faire de nouveau » : « à nouveau » est de trop.'),
  EXQ('ex124', 'synt', 'Choisissez le connecteur : « Il pleuvait à verse ; ____, le match a eu lieu. »', ['néanmoins', 'donc', 'car', 'ainsi', 'c\'est pourquoi'], 'Le match a eu lieu malgré la pluie : opposition → <b>néanmoins</b>.'),
  EXQ('ex125', 'synt', 'Complétez : « Il a réussi son examen ____ ses efforts réguliers. »', ['grâce à', 'à cause de', 'faute de', 'en dépit de', 'malgré'], 'Cause positive → <b>grâce à</b>. « À cause de » introduit plutôt une cause négative.'),
  EXQ('ex126', 'synt', 'Complétez : « Il a échoué ____ préparation suffisante. »', ['faute de', 'grâce à', 'à cause de la', 'en raison de sa', 'malgré'], '« Faute de » = par manque de. Les autres constructions ne conviennent pas ici.'),
);

/* ---- 70-ai.js ---- */
/* ===== IA (Claude) : explications, prof particulier, génération de questions ===== */
function toPlain(html) {
  if (typeof document === 'undefined') return String(html || '').replace(/<[^>]+>/g, ' ');
  const d = document.createElement('div');
  d.innerHTML = html || '';
  d.querySelectorAll('svg').forEach((s) => s.replaceWith('[figure]'));
  let guard = 0, inner;
  while ((inner = Array.from(d.querySelectorAll('.fr')).filter((f) => !f.querySelector('.fr'))).length && guard++ < 50) {
    inner.forEach((f) => { const [a, b] = f.children; f.replaceWith(`(${a ? a.textContent : ''})/(${b ? b.textContent : ''})`); });
  }
  d.querySelectorAll('.sq').forEach((s) => { const r = s.querySelector('.sq-r'); s.replaceWith(`√(${r ? r.textContent : ''})`); });
  d.querySelectorAll('sup').forEach((s) => s.replaceWith('^' + s.textContent));
  d.querySelectorAll('li').forEach((li) => li.prepend('- '));
  d.querySelectorAll('p, li, div, br').forEach((n) => n.append('\n'));
  return d.textContent.replace(/[ \t ]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

const AI_THEMES = ['la semaine de quatre jours', 'l\'intelligence artificielle et l\'emploi', 'la mode éphémère (fast fashion)', 'le tourisme de masse', 'la sobriété énergétique', 'les cryptomonnaies', 'le marketing d\'influence', 'la désinformation en ligne', 'la revitalisation des villes moyennes', 'le sport professionnel et l\'argent', 'la voiture électrique', 'l\'économie du partage', 'la gratuité des services publics', 'la place des seniors dans l\'entreprise', 'le commerce en ligne et les centres-villes', 'la souveraineté industrielle', 'le bien-être au travail', 'l\'endettement des États', 'la publicité ciblée', 'les start-up et la prise de risque'];

const AI = {
  fn: null,
  off: false,
  ready: false,
  async init() {
    if (typeof window === 'undefined' || !window.claude || typeof window.claude.use !== 'function') { this.ready = true; return; }
    try { this.fn = await window.claude.use('sample'); } catch (e) { this.fn = null; }
    this.ready = true;
  },
  available() { return !!this.fn && !this.off; },
  errMsg(e) {
    const c = e && e.code;
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) { this.off = true; return 'Claude n\'est pas autorisé sur cette page. L\'app fonctionne sans l\'IA ; tu peux l\'autoriser depuis le menu Autorisations de l\'artifact.'; }
    if (c === 'rate_limited') return 'Limite d\'utilisation de Claude atteinte pour le moment. Réessaie un peu plus tard.';
    if (c === 'session_expired') return 'Ta session Claude a expiré : reconnecte-toi puis réessaie.';
    if (c === 'refused') return 'Claude n\'a pas pu répondre à cette demande. Reformule ta question.';
    if (c === 'invalid_json') return 'La réponse de Claude était incomplète. Réessaie.';
    if (c === 'prompt_too_large') return 'La demande est trop longue. Raccourcis ton message.';
    if (c === 'cancelled') return '';
    return 'Problème de connexion avec Claude. Réessaie dans un instant.';
  },
  profile() {
    const p = Store.S.profile;
    return `Profil de l'élève : ${p.about || 'non renseigné'} Objectif : ${p.target}/600.${p.examDate ? ' Date du test : ' + p.examDate + '.' : ' Date du test : pas encore fixée.'}`;
  },
  rules: 'Règles d\'écriture : français, tutoiement, phrases courtes, pas de LaTeX ni de balises ; écris les fractions sous la forme a/b, utilise ×, ÷, √ et le symbole %, numérote les étapes de calcul.',

  questionText(q, chosen) {
    const sub = SUB[q.sub] ? SUB[q.sub].name : q.sub;
    let t = `Sous-test : ${sub}.\n`;
    if (q.passageTitle || q.passage) t += `TEXTE (extrait) : ${toPlain(q.passage || '').slice(0, 2500)}\n`;
    t += `QUESTION : ${q.aiq || toPlain(q.q)}\n`;
    if (q.visual && !q.aiq) t += `(La question comporte une figure : ${toPlain(q.visual).slice(0, 300)})\n`;
    if (q.stmts) t += `Condition (1) : ${toPlain(q.stmts[0])}\nCondition (2) : ${toPlain(q.stmts[1])}\n`;
    const ch = q.aic || q.choices.map(toPlain);
    t += 'CHOIX :\n' + ch.map((c, i) => `${LETTERS[i]}) ${c}`).join('\n') + '\n';
    t += `BONNE RÉPONSE : ${LETTERS[q.answer]}\n`;
    t += chosen == null ? 'L\'élève n\'a pas répondu.\n' : chosen === q.answer ? 'L\'élève a trouvé la bonne réponse mais veut mieux comprendre.\n' : `RÉPONSE DE L'ÉLÈVE : ${LETTERS[chosen]}\n`;
    t += `CORRECTION DE L'APP : ${toPlain(q.expl || '')}\n`;
    return t;
  },

  async explain(q, chosen, onText, signal) {
    const wrong = chosen != null && chosen !== q.answer;
    const prompt = `Tu es un professeur particulier expert du Tage Mage (test d'admission des écoles de commerce françaises). ${this.profile()}\n\n${this.questionText(q, chosen)}\nExplique autrement et très simplement, pour quelqu'un qui a un bac STMG et qui est lent en calcul mental :\n${wrong ? '1. l\'erreur de raisonnement que l\'élève a probablement faite,\n2.' : '1.'} la méthode la plus rapide pour trouver la bonne réponse en moins de 80 secondes le jour du test,\n${wrong ? '3.' : '2.'} un réflexe ou une astuce à retenir pour la prochaine fois.\n180 mots maximum. ${this.rules}`;
    const r = await this.fn(prompt, { onText, signal, cache: { gcTime: 3600000 } });
    return r.text;
  },

  async chat(turns, onText, signal) {
    const rules = `Tu es « Prof », le professeur particulier de l'élève dans son application de révision du Tage Mage « Objectif 400 ». ${this.profile()}\nBilan calculé par l'application : ${statsSummary()}\nRappels : le Tage Mage comporte 6 sous-tests de 15 questions en 20 minutes (Compréhension de textes, Calcul, Raisonnement & Argumentation, Conditions minimales, Expression, Logique), QCM à 5 choix, pas de calculatrice, score sur 600. Barème utilisé dans l'app : ${scoringPenalty() ? '+4 par bonne réponse, −1 par mauvaise' : '+4 par bonne réponse, 0 pour une mauvaise ou une absence de réponse'}.\nTa mission : expliquer simplement, donner des méthodes rapides et des astuces de calcul mental, proposer des mini-exercices (une seule question à la fois ; attends la réponse de l'élève avant de corriger), et motiver sans infantiliser. Si on te parle d'autre chose, ramène gentiment vers la préparation.\nRéponses courtes (150 mots maximum sauf si l'élève demande plus). ${this.rules}`;
    const msgs = [{ role: 'user', content: rules }, { role: 'assistant', content: 'Compris. Je suis prêt à aider l\'élève.' }, ...turns.slice(-16)];
    const r = await this.fn(msgs, { onText, signal, cache: false });
    return r.text;
  },

  async coach(onText, signal) {
    const prompt = `Tu es le coach Tage Mage de l'élève. ${this.profile()}\nVoici ses statistiques calculées par l'application : ${statsSummary()}\nDonne-lui un diagnostic honnête et un plan pour les 7 prochains jours : 1) ses 3 priorités (chapitres précis), 2) ce qu'il fait déjà bien, 3) un programme jour par jour réaliste avec ${Store.S.profile.dailyMin} minutes par jour, 4) une phrase de motivation. 220 mots maximum. ${this.rules}`;
    const r = await this.fn(prompt, { onText, signal, cache: false });
    return r.text;
  },

  validItem(x, nCh = 5) {
    return x && Array.isArray(x.choix) && x.choix.length === nCh && x.choix.every((c) => typeof c === 'string' && c.trim()) &&
      new Set(x.choix.map((c) => c.trim().toLowerCase())).size === nCh && Number.isInteger(x.bonne) && x.bonne >= 0 && x.bonne < nCh && typeof x.explication === 'string';
  },
  mkQ(sub, skillCat, qHtml, x, extra = {}) {
    return Object.assign({ id: 'ai-' + uid(), kind: 'qcm', sub, skill: sub + '.' + skillCat, diff: 2, q: qHtml, choices: x.choix.map((c) => inlineMd(esc(c.trim()))), answer: x.bonne, expl: md(x.explication), ai: true, target: 80 }, extra);
  },

  async generate(sub, n, opts = {}) {
    const lvl = opts.level || 'difficile, comparable au vrai test';
    let prompt, data;
    if (sub === 'ra') {
      prompt = `Crée ${n} questions ORIGINALES du sous-test « Raisonnement & Argumentation » du Tage Mage, niveau ${lvl}, en français.\nChaque question : un court raisonnement (3 à 5 phrases) sur un thème d'économie, de management, de société ou d'actualité, suivi d'une consigne parmi : trouver la conclusion, l'hypothèse implicite, ce qui affaiblit le plus, ce qui renforce le plus, la faille du raisonnement, le raisonnement de même structure, ce que l'on peut déduire avec certitude, ce qui explique un paradoxe. Varie les consignes et les thèmes.\n5 choix plausibles et une seule réponse indiscutable. Les mauvaises réponses doivent correspondre à des pièges classiques (trop fort, hors sujet, réciproque, simple reprise d'une prémisse…).\nRéponds UNIQUEMENT avec un tableau JSON de cette forme : [{"argument": "…", "consigne": "…", "choix": ["…", "…", "…", "…", "…"], "bonne": 2, "explication": "…"}] où "bonne" est l'indice (0 à 4) de la bonne réponse. Place la bonne réponse à des positions variées. L'explication (2 à 4 phrases) dit pourquoi la bonne réponse est juste et pourquoi le piège principal est faux.`;
      data = await this.fn.json(prompt, { cache: false });
      if (!Array.isArray(data)) throw { code: 'invalid_json' };
      return data.filter((x) => this.validItem(x) && x.argument && x.consigne).slice(0, n).map((x) => this.mkQ('ra', 'ia', `<p class="arg">${inlineMd(esc(x.argument))}</p><p><b>${inlineMd(esc(x.consigne))}</b></p>`, x));
    }
    if (sub === 'expr') {
      const focus = opts.focus || 'mélange : accords du participe passé, conjugaison et modes (subjonctif, concordance des temps), homophones, paronymes, sens de mots soutenus, constructions verbales, pléonasmes, connecteurs logiques';
      prompt = `Crée ${n} questions ORIGINALES du sous-test « Expression » du Tage Mage (français écrit soutenu), niveau ${lvl}. Thèmes : ${focus}.\nFormats : phrase à compléter (avec ____), « Quelle phrase est correcte ? », « Que signifie le mot … ? ».\n5 choix, une seule réponse correcte selon la norme (Académie française, grammaires de référence), sans aucune ambiguïté.\nRéponds UNIQUEMENT avec un tableau JSON : [{"question": "…", "choix": ["…", "…", "…", "…", "…"], "bonne": 0, "explication": "la règle en 1 ou 2 phrases"}] ; "bonne" est l'indice de 0 à 4, à des positions variées.`;
      data = await this.fn.json(prompt, { cache: false });
      if (!Array.isArray(data)) throw { code: 'invalid_json' };
      return data.filter((x) => this.validItem(x) && x.question).slice(0, n).map((x) => this.mkQ('expr', 'ia', `<p>${inlineMd(esc(x.question))}</p>`, x));
    }
    if (sub === 'cdt') {
      const theme = opts.theme || AI_THEMES[Math.floor(Math.random() * AI_THEMES.length)];
      prompt = `Écris un texte ORIGINAL de 450 à 550 mots, niveau universitaire, sur le thème : « ${theme} ». Style d'article d'analyse (presse économique ou essai), avec une thèse claire, des nuances, des exemples et des connecteurs logiques.\nPuis écris 5 questions de compréhension type Tage Mage, dans cet ordre de types : idée principale, détail, inférence, vocabulaire en contexte, position de l'auteur ou rôle d'un exemple. 5 choix par question, une seule bonne réponse justifiable par le texte ; les mauvaises réponses sont des pièges classiques (trop fort, déformation, hors texte, trop étroit).\nRéponds UNIQUEMENT avec un objet JSON : {"titre": "…", "texte": ["paragraphe 1", "paragraphe 2", "…"], "questions": [{"type": "idee", "question": "…", "choix": ["…", "…", "…", "…", "…"], "bonne": 0, "explication": "… (cite le passage utile)"}]} ; "bonne" est l'indice de 0 à 4, à des positions variées.`;
      data = await this.fn.json(prompt, { cache: false });
      if (!data || !Array.isArray(data.texte) || !Array.isArray(data.questions)) throw { code: 'invalid_json' };
      const html = data.texte.filter((p) => typeof p === 'string').map((p) => `<p>${esc(p)}</p>`).join('');
      const title = esc(data.titre || theme);
      const types = ['idee', 'detail', 'inference', 'vocab', 'auteur'];
      return data.questions.filter((x) => this.validItem(x) && x.question).slice(0, 5).map((x, i) => this.mkQ('cdt', types.includes(x.type) ? x.type : types[i] || 'idee', `<p><b>${inlineMd(esc(x.question))}</b></p>`, x, { passage: html, passageTitle: title }));
    }
    throw { code: 'invalid_request' };
  },
};

/* Résumé texte des statistiques, pour le prof et le coach */
function statsSummary() {
  const S = Store.S, lines = [];
  for (const s of SUBS) {
    const h = (S.subs[s.id] && S.subs[s.id].hist) || [];
    const p = projectSub(s.id);
    const acc = h.length ? Math.round(100 * h.reduce((a, x) => a + x[0], 0) / h.length) : null;
    lines.push(`${s.name} : ${h.length ? `${h.length} réponses récentes, ${acc} % de réussite` : 'pas encore travaillé'}${p != null ? `, estimation ${p}/60` : ''}`);
  }
  const weak = Object.values(TM.chapters).map((c) => ({ c, m: chapterMastery(c.id) })).filter((x) => x.m != null).sort((a, b) => a.m - b.m).slice(0, 4).map((x) => `${x.c.title} (${x.m} %)`);
  const pt = projectTotal();
  return lines.join(' ; ') + '. ' + (weak.length ? 'Chapitres les plus faibles : ' + weak.join(', ') + '. ' : '') + (pt.total != null ? `Projection actuelle : ${pt.total}/600. ` : '') + `Série de jours de travail : ${streakDays()}.`;
}

/* ---- 80-engine.js ---- */
/* ===== Moteur : choix des questions, épreuves, cahier d'erreurs, programme du jour ===== */
const CALC_W = { pct: 2, vit: 1.6, frac: 1.3, eq: 1.3, proba: 1.3, geo: 1.1, prop: 1.1, moy: 1, arith: 1, pow: 1, trav: 1, suite: 0.7, conv: 0.7, ops: 0.8 };

function genIdsFor(sub, chId) {
  if (chId) return (TM.chapters[chId] ? TM.chapters[chId].gens : []).slice();
  return gensOf(sub).map((g) => g.id);
}
/* Une question d'entraînement adaptée au niveau (avec anti-doublon pour les banques) */
function nextTrainingQ(ctx) {
  const R = makeRng(newSeed());
  for (let tries = 0; tries < 8; tries++) {
    const id = ctx.ids.length === 1 ? ctx.ids[0] : pickGen(R, ctx.ids);
    const q = buildQ(id, newSeed(), ctx.diff || skillLevel(id));
    const key = q.src.t === 'bank' ? q.src.id : null;
    if (key && ctx.used.has(key) && tries < 7) continue;
    if (key) ctx.used.add(key);
    return q;
  }
  return buildQ(ctx.ids[0], newSeed(), 1);
}
function cdtTexts(n) {
  const seen = Store.S.seenBank || {};
  const builtIn = TM.cdtTexts.map((t) => ({ t, last: Math.max(...t.qs.map((q) => seen[q.id] || 0)) })).sort((a, b) => a.last - b.last).map((x) => x.t);
  const sets = builtIn.map((t) => t.qs.map((q) => bankQ(Object.assign({}, q, { textId: t.id, passage: t.html, passageTitle: t.title, ch: 'cdt-methode' }), 'cdt')));
  const ai = aiTextSets();
  const out = [];
  while (out.length < n && (ai.length || sets.length)) {
    if (ai.length && (out.length % 2 === 1 || !sets.length)) out.push(ai.shift());
    else out.push(sets.shift());
  }
  return out;
}
function aiTextSets() {
  const pool = Store.A.cdt || [];
  const byText = {};
  pool.forEach((q) => { (byText[q.passageTitle] = byText[q.passageTitle] || []).push(q); });
  return Object.values(byText).filter((qs) => qs.length >= 3);
}
function consumeAI(sub, qs) {
  const ids = new Set(qs.map((q) => q.id));
  Store.A[sub] = (Store.A[sub] || []).filter((q) => !ids.has(q.id));
  Store.save('ai');
}

/* Questions d'une épreuve chronométrée (15 questions) */
function examQuestions(sub) {
  const R = makeRng(newSeed());
  const diffAt = (i) => (i < 5 ? 1 : i < 11 ? 2 : 3);
  if (sub === 'calcul') {
    const chs = chaptersOf('calcul');
    const pickedGens = new Set(), qs = [];
    let g = 0;
    while (qs.length < 15 && g++ < 300) {
      const ch = R.weighted(chs, chs.map((c) => CALC_W[c.id] || 1));
      const cands = ch.gens.filter((id) => !pickedGens.has(id) && TM.gens[id].diffs.includes(diffAt(qs.length)));
      if (!cands.length) continue;
      const id = R.pick(cands); pickedGens.add(id);
      qs.push(buildQ(id, newSeed(), diffAt(qs.length)));
    }
    return qs;
  }
  if (sub === 'cm') {
    const ids = R.shuffle(gensOf('cm').map((x) => x.id)).slice(0, 15);
    while (ids.length < 15) ids.push(R.pick(gensOf('cm')).id);
    return ids.map((id, i) => buildQ(id, newSeed(), diffAt(i)));
  }
  if (sub === 'logique') {
    const plan = R.shuffle(['log.num', 'log.num', 'log.num', 'log.let', 'log.let', 'log.domino', 'log.domino', 'log.domino', 'log.cartes', 'log.cartes', 'log.grille', 'log.grille', 'log.fig', 'log.fig', 'log.horloge']);
    return plan.map((id, i) => buildQ(id, newSeed(), diffAt(i)));
  }
  if (sub === 'cdt') return [].concat(...cdtTexts(3)).slice(0, 15);
  const pool = (Store.A[sub] || []).slice(0, 5);
  const ctx = { ids: genIdsFor(sub), used: new Set(), diff: 2 };
  const qs = pool.slice();
  while (qs.length < 15) qs.push(nextTrainingQ(ctx));
  if (pool.length) consumeAI(sub, pool);
  return R.shuffle(qs);
}

/* ---------- Cahier d'erreurs (répétition espacée) ---------- */
const BOX_DAYS = [0, 1, 3, 7, 16, 35];
function tomorrowStart() { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime() - 3 * 3600000; }
function errKey(q) { return q.src.t === 'gen' ? 'g:' + q.skill + ':' + q.src.s : q.src.t === 'bank' ? 'b:' + q.src.id : 'a:' + q.id; }
function srcFor(q) {
  if (q.src.t !== 'ai') return q.src;
  const snap = { id: q.id, sub: q.sub, skill: q.skill, q: q.q, choices: q.choices, answer: q.answer, expl: q.expl, diff: q.diff, ai: true, kind: 'qcm' };
  if (q.passage) { snap.passage = q.passage; snap.passageTitle = q.passageTitle; }
  return { t: 'ai', q: snap };
}
function addError(q) {
  if (!q || !q.src) return;
  const key = errKey(q), now = Date.now(), E = Store.E.items;
  const e = E[key] || { id: key, sub: q.sub, skill: q.skill, src: srcFor(q), added: now, n: 0 };
  e.box = 1; e.due = tomorrowStart(); e.upd = now; e.n = (e.n || 0) + 1;
  E[key] = e;
}
function dueErrors() { const now = Date.now(); return Object.values(Store.E.items).filter((e) => e.box < 6 && e.due <= now).sort((a, b) => a.due - b.due); }
function activeErrors() { return Object.values(Store.E.items).filter((e) => e.box < 6); }
function reviewQ(e) {
  if (e.src.t === 'gen') { const q = buildQ(e.src.g, newSeed(), e.src.d); q.reviewOf = e.id; return q; }
  const q = rebuild(e.src); if (q) q.reviewOf = e.id; return q;
}
function reviewDone(id, ok) {
  const e = Store.E.items[id]; if (!e) return;
  if (ok) { e.box = Math.min(6, (e.box || 1) + 1); e.due = e.box >= 6 ? Infinity : Date.now() + BOX_DAYS[e.box] * DAY_MS; }
  else { e.box = 1; e.due = tomorrowStart(); }
  e.upd = Date.now();
}

/* ---------- Programme du jour ---------- */
function nextCalcChapter() {
  const chs = chaptersOf('calcul');
  for (const c of chs) { const m = chapterMastery(c.id); if (m == null || m < 70) return c; }
  return chs.slice().sort((a, b) => (chapterMastery(a.id) || 0) - (chapterMastery(b.id) || 0))[0];
}
function drillLevel(id) { const d = Store.S.drills[id]; return (d && d.lvl) || 1; }
function pickWarmDrill(R) {
  const ids = ['dr.tables', 'dr.mul', 'dr.frac', 'dr.pct', 'dr.time', 'dr.dec', 'dr.sq', 'dr.div', 'dr.speed', 'dr.half', 'dr.trick', 'dr.pow'];
  const scored = ids.map((id) => { const d = Store.S.drills[id]; return { id, last: d && d.hist.length ? d.hist[d.hist.length - 1][0] : 0 }; }).sort((a, b) => a.last - b.last);
  return R.pick(scored.slice(0, 4)).id;
}
function dailyPlan() {
  const k = dayKey(), R = makeRng(hashStr(k)), dn = Math.floor(Date.now() / DAY_MS);
  const done = Store.S.plan[k] || [];
  const tasks = [];
  const wd = pickWarmDrill(R);
  tasks.push({ id: 'warm', sub: 'calcul', icon: 'bolt', t: 'Échauffement calcul mental', s: `${TM.drills[wd].name} · 2 minutes`, act: { type: 'drill', drill: wd, dur: 120 } });
  const due = dueErrors().length;
  if (due) tasks.push({ id: 'review', sub: null, icon: 'repeat', t: 'Révisions du cahier d\'erreurs', s: `${plural(Math.min(due, 15), 'question')} à revoir`, act: { type: 'review' } });
  const ch = nextCalcChapter();
  tasks.push({ id: 'calc', sub: 'calcul', icon: 'book', t: `Calcul : ${ch.title}`, s: Store.S.lessons[ch.id] ? '10 questions adaptées à ton niveau' : 'Lire le cours, puis 10 questions', act: { type: 'chapter', ch: ch.id } });
  const logicSub = dn % 2 === 0 ? 'cm' : 'logique';
  tasks.push({ id: 'logic', sub: logicSub, icon: 'target', t: `${SUB[logicSub].name} : 10 questions`, s: logicSub === 'cm' ? 'Méthode A-B-C-D-E, sans calculer jusqu\'au bout' : 'Suites, dominos, figures…', act: { type: 'train', sub: logicSub } });
  if (Store.S.profile.dailyMin >= 30) {
    const vSub = ['ra', 'expr', 'cdt'][dn % 3];
    tasks.push({ id: 'verbal', sub: vSub, icon: 'book', t: `${SUB[vSub].name} : ${vSub === 'cdt' ? '1 texte' : '10 questions'}`, s: vSub === 'cdt' ? 'Garder ton point fort au top' : 'Points rapides à sécuriser', act: { type: 'train', sub: vSub } });
  }
  if (Store.S.profile.dailyMin >= 30) {
    const dueCards = TM.decks.reduce((a, d) => a + deckStats(d).due, 0);
    tasks.push({ id: 'cards', sub: null, icon: 'book', t: 'Fiches mémo : 10 cartes', s: dueCards ? `${plural(dueCards, 'carte')} à revoir · 5 minutes` : 'Nouvelles cartes · 5 minutes, idéal dans les transports', act: { type: 'cards' } });
  }
  if (Store.S.profile.dailyMin >= 45 && dn % 3 === 0) {
    const weakest = SUBS.map((s) => ({ s, p: projectSub(s.id) })).sort((a, b) => (a.p == null ? -1 : a.p) - (b.p == null ? -1 : b.p))[0].s;
    tasks.push({ id: 'exam', sub: weakest.id, icon: 'clock', t: `Épreuve chronométrée : ${weakest.name}`, s: '15 questions en 20 minutes', act: { type: 'exam', sub: weakest.id } });
  }
  return tasks.map((t) => Object.assign(t, { done: done.includes(t.id) }));
}
function markTask(id) {
  if (!id) return;
  const k = dayKey();
  const arr = Store.S.plan[k] || (Store.S.plan[k] = []);
  if (!arr.includes(id)) arr.push(id);
  const keys = Object.keys(Store.S.plan).sort();
  while (keys.length > 30) delete Store.S.plan[keys.shift()];
}
function saveSession(rec) {
  Store.S.sessions.push(rec);
  if (Store.S.sessions.length > 400) Store.S.sessions.splice(0, Store.S.sessions.length - 400);
  if (rec.task) markTask(rec.task);
  Store.save('main');
  Store.save('errors');
}
function markSeen(q) {
  if (q && q.src && q.src.t === 'bank') { const s = Store.S.seenBank || (Store.S.seenBank = {}); s[q.src.id] = Date.now(); }
}

/* ---- 85-session.js ---- */
/* ===== Sessions : entraînement, épreuves, révisions, Tage Mage blanc, calcul mental ===== */
let Cur = null;
const CM_SHORT = ['(1) seule suffit', '(2) seule suffit', 'Les deux ensemble', 'Chacune seule', 'Même ensemble, non'];

/* ---------- Couches, modales, toasts ---------- */
function openLayer(html, sub) {
  let el = $('#layer');
  if (!el) { el = document.createElement('div'); el.id = 'layer'; document.body.appendChild(el); }
  el.className = 'layer';
  el.style.setProperty('--sub', sub ? SUB[sub].color : 'var(--ink)');
  el.innerHTML = `<div class="layer-in">${html}</div>`;
  el.hidden = false;
  document.body.classList.add('locked');
  return el;
}
function layerIn() { return $('#layer .layer-in'); }
function closeLayer() {
  if (Cur && Cur.stop) Cur.stop();
  Cur = null;
  const el = $('#layer'); if (el) { el.hidden = true; el.innerHTML = ''; }
  document.body.classList.remove('locked');
  render();
}
let toastT;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
}
function modal(title, body, buttons) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>${title}</h3><div class="muted">${body}</div><div class="btns">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-mi="${i}">${b.label}</button>`).join('')}</div></div>`;
  bg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mi]');
    if (b) { bg.remove(); const fn = buttons[+b.dataset.mi].fn; if (fn) fn(); }
    else if (e.target === bg) bg.remove();
  });
  document.body.appendChild(bg);
  const first = bg.querySelector('[data-mi]'); if (first) first.focus();
}
const diffDots = (d) => '●'.repeat(d) + '○'.repeat(3 - d);
const mmss = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function skillName(q) { const g = TM.gens[q.skill]; return g ? g.name : q.ai ? 'Question IA' : (SUB[q.sub] || {}).name || ''; }

/* ---------- Rendu d'une question ---------- */
function qHTML(q, st) {
  const sel = st.sel, rev = st.reveal;
  const meta = `<div class="qmeta"><span class="pill sub">${esc(skillName(q))}</span><span class="pill" title="difficulté">${diffDots(q.diff || 2)}</span>${q.ai ? '<span class="pill ai">IA</span>' : ''}${st.flag ? '<span class="pill warn">À revoir</span>' : ''}</div>`;
  const passage = q.passage ? `<div class="passage${st.fullText ? ' full' : ''}" tabindex="0"><p class="eyebrow">${esc(toPlainTitle(q.passageTitle))}</p>${q.passage}</div>` : '';
  const stm = q.stmts ? `<div class="stmts"><div class="stmt"><b>(1)</b><span>${q.stmts[0]}</span></div><div class="stmt"><b>(2)</b><span>${q.stmts[1]}</span></div></div>` : '';
  const vis = q.visual ? `<div class="visual">${q.visual}</div>` : '';
  const ch = q.choices.map((c, i) => {
    let cls = 'choice';
    if (rev) { if (i === q.answer) cls += ' ok'; else if (i === sel) cls += ' ko'; else cls += ' dim'; }
    else if (i === sel) cls += ' sel';
    const body = q.cm ? `<b>${CM_SHORT[i]}</b><br><span class="small muted">${c}</span>` : c;
    return `<button class="${cls}" data-act="choose" data-k="${i}" ${rev ? 'aria-disabled="true"' : ''}><span class="bub">${LETTERS[i]}</span><span class="ct">${body}</span></button>`;
  }).join('');
  return `<div class="qcard">${meta}${passage}${vis}<div class="qtext">${q.q}</div>${stm}<div class="choices${q.vis ? ' vis' : ''}">${ch}</div></div>`;
}
function toPlainTitle(t) { return String(t || 'Texte').replace(/<[^>]+>/g, ''); }
function fbHTML(q, sel) {
  const ok = sel === q.answer;
  const head = sel == null ? `Réponse : ${LETTERS[q.answer]}` : ok ? 'Bonne réponse' : `Raté : la bonne réponse est ${LETTERS[q.answer]}`;
  const lessonBtn = q.chapter && TM.chapters[q.chapter] ? `<button class="btn ghost sm" data-act="peek" data-ch="${q.chapter}">${ic('book')}Revoir le cours</button>` : '';
  return `<div class="fb ${ok ? 'ok' : 'ko'}"><div class="fb-h">${ok ? ic('check') : ic('close')}<span>${head}</span></div><div class="expl">${q.expl || ''}</div>${q.tip ? `<div class="tip">${q.tip}</div>` : ''}${q.trap ? `<div class="trap">${q.trap}</div>` : ''}<div class="row wrap">${lessonBtn}</div>${aiExplainBlock()}</div>`;
}
function aiExplainBlock() {
  if (!AI.available()) return '';
  return `<div id="aiex"><button class="btn soft sm" data-act="ai-explain">${ic('spark')}Explique-moi autrement</button></div>`;
}
async function runExplain(q, sel) {
  const box = $('#aiex'); if (!box) return;
  const ctl = new AbortController();
  box.innerHTML = `<div class="aibox"><div class="thinking"><i></i><i></i><i></i> Claude réfléchit…</div></div><button class="btn ghost sm" data-act="ai-stop">${ic('stop')}Arrêter</button>`;
  AI.ctl = ctl;
  const out = () => $('#aiex .aibox');
  try {
    await AI.explain(q, sel, ({ text }) => { const o = out(); if (o) o.innerHTML = md(text); }, ctl.signal);
    const s = $('#aiex [data-act="ai-stop"]'); if (s) s.remove();
  } catch (e) {
    const msg = AI.errMsg(e);
    const o = out(); if (o) o.innerHTML = (e && e.text ? md(e.text) : '') + (msg ? `<p class="small muted">${esc(msg)}</p>` : '');
    const s = $('#aiex [data-act="ai-stop"]'); if (s) s.remove();
  }
}

/* ---------- Session de questions ---------- */
class Session {
  constructor(o) {
    Object.assign(this, { mode: 'train', title: 'Entraînement', sub: null, n: 10, qs: [], ans: [], ms: [], i: 0, limit: 0, task: null, ctx: null, mock: null, onDone: null }, o);
    this.flags = new Set(); this.revealed = false; this.fullText = false;
  }
  get q() { return this.qs[this.i]; }
  ensureQ() { if (!this.qs[this.i] && this.ctx) this.qs[this.i] = nextTrainingQ(this.ctx); }
  start() {
    Cur = this; this.t0 = Date.now(); this.qStart = Date.now();
    if (this.mode === 'exam') this.deadline = Date.now() + this.limit * 1000;
    this.ensureQ(); this.render();
    clearInterval(this.timer); this.timer = setInterval(() => this.tick(), 500);
  }
  stop() { clearInterval(this.timer); if (AI.ctl) AI.ctl.abort(); }
  tick() {
    const c = $('#chrono'); if (!c) return;
    if (this.mode === 'exam') {
      const left = (this.deadline - Date.now()) / 1000;
      c.querySelector('span').textContent = mmss(left);
      c.classList.toggle('low', left < 120);
      const pace = $('#pace'); if (pace) { const p = this.pace(); pace.textContent = p.txt; pace.className = 'pill ' + p.cls; }
      if (left <= 0) { toast('Temps écoulé : l\'épreuve est terminée.'); this.finish(); }
    } else if (!this.revealed) {
      const el = (Date.now() - this.qStart) / 1000;
      c.querySelector('span').textContent = mmss(el);
      c.classList.toggle('low', el > (this.q.target || 80));
    }
  }
  pace() {
    const el = (Date.now() - this.t0) / 1000, per = this.limit / this.n;
    const ideal = Math.min(this.n, Math.floor(el / per) + 1), at = this.i + 1;
    if (this.diag) return { txt: `Question idéale : ${ideal}`, cls: '' };
    if (at >= ideal + 1) return { txt: `En avance (idéal : q. ${ideal})`, cls: 'ok' };
    if (at >= ideal - 1) return { txt: `Dans les temps (q. ${ideal})`, cls: '' };
    return { txt: `En retard : vise la q. ${ideal}`, cls: 'warn' };
  }
  render() {
    const q = this.q, exam = this.mode === 'exam';
    const answered = this.ans.filter((a) => a != null).length;
    const prog = exam ? answered / this.n : this.i / this.n;
    const st = { sel: this.ans[this.i], reveal: !exam && this.revealed, flag: this.flags.has(this.i), fullText: this.fullText };
    const bar = `<div class="lbar"><button class="iconbtn" data-act="quit" aria-label="Quitter">${ic('close')}</button><div class="ttl">${esc(this.title)} <span class="faint num">· ${this.i + 1}/${this.n}</span></div><span class="chrono" id="chrono">${ic('clock')}<span>${exam ? mmss((this.deadline - Date.now()) / 1000) : '0:00'}</span></span></div><div class="progress" aria-hidden="true"><i style="width:${Math.round(prog * 100)}%"></i></div>${exam ? `<div class="row" style="margin-top:8px"><span class="pill" id="pace">${this.pace().txt}</span></div>` : ''}`;
    let foot;
    if (exam) {
      foot = `<div class="qfoot"><button class="btn ghost" data-act="prev" ${this.i === 0 ? 'disabled' : ''}>${ic('back')}</button><button class="btn ghost" data-act="flag" aria-pressed="${st.flag}">${ic('flag')}</button><button class="btn ghost" data-act="grid">Grille</button>${this.i + 1 < this.n ? `<button class="btn" data-act="next">Suivante</button>` : `<button class="btn" data-act="end">Terminer</button>`}</div>`;
    } else {
      foot = this.revealed ? `<div class="qfoot"><button class="btn" data-act="next">${this.i + 1 < this.n ? 'Question suivante' : 'Voir le bilan'}</button></div>` : (q.passage ? `<div class="qfoot"><button class="btn ghost" data-act="toggle-text">${this.fullText ? 'Réduire le texte' : 'Agrandir le texte'}</button></div>` : '');
    }
    const grid = exam && this.showGrid ? `<div class="card"><p class="eyebrow">Aller à la question</p><div class="qnav">${this.qs.map((_, k) => `<button data-act="goto" data-k="${k}" class="${this.ans[k] != null ? 'ans' : ''} ${k === this.i ? 'cur' : ''} ${this.flags.has(k) ? 'flag' : ''}">${k + 1}</button>`).join('')}</div><p class="small muted" style="margin-top:8px">${answered}/${this.n} réponses · les questions marquées « à revoir » ont un contour pointillé.</p></div>` : '';
    const fb = !exam && this.revealed ? fbHTML(q, this.ans[this.i]) : '';
    openLayer(`${bar}<div class="stack" style="margin-top:12px">${grid}${qHTML(q, st)}${fb}</div>${foot}`, this.sub || q.sub);
    if (!exam && this.revealed) { const f = $('.fb'); if (f) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }
  leaveQ() { if (this.mode === 'exam') { this.ms[this.i] = (this.ms[this.i] || 0) + (Date.now() - this.qStart); this.qStart = Date.now(); } }
  choose(k) {
    const q = this.q;
    if (this.mode === 'exam') { this.ans[this.i] = k; this.render(); return; }
    if (this.revealed) return;
    this.ans[this.i] = k; this.ms[this.i] = Date.now() - this.qStart; this.revealed = true;
    const ok = k === q.answer;
    recordAnswer(q, ok, this.ms[this.i]); markSeen(q);
    if (this.mode === 'review') reviewDone(q.reviewOf, ok); else if (!ok) addError(q);
    Store.save('main'); Store.save('errors');
    this.render();
  }
  next() {
    if (this.mode === 'exam') { if (this.i + 1 < this.n) { this.leaveQ(); this.i++; this.render(); } return; }
    if (this.i + 1 >= this.n) return this.finish();
    this.i++; this.revealed = false; this.qStart = Date.now(); this.ensureQ(); this.render();
    layerScrollTop();
  }
  prev() { if (this.i > 0) { this.leaveQ(); this.i--; this.render(); layerScrollTop(); } }
  goto(k) { this.leaveQ(); this.i = k; this.showGrid = false; this.render(); layerScrollTop(); }
  quit() {
    if (this.mode === 'exam') return modal('Abandonner l\'épreuve ?', 'Tes réponses de cette épreuve ne seront pas comptées.', [{ label: 'Continuer l\'épreuve', cls: '' }, { label: 'Abandonner', cls: 'ghost', fn: () => closeLayer() }]);
    const done = this.ans.filter((a) => a != null).length;
    if (!done) return closeLayer();
    modal('Arrêter la session ?', `Tes ${plural(done, 'réponse')} sont déjà enregistrées.`, [{ label: 'Continuer', cls: '' }, { label: 'Voir le bilan', cls: 'ghost', fn: () => this.finish(true) }]);
  }
  endExam() {
    const blank = this.qs.length - this.ans.filter((a) => a != null).length;
    const tip = blank && !scoringPenalty() ? `<br><br><b>${plural(blank, 'question')} sans réponse.</b> Avec le barème sans pénalité, coche toujours une réponse : au hasard, tu as 1 chance sur 5.` : blank ? `<br><br>${plural(blank, 'question')} sans réponse.` : '';
    modal('Terminer l\'épreuve ?', `Il reste ${mmss((this.deadline - Date.now()) / 1000)} au chrono.${tip}`, [{ label: 'Revenir', cls: 'ghost' }, { label: 'Terminer', fn: () => this.finish() }]);
  }
  finish(early) {
    this.stop();
    const exam = this.mode === 'exam';
    if (exam) this.leaveQ();
    const n = exam ? this.qs.length : (early ? this.ans.filter((a) => a != null).length : this.n);
    const qs = this.qs.slice(0, n), ans = this.ans.slice(0, n);
    let ok = 0, ko = 0, blank = 0;
    qs.forEach((q, k) => {
      const a = ans[k];
      if (a == null) blank++; else if (a === q.answer) ok++; else ko++;
      if (exam) { recordAnswer(q, a === q.answer, this.ms[k] || 0); markSeen(q); if (a !== q.answer) addError(q); }
    });
    const totalMs = Date.now() - this.t0;
    const sc = exam && !this.diag ? score60(ok, ko) : null;
    saveSession({ t: Date.now(), sub: this.sub, mode: this.mock ? 'mock' : this.diag ? 'diag' : this.mode, n, ok, sc, ms: totalMs, task: this.task, ch: this.ch || null });
    this.res = { n, ok, ko, blank, sc, totalMs, qs, ans };
    if (this.mock) return this.mock.subDone(this);
    if (this.diag) return diagResults(this);
    if (!n) return closeLayer();
    this.renderResults();
  }
  renderResults() {
    if (this.diag) return diagResults(this);
    const r = this.res, exam = this.mode === 'exam';
    const avg = r.n ? r.qs.reduce((a, q, k) => a + (this.ms[k] || 0), 0) / r.n / 1000 : 0;
    const hero = exam
      ? `<div class="result-hero"><p class="eyebrow">${esc(SUB[this.sub].name)} · épreuve chronométrée</p><div class="scorebig">${r.sc}<small>/60</small></div><p class="muted">${r.ok} bonnes · ${r.ko} fausses · ${r.blank} sans réponse</p><p class="small faint">Barème : ${scoringPenalty() ? '+4 / −1 / 0' : '+4 / 0 / 0 (sans pénalité)'}</p></div>`
      : `<div class="result-hero"><p class="eyebrow">${esc(this.title)}</p><div class="scorebig">${r.ok}<small>/${r.n}</small></div><p class="muted">${r.n ? Math.round(100 * r.ok / r.n) : 0} % de réussite</p></div>`;
    const stats = `<div class="statgrid"><div class="stat"><div class="v">${mmss(r.totalMs / 1000)}</div><div class="l">durée</div></div><div class="stat"><div class="v">${Math.round(avg)} s</div><div class="l">par question</div></div><div class="stat"><div class="v">${r.ko + r.blank}</div><div class="l">au cahier d'erreurs</div></div></div>`;
    const rows = r.qs.map((q, k) => { const a = r.ans[k], good = a === q.answer; return `<button class="li" data-act="rev-q" data-k="${k}"><span class="idx ${good ? 'done' : ''}">${k + 1}</span><span class="grow"><span class="t">${esc(skillName(q))}</span><br><span class="s">${a == null ? 'Sans réponse' : good ? 'Juste' : `Ta réponse : ${LETTERS[a]} · bonne : ${LETTERS[q.answer]}`} · ${Math.round((this.ms[k] || 0) / 1000)} s</span></span>${ic('chev', 'chev')}</button>`; }).join('');
    const wrongN = r.ko + r.blank;
    const msg = exam ? examComment(r.sc) : r.n && r.ok / r.n >= 0.8 ? 'Très bien : la difficulté va augmenter automatiquement.' : r.n && r.ok / r.n >= 0.5 ? 'C\'est en progrès. Relis les corrections des questions ratées.' : 'Pas de panique : relis le cours, puis refais une série. Les erreurs sont dans ton cahier.';
    const slow = exam ? r.qs.map((q, k) => ({ k, s: Math.round((this.ms[k] || 0) / 1000) })).filter((x) => x.s > 120) : [];
    const slowTxt = slow.length ? `<div class="notice warn">Tu as passé plus de 2 minutes sur ${slow.map((x) => `la q. ${x.k + 1} (${mmss(x.s)})`).join(', ')}. Le jour J, applique la règle des 90 secondes : coche ta meilleure réponse et passe.</div>` : '';
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Bilan</div></div><div class="stack-lg">${hero}<p class="center muted">${msg}</p>${slowTxt}${stats}<div class="btns">${wrongN ? `<button class="btn" data-act="redo-wrong">${ic('repeat')}Refaire les ${plural(wrongN, 'erreur')}</button>` : ''}<button class="btn ghost" data-act="close">Terminer</button></div><div class="sec"><div class="sec-h"><h3>Corrections</h3></div><div class="list">${rows}</div></div></div>`, this.sub);
    render();
  }
  reviewOne(k) {
    const q = this.res.qs[k], a = this.res.ans[k];
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="back-results" aria-label="Retour">${ic('back')}</button><div class="ttl">Question ${k + 1}</div></div><div class="stack">${qHTML(q, { sel: a, reveal: true })}${fbHTML(q, a)}</div>`, q.sub);
    this.reviewing = k;
  }
  redoWrong() {
    const wrong = this.res.qs.filter((q, k) => this.res.ans[k] !== q.answer).map((q) => (q.src.t === 'gen' ? buildQ(q.src.g, newSeed(), q.src.d) : Object.assign({}, q)));
    new Session({ mode: 'train', title: 'Refaire mes erreurs', sub: this.sub, n: wrong.length, qs: wrong }).start();
  }
}
function layerScrollTop() { const el = $('#layer'); if (el) el.scrollTop = 0; }
function examComment(sc) {
  if (sc >= 48) return 'Excellent : niveau des meilleures écoles sur ce sous-test.';
  if (sc >= 40) return 'Très bon score, dans la cible pour viser 400.';
  if (sc >= 30) return 'Score correct. Pour 400, vise 40/60 de moyenne : regarde où tu as perdu des points.';
  return 'Ce sous-test est une priorité. Le cahier d\'erreurs et les cours vont t\'aider à remonter vite.';
}

/* ---------- Lancement des sessions ---------- */
function startTraining(sub, opts = {}) {
  if (sub === 'cdt' && !opts.ch && !opts.ids) {
    const sets = cdtTexts(1);
    if (!sets.length) return toast('Aucun texte disponible.');
    const qs = sets[0];
    if (qs[0].ai) consumeAI('cdt', qs);
    return new Session({ mode: 'train', title: 'Compréhension · 1 texte', sub, n: qs.length, qs, task: opts.task }).start();
  }
  const ids = opts.ids || genIdsFor(sub, opts.ch);
  const title = opts.title || (opts.ch ? TM.chapters[opts.ch].short : SUB[sub].name) + ' · entraînement';
  new Session({ mode: 'train', title, sub, n: opts.n || 10, ctx: { ids, used: new Set() }, task: opts.task, ch: opts.ch }).start();
}
function startExam(sub, task) {
  const qs = examQuestions(sub);
  new Session({ mode: 'exam', title: SUB[sub].name + ' · épreuve', sub, n: qs.length, qs, limit: 20 * 60, task }).start();
}
function startReview(task) {
  const due = dueErrors().slice(0, 15);
  if (!due.length) return toast('Aucune erreur à revoir aujourd\'hui. Bravo !');
  const qs = due.map(reviewQ).filter(Boolean);
  new Session({ mode: 'review', title: 'Révisions', sub: null, n: qs.length, qs, task }).start();
}
function startAISet(sub, qs, title) {
  consumeAI(sub, qs);
  new Session({ mode: 'train', title: title || SUB[sub].name + ' · questions IA', sub, n: qs.length, qs }).start();
}

/* ---------- Tage Mage blanc complet ---------- */
class Mock {
  constructor() { this.order = OFFICIAL_ORDER.slice(); this.k = 0; this.scores = {}; this.t0 = Date.now(); }
  intro() {
    Cur = this;
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Tage Mage blanc</div></div><div class="stack-lg"><div class="result-hero"><p class="eyebrow">Conditions réelles</p><div class="scorebig">2<small> h</small></div><p class="muted">6 sous-tests × 15 questions × 20 minutes, dans l'ordre du vrai test.</p></div><div class="list">${this.order.map((s, i) => `<div class="li"><span class="idx">${i + 1}</span><span class="grow"><span class="t">${SUB[s].name}</span><br><span class="s">15 questions · 20 min</span></span></div>`).join('')}</div><div class="notice">Installe-toi au calme, sans calculatrice, avec une feuille de brouillon. Score final sur 600 = moyenne des 6 notes sur 60, multipliée par 10.</div><button class="btn block" data-act="mock-go">${ic('play')}Commencer le 1er sous-test</button></div>`);
  }
  go() { const sub = this.order[this.k]; const qs = examQuestions(sub); new Session({ mode: 'exam', title: `Blanc ${this.k + 1}/6 · ${SUB[sub].short}`, sub, n: qs.length, qs, limit: 20 * 60, mock: this }).start(); }
  subDone(sess) {
    this.scores[sess.sub] = sess.res.sc; this.k++;
    Cur = this;
    if (this.k >= this.order.length) return this.final();
    const nx = this.order[this.k];
    openLayer(`<div class="lbar"><div class="ttl">Tage Mage blanc</div></div><div class="stack-lg"><div class="result-hero"><p class="eyebrow">Sous-test ${this.k}/6 terminé</p><p class="muted">Prochain : <b>${SUB[nx].name}</b> (20 minutes)</p></div><div class="notice">Comme le jour J, tu découvriras tes notes à la fin. Respire, bois un verre d'eau, puis lance la suite.</div><button class="btn block" data-act="mock-go">${ic('play')}Commencer ${SUB[nx].short}</button><button class="btn ghost block" data-act="mock-stop">Arrêter le blanc ici</button></div>`, nx);
  }
  final() {
    const vals = this.order.filter((s) => this.scores[s] != null).map((s) => this.scores[s]);
    const total = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) : 0;
    if (vals.length === 6) { Store.S.mocks = Store.S.mocks || []; Store.S.mocks.push({ t: Date.now(), scores: this.scores, total }); Store.save('main'); }
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Résultat du blanc</div></div><div class="stack-lg"><div class="result-hero"><p class="eyebrow">Score estimé</p><div class="scorebig">${total}<small>/600</small></div><p class="muted">${total >= Store.S.profile.target ? 'Objectif atteint sur ce blanc !' : `Encore ${Store.S.profile.target - total} points pour ton objectif de ${Store.S.profile.target}.`}</p></div><div class="list">${this.order.map((s) => `<div class="li" style="--sub:${SUB[s].color}"><span class="idx sub">${SUB[s].abbr.slice(0, 3)}</span><span class="grow t">${SUB[s].name}</span><span class="num"><b>${this.scores[s] != null ? this.scores[s] : '—'}</b><span class="faint">/60</span></span></div>`).join('')}</div><p class="small muted center">Toutes tes erreurs sont dans le cahier d'erreurs, prêtes à être revues.</p><button class="btn block" data-act="close">Terminer</button></div>`);
  }
}

/* ---------- Calcul mental (réponse tapée) ---------- */
class Drill {
  constructor(o) { Object.assign(this, { id: 'dr.mix', level: 1, dur: 60, task: null }, o); this.def = TM.drills[this.id]; }
  start() {
    Cur = this; this.items = []; this.score = 0; this.t0 = Date.now(); this.endAt = this.t0 + this.dur * 1000; this.busy = false;
    this.newItem(); this.render();
    clearInterval(this.timer); this.timer = setInterval(() => this.tick(), 200);
    this.onKey = (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) this.key(k); else if (k === ',' || k === '.') this.key(','); else if (k === '-') this.key('-');
      else if (k === 'Backspace') this.key('del'); else if (k === 'Enter') this.key('ok'); else if (/^[a-zA-Z]$/.test(k) && this.cur.kb === 'alpha') this.key(k.toUpperCase()); else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', this.onKey);
  }
  stop() { clearInterval(this.timer); document.removeEventListener('keydown', this.onKey); }
  newItem() { this.cur = this.def.make(makeRng(newSeed()), this.level); this.cur.kb = this.cur.kb || this.def.kb; this.input = ''; this.itemStart = Date.now(); }
  tick() {
    const left = (this.endAt - Date.now()) / 1000;
    const c = $('#chrono span'); if (c) c.textContent = mmss(left);
    if (left <= 0) this.finish();
  }
  render() {
    const kb = this.cur.kb === 'alpha'
      ? `<div class="keypad letters">${ALPHA.split('').map((l) => `<button data-act="dk" data-k="${l}">${l}</button>`).join('')}<button class="k-fn" data-act="dk" data-k="del" style="grid-column: span 2">effacer</button><button class="k-fn" data-act="dk" data-k="skip" style="grid-column: span 2">passer</button></div>`
      : `<div class="keypad"><button data-act="dk" data-k="7">7</button><button data-act="dk" data-k="8">8</button><button data-act="dk" data-k="9">9</button><button class="k-fn" data-act="dk" data-k="del" aria-label="Effacer">⌫</button><button data-act="dk" data-k="4">4</button><button data-act="dk" data-k="5">5</button><button data-act="dk" data-k="6">6</button><button class="k-ok" data-act="dk" data-k="ok">OK</button><button data-act="dk" data-k="1">1</button><button data-act="dk" data-k="2">2</button><button data-act="dk" data-k="3">3</button><button data-act="dk" data-k=",">,</button><button data-act="dk" data-k="-">−</button><button data-act="dk" data-k="0">0</button><button class="k-fn" data-act="dk" data-k="skip">passer</button></div>`;
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="quit-drill" aria-label="Quitter">${ic('close')}</button><div class="ttl">${esc(this.def.name)} <span class="faint">· niveau ${this.level}</span></div><span class="chrono" id="chrono">${ic('clock')}<span>${mmss((this.endAt - Date.now()) / 1000)}</span></span></div><div class="drill-stage"><p class="eyebrow">Score : <span class="num" id="dscore">${this.score}</span></p><div class="drill-prompt" id="dprompt">${this.cur.p}</div><div class="drill-answer num" id="dans">${esc(this.input) || '&nbsp;'}</div><div class="drill-sol" id="dsol" aria-live="polite"></div></div>${kb}<p class="small faint center" style="margin-top:10px">La réponse est validée automatiquement dès qu'elle est juste.</p>`, this.def.sub);
  }
  upd(cls) {
    const a = $('#dans'); if (!a) return;
    a.textContent = this.input || ' ';
    a.className = 'drill-answer num' + (cls ? ' ' + cls : '');
  }
  key(k) {
    if (this.busy) return;
    if (k === 'del') { this.input = this.input.slice(0, -1); return this.upd(); }
    if (k === 'skip') return this.wrong();
    if (k === 'ok') { if (!this.input) return; return normAns(this.input) === normAns(this.cur.a) ? this.right() : this.wrong(); }
    if (this.input.length >= 12) return;
    if (k === '-' && this.input) return;
    if (k === ',' && this.input.includes(',')) return;
    this.input += k; this.upd();
    if (normAns(this.input) === normAns(this.cur.a)) this.right();
  }
  right() {
    this.busy = true; this.score++;
    this.items.push({ p: this.cur.p, a: this.cur.a, ok: true, ms: Date.now() - this.itemStart });
    this.upd('flash-ok'); const s = $('#dscore'); if (s) s.textContent = this.score;
    setTimeout(() => { this.busy = false; if (Date.now() < this.endAt) { this.newItem(); $('#dprompt').innerHTML = this.cur.p; this.upd(); } }, 220);
  }
  wrong() {
    this.busy = true;
    this.items.push({ p: this.cur.p, a: this.cur.a, ok: false, given: this.input, ms: Date.now() - this.itemStart });
    this.upd('flash-ko'); const sol = $('#dsol'); if (sol) sol.textContent = 'Réponse : ' + this.cur.a;
    setTimeout(() => { this.busy = false; if (sol) sol.textContent = ''; if (Date.now() < this.endAt) { this.newItem(); $('#dprompt').innerHTML = this.cur.p; this.upd(); } }, 1300);
  }
  quit() {
    if (!this.items.length) return closeLayer();
    modal('Arrêter la série ?', 'La série en cours ne sera pas comptée dans ton record.', [{ label: 'Continuer' }, { label: 'Arrêter', cls: 'ghost', fn: () => closeLayer() }]);
  }
  finish() {
    if (this.finished) return; this.finished = true; this.stop();
    const n = this.items.length, ok = this.score, acc = n ? ok / n : 0, ipm = round(ok / (this.dur / 60), 1);
    const d = Store.S.drills[this.id] || (Store.S.drills[this.id] = { best: 0, n: 0, hist: [], lvl: 1 });
    const prevBest = d.bestL && d.bestL[this.level] || 0;
    d.bestL = d.bestL || {}; if (ipm > prevBest) d.bestL[this.level] = ipm;
    d.best = Math.max(d.best || 0, ipm); d.n++;
    d.hist.push([Date.now(), ok, ipm, round(acc, 2), this.level]); if (d.hist.length > 40) d.hist.shift();
    let lvlMsg = '';
    if (acc >= 0.9 && ipm >= 8 + 4 * this.level && this.level < 3) { d.lvl = this.level + 1; lvlMsg = `Niveau ${d.lvl} débloqué pour la prochaine série !`; }
    else if (acc < 0.6 && this.level > 1) { d.lvl = this.level - 1; lvlMsg = 'On redescend d\'un niveau pour consolider les bases.'; }
    else d.lvl = this.level;
    addDay(n, ok, this.dur * 1000);
    saveSession({ t: Date.now(), sub: this.def.sub, mode: 'drill', drill: this.id, n, ok, sc: null, ms: this.dur * 1000, task: this.task });
    const misses = this.items.filter((x) => !x.ok).slice(0, 12).map((x) => `<div class="li"><span class="grow"><span class="t num">${x.p}</span></span><span class="num"><b>${esc(x.a)}</b>${x.given ? `<span class="faint"> (toi : ${esc(x.given)})</span>` : ''}</span></div>`).join('');
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Bilan · ${esc(this.def.name)}</div></div><div class="stack-lg"><div class="result-hero"><p class="eyebrow">Niveau ${this.level} · ${this.dur} s</p><div class="scorebig">${ipm}<small> /min</small></div><p class="muted">${ok} bonnes réponses sur ${n} · ${Math.round(acc * 100)} % de précision</p>${ipm > prevBest && prevBest ? `<span class="pill ok">Nouveau record (avant : ${prevBest}/min)</span>` : ''}${lvlMsg ? `<p class="small">${lvlMsg}</p>` : ''}</div><div class="btns"><button class="btn" data-act="drill-again">${ic('repeat')}Rejouer</button><button class="btn ghost" data-act="close">Terminer</button></div>${misses ? `<div class="sec"><div class="sec-h"><h3>À retenir</h3></div><div class="list">${misses}</div></div>` : ''}</div>`, this.def.sub);
    render();
  }
}
function startDrill(id, opts = {}) { new Drill({ id, level: opts.level || drillLevel(id), dur: opts.dur || 60, task: opts.task }).start(); }

/* ---------- Cours ---------- */
function openLesson(chId) {
  const ch = TM.chapters[chId]; if (!ch) return;
  Store.S.lessons[chId] = Date.now(); Store.save('main');
  const skills = ch.gens.map((id) => { const m = skillMastery(id); const g = TM.gens[id]; return `<div class="li"><span class="grow"><span class="t">${esc(g.name)}</span><div class="bar" style="margin-top:6px"><i style="width:${m || 0}%"></i></div></span><button class="btn soft sm" data-act="train-skill" data-id="${id}">${ic('play')}10 Q</button></div>`; }).join('');
  Cur = { lessonOf: chId };
  const gds = guidesOf(chId);
  const gHtml = gds.length ? `<div class="sec" style="margin-top:24px"><div class="sec-h"><h3>Exercices guidés pas à pas</h3></div><p class="small muted">Le problème est découpé en étapes : tu tapes chaque résultat, avec un indice si tu bloques. Idéal juste après le cours.</p><div class="list">${gds.map((g) => `<button class="li" data-act="guide" data-id="${g.id}"><span class="idx sub">${ic('play')}</span><span class="grow"><span class="t">${esc(g.name)}</span></span>${ic('chev', 'chev')}</button>`).join('')}</div></div>` : '';
  openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('back')}</button><div class="ttl">${esc(ch.title)}</div></div><article class="lesson"><p class="eyebrow">${esc(SUB[ch.sub].name)} · cours</p><h2>${esc(ch.title)}</h2>${ch.lesson}</article>${gHtml}<div class="sec" style="margin-top:24px"><div class="sec-h"><h3>Exercices de ce chapitre</h3></div><button class="btn block" data-act="train-ch" data-ch="${chId}">${ic('play')}S'entraîner sur tout le chapitre (10 questions)</button><div class="list">${skills}</div></div>`, ch.sub);
}

/* ---- 86-extra.js ---- */
/* ===== Exercices guidés, fiches mémo, test de positionnement, cours en aperçu, stratégie ===== */

/* ---------- Exercice guidé ---------- */
class GuideSession {
  constructor(o) { this.id = o.id; this.def = TM.guides[o.id]; this.task = o.task || null; }
  start() {
    Cur = this; this.data = this.def.make(makeRng(newSeed())); this.k = 0; this.input = ''; this.tries = 0; this.done = []; this.t0 = Date.now(); this.finished = false; this.msg = '';
    this.render();
    this.onKey = (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) this.key(k); else if (k === ',' || k === '.') this.key(','); else if (k === '-') this.key('-'); else if (k === '/') this.key('/');
      else if (k === 'Backspace') this.key('del'); else if (k === 'Enter') this.key('ok'); else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', this.onKey);
  }
  stop() { document.removeEventListener('keydown', this.onKey); }
  render() {
    const d = this.data, n = d.steps.length;
    const rows = this.done.map((x, i) => `<div class="gstep done"><span class="idx done">${ic('check')}</span><div class="grow"><div class="small muted">${d.steps[i].p}</div><b class="num">${esc(x.a)}${d.steps[i].u ? ' ' + d.steps[i].u : ''}</b>${x.helped ? ' <span class="pill warn">avec aide</span>' : ''}</div></div>`).join('');
    let cur = '';
    if (!this.finished) {
      const st = d.steps[this.k];
      cur = `<div class="gstep cur"><p class="eyebrow">Étape ${this.k + 1} sur ${n}</p><p class="gprompt">${st.p}</p><div class="row" style="justify-content:center;gap:8px"><div class="drill-answer num" id="gans">${esc(this.input) || '&nbsp;'}</div>${st.u ? `<span class="muted">${st.u}</span>` : ''}</div><div id="gmsg" class="small center" aria-live="polite">${this.msg}</div>${this.tries ? `<div class="tip"><b>Indice :</b> ${st.hint || 'Relis l\'énoncé.'}</div>` : ''}</div>
<div class="keypad"><button data-act="gk" data-k="7">7</button><button data-act="gk" data-k="8">8</button><button data-act="gk" data-k="9">9</button><button class="k-fn" data-act="gk" data-k="del" aria-label="Effacer">⌫</button><button data-act="gk" data-k="4">4</button><button data-act="gk" data-k="5">5</button><button data-act="gk" data-k="6">6</button><button class="k-ok" data-act="gk" data-k="ok">OK</button><button data-act="gk" data-k="1">1</button><button data-act="gk" data-k="2">2</button><button data-act="gk" data-k="3">3</button><button data-act="gk" data-k=",">,</button><button data-act="gk" data-k="-">−</button><button data-act="gk" data-k="0">0</button><button data-act="gk" data-k="/">/</button></div>
<div class="btns" style="margin-top:10px"><button class="btn soft sm" data-act="g-hint">${ic('spark')}Indice</button><button class="btn ghost sm" data-act="g-show">Voir la réponse</button></div>`;
    } else {
      const clean = this.done.filter((x) => !x.helped).length;
      cur = `<div class="fb ok"><div class="fb-h">${ic('check')}<span>Exercice terminé · ${clean}/${n} étapes sans aide</span></div><div class="expl"><p>${d.end}</p></div></div><div class="btns"><button class="btn" data-act="g-again">${ic('repeat')}Un autre exercice du même type</button><button class="btn ghost" data-act="g-qcm">${ic('play')}Passer aux QCM du chapitre</button></div>`;
    }
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Exercice guidé · ${esc(this.def.name)}</div></div><div class="stack"><div class="qcard"><div class="qmeta"><span class="pill sub">${esc(TM.chapters[this.def.ch].short)}</span><span class="pill">pas à pas</span></div><div class="qtext">${d.q}</div></div>${rows}${cur}</div>`, 'calcul');
    const a = $('.gstep.cur'); if (a) a.scrollIntoView({ block: 'nearest' });
  }
  upd(cls) { const a = $('#gans'); if (a) { a.textContent = this.input || ' '; a.className = 'drill-answer num' + (cls ? ' ' + cls : ''); } }
  key(k) {
    if (this.finished || this.busy) return;
    if (k === 'del') { this.input = this.input.slice(0, -1); return this.upd(); }
    if (k === 'ok') return this.submit();
    if (this.input.length >= 14) return;
    if (k === '-' && this.input) return;
    this.input += k; this.upd();
    if (sameAns(this.input, this.data.steps[this.k].a) && !/[,/]$/.test(this.input)) this.ok();
  }
  submit() {
    if (!this.input) return;
    if (sameAns(this.input, this.data.steps[this.k].a)) return this.ok();
    this.tries++; this.msg = this.tries >= 2 ? 'Toujours pas. Utilise l\'indice ou affiche la réponse.' : 'Pas tout à fait : regarde l\'indice.';
    this.input = ''; this.render(); this.upd('flash-ko');
  }
  ok() {
    this.busy = true; this.upd('flash-ok');
    setTimeout(() => { this.busy = false; this.done.push({ a: this.input, helped: this.tries >= 2 }); this.next(); }, 350);
  }
  hint() { if (!this.tries) { this.tries = 1; this.msg = ''; this.render(); } }
  show() { const st = this.data.steps[this.k]; this.done.push({ a: st.a, helped: true }); this.next(); }
  next() {
    this.k++; this.input = ''; this.tries = 0; this.msg = '';
    if (this.k >= this.data.steps.length) return this.finish();
    this.render();
  }
  finish() {
    this.finished = true; this.stop();
    const n = this.data.steps.length, clean = this.done.filter((x) => !x.helped).length;
    const g = Store.S.guides || (Store.S.guides = {});
    const s = g[this.id] || (g[this.id] = { n: 0, clean: 0, last: 0 });
    s.n++; if (clean === n) s.clean++; s.last = Date.now();
    addDay(n, clean, Date.now() - this.t0);
    saveSession({ t: Date.now(), sub: 'calcul', mode: 'guide', guide: this.id, n, ok: clean, sc: null, ms: Date.now() - this.t0, task: this.task });
    this.render(); render();
  }
}
function startGuide(id, task) { new GuideSession({ id, task }).start(); }

/* ---------- Fiches mémo ---------- */
class CardSession {
  constructor(o) { this.queue = cardQueue(o.decks || null, o.max || 15); this.i = 0; this.flipped = false; this.know = 0; this.task = o.task || null; this.title = o.title || 'Fiches mémo'; this.t0 = Date.now(); }
  start() {
    if (!this.queue.length) return toast('Tout est révisé pour aujourd\'hui. Reviens demain !');
    Cur = this; this.render();
  }
  render() {
    const c = this.queue[this.i], n = this.queue.length;
    const sub = c.deck.sub;
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">${esc(this.title)} <span class="faint num">· ${this.i + 1}/${n}</span></div></div><div class="progress" aria-hidden="true"><i style="width:${Math.round(this.i / n * 100)}%"></i></div><div class="stack" style="margin-top:14px"><p class="eyebrow center">${esc(c.deck.name)}</p><button class="flash${this.flipped ? ' on' : ''}" data-act="flip" aria-label="Retourner la carte"><span class="ff">${c.f}</span>${this.flipped ? `<span class="fb2">${c.b}</span>` : '<span class="small faint">Touche pour voir la réponse</span>'}</button>${this.flipped ? `<div class="btns"><button class="btn ghost" data-act="rate" data-k="0">${ic('repeat')}À revoir</button><button class="btn" data-act="rate" data-k="1">${ic('check')}Je savais</button></div>` : `<button class="btn block" data-act="flip">Voir la réponse</button>`}<p class="small faint center">Sois honnête : une carte « à revoir » revient plus souvent, c'est comme ça qu'on mémorise.</p></div>`, sub);
  }
  flip() { if (!this.flipped) { this.flipped = true; this.render(); } }
  rate(knew) {
    const c = this.queue[this.i];
    rateCard(c.id, knew);
    if (knew) this.know++;
    else if (!c.again) this.queue.push(Object.assign({}, c, { again: true }));
    this.i++; this.flipped = false;
    if (this.i >= this.queue.length) return this.finish();
    this.render();
  }
  finish() {
    const n = this.queue.filter((c) => !c.again).length;
    addDay(0, 0, Date.now() - this.t0);
    saveSession({ t: Date.now(), sub: null, mode: 'cards', n, ok: this.know, sc: null, ms: Date.now() - this.t0, task: this.task });
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Fiches terminées</div></div><div class="stack-lg"><div class="result-hero"><p class="eyebrow">Fiches mémo</p><div class="scorebig">${this.know}<small>/${n}</small></div><p class="muted">cartes sues du premier coup</p></div><p class="center muted">Les cartes ratées reviendront plus tôt. Une série de fiches par jour suffit pour tout retenir d'ici au test.</p><div class="btns"><button class="btn" data-act="cards-all">${ic('repeat')}Encore 15 cartes</button><button class="btn ghost" data-act="close">Terminer</button></div></div>`);
    render();
  }
}
function vFiches() {
  const dueAll = TM.decks.reduce((a, d) => a + deckStats(d).due, 0);
  const groups = SUBS.map((s) => ({ s, decks: TM.decks.filter((d) => d.sub === s.id) })).filter((g) => g.decks.length);
  return `<main class="sheet home"><div class="stack-lg"><div class="sec"><p class="eyebrow">Mémorisation</p><h2>Fiches mémo</h2><p class="small muted">Des cartes recto-verso pour réviser en 5 minutes, dans les transports par exemple. Les cartes que tu sais reviennent de moins en moins souvent, celles que tu rates reviennent vite.</p></div><button class="btn block" data-act="cards-all">${ic('play')}${dueAll ? `Réviser ${Math.min(15, dueAll)} cartes à revoir` : 'Apprendre 15 nouvelles cartes'}</button>${groups.map(({ s, decks }) => `<div class="sec" style="--sub:${s.color}"><p class="mtitle"><i></i>${s.name}</p><div class="list">${decks.map((d) => { const st = deckStats(d); return `<button class="li" data-act="cards" data-id="${d.id}"><span class="grow"><span class="t">${esc(d.name)}</span><br><span class="s">${esc(d.desc)} · ${st.mastered}/${st.total} maîtrisées${st.due ? ` · <b>${st.due} à revoir</b>` : ''}</span><div class="bar" style="margin-top:6px"><i style="width:${Math.round(100 * st.mastered / st.total)}%"></i></div></span>${ic('chev', 'chev')}</button>`; }).join('')}</div></div>`).join('')}</div></main>`;
}

/* ---------- Test de positionnement ---------- */
function startDiag() {
  const R = makeRng(newSeed()), qs = [];
  ['pct.evol', 'frac.add', 'vit.v', 'eq.lin'].forEach((id, i) => qs.push(buildQ(id, newSeed(), i < 2 ? 1 : 2)));
  R.sample(gensOf('cm').map((g) => g.id), 3).forEach((id) => qs.push(buildQ(id, newSeed(), 2)));
  ['log.num', 'log.domino', 'log.let'].forEach((id) => qs.push(buildQ(id, newSeed(), 2)));
  const txt = cdtTexts(1)[0]; if (txt) txt.slice(0, 3).forEach((q) => qs.push(q));
  ['ra.concl', 'ra.hyp', 'ra.faille', 'expr.accords', 'expr.conjug', 'expr.paro'].forEach((id) => qs.push(buildQ(id, newSeed(), 2)));
  new Session({ mode: 'exam', diag: true, title: 'Test de positionnement', sub: null, n: qs.length, qs, limit: 30 * 60 }).start();
}
function diagResults(sess) {
  const r = sess.res, by = {};
  r.qs.forEach((q, k) => { const b = by[q.sub] || (by[q.sub] = { ok: 0, n: 0 }); b.n++; if (r.ans[k] === q.answer) b.ok++; });
  Store.S.diag = { t: Date.now(), by };
  Store.S.profile.seenIntro = true;
  Store.save('main');
  const order = OFFICIAL_ORDER.filter((s) => by[s]).sort((a, b) => by[a].ok / by[a].n - by[b].ok / by[b].n);
  const rows = OFFICIAL_ORDER.filter((s) => by[s]).map((s) => { const b = by[s], p = b.ok / b.n; return `<button class="li" data-act="nav" data-v="${SUB[s].hash}" style="--sub:${SUB[s].color}"><span class="idx sub">${SUB[s].abbr.slice(0, 3)}</span><span class="grow"><span class="t">${SUB[s].name}</span><div class="bar" style="margin-top:6px"><i style="width:${Math.round(p * 100)}%"></i></div></span><span class="num"><b>${b.ok}</b><span class="faint">/${b.n}</span></span></button>`; }).join('');
  const prio = order.slice(0, 3).map((s, i) => `<li><b>${SUB[s].name}</b> : ${i === 0 ? 'ta priorité absolue, commence par les cours de cet onglet.' : i === 1 ? 'à travailler juste après.' : 'à consolider régulièrement.'}</li>`).join('');
  openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Ton point de départ</div></div><div class="stack-lg"><div class="result-hero"><p class="eyebrow">Test de positionnement</p><div class="scorebig">${r.ok}<small>/${r.n}</small></div><p class="muted">Ce n'est pas une note : c'est une photo de ton niveau aujourd'hui.</p></div><div class="list">${rows}</div><div class="sec"><h3>Par où commencer</h3><ol class="small" style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px">${prio}</ol><p class="small muted">Le programme du jour tient compte de ces résultats, et la difficulté s'ajuste toute seule.</p></div><div class="btns"><button class="btn" data-act="rev-q" data-k="0">Voir les corrections</button><button class="btn ghost" data-act="close">Terminer</button></div></div>`);
  render();
}

/* ---------- Cours en aperçu (sans quitter la séance) ---------- */
function openPeek(chId) {
  const ch = TM.chapters[chId]; if (!ch) return;
  let el = $('#peek');
  if (!el) { el = document.createElement('div'); el.id = 'peek'; document.body.appendChild(el); }
  el.className = 'layer peek';
  el.style.setProperty('--sub', SUB[ch.sub].color);
  el.innerHTML = `<div class="layer-in"><div class="lbar"><button class="iconbtn" data-act="peek-close" aria-label="Revenir à la question">${ic('back')}</button><div class="ttl">${esc(ch.title)}</div></div><article class="lesson"><p class="eyebrow">Cours · ${esc(SUB[ch.sub].name)}</p>${ch.lesson}</article><button class="btn block" style="margin-top:20px" data-act="peek-close">${ic('back')}Revenir à la question</button></div>`;
  el.hidden = false; el.scrollTop = 0;
}
function closePeek() { const el = $('#peek'); if (el) { el.hidden = true; el.innerHTML = ''; } }

/* ---------- Stratégie le jour J ---------- */
const STRATEGY_HTML = `
<p>Le Tage Mage se gagne aussi sur la <b>méthode</b> : les candidats qui ont un plan pour chaque minute gagnent facilement 30 à 50 points.</p>
<h3><span class="hl">1. Le format en un coup d'œil</span></h3>
<ul><li>6 sous-tests de 15 questions, <b>20 minutes chacun</b> : le temps ne se reporte pas d'un sous-test à l'autre.</li><li>QCM à 5 réponses, <b>sans calculatrice</b>.</li><li>Chaque sous-test est noté sur 60 ; le score sur 600 est la moyenne des 6 notes multipliée par 10. Pour 400, il faut en moyenne 40/60, soit environ 10 bonnes réponses sur 15.</li></ul>
<h3><span class="hl">2. Gérer ses 20 minutes</span></h3>
<ul><li><b>80 secondes par question</b> en moyenne. Regarde le chrono toutes les 5 questions : à la question 5, il devrait rester environ 13 minutes.</li><li><b>Règle des 90 secondes</b> : si tu sèches au-delà, coche ta meilleure réponse et passe. Une question difficile ne rapporte pas plus qu'une facile.</li><li>Garde 1 minute à la fin pour remplir les cases vides.</li></ul>
<h3><span class="hl">3. Répondre à tout ?</span></h3>
<p>Avec le barème sans pénalité (annoncé depuis 2025), <b>ne laisse jamais une case vide</b> : au hasard tu as 1 chance sur 5, et 1 sur 2 si tu as éliminé trois réponses. Si le barème −1 s'appliquait encore, réponds dès que tu as éliminé au moins une réponse. Vérifie le barème en vigueur sur le site officiel avant le test.</p>
<h3><span class="hl">4. Sous-test par sous-test</span></h3>
<ul><li><b>Calcul</b> : lis les 5 réponses avant de calculer, élimine avec les unités et l'ordre de grandeur, teste les réponses dans l'énoncé.</li><li><b>Conditions minimales</b> : (1) seule, (2) seule, puis ensemble. Ne calcule jamais jusqu'au bout.</li><li><b>Logique</b> : écarts, une case sur deux, modulo 7 pour les dominos. Ne reste pas bloqué sur une figure.</li><li><b>Compréhension</b> : ton point fort. Survole les questions, lis une fois, reviens au passage précis.</li><li><b>Raisonnement & Argumentation</b> : trouve la conclusion avant de lire les réponses.</li><li><b>Expression</b> : questions rapides, vise 45 secondes pour gagner du temps de réflexion sur les plus dures.</li></ul>
<h3><span class="hl">5. Les 7 derniers jours</span></h3>
<ul><li>Un Tage Mage blanc complet en début de semaine, dans les conditions réelles.</li><li>Ensuite : cahier d'erreurs et fiches mémo chaque jour, pas de nouveau chapitre.</li><li>La veille : 20 minutes de fiches mémo, puis repos. Prépare ce que demande ta convocation (pièce d'identité notamment).</li><li>Le jour J : arrive en avance ; après chaque sous-test, oublie-le et concentre-toi sur le suivant.</li></ul>
<div class="tip"><b>Ton plan pour 400 :</b> sécuriser 50+ en Compréhension, viser 40+ en Expression et en Raisonnement, et remonter Calcul, Conditions minimales et Logique au-dessus de 30. C'est exactement ce que ton programme du jour travaille.</div>`;
function openStrategy() {
  Cur = { strategy: true };
  openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('back')}</button><div class="ttl">Stratégie le jour J</div></div><article class="lesson"><p class="eyebrow">Méthode</p><h2>Stratégie le jour J</h2>${STRATEGY_HTML}</article>`);
}

/* ---- 90-ui.js ---- */
/* ===== Interface : accueil, onglets, cahier d'erreurs, stats, prof, réglages ===== */
const VIEWS = ['accueil', ...SUBS.map((s) => s.hash), 'erreurs', 'stats', 'prof', 'reglages', 'fiches'];
const HASH2SUB = Object.fromEntries(SUBS.map((s) => [s.hash, s.id]));
function currentView() { const h = (location.hash || '').replace('#', ''); return VIEWS.includes(h) ? h : 'accueil'; }
function go(view) { if (location.hash !== '#' + view) location.hash = view; else render(); }

function render() {
  const app = $('#app'); if (!app) return;
  const v = currentView();
  const sub = HASH2SUB[v];
  const due = dueErrors().length;
  const tabs = `<nav class="tabs" role="tablist" aria-label="Sous-tests"><button class="tab" role="tab" aria-selected="${v === 'accueil'}" data-act="nav" data-v="accueil">Accueil</button>${SUBS.map((s) => `<button class="tab" role="tab" aria-selected="${v === s.hash}" data-act="nav" data-v="${s.hash}" style="--tabc:${s.color}"><span class="dot"></span>${s.short}</button>`).join('')}</nav>`;
  const head = `<header class="top"><div class="brandbar"><div class="brand"><span>Objectif</span><b class="num">${Store.S.profile.target}</b></div><div class="grow"></div><span class="streak" title="Jours de travail d'affilée">${ic('flame')}${streakDays()} j</span>${AI.available() ? `<button class="iconbtn" data-act="nav" data-v="prof" aria-label="Prof IA">${ic('spark')}</button>` : ''}<button class="iconbtn" data-act="nav" data-v="reglages" aria-label="Réglages">${ic('gear')}</button></div>${tabs}</header>`;
  let body;
  if (v === 'accueil') body = vHome(due);
  else if (sub) body = vSub(sub);
  else if (v === 'erreurs') body = vErrors();
  else if (v === 'stats') body = vStats();
  else if (v === 'prof') body = vProf();
  else if (v === 'fiches') body = vFiches();
  else body = vSettings();
  app.style.setProperty('--sub', sub ? SUB[sub].color : 'var(--ink)');
  app.innerHTML = head + body;
  const t = app.querySelector('.tab[aria-selected="true"]'); if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  if (v === 'prof') { const c = $('#chatEnd'); if (c) c.scrollIntoView({ block: 'end' }); }
  if (v === 'stats') chartTipHandlers(app);
}

/* ---------- Accueil ---------- */
function ringSVG(frac) {
  const r = 46, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac || 0));
  return `<svg viewBox="0 0 112 112" aria-hidden="true"><circle cx="56" cy="56" r="${r}" fill="none" stroke="var(--card-2)" stroke-width="10"/><circle cx="56" cy="56" r="${r}" fill="none" stroke="var(--ok)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}"/></svg>`;
}
function vHome(due) {
  const S = Store.S, p = S.profile, pt = projectTotal();
  const intro = !p.seenIntro ? `<div class="notice"><b>Bienvenue dans ton appli Tage Mage.</b> Chaque onglet correspond à un sous-test : cours, exercices infinis, épreuves chronométrées. Commence par le programme du jour ci-dessous, il s'adapte à ton niveau au fil des séances.<div class="btns" style="margin-top:10px"><button class="btn sm" data-act="diag">${ic('target')}Test de positionnement (15 min)</button><button class="btn ghost sm" data-act="intro-ok">Plus tard</button></div></div>` : '';
  const sync = Store.syncNote ? `<div class="notice warn">${esc(Store.syncNote)}</div>` : '';
  const minis = SUBS.map((s, i) => `<button class="mini" style="--sub:${s.color}" data-act="nav" data-v="${s.hash}"><span class="n">${s.short}</span><span class="v num">${pt.vals[i] != null ? pt.vals[i] : '—'}<small>/60</small></span></button>`).join('');
  const total = pt.total;
  const days = p.examDate ? daysBetween(dayKey(), p.examDate) : null;
  const proj = `<div class="proj"><div class="ring">${ringSVG(total != null ? total / p.target : 0)}<div class="lbl"><b>${total != null ? total : '—'}</b><span>/600 estimé</span></div></div><div class="stack" style="gap:6px"><p class="eyebrow">Projection</p><p><b>Objectif ${p.target}</b>${total != null ? ` · ${total >= p.target ? 'atteint !' : `encore ${p.target - total} points`}` : ''}</p><p class="small muted">${total != null ? `Calculée sur ${pt.known} sous-test${pt.known > 1 ? 's' : ''} travaillé${pt.known > 1 ? 's' : ''}.` : 'Réponds à quelques questions dans au moins deux sous-tests pour voir ton score estimé.'}${days != null ? ` <b>${days > 0 ? `J-${days}` : days === 0 ? 'C\'est le jour J !' : 'Date passée'}</b>` : ''}</p></div></div><div class="minis">${minis}</div>`;
  const tasks = dailyPlan();
  const doneN = tasks.filter((t) => t.done).length;
  const today = S.days[dayKey()], minToday = today ? Math.round(today.ms / 60000) : 0;
  const plan = `<div class="sec"><div class="sec-h"><h2>Programme du jour</h2><span class="pill ${doneN === tasks.length ? 'ok' : ''}">${doneN}/${tasks.length}</span></div><div class="row small muted"><span class="grow">Aujourd'hui : <b class="num">${minToday}</b> min sur ${p.dailyMin} min visées</span></div><div class="bar ok" aria-hidden="true"><i style="width:${Math.min(100, Math.round(100 * minToday / p.dailyMin))}%"></i></div><div class="list">${tasks.map((t, i) => `<button class="task${t.done ? ' done' : ''}" data-act="task" data-i="${i}" style="--sub:${t.sub ? SUB[t.sub].color : 'var(--ink-3)'}"><span class="check${t.done ? ' on' : ''}">${t.done ? ic('check') : ''}</span><span class="grow"><span class="t">${esc(t.t)}</span><br><span class="s">${esc(t.s)}</span></span>${ic('chev', 'chev')}</button>`).join('')}</div></div>`;
  const dueCards = TM.decks.reduce((a, d) => a + deckStats(d).due, 0);
  const tiles = `<div class="tiles"><button class="tile" data-act="nav" data-v="fiches" style="--sub:var(--ra)">${ic('book')}<span class="t">Fiches mémo</span><span class="s">${dueCards ? `${plural(dueCards, 'carte')} à revoir` : '5 min par jour'}</span></button>${!S.diag ? `<button class="tile" data-act="diag" style="--sub:var(--cm)">${ic('target')}<span class="t">Test de positionnement</span><span class="s">19 questions, ton point de départ</span></button>` : ''}<button class="tile" data-act="strategy" style="--sub:var(--cdt)">${ic('flag')}<span class="t">Stratégie jour J</span><span class="s">Gestion du temps, réponses</span></button><button class="tile" data-act="mock" style="--sub:var(--calc)">${ic('exam')}<span class="t">Tage Mage blanc</span><span class="s">6 × 20 min, score /600</span></button><button class="tile" data-act="nav" data-v="erreurs" style="--sub:var(--expr)">${ic('repeat')}<span class="t">Cahier d'erreurs</span><span class="s">${due ? `${plural(due, 'question')} à revoir` : 'Rien à revoir aujourd\'hui'}</span></button><button class="tile" data-act="nav" data-v="stats" style="--sub:var(--cdt)">${ic('chart')}<span class="t">Statistiques</span><span class="s">Progression et points faibles</span></button>${AI.available() ? `<button class="tile" data-act="nav" data-v="prof" style="--sub:var(--log)">${ic('spark')}<span class="t">Prof IA</span><span class="s">Pose tes questions</span></button>` : `<button class="tile" data-act="drill-quick" style="--sub:var(--ra)">${ic('bolt')}<span class="t">Série express</span><span class="s">60 s de calcul mental</span></button>`}</div>`;
  const scoring = `<p class="small faint">Barème utilisé : ${scoringPenalty() ? '+4 / −1 / 0' : '+4 / 0 / 0, sans pénalité (format annoncé depuis 2025)'} · <button class="linkbtn" data-act="nav" data-v="reglages">modifier</button></p>`;
  return `<main class="sheet home"><div class="stack-lg">${intro}${sync}${proj}${plan}${tiles}${scoring}</div></main>`;
}

/* ---------- Onglet d'un sous-test ---------- */
const SUB_FMT = {
  calcul: '15 questions · 20 minutes · sans calculatrice',
  cm: '15 questions · 20 minutes · dire si les données suffisent',
  logique: '15 questions · 20 minutes · suites, dominos, cartes, figures',
  cdt: '15 questions · 20 minutes · textes et questions de compréhension',
  ra: '15 questions · 20 minutes · arguments, hypothèses, failles',
  expr: '15 questions · 20 minutes · grammaire, orthographe, vocabulaire',
};
const SUB_TIPS = {
  calcul: ['Lis les 5 réponses avant de calculer : elles indiquent la précision nécessaire.', 'Élimine avec le chiffre des unités et l\'ordre de grandeur.', 'Bloqué au-delà de 1 min 30 ? Coche une réponse et passe : chaque question rapporte autant de points.', 'Teste les réponses proposées dans l\'énoncé quand l\'équation est compliquée.'],
  cm: ['Ne calcule jamais jusqu\'au bout : savoir qu\'on PEUT trouver suffit.', 'Teste (1) seule, puis (2) seule, et seulement ensuite les deux ensemble.', 'Pour une question oui/non, un « non » certain est une réponse.', 'Méfie-toi des conditions qui disent la même chose.'],
  logique: ['Commence par les écarts entre les termes.', 'Pense « modulo 7 » pour les dominos et « modulo 13 » pour les cartes.', 'Pour les figures, élimine caractéristique par caractéristique.', 'Apprends les rangs des lettres (E = 5, J = 10, O = 15, T = 20, Y = 25).'],
  cdt: ['Survole les questions avant de lire le texte.', 'Retourne toujours au passage précis avant de répondre.', 'Méfie-toi des réponses trop fortes (toujours, jamais, tous).'],
  ra: ['Identifie la conclusion avant de lire les réponses.', 'Pour l\'hypothèse implicite, applique le test de la négation.', 'La contraposée est vraie, la réciproque ne l\'est pas.'],
  expr: ['Les questions d\'Expression sont rapides : vise 45 secondes chacune.', 'En cas de doute sur un accord, cherche le COD et sa position.', 'Apprends une liste de paronymes par jour.'],
};
function subStats(sub) {
  const h = (Store.S.subs[sub] && Store.S.subs[sub].hist) || [];
  const acc = h.length ? Math.round(100 * h.reduce((a, x) => a + x[0], 0) / h.length) : null;
  const avgT = h.length ? Math.round(h.reduce((a, x) => a + x[1], 0) / h.length) : null;
  const total = Object.entries(Store.S.skills).filter(([k]) => (TM.gens[k] ? TM.gens[k].sub === sub : k.startsWith(sub + '.'))).reduce((a, [, s]) => a + s.n, 0);
  return { acc, avgT, total, proj: projectSub(sub) };
}
function vSub(sub) {
  const s = SUB[sub], st = subStats(sub);
  const head = `<div class="subhead"><p class="eyebrow">Sous-test ${s.official} du Tage Mage</p><h1>${s.name}</h1><p class="fmt">${SUB_FMT[sub]}</p><div class="scorebox"><div class="scorebig">${st.proj != null ? st.proj : '—'}<small>/60 estimé</small></div><div class="kpis"><div class="kpi"><span class="v">${st.acc != null ? st.acc + ' %' : '—'}</span><span class="l">réussite récente</span></div><div class="kpi"><span class="v">${st.total}</span><span class="l">questions faites</span></div><div class="kpi"><span class="v">${st.avgT != null ? st.avgT + ' s' : '—'}</span><span class="l">par question</span></div></div></div></div>`;
  const actions = `<div class="btns"><button class="btn sub" data-act="train" data-sub="${sub}">${ic('play')}${sub === 'cdt' ? 'Lire un texte (5 questions)' : 'Entraînement adapté (10 Q)'}</button><button class="btn ghost" data-act="exam" data-sub="${sub}">${ic('clock')}Épreuve 15 Q / 20 min</button></div>`;
  let extra = '';
  if (sub === 'calcul' || sub === 'logique') {
    const ids = Object.values(TM.drills).filter((d) => d.sub === sub).map((d) => d.id);
    extra += `<div class="sec"><div class="sec-h"><h2>${sub === 'calcul' ? 'Calcul mental chronométré' : 'Réflexes de logique'}</h2>${sub === 'calcul' ? '<button class="btn soft sm" data-act="drill-quick">Série express</button>' : ''}</div><p class="small muted">${sub === 'calcul' ? 'Des séries de 60 secondes où tu tapes la réponse. Objectif : gagner en vitesse sur les automatismes. Le niveau monte tout seul quand tu es prêt.' : 'Pour reconnaître les lettres et les écarts en un éclair.'}</p><div class="drills">${ids.map((id) => { const d = TM.drills[id], rec = Store.S.drills[id]; return `<button class="drill" data-act="drill" data-id="${id}"><span class="t">${esc(d.name)}</span><span class="s">${esc(d.desc)}</span><span class="rec">${rec && rec.best ? `Record ${rec.best}/min · niv. ${rec.lvl || 1}` : 'Pas encore tenté'}</span></button>`; }).join('')}</div></div>`;
  }
  if (sub === 'calcul') {
    const G = Store.S.guides || {};
    extra += `<div class="sec"><div class="sec-h"><h2>Exercices guidés pas à pas</h2></div><p class="small muted">Pour comprendre la méthode : le problème est découpé en étapes, tu tapes chaque résultat intermédiaire, avec un indice si tu bloques.</p><div class="drills">${Object.values(TM.guides).map((g) => `<button class="drill" data-act="guide" data-id="${g.id}"><span class="t">${esc(g.name)}</span><span class="s">${esc(TM.chapters[g.ch].short)}</span><span class="rec">${G[g.id] ? `Fait ${G[g.id].n} fois` : 'Pas encore fait'}</span></button>`).join('')}</div></div>`;
  }
  if (['ra', 'expr', 'cdt'].includes(sub)) {
    const pool = (Store.A[sub] || []).length;
    extra += AI.available()
      ? `<div class="sec"><div class="sec-h"><h2>Questions illimitées</h2><span class="pill ai">IA</span></div><p class="small muted">${sub === 'cdt' ? 'Claude écrit un texte inédit et 5 questions de compréhension, dans le style du Tage Mage.' : 'Claude crée de nouvelles questions dans le style du Tage Mage, avec leur correction.'}${pool ? ` <b>${pool} question${pool > 1 ? 's' : ''} déjà prête${pool > 1 ? 's' : ''}.</b>` : ''}</p><div class="btns">${pool >= (sub === 'cdt' ? 3 : 5) ? `<button class="btn soft" data-act="ai-use" data-sub="${sub}">${ic('play')}Utiliser les questions prêtes</button>` : ''}<button class="btn soft" data-act="ai-gen" data-sub="${sub}" id="aigen-${sub}">${ic('spark')}${sub === 'cdt' ? 'Générer un nouveau texte' : 'Générer 5 nouvelles questions'}</button></div><div id="aigen-out-${sub}"></div></div>`
      : '';
  }
  const chs = chaptersOf(sub);
  const chList = `<div class="sec"><div class="sec-h"><h2>Cours et exercices</h2></div><div class="list">${chs.map((c, i) => { const m = chapterMastery(c.id), read = Store.S.lessons[c.id]; return `<div class="li"><span class="idx ${m != null && m >= 70 ? 'done' : 'sub'}">${m != null && m >= 70 ? ic('check') : i + 1}</span><span class="grow"><button class="linkbtn" style="color:var(--ink);text-decoration:none;text-align:left" data-act="lesson" data-ch="${c.id}"><span class="t">${esc(c.title)}</span></button><br><span class="s">${m != null ? `Maîtrise ${m} %` : read ? 'Cours lu · pas encore d\'exercice' : 'Pas encore commencé'}</span><div class="bar" style="margin-top:6px"><i style="width:${m || 0}%"></i></div></span><span class="row" style="gap:6px"><button class="btn ghost sm" data-act="lesson" data-ch="${c.id}" aria-label="Cours ${esc(c.title)}">${ic('book')}</button><button class="btn soft sm" data-act="train-ch" data-ch="${c.id}" aria-label="S'entraîner : ${esc(c.title)}">${ic('play')}</button></span></div>`; }).join('')}</div></div>`;
  const tips = `<div class="sec"><div class="sec-h"><h3>Conseils pour le jour J</h3></div><ul class="small muted" style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px">${SUB_TIPS[sub].map((t) => `<li>${t}</li>`).join('')}</ul></div>`;
  return `<main class="sheet" style="--sub:${s.color}"><div class="stack-lg">${head}${actions}${extra}${chList}${tips}</div></main>`;
}

/* ---------- Cahier d'erreurs ---------- */
function vErrors() {
  const items = Object.values(Store.E.items), due = dueErrors(), active = activeErrors();
  const boxes = [1, 2, 3, 4, 5].map((b) => items.filter((e) => e.box === b).length), mastered = items.filter((e) => e.box >= 6).length;
  const bySub = SUBS.map((s) => ({ s, list: active.filter((e) => e.sub === s.id) })).filter((x) => x.list.length);
  return `<main class="sheet home"><div class="stack-lg"><div class="sec"><p class="eyebrow">Répétition espacée</p><h2>Cahier d'erreurs</h2><p class="small muted">Chaque question ratée revient le lendemain, puis après 3, 7, 16 et 35 jours si tu la réussis. En calcul, en conditions minimales et en logique, elle revient avec de nouveaux nombres : tu apprends la méthode, pas la réponse.</p></div><div class="btns"><button class="btn" data-act="review" ${due.length ? '' : 'disabled'}>${ic('repeat')}${due.length ? `Réviser maintenant (${Math.min(15, due.length)})` : 'Rien à réviser aujourd\'hui'}</button></div><div class="statgrid">${boxes.slice(0, 3).map((n, i) => `<div class="stat"><div class="v">${n}</div><div class="l">boîte ${i + 1}</div></div>`).join('')}<div class="stat"><div class="v">${boxes[3] + boxes[4]}</div><div class="l">boîtes 4-5</div></div><div class="stat"><div class="v">${mastered}</div><div class="l">maîtrisées</div></div><div class="stat"><div class="v">${due.length}</div><div class="l">à revoir</div></div></div>${bySub.length ? bySub.map(({ s, list }) => `<div class="sec" style="--sub:${s.color}"><div class="sec-h"><h3 class="mtitle"><i></i>${s.name}</h3><span class="pill">${list.length}</span></div><div class="list">${groupSkills(list).map(([sk, n, nextDue]) => `<div class="li"><span class="grow"><span class="t">${esc(TM.gens[sk] ? TM.gens[sk].name : sk.endsWith('.ia') ? 'Questions IA' : sk)}</span><br><span class="s">${plural(n, 'question')} · prochaine révision ${nextDue <= Date.now() ? 'aujourd\'hui' : new Date(nextDue).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></span>${TM.gens[sk] ? `<button class="btn soft sm" data-act="train-skill" data-id="${sk}">${ic('play')}</button>` : ''}</div>`).join('')}</div></div>`).join('') : '<div class="notice">Ton cahier est vide pour l\'instant. Les questions ratées s\'y rangent automatiquement.</div>'}${mastered ? `<button class="btn ghost sm" data-act="clear-mastered">Supprimer les ${mastered} questions maîtrisées</button>` : ''}</div></main>`;
}
function groupSkills(list) {
  const m = {};
  list.forEach((e) => { const g = m[e.skill] || (m[e.skill] = [e.skill, 0, Infinity]); g[1]++; g[2] = Math.min(g[2], e.due); });
  return Object.values(m).sort((a, b) => b[1] - a[1]);
}

/* ---------- Graphiques (SVG) ---------- */
function niceMax(v) { if (v <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function colChart(data, title) {
  const W = 340, H = 150, L = 28, Rr = 6, T = 10, B = 22, n = data.length;
  const max = niceMax(Math.max(1, ...data.map((d) => d.v)));
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const slot = (W - L - Rr) / n, bw = Math.min(24, slot - 2);
  let g = '';
  [0, max / 2, max].forEach((t) => { g += `<line x1="${L}" x2="${W - Rr}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`; });
  const ticks = [0, max / 2, max].map((t) => `<text x="${L - 6}" y="${(y(t) + 3.5).toFixed(1)}" text-anchor="end">${fmt(t)}</text>`).join('');
  const bars = data.map((d, i) => {
    const x = L + i * slot + (slot - bw) / 2, y0 = y(0), yt = y(d.v), r = Math.min(4, (y0 - yt) / 2, bw / 2);
    const path = d.v > 0 ? `M${x.toFixed(1)},${y0} V${(yt + r).toFixed(1)} Q${x.toFixed(1)},${yt.toFixed(1)} ${(x + r).toFixed(1)},${yt.toFixed(1)} H${(x + bw - r).toFixed(1)} Q${(x + bw).toFixed(1)},${yt.toFixed(1)} ${(x + bw).toFixed(1)},${(yt + r).toFixed(1)} V${y0} Z` : '';
    return `<rect class="hit" x="${(L + i * slot).toFixed(1)}" y="${T}" width="${slot.toFixed(1)}" height="${H - T - B}" tabindex="0" data-tip="${esc(d.tip)}" aria-label="${esc(d.tip)}"/>${path ? `<path class="bar" d="${path}"/>` : ''}`;
  }).join('');
  const lbls = [0, Math.floor((n - 1) / 2), n - 1].map((i) => `<text x="${(L + i * slot + slot / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(data[i].x)}</text>`).join('');
  return `<div class="chartbox"><div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><g class="grid">${g}</g>${ticks}${bars}${lbls}</svg></div><div class="ctip" hidden></div></div>`;
}
function lineChart(points, title, opts = {}) {
  const W = opts.w || 340, H = opts.h || 140, L = 26, Rr = 30, T = 12, B = 20, n = points.length;
  const max = opts.max || niceMax(Math.max(1, ...points.map((p) => p.v)));
  const x = (i) => (n === 1 ? (L + W - Rr) / 2 : L + (W - L - Rr) * i / (n - 1)), y = (v) => T + (H - T - B) * (1 - v / max);
  const grid = [0, max / 2, max].map((t) => `<line x1="${L}" x2="${W - Rr}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`).join('');
  const ticks = [0, max / 2, max].map((t) => `<text x="${L - 6}" y="${(y(t) + 3.5).toFixed(1)}" text-anchor="end">${fmt(t)}</text>`).join('');
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = n > 1 ? `<path class="area" d="${d} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z"/>` : '';
  const last = points[n - 1];
  const hits = points.map((p, i) => `<rect class="hit" x="${(x(i) - Math.max(12, (W - L - Rr) / Math.max(1, n - 1) / 2)).toFixed(1)}" y="${T}" width="${Math.max(24, (W - L - Rr) / Math.max(1, n - 1)).toFixed(1)}" height="${H - T - B}" tabindex="0" data-tip="${esc(p.tip)}" data-cx="${x(i).toFixed(1)}" aria-label="${esc(p.tip)}"/>`).join('');
  const lbls = n > 1 ? `<text x="${x(0).toFixed(1)}" y="${H - 5}" text-anchor="start">${esc(points[0].x)}</text><text x="${x(n - 1).toFixed(1)}" y="${H - 5}" text-anchor="end">${esc(last.x)}</text>` : `<text x="${x(0).toFixed(1)}" y="${H - 5}" text-anchor="middle">${esc(last.x)}</text>`;
  return `<div class="chartbox"><div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><g class="grid">${grid}</g>${ticks}${area}${n > 1 ? `<path class="line" d="${d}"/>` : ''}<line class="xhair" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/><circle class="dot" cx="${x(n - 1).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="4.5"/><text class="endlbl" x="${(x(n - 1) + 8).toFixed(1)}" y="${(y(last.v) + 4).toFixed(1)}">${fmt(last.v)}</text>${lbls}${hits}</svg></div><div class="ctip" hidden></div></div>`;
}
function dataTable(head, rows) { return `<details class="data"><summary>Voir les données</summary><div class="tablewrap"><table><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div></details>`; }
function chartTipHandlers(root) {
  const show = (hit) => {
    const box = hit.closest('.chartbox'), tip = box.querySelector('.ctip'), svg = box.querySelector('svg');
    const [a, b] = hit.dataset.tip.split('|');
    tip.textContent = ''; const bb = document.createElement('b'); bb.textContent = a; const sp = document.createElement('span'); sp.textContent = b || ''; tip.append(bb, sp);
    const r = hit.getBoundingClientRect(), br = box.getBoundingClientRect();
    let cx = r.left + r.width / 2 - br.left;
    if (hit.dataset.cx) { const sr = svg.getBoundingClientRect(); cx = (+hit.dataset.cx) * sr.width / svg.viewBox.baseVal.width + (sr.left - br.left); const xh = svg.querySelector('.xhair'); if (xh) { xh.setAttribute('x1', hit.dataset.cx); xh.setAttribute('x2', hit.dataset.cx); xh.setAttribute('visibility', 'visible'); } }
    tip.style.left = Math.max(60, Math.min(br.width - 60, cx)) + 'px'; tip.style.top = (r.top - br.top + 8) + 'px'; tip.hidden = false;
  };
  const hide = (hit) => { const box = hit.closest('.chartbox'); box.querySelector('.ctip').hidden = true; const xh = box.querySelector('.xhair'); if (xh) xh.setAttribute('visibility', 'hidden'); };
  root.querySelectorAll('.chart .hit').forEach((h) => {
    h.addEventListener('pointerenter', () => show(h)); h.addEventListener('pointerleave', () => hide(h));
    h.addEventListener('focus', () => show(h)); h.addEventListener('blur', () => hide(h));
  });
}

/* ---------- Statistiques ---------- */
function vStats() {
  const S = Store.S, pt = projectTotal();
  const tiles = SUBS.map((s, i) => { const st = subStats(s.id); return `<button class="mini" style="--sub:${s.color}" data-act="nav" data-v="${s.hash}"><span class="n">${s.name}</span><span class="v num">${pt.vals[i] != null ? pt.vals[i] : '—'}<small>/60</small></span><span class="small faint">${st.acc != null ? st.acc + ' % · ' : ''}${st.total} Q</span></button>`; }).join('');
  const days = []; for (let k = 29; k >= 0; k--) { const key = addDays(dayKey(), -k), d = S.days[key]; const lab = new Date(key + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); days.push({ x: lab, v: d ? d.q : 0, tip: `${d ? d.q : 0} questions|${lab}${d && d.q ? ` · ${Math.round(100 * d.ok / d.q)} % justes` : ''}` }); }
  const totalQ = Object.values(S.days).reduce((a, d) => a + d.q, 0), totalMin = Math.round(Object.values(S.days).reduce((a, d) => a + d.ms, 0) / 60000);
  const activity = `<div class="sec"><div class="sec-h"><h3>Questions par jour</h3><span class="small muted">30 derniers jours</span></div>${colChart(days, 'Questions répondues par jour sur 30 jours')}${dataTable(['Jour', 'Questions'], days.filter((d) => d.v).map((d) => [esc(d.x), d.v]))}</div>`;
  const exams = SUBS.map((s) => ({ s, list: S.sessions.filter((x) => x.sub === s.id && (x.mode === 'exam' || x.mode === 'mock') && x.sc != null).slice(-12) })).filter((x) => x.list.length);
  const examSec = `<div class="sec"><div class="sec-h"><h3>Scores aux épreuves chronométrées</h3><span class="small muted">sur 60</span></div>${exams.length ? `<div class="multiples">${exams.map(({ s, list }) => `<div style="--sub:${s.color}"><p class="mtitle"><i></i>${s.short}</p>${lineChart(list.map((x) => { const lab = new Date(x.t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); return { x: lab, v: x.sc, tip: `${x.sc}/60|${lab}` }; }), 'Scores ' + s.name, { max: 60, w: 200, h: 110 })}</div>`).join('')}</div>${dataTable(['Sous-test', 'Date', 'Score /60'], [].concat(...exams.map(({ s, list }) => list.map((x) => [s.short, new Date(x.t).toLocaleDateString('fr-FR'), x.sc]))))}` : '<div class="notice">Passe une épreuve chronométrée (15 questions, 20 minutes) dans un onglet pour suivre ton score ici.</div>'}</div>`;
  const dr = {}; Object.values(S.drills).forEach((d) => d.hist.forEach(([t, , ipm]) => { const k = dayKey(new Date(t)); (dr[k] = dr[k] || []).push(ipm); }));
  const drPts = Object.keys(dr).sort().slice(-20).map((k) => { const v = round(dr[k].reduce((a, b) => a + b, 0) / dr[k].length, 1); const lab = new Date(k + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); return { x: lab, v, tip: `${fmt(v)} bonnes réponses/min|${lab}` }; });
  const speed = `<div class="sec"><div class="sec-h"><h3>Vitesse en calcul mental</h3><span class="small muted">bonnes réponses par minute</span></div>${drPts.length ? lineChart(drPts, 'Vitesse moyenne en calcul mental') + dataTable(['Jour', 'Réponses/min'], drPts.map((p) => [esc(p.x), fmt(p.v)])) : '<div class="notice">Fais une série de calcul mental (onglet Calcul) pour suivre ta vitesse.</div>'}</div>`;
  const chRows = SUBS.map((s) => { const chs = chaptersOf(s.id).map((c) => ({ c, m: chapterMastery(c.id) })); return `<div class="sec" style="--sub:${s.color}"><p class="mtitle"><i></i>${s.name}</p><div class="list">${chs.map(({ c, m }) => `<button class="li" data-act="lesson" data-ch="${c.id}"><span class="grow"><span class="t">${esc(c.short)}</span><div class="bar" style="margin-top:6px"><i style="width:${m || 0}%"></i></div></span><span class="num small">${m != null ? m + ' %' : '—'}</span></button>`).join('')}</div></div>`; }).join('');
  const coach = AI.available() ? `<div class="sec"><div class="sec-h"><h3>Analyse de ton coach</h3><span class="pill ai">IA</span></div><p class="small muted">Claude lit tes statistiques et te propose un plan pour la semaine.</p><button class="btn soft" data-act="coach">${ic('spark')}Analyser ma progression</button><div id="coachOut"></div></div>` : '';
  const mocks = (S.mocks || []).slice(-5).reverse();
  const mockSec = mocks.length ? `<div class="sec"><div class="sec-h"><h3>Tage Mage blancs</h3></div><div class="list">${mocks.map((m) => `<div class="li"><span class="grow"><span class="t">${new Date(m.t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span><br><span class="s">${OFFICIAL_ORDER.map((s) => `${SUB[s].abbr} ${m.scores[s]}`).join(' · ')}</span></span><span class="num"><b>${m.total}</b><span class="faint">/600</span></span></div>`).join('')}</div></div>` : '';
  return `<main class="sheet home"><div class="stack-lg"><div class="sec"><p class="eyebrow">Statistiques</p><h2>${pt.total != null ? `${pt.total}/600 estimé` : 'Ta progression'}</h2><p class="small muted">${fmt(totalQ)} questions et séries · ${fmt(totalMin)} minutes de travail · série de ${streakDays()} jour${streakDays() > 1 ? 's' : ''}</p></div><div class="minis">${tiles}</div>${coach}${activity}${examSec}${mockSec}${speed}<div class="sec"><div class="sec-h"><h3>Maîtrise par chapitre</h3></div></div>${chRows}</div></main>`;
}

/* ---------- Prof IA ---------- */
const PROF_CHIPS = ['Explique-moi la vitesse moyenne comme si j\'avais 12 ans', 'Donne-moi 3 astuces de calcul mental pour gagner du temps', 'Fais-moi réviser les pourcentages avec un exercice', 'Comment gérer mes 20 minutes en Conditions minimales ?', 'Quel planning pour atteindre 400 en 2 mois ?'];
function vProf() {
  if (!AI.available()) return `<main class="sheet home"><div class="stack"><h2>Prof IA</h2><div class="notice">${AI.fn ? 'L\'IA a été désactivée pour cette page. Tu peux l\'autoriser depuis le menu Autorisations de l\'artifact.' : 'Le prof IA est disponible dans la version « lien Claude » de l\'app. La version hors-ligne fonctionne sans IA.'}</div></div></main>`;
  const msgs = Store.C.msgs;
  const list = msgs.length ? msgs.map((m) => `<div class="msg ${m.role === 'user' ? 'me' : 'ai'}">${m.role === 'user' ? esc(m.content) : md(m.content)}</div>`).join('') : `<div class="msg ai">${md('Salut ! Je suis ton prof particulier pour le Tage Mage. Pose-moi n\'importe quelle question : une notion de calcul que tu ne comprends pas, une méthode, un exercice à faire ensemble… Je connais ton profil et tes statistiques.')}</div>`;
  return `<main class="sheet home"><div class="stack"><div class="sec-h"><h2>Prof IA</h2>${msgs.length ? '<button class="btn ghost sm" data-act="chat-clear">Nouvelle conversation</button>' : ''}</div><div class="chat" id="chat">${list}<div id="chatLive"></div><span id="chatEnd"></span></div>${msgs.length ? '' : `<div class="chips">${PROF_CHIPS.map((c, i) => `<button class="chip" data-act="chip" data-i="${i}">${esc(c)}</button>`).join('')}</div>`}<form class="composer" id="chatForm"><label for="chatIn" class="sr" hidden>Ton message</label><textarea id="chatIn" rows="1" placeholder="Pose ta question…" maxlength="2000"></textarea><button class="btn" type="submit" aria-label="Envoyer">${ic('send')}</button></form></div></main>`;
}
async function sendChat(text) {
  text = (text || '').trim(); if (!text || AI.busy) return;
  Store.C.msgs.push({ role: 'user', content: text });
  render();
  const live = $('#chatLive'); AI.busy = true;
  live.innerHTML = `<div class="msg ai"><div class="thinking"><i></i><i></i><i></i> Prof réfléchit…</div></div>`;
  const end = $('#chatEnd'); if (end) end.scrollIntoView({ block: 'end' });
  const ctl = new AbortController(); AI.ctl = ctl;
  try {
    const turns = Store.C.msgs.map((m) => ({ role: m.role, content: m.content }));
    const ans = await AI.chat(turns, ({ text: t }) => { const l = $('#chatLive'); if (l) l.innerHTML = `<div class="msg ai">${md(t)}</div>`; }, ctl.signal);
    Store.C.msgs.push({ role: 'assistant', content: ans });
  } catch (e) {
    const msg = AI.errMsg(e);
    if (e && e.text) Store.C.msgs.push({ role: 'assistant', content: e.text + '\n\n(réponse interrompue)' });
    if (msg) toast(msg);
  } finally {
    AI.busy = false;
    if (Store.C.msgs.length > 40) Store.C.msgs.splice(0, Store.C.msgs.length - 40);
    Store.save('chat');
    if (currentView() === 'prof') render();
  }
}

/* ---------- Réglages ---------- */
function vSettings() {
  const p = Store.S.profile;
  const seg = (key, opts, val) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-act="set" data-k="${key}" data-val="${v}" aria-pressed="${String(val) === String(v)}">${l}</button>`).join('')}</div>`;
  const syncTxt = Store.mode === 'cloud' ? 'Ta progression est synchronisée avec ton compte Claude : tu la retrouves sur téléphone et ordinateur.' : (typeof window !== 'undefined' && window.claude ? 'Synchronisation indisponible pour le moment : ta progression est enregistrée sur cet appareil.' : 'Version hors-ligne : ta progression est enregistrée sur cet appareil. Utilise le code de transfert pour la copier ailleurs.');
  return `<main class="sheet home"><div class="stack-lg"><div class="sec"><p class="eyebrow">Réglages</p><h2>Ton profil</h2></div>
<div class="field"><label for="f-target">Score visé (sur 600)</label><input id="f-target" type="number" inputmode="numeric" min="150" max="600" step="10" value="${p.target}" data-field="target"></div>
<div class="field"><label for="f-date">Date du test (facultatif)</label><input id="f-date" type="date" value="${esc(p.examDate || '')}" data-field="examDate"><span class="small faint">Tu veux le passer après l'AMF et avant le TOEIC : ajoute la date dès que tu es inscrit, l'accueil affichera le compte à rebours.</span></div>
<div class="field"><label>Temps de révision par jour</label>${seg('dailyMin', [[15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '1 h'], [90, '1 h 30']], p.dailyMin)}</div>
<div class="field"><label for="f-about">Ce que le prof IA sait de toi</label><textarea id="f-about" rows="5" data-field="about">${esc(p.about || '')}</textarea></div>
<div class="sec"><h3>Barème</h3><p class="small muted">D'après plusieurs sources, les mauvaises réponses ne retirent plus de points depuis 2025. Vérifie sur le site officiel du Tage Mage et ajuste si besoin.</p>${seg('scoring', [['nopenalty', '+4 / 0 / 0'], ['penalty', '+4 / −1 / 0']], p.scoring)}</div>
<div class="sec"><h3>Sauvegarde</h3><p class="small muted">${syncTxt}</p><div class="btns"><button class="btn soft" data-act="export">${ic('copy')}Copier mon code de transfert</button></div><div class="field"><label for="f-import">Importer une progression (coller un code)</label><textarea id="f-import" rows="3" placeholder="Colle ici le code copié depuis l'autre version de l'app"></textarea><button class="btn ghost sm" data-act="import">Importer</button></div></div>
<div class="sec"><h3>Remise à zéro</h3><button class="btn ghost sm" data-act="reset">Effacer toute ma progression</button></div>
<p class="small faint">Objectif 400 est une application de révision personnelle, non officielle et sans lien avec la FNEGE, organisatrice du Tage Mage. Les questions sont originales.</p></div></main>`;
}

/* ---------- Actions ---------- */
function runTask(t) {
  const a = t.act;
  if (a.type === 'drill') return startDrill(a.drill, { dur: a.dur, task: t.id });
  if (a.type === 'review') return startReview(t.id);
  if (a.type === 'chapter') { if (!Store.S.lessons[a.ch]) { openLesson(a.ch); Cur = { lessonOf: a.ch, task: t.id }; return; } return startTraining('calcul', { ch: a.ch, task: t.id }); }
  if (a.type === 'train') return startTraining(a.sub, { task: t.id });
  if (a.type === 'exam') return startExam(a.sub, t.id);
  if (a.type === 'cards') return new CardSession({ max: 10, task: t.id }).start();
}
async function aiGenerate(sub) {
  if (!AI.available()) return toast('L\'IA n\'est pas disponible ici.');
  const btn = $('#aigen-' + sub), out = $('#aigen-out-' + sub);
  if (btn) btn.disabled = true;
  if (out) out.innerHTML = `<div class="aibox" style="margin-top:10px"><div class="thinking"><i></i><i></i><i></i> Claude prépare ${sub === 'cdt' ? 'un texte et ses questions' : 'tes questions'}… (30 à 60 secondes)</div></div>`;
  try {
    const qs = await AI.generate(sub, sub === 'cdt' ? 5 : 5);
    if (!qs.length) throw { code: 'invalid_json' };
    Store.A[sub] = (Store.A[sub] || []).concat(qs);
    Store.save('ai');
    if (currentView() === SUB[sub].hash && !Cur) startAISet(sub, sub === 'cdt' ? qs : qs.slice(0, 5), sub === 'cdt' ? 'Texte inédit · ' + toPlainTitle(qs[0].passageTitle) : undefined);
    else toast('Questions prêtes dans l\'onglet ' + SUB[sub].short + '.');
  } catch (e) {
    const msg = AI.errMsg(e);
    if (out) out.innerHTML = msg ? `<p class="small muted" style="margin-top:8px">${esc(msg)}</p>` : '';
  } finally { if (btn) btn.disabled = false; }
}
function onClick(e) {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, d = el.dataset;
  switch (a) {
    case 'nav': if (Cur && $('#layer') && !$('#layer').hidden) closeLayer(); go(d.v); window.scrollTo(0, 0); break;
    case 'intro-ok': Store.S.profile.seenIntro = true; Store.save('main'); render(); break;
    case 'task': { const t = dailyPlan()[+d.i]; if (t) runTask(t); break; }
    case 'train': startTraining(d.sub); break;
    case 'exam': startExam(d.sub); break;
    case 'train-ch': { const ch = TM.chapters[d.ch]; const task = Cur && Cur.lessonOf === d.ch ? Cur.task : null; startTraining(ch.sub, { ch: d.ch, task }); break; }
    case 'train-skill': { const g = TM.gens[d.id]; startTraining(g.sub, { ids: [d.id], title: g.name }); break; }
    case 'lesson': openLesson(d.ch); break;
    case 'review': startReview(); break;
    case 'mock': new Mock().intro(); break;
    case 'mock-go': if (Cur instanceof Mock) Cur.go(); break;
    case 'mock-stop': if (Cur instanceof Mock) Cur.final(); break;
    case 'drill': startDrill(d.id); break;
    case 'drill-quick': startDrill('dr.mix', { dur: 60 }); break;
    case 'drill-again': if (Cur instanceof Drill) startDrill(Cur.id, { dur: Cur.dur }); break;
    case 'dk': if (Cur instanceof Drill) Cur.key(d.k); break;
    case 'quit-drill': if (Cur instanceof Drill) Cur.quit(); break;
    case 'choose': if (Cur instanceof Session) Cur.choose(+d.k); break;
    case 'next': if (Cur instanceof Session) Cur.next(); break;
    case 'prev': if (Cur instanceof Session) Cur.prev(); break;
    case 'flag': if (Cur instanceof Session) { Cur.flags.has(Cur.i) ? Cur.flags.delete(Cur.i) : Cur.flags.add(Cur.i); Cur.render(); } break;
    case 'grid': if (Cur instanceof Session) { Cur.showGrid = !Cur.showGrid; Cur.render(); } break;
    case 'goto': if (Cur instanceof Session) Cur.goto(+d.k); break;
    case 'end': if (Cur instanceof Session) Cur.endExam(); break;
    case 'toggle-text': if (Cur instanceof Session) { Cur.fullText = !Cur.fullText; Cur.render(); } break;
    case 'quit': if (Cur instanceof Session) Cur.quit(); break;
    case 'close': closeLayer(); break;
    case 'rev-q': if (Cur instanceof Session) Cur.reviewOne(+d.k); break;
    case 'back-results': if (Cur instanceof Session) Cur.renderResults(); break;
    case 'redo-wrong': if (Cur instanceof Session) Cur.redoWrong(); break;
    case 'ai-explain': {
      const s = Cur instanceof Session ? Cur : null; if (!s) break;
      const k = s.reviewing != null && s.res ? s.reviewing : s.i;
      const q = s.res && s.reviewing != null ? s.res.qs[k] : s.q, sel = s.res && s.reviewing != null ? s.res.ans[k] : s.ans[s.i];
      runExplain(q, sel); break;
    }
    case 'ai-stop': if (AI.ctl) AI.ctl.abort(); break;
    case 'ai-gen': aiGenerate(d.sub); break;
    case 'ai-use': { const pool = (Store.A[d.sub] || []); if (d.sub === 'cdt') { const sets = aiTextSets(); if (sets.length) startAISet('cdt', sets[0], 'Texte · ' + toPlainTitle(sets[0][0].passageTitle)); } else startAISet(d.sub, pool.slice(0, 5)); break; }
    case 'coach': runCoach(); break;
    case 'guide': startGuide(d.id); break;
    case 'gk': if (Cur instanceof GuideSession) Cur.key(d.k); break;
    case 'g-hint': if (Cur instanceof GuideSession) Cur.hint(); break;
    case 'g-show': if (Cur instanceof GuideSession) Cur.show(); break;
    case 'g-again': if (Cur instanceof GuideSession) startGuide(Cur.id, null); break;
    case 'g-qcm': if (Cur instanceof GuideSession) { const ch = TM.guides[Cur.id].ch; startTraining('calcul', { ch }); } break;
    case 'cards': new CardSession({ decks: [d.id], title: (TM.decks.find((x) => x.id === d.id) || {}).name }).start(); break;
    case 'cards-all': new CardSession({}).start(); break;
    case 'flip': if (Cur instanceof CardSession) Cur.flip(); break;
    case 'rate': if (Cur instanceof CardSession) Cur.rate(d.k === '1'); break;
    case 'diag': startDiag(); break;
    case 'peek': openPeek(d.ch); break;
    case 'peek-close': closePeek(); break;
    case 'strategy': openStrategy(); break;
    case 'chip': sendChat(PROF_CHIPS[+d.i]); break;
    case 'chat-clear': Store.C.msgs = []; Store.save('chat'); render(); break;
    case 'clear-mastered': { const E = Store.E.items; Object.keys(E).forEach((k) => { if (E[k].box >= 6) delete E[k]; }); Store.save('errors'); render(); toast('Questions maîtrisées supprimées.'); break; }
    case 'set': { const p = Store.S.profile; p[d.k] = d.k === 'dailyMin' ? +d.val : d.val; Store.save('main'); render(); toast('Réglage enregistré.'); break; }
    case 'export': {
      const code = Store.exportCode();
      const fallback = () => { const ta = $('#f-import'); if (ta) { ta.value = code; ta.focus(); ta.select(); } toast('Copie impossible ici : le code est sélectionné dans le champ, copie-le à la main.'); };
      try { navigator.clipboard.writeText(code).then(() => toast('Code copié. Colle-le dans l\'autre version de l\'app (Réglages → Importer).'), fallback); } catch (err) { fallback(); }
      break;
    }
    case 'import': {
      const ta = $('#f-import'); const code = ta && ta.value.trim(); if (!code) return toast('Colle d\'abord un code.');
      modal('Importer cette progression ?', 'Elle remplacera ta progression actuelle sur cette version (le cahier d\'erreurs sera fusionné).', [{ label: 'Annuler', cls: 'ghost' }, { label: 'Importer', fn: () => { try { Store.importCode(code); toast('Progression importée.'); render(); } catch (err) { toast('Ce code n\'est pas valide. Vérifie qu\'il a été copié en entier.'); } } }]);
      break;
    }
    case 'reset': modal('Tout effacer ?', 'Toute ta progression (statistiques, cahier d\'erreurs, conversation) sera supprimée. Cette action est définitive.', [{ label: 'Annuler', cls: 'ghost' }, { label: 'Tout effacer', fn: () => { Store.resetAll(); render(); toast('Progression effacée.'); } }]); break;
    default: break;
  }
}
async function runCoach() {
  const out = $('#coachOut'); if (!out) return;
  const ctl = new AbortController(); AI.ctl = ctl;
  out.innerHTML = `<div class="aibox" style="margin-top:10px"><div class="thinking"><i></i><i></i><i></i> Ton coach analyse tes statistiques…</div></div>`;
  try { await AI.coach(({ text }) => { const o = $('#coachOut'); if (o) o.innerHTML = `<div class="aibox" style="margin-top:10px">${md(text)}</div>`; }, ctl.signal); }
  catch (e) { const msg = AI.errMsg(e); const o = $('#coachOut'); if (o) o.innerHTML = msg ? `<p class="small muted">${esc(msg)}</p>` : ''; }
}
function onInput(e) {
  const f = e.target.dataset && e.target.dataset.field; if (!f) return;
  const p = Store.S.profile;
  if (f === 'target') { const v = Math.round(+e.target.value); if (v >= 150 && v <= 600) p.target = v; else return; }
  else p[f] = e.target.value;
  clearTimeout(onInput.t); onInput.t = setTimeout(() => Store.save('main'), 600);
}
function onSubmit(e) {
  if (e.target.id === 'chatForm') { e.preventDefault(); const ta = $('#chatIn'); const v = ta.value; ta.value = ''; sendChat(v); }
}
function onKeydownChat(e) {
  if (e.target.id === 'chatIn' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = e.target.value; e.target.value = ''; sendChat(v); }
}

/* ---- 99-boot.js ---- */
/* ===== Démarrage ===== */
function boot() {
  linkGens();
  Store.loadLocal();
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('keydown', onKeydownChat);
  window.addEventListener('hashchange', () => { if (Cur) closeLayer(); else render(); window.scrollTo(0, 0); });
  render();
  AI.init().then(() => { if (!Cur) render(); });
  Store.initCloud().then((changed) => { if (changed && !Cur) render(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') Store.flush();
    else Store.refreshFromCloud().then((ch) => { if (ch && !Cur) render(); });
  });
  window.addEventListener('pagehide', () => Store.flush());
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

})();
