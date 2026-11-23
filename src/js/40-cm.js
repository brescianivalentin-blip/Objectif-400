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
  const v = cmPick(R, ['C', 'C2', 'E', 'D', 'A']);
  const Q = 'Quelle est la moyenne de cette classe au dernier devoir ?';
  if (v === 'C') return cmQ(Q, `La somme de toutes les notes vaut ${n * avg}.`, `La classe compte ${n} élèves.`, 'C', `${KO} (combien d'élèves ?).`, `${KO}.`, `${n * avg} ${DV} ${n} = ${avg} : ça ${OK}.`);
  if (v === 'C2') return cmQ(Q, 'Les filles ont 14 de moyenne et les garçons 11.', 'Il y a deux fois plus de filles que de garçons.', 'C', `${KO} (tout dépend des effectifs).`, `${KO}.`, `sur 3 élèves, 2 filles et 1 garçon : (2 × 14 + 11) ÷ 3 = 13. Pas besoin des effectifs exacts : ça ${OK}.`, '<b>Astuce :</b> une proportion suffit pour une moyenne pondérée.');
  if (v === 'E') return cmQ(Q, 'Les filles ont 14 de moyenne et les garçons 11.', `La classe compte ${n} élèves.`, 'E', `${KO}.`, `${KO}.`, `on ne sait pas combien il y a de filles : ${KO}.`);
  if (v === 'D') return cmQ(Q, `Les ${n} élèves ont totalisé ${n * avg} points.`, `Si un élève supplémentaire avait eu ${avg}, la moyenne n'aurait pas changé.`, 'D', `${n * avg} ${DV} ${n} = ${avg} : ${OK}.`, `ajouter une note égale à la moyenne ne la change pas, et c'est le seul cas : la moyenne vaut ${avg}, ${OK}.`);
  return cmQ(Q, `Les ${n} élèves ont totalisé ${n * avg} points.`, `La moitié des élèves a eu plus de ${avg}.`, 'A', `${OK}.`, `${KO}.`);
});
gen('cm.age', { sub: 'cm', ch: 'cm-methode', name: 'Âges', target: 70, diffs: [1, 2] }, (R) => {
  const p = R.int(20, 40), m = p - R.int(2, 8);
  const v = cmPick(R, ['A', 'C', 'E', 'B']);
  const Q = 'Quel âge a Paul ?';
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
  const v = cmPick(R, d === 1 ? ['C', 'D'] : ['C', 'A', 'E', 'D']);
  const Q = 'Quelle est la distance entre les villes A et B ?';
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
  const v = cmPick(R, ['C', 'C2', 'E', 'A']);
  const Q = 'Combien d\'élèves compte cette classe ?';
  if (v === 'C') return cmQ(Q, `Il y a ${f} filles.`, `Les filles représentent ${pc(pf)} de la classe.`, 'C', `${KO}.`, `${KO}.`, `${f} ${DV} ${fmt(pf / 100)} = ${T} : ça ${OK}.`);
  if (v === 'C2' && g !== f) { const dlt = Math.abs(g - f); return cmQ(Q, `Il y a ${dlt} ${g > f ? 'garçons de plus que de filles' : 'filles de plus que de garçons'}.`, `Les garçons représentent ${pc(100 - pf)} de la classe.`, 'C', `${KO}.`, `${KO}.`, `l'écart de ${dlt} élèves représente ${pc(Math.abs(100 - 2 * pf))} de la classe → ${dlt} ${DV} ${fmt(Math.abs(100 - 2 * pf) / 100)} = ${T} : ça ${OK}.`); }
  if (v === 'E') return cmQ(Q, `Les filles représentent ${pc(pf)} de la classe.`, `Les garçons représentent ${pc(100 - pf)} de la classe.`, 'E', `${KO}.`, `c'est la même information : ${KO}.`, `aucun nombre d'élèves : ${KO}.`);
  const k = R.int(2, 6);
  return cmQ(Q, `Si ${k} élèves partaient, il en resterait ${T - k}.`, 'Il y a plus de filles que de garçons.', 'A', `${T - k} + ${k} = ${T} : ${OK}.`, `${KO}.`);
});
gen('cm.tri', { sub: 'cm', ch: 'cm-methode', name: 'Triangles', target: 75, diffs: [2, 3] }, (R) => {
  const v = cmPick(R, ['C', 'A', 'D', 'E']);
  const Q = 'Le triangle ABC est-il rectangle ?';
  const [a, b, c] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
  if (v === 'C') return cmQ(Q, `AB = ${a} cm et BC = ${b} cm.`, `AC = ${c} cm.`, 'C', `le 3e côté est inconnu : ${KO}.`, `${KO}.`, `${a}² + ${b}² = ${a * a + b * b} = ${c}² : rectangle en B (réciproque de Pythagore), ça ${OK}.`);
  if (v === 'A') return cmQ(Q, 'Les angles  et B̂ mesurent 35° et 55°.', `AB = ${c} cm.`, 'A', `Ĉ = 180 ${MINUS} 35 ${MINUS} 55 = 90° : ${OK}.`, `${KO}.`);
  if (v === 'D') return cmQ(Q, ' + B̂ = 90°', 'AB² = AC² + BC²', 'D', `Ĉ = 180 ${MINUS} 90 = 90° : ${OK}.`, `réciproque de Pythagore : rectangle en C, ${OK}.`);
  return cmQ(Q, `AB = ${a} cm.`, `BC = ${b} cm.`, 'E', `${KO}.`, `${KO}.`, `sans le 3e côté ni aucun angle : ${KO}.`);
});
gen('cm.travail', { sub: 'cm', ch: 'cm-methode', name: 'Travail en commun', target: 75, diffs: [2, 3] }, (R) => {
  const [a, b, t] = R.pick([[6, 12, 4], [3, 6, 2], [10, 15, 6], [4, 12, 3], [12, 24, 8]]);
  const v = cmPick(R, ['C', 'E', 'A']);
  const Q = 'Combien de temps faudrait-il à Anna, seule, pour faire ce travail ?';
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
  const v = cmPick(R, ['C', 'E', 'C2']);
  const Q = 'Combien d\'élèves de cette classe pratiquent à la fois le foot et le tennis ?';
  if (v === 'C') return cmQ(Q, `${N - none} élèves pratiquent au moins l'un des deux sports.`, `${F0} élèves font du foot et ${T0} du tennis.`, 'C', `${KO}.`, `${KO}.`, `${F0} + ${T0} ${MINUS} ${N - none} = ${both} : ça ${OK}.`);
  if (v === 'E') return cmQ(Q, `${F0} élèves font du foot et ${T0} du tennis.`, `La classe compte ${N} élèves.`, 'E', `${KO}.`, `${KO}.`, `il manque le nombre d'élèves qui ne font aucun des deux : ${KO}.`);
  return cmQ(Q, `La classe compte ${N} élèves, dont ${F0} font du foot et ${T0} du tennis.`, `${none} élèves ne pratiquent aucun de ces deux sports.`, 'C', `${KO}.`, `${KO}.`, `au moins un sport : ${N} ${MINUS} ${none} = ${N - none}, donc les deux : ${F0} + ${T0} ${MINUS} ${N - none} = ${both}. Ça ${OK}.`);
});
gen('cm.ent', { sub: 'cm', ch: 'cm-methode', name: 'Trouver un entier', target: 65 }, (R) => {
  const v = cmPick(R, ['C', 'A', 'E', 'B']);
  const Q = 'Quelle est la valeur de l\'entier n ?';
  if (v === 'C') return cmQ(Q, 'n est un multiple de 7 compris entre 20 et 40.', 'n est pair.', 'C', `21, 28 ou 35 : ${KO}.`, `${KO}.`, `seul 28 est pair : ça ${OK}.`);
  if (v === 'A') return cmQ(Q, 'n est un nombre premier compris entre 24 et 30.', 'n est impair.', 'A', `seul 29 convient : ${OK}.`, `${KO}.`);
  if (v === 'E') return cmQ(Q, 'n est un multiple de 5 compris entre 10 et 40.', 'n est impair.', 'E', `${KO}.`, `${KO}.`, `15, 25 ou 35 : ${KO}.`);
  return cmQ(Q, 'n est impair.', 'n est le carré d\'un entier et 40 &lt; n &lt; 60.', 'B', `${KO}.`, `seul 49 = 7² convient : ${OK}.`);
});
