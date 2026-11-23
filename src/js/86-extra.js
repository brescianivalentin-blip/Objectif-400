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
