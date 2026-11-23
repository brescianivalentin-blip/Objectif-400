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
