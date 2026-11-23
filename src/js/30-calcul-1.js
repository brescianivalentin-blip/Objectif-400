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
