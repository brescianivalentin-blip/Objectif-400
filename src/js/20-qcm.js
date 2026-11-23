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
