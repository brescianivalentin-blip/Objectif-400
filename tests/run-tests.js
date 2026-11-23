/* Tests automatiques des générateurs et du moteur (node tests/run-tests.js) */
const B = require('../dist/test-bundle.js');
const { TM, buildQ, bankQ, normAns, makeRng, examQuestions, dailyPlan, CM_CHOICES } = B;
const N = +(process.argv[2] || 250);
const plain = (h) => String(h || '').replace(/<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$1/$2').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const BAD = /NaN|undefined|Infinity|\[object|null\b/;
let fails = 0, checks = 0;
const failMsgs = {};
function fail(key, msg) { fails++; (failMsgs[key] = failMsgs[key] || []).push(msg); }

// 1) Générateurs
const answerPos = {};
const mismatch = {};
for (const g of Object.values(TM.gens)) {
  for (const d of g.diffs) {
    for (let i = 0; i < N; i++) {
      const seed = 1000 + i * 7919 + d;
      let q;
      checks++;
      try { q = buildQ(g.id, seed, d); } catch (e) { fail(g.id, `d${d} seed ${seed}: exception ${e.message}`); continue; }
      const ch = q.choices;
      if (!Array.isArray(ch) || ch.length !== 5) { fail(g.id, `d${d} seed ${seed}: ${ch && ch.length} choix`); continue; }
      const pl = ch.map(plain);
      if (new Set(pl).size !== 5 && !g.id.startsWith('log.')) fail(g.id, `d${d} seed ${seed}: choix en double ${JSON.stringify(pl)}`);
      if (g.id.startsWith('log.') && new Set(ch).size !== 5) fail(g.id, `d${d} seed ${seed}: choix visuels en double`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 4) fail(g.id, `d${d} seed ${seed}: answer ${q.answer}`);
      for (const [k, v] of [['q', q.q], ['expl', q.expl], ['choices', ch.join(' | ')], ['tip', q.tip || ''], ['trap', q.trap || ''], ['stmts', (q.stmts || []).join(' ')]]) {
        if (BAD.test(plain(v))) fail(g.id, `d${d} seed ${seed}: "${k}" contient ${plain(v).match(BAD)[0]} → ${plain(v).slice(0, 160)}`);
      }
      if (!plain(q.q) || !plain(q.expl)) fail(g.id, `d${d} seed ${seed}: énoncé ou correction vide`);
      if (pl.some((c) => !c) && !q.vis) fail(g.id, `d${d} seed ${seed}: choix vide`);
      const key = g.sub;
      answerPos[key] = answerPos[key] || [0, 0, 0, 0, 0];
      answerPos[key][q.answer]++;
      // cohérence entre la ligne « Réponse : » et le choix correct (contrôle souple)
      const m = plain(q.expl).match(/Réponse : (.*)$/);
      if (m && !q.vis && !q.cm) {
        const want = pl[q.answer].replace(/\s/g, ''), got = m[1].replace(/\s/g, '');
        const digits = (s) => (s.match(/[\d,\/√π−-]+/g) || []).join('');
        if (!(got.includes(want) || want.includes(got) || (digits(want) && digits(got).includes(digits(want))))) {
          (mismatch[g.id] = mismatch[g.id] || []).push(`d${d}: choix="${pl[q.answer]}" / correction="${m[1]}"`);
        }
      }
    }
  }
}

// 2) Calcul mental
for (const dr of Object.values(TM.drills)) {
  for (const l of [1, 2, 3]) {
    for (let i = 0; i < N; i++) {
      checks++;
      let it;
      try { it = dr.make(makeRng(5000 + i * 31 + l), l); } catch (e) { fail(dr.id, `l${l}: exception ${e.message}`); continue; }
      if (!it || !it.p || it.a == null || it.a === '') { fail(dr.id, `l${l}: item vide`); continue; }
      if (BAD.test(String(it.a)) || BAD.test(plain(it.p))) fail(dr.id, `l${l}: ${plain(it.p)} = ${it.a}`);
      if (normAns(it.a) !== normAns(normAns(it.a))) fail(dr.id, `l${l}: normalisation instable ${it.a}`);
      if (String(it.a).length > 12) fail(dr.id, `l${l}: réponse trop longue pour le pavé ${it.a}`);
    }
  }
}

// 3) Banques rédigées
for (const [sub, list] of Object.entries(TM.banks)) {
  const ids = new Set();
  for (const it of list) {
    checks++;
    if (ids.has(it.id)) fail('bank-' + sub, `id en double ${it.id}`);
    ids.add(it.id);
    if (!Array.isArray(it.choices) || it.choices.length !== 5 || new Set(it.choices).size !== 5) fail('bank-' + sub, `${it.id}: choix invalides`);
    const q = bankQ(it, sub);
    if (q.choices[q.answer] !== it.choices[it.answer || 0]) fail('bank-' + sub, `${it.id}: mélange incorrect`);
  }
}

// 3b) Exercices guidés
for (const g of Object.values(TM.guides || {})) {
  for (let i = 0; i < N; i++) {
    checks++;
    let d;
    try { d = g.make(makeRng(9000 + i * 13)); } catch (e) { fail(g.id, 'exception ' + e.message); continue; }
    if (!d.q || !Array.isArray(d.steps) || !d.steps.length || !d.end) { fail(g.id, 'structure incomplète'); continue; }
    if (BAD.test(plain(d.q + d.end))) fail(g.id, 'texte cassé : ' + plain(d.q + d.end).slice(0, 120));
    d.steps.forEach((st, k) => {
      const a = String(st.a);
      if (!a || BAD.test(a) || BAD.test(plain(st.p)) || BAD.test(plain(st.hint || ''))) fail(g.id, `étape ${k + 1} : ${plain(st.p)} = ${a}`);
      if (!B.sameAns(a, a)) fail(g.id, `étape ${k + 1} : réponse non reconnue « ${a} »`);
      if (a.length > 14) fail(g.id, `étape ${k + 1} : réponse trop longue ${a}`);
      if (/,\d{4,}/.test(a)) fail(g.id, `étape ${k + 1} : réponse à décimales infinies ${a}`);
    });
  }
}
// 3c) Fiches mémo
for (const dk of TM.decks || []) { checks++; dk.cards.forEach((c) => { if (!plain(c.f) || !plain(c.b) || BAD.test(plain(c.f + ' ' + c.b))) fail('deck-' + dk.id, `carte vide ou cassée : ${c.id}`); }); }

// 4) Épreuves et programme
for (const s of B.SUBS) {
  for (let r = 0; r < 20; r++) {
    checks++;
    let qs;
    try { qs = examQuestions(s.id); } catch (e) { fail('exam-' + s.id, 'exception ' + e.message); continue; }
    if (qs.length !== 15) fail('exam-' + s.id, `${qs.length} questions au lieu de 15`);
    qs.forEach((q, k) => { if (!q || q.choices.length !== 5) fail('exam-' + s.id, `question ${k} invalide`); });
  }
}
checks++;
const plan = dailyPlan();
if (!plan.length) fail('plan', 'programme vide');

// Rapport
console.log(`${checks} vérifications, ${fails} échecs.`);
for (const [k, v] of Object.entries(failMsgs)) { console.log(`\n✘ ${k} (${v.length})`); v.slice(0, 4).forEach((m) => console.log('   ' + m)); }
console.log('\nRépartition des bonnes réponses (A B C D E) par sous-test :');
for (const [k, v] of Object.entries(answerPos)) { const t = v.reduce((a, b) => a + b, 0); console.log(`  ${k.padEnd(8)} ${v.map((x) => Math.round(100 * x / t).toString().padStart(3) + '%').join(' ')}`); }
const mm = Object.entries(mismatch).filter(([, v]) => v.length > N * 0.05);
if (mm.length) { console.log('\nIncohérences « Réponse : » à vérifier :'); mm.forEach(([k, v]) => { console.log(`  ${k} (${v.length})`); v.slice(0, 2).forEach((x) => console.log('     ' + x)); }); }
console.log(`\nExercices guidés : ${Object.keys(TM.guides || {}).length} · fiches : ${(TM.decks || []).reduce((a, d) => a + d.cards.length, 0)}`);
console.log(`Générateurs : ${Object.keys(TM.gens).length} · séries de calcul mental : ${Object.keys(TM.drills).length} · questions rédigées : ${Object.values(TM.banks).reduce((a, l) => a + l.length, 0)} · chapitres : ${Object.keys(TM.chapters).length}`);
process.exit(fails ? 1 : 0);
