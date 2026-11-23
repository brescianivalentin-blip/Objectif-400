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
