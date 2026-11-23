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
  return `<div class="fb ${ok ? 'ok' : 'ko'}"><div class="fb-h">${ok ? ic('check') : ic('close')}<span>${head}</span></div><div class="expl">${q.expl || ''}</div>${q.tip ? `<div class="tip">${q.tip}</div>` : ''}${q.trap ? `<div class="trap">${q.trap}</div>` : ''}${aiExplainBlock()}</div>`;
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
      if (left <= 0) { toast('Temps écoulé : l\'épreuve est terminée.'); this.finish(); }
    } else if (!this.revealed) {
      const el = (Date.now() - this.qStart) / 1000;
      c.querySelector('span').textContent = mmss(el);
      c.classList.toggle('low', el > (this.q.target || 80));
    }
  }
  render() {
    const q = this.q, exam = this.mode === 'exam';
    const answered = this.ans.filter((a) => a != null).length;
    const prog = exam ? answered / this.n : this.i / this.n;
    const st = { sel: this.ans[this.i], reveal: !exam && this.revealed, flag: this.flags.has(this.i), fullText: this.fullText };
    const bar = `<div class="lbar"><button class="iconbtn" data-act="quit" aria-label="Quitter">${ic('close')}</button><div class="ttl">${esc(this.title)} <span class="faint num">· ${this.i + 1}/${this.n}</span></div><span class="chrono" id="chrono">${ic('clock')}<span>${exam ? mmss((this.deadline - Date.now()) / 1000) : '0:00'}</span></span></div><div class="progress" aria-hidden="true"><i style="width:${Math.round(prog * 100)}%"></i></div>`;
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
    const sc = exam ? score60(ok, ko) : null;
    saveSession({ t: Date.now(), sub: this.sub, mode: this.mock ? 'mock' : this.mode, n, ok, sc, ms: totalMs, task: this.task, ch: this.ch || null });
    this.res = { n, ok, ko, blank, sc, totalMs, qs, ans };
    if (this.mock) return this.mock.subDone(this);
    if (!n) return closeLayer();
    this.renderResults();
  }
  renderResults() {
    const r = this.res, exam = this.mode === 'exam';
    const avg = r.n ? r.qs.reduce((a, q, k) => a + (this.ms[k] || 0), 0) / r.n / 1000 : 0;
    const hero = exam
      ? `<div class="result-hero"><p class="eyebrow">${esc(SUB[this.sub].name)} · épreuve chronométrée</p><div class="scorebig">${r.sc}<small>/60</small></div><p class="muted">${r.ok} bonnes · ${r.ko} fausses · ${r.blank} sans réponse</p><p class="small faint">Barème : ${scoringPenalty() ? '+4 / −1 / 0' : '+4 / 0 / 0 (sans pénalité)'}</p></div>`
      : `<div class="result-hero"><p class="eyebrow">${esc(this.title)}</p><div class="scorebig">${r.ok}<small>/${r.n}</small></div><p class="muted">${r.n ? Math.round(100 * r.ok / r.n) : 0} % de réussite</p></div>`;
    const stats = `<div class="statgrid"><div class="stat"><div class="v">${mmss(r.totalMs / 1000)}</div><div class="l">durée</div></div><div class="stat"><div class="v">${Math.round(avg)} s</div><div class="l">par question</div></div><div class="stat"><div class="v">${r.ko + r.blank}</div><div class="l">au cahier d'erreurs</div></div></div>`;
    const rows = r.qs.map((q, k) => { const a = r.ans[k], good = a === q.answer; return `<button class="li" data-act="rev-q" data-k="${k}"><span class="idx ${good ? 'done' : ''}">${k + 1}</span><span class="grow"><span class="t">${esc(skillName(q))}</span><br><span class="s">${a == null ? 'Sans réponse' : good ? 'Juste' : `Ta réponse : ${LETTERS[a]} · bonne : ${LETTERS[q.answer]}`} · ${Math.round((this.ms[k] || 0) / 1000)} s</span></span>${ic('chev', 'chev')}</button>`; }).join('');
    const wrongN = r.ko + r.blank;
    const msg = exam ? examComment(r.sc) : r.n && r.ok / r.n >= 0.8 ? 'Très bien : la difficulté va augmenter automatiquement.' : r.n && r.ok / r.n >= 0.5 ? 'C\'est en progrès. Relis les corrections des questions ratées.' : 'Pas de panique : relis le cours, puis refais une série. Les erreurs sont dans ton cahier.';
    openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('close')}</button><div class="ttl">Bilan</div></div><div class="stack-lg">${hero}<p class="center muted">${msg}</p>${stats}<div class="btns">${wrongN ? `<button class="btn" data-act="redo-wrong">${ic('repeat')}Refaire les ${plural(wrongN, 'erreur')}</button>` : ''}<button class="btn ghost" data-act="close">Terminer</button></div><div class="sec"><div class="sec-h"><h3>Corrections</h3></div><div class="list">${rows}</div></div></div>`, this.sub);
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
  openLayer(`<div class="lbar"><button class="iconbtn" data-act="close" aria-label="Fermer">${ic('back')}</button><div class="ttl">${esc(ch.title)}</div></div><article class="lesson"><p class="eyebrow">${esc(SUB[ch.sub].name)} · cours</p><h2>${esc(ch.title)}</h2>${ch.lesson}</article><div class="sec" style="margin-top:24px"><div class="sec-h"><h3>Exercices de ce chapitre</h3></div><button class="btn block" data-act="train-ch" data-ch="${chId}">${ic('play')}S'entraîner sur tout le chapitre (10 questions)</button><div class="list">${skills}</div></div>`, ch.sub);
}
