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
