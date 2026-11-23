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
