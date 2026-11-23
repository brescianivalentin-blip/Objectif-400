/* ===== CALCUL (3/3) : travail & mélanges, arithmétique, probabilités, géométrie, suites ===== */

/* ---------------- Chapitre 10 : Travail en commun, mélanges ---------------- */
chapter({
  id: 'trav', sub: 'calcul', order: 10, title: 'Travail en commun & mélanges', short: 'Travail & mélanges',
  lesson: `
<h3><span class="hl">1. Travailler ensemble (robinets, ouvriers, imprimantes)</span></h3>
<p>On raisonne en <b>part du travail faite en 1 heure</b>. Un robinet qui remplit une cuve en 3 h en remplit ${F(1, 3)} par heure.</p>
<div class="ex"><b>Exemple</b><span>Robinet A : 3 h. Robinet B : 6 h. Ensemble : ${F(1, 3)} + ${F(1, 6)} = ${F(2, 6)} + ${F(1, 6)} = ${F(3, 6)} = ${F(1, 2)} cuve par heure → <b>2 h</b>.</span></div>
<div class="formula">Pour deux : t = ${F('a × b', 'a + b')} &nbsp;&nbsp; ex : ${F('3 × 6', '3 + 6')} = ${F(18, 9)} = 2 h</div>
<div class="trap"><b>Piège :</b> faire la moyenne (4,5 h) ou la somme (9 h). Ensemble, on va TOUJOURS plus vite que le plus rapide seul.</div>
<p><b>Une fuite</b> qui vide la cuve en 12 h ? On soustrait : ${F(1, 3)} − ${F(1, 12)} = ${F(3, 12)} = ${F(1, 4)} → 4 h.</p>
<h3><span class="hl">2. Mélanges et concentrations</span></h3>
<div class="formula">quantité de produit pur = volume × concentration</div>
<div class="ex"><b>Mélanger deux solutions</b><span>2 L à 30 % + 3 L à 10 % : produit pur 0,6 + 0,3 = 0,9 L dans 5 L → 0,9 ÷ 5 = <b>18 %</b>.</span></div>
<div class="ex"><b>Diluer</b><span>10 L de sirop à 20 % contiennent 2 L de sirop pur. Pour descendre à 8 %, il faut 2 ÷ 0,08 = 25 L au total, donc ajouter <b>15 L d'eau</b>.</span></div>
<h3><span class="hl">3. Prix moyen d'un mélange</h3>
<p>1 kg de café à 12 € + 2 kg à 18 € : (12 + 36) ÷ 3 = <b>16 €/kg</b>. C'est une moyenne pondérée par les quantités.</p>
<div class="tip"><b>Règle de la balance :</b> pour obtenir 15 €/kg avec des cafés à 12 € et 20 €, on mélange dans le rapport des écarts inversés : (20 − 15) : (15 − 12) = 5 : 3.</div>`,
});

gen('trav.rob', { sub: 'calcul', ch: 'trav', name: 'Travail en commun, robinets', target: 70 }, (R, d) => {
  let q, mins, ex, wrong;
  if (d === 1) {
    const [a, b] = R.shuffle(R.pick([[3, 6], [2, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [4, 4], [2, 3], [6, 3], [5, 20]]));
    const t = a * b / (a + b); mins = Math.round(t * 60);
    wrong = [Math.round((a + b) / 2 * 60), (a + b) * 60, Math.abs(a - b) * 60 || 90, mins + 30];
    q = `Un robinet remplit une cuve en ${plural(a, 'heure')}, un autre en ${plural(b, 'heure')}. En combien de temps la remplissent-ils ensemble ?`;
    ex = steps(`Par heure : ${F(1, a)} + ${F(1, b)} = ${frRaw(a + b, a * b)} de la cuve.`, `Temps : ${F(a * b, a + b)} h = ${Number.isInteger(t) ? hm(t) : fmt(round(t, 3)) + ' h = ' + hm(t)}.`);
  } else if (d === 2) {
    const [a, b] = R.pick([[3, 12], [4, 12], [2, 6], [6, 10], [4, 6], [3, 6], [2, 3], [5, 30]]);
    const t = a * b / (b - a); mins = Math.round(t * 60);
    wrong = [Math.round(a * b / (a + b) * 60), (b - a) * 60, (a + b) * 60, mins - 60];
    q = `Un robinet remplit une cuve en ${plural(a, 'heure')}, mais une fuite la viderait en ${plural(b, 'heure')}. En combien de temps la cuve se remplit-elle ?`;
    ex = steps(`Par heure : on remplit ${F(1, a)} et on perd ${F(1, b)}.`, `${F(1, a)} ${MINUS} ${F(1, b)} = ${frRaw(b - a, a * b)} de la cuve par heure.`, `Temps : ${F(a * b, b - a)} = ${hm(t)}.`);
  } else {
    const [a, c] = R.pick([[6, 4], [3, 2], [10, 6], [12, 8], [15, 10], [20, 12], [4, 3]]);
    const b = a * c / (a - c); mins = Math.round(b * 60);
    wrong = [(a - c) * 60, (a + c) * 60, Math.round(a * c / (a + c) * 60), mins + 120];
    q = `Ensemble, Alice et Bruno repeignent une salle en ${plural(c, 'heure')}. Seule, Alice mettrait ${plural(a, 'heure')}. Combien de temps mettrait Bruno seul ?`;
    ex = steps(`Ensemble : ${F(1, c)} de la salle par heure. Alice seule : ${F(1, a)}.`, `Bruno : ${F(1, c)} ${MINUS} ${F(1, a)} = ${frRaw(a - c, a * c)} = ${new Fr(a - c, a * c).html()} par heure.`, `Il met donc ${fmt(b)} h.`);
  }
  const m = mcq(R, mins, wrong, { render: (v) => hm(v / 60), valid: (v) => v > 0 });
  return { q: P(q), ...m, expl: ex + res(hm(mins / 60)), trap: d === 1 ? '<b>Piège :</b> à deux, on va forcément plus vite que le plus rapide des deux.' : '' };
});
gen('trav.mel', { sub: 'calcul', ch: 'trav', name: 'Mélanges et concentrations', target: 75 }, (R, d) => {
  if (d === 1) {
    let v1, c1, v2, c2, c; do { v1 = R.int(1, 6); v2 = R.int(1, 6); c1 = R.pick([10, 20, 30, 40, 50, 60]); c2 = R.pick([5, 10, 15, 20, 25]); c = (v1 * c1 + v2 * c2) / (v1 + v2); } while (c1 === c2 || !Number.isInteger(c));
    const m = mcq(R, c, [(c1 + c2) / 2, c1 + c2, c + 5, c - 3].map((x) => round(x, 2)), { render: pc });
    return { q: P(`On mélange ${unit(v1, 'L')} de jus à ${pc(c1)} de sucre et ${unit(v2, 'L')} de jus à ${pc(c2)} de sucre. Quelle est la concentration en sucre du mélange ?`), ...m, expl: steps(`Sucre pur : ${v1} ${X} ${fmt(c1 / 100)} + ${v2} ${X} ${fmt(c2 / 100)} = ${fmt(round((v1 * c1 + v2 * c2) / 100, 3))} L.`, `Volume total : ${v1 + v2} L.`, `Concentration : ${fmt(round((v1 * c1 + v2 * c2) / 100, 3))} ${DV} ${v1 + v2} = ${fmt(c / 100)}, soit ${pc(c)}.`) + res(pc(c)), trap: `<b>Piège :</b> faire la moyenne des concentrations (${pc((c1 + c2) / 2)}) sans tenir compte des volumes.` };
  }
  if (d === 2) {
    const [V, c, c2] = R.pick([[10, 20, 8], [12, 25, 10], [6, 30, 20], [8, 15, 10], [20, 12, 8], [5, 40, 25], [9, 20, 12]]);
    const add = round(V * c / c2 - V, 3);
    const m = mcq(R, add, [V * (c - c2) / 100, V * c / c2, round(V * c2 / c, 3), add + 2].map((x) => round(x, 3)), { render: (x) => unit(x, 'L') });
    return { q: P(`On a ${unit(V, 'L')} de sirop à ${pc(c)}. Combien de litres d'eau faut-il ajouter pour obtenir un sirop à ${pc(c2)} ?`), ...m, expl: steps(`Sirop pur : ${V} ${X} ${fmt(c / 100)} = ${fmt(V * c / 100)} L. Ajouter de l'eau ne change pas cette quantité.`, `Volume total nécessaire : ${fmt(V * c / 100)} ${DV} ${fmt(c2 / 100)} = ${fmt(round(V * c / c2, 3))} L.`, `Eau à ajouter : ${fmt(round(V * c / c2, 3))} ${MINUS} ${V} = ${unit(add, 'L')}.`) + res(unit(add, 'L')) };
  }
  const [V, c2, c1, c3] = R.pick([[10, 10, 40, 20], [6, 20, 50, 30], [12, 5, 25, 15], [9, 10, 30, 15], [9, 20, 60, 30], [4, 10, 40, 25]]);
  const x = V * (c3 - c2) / (c1 - c3);
  const m = mcq(R, x, [V, V * (c3 - c2) / c1, x * 2, x + 3].map((v) => round(v, 3)), { render: (v) => unit(v, 'L') });
  return { q: P(`Combien de litres d'une solution à ${pc(c1)} faut-il ajouter à ${unit(V, 'L')} d'une solution à ${pc(c2)} pour obtenir une solution à ${pc(c3)} ?`), ...m, expl: steps(`Soit x le volume ajouté : ${fmt(c1 / 100)}x + ${fmt(V * c2 / 100)} = ${fmt(c3 / 100)}(x + ${V}).`, `${fmt(round((c1 - c3) / 100, 3))}x = ${fmt(round(V * (c3 - c2) / 100, 3))}.`, `x = ${unit(round(x, 3), 'L')}.`) + res(unit(round(x, 3), 'L')), tip: '<b>Règle de la balance :</b> les volumes sont dans le rapport inverse des écarts à la concentration visée.' };
});
gen('trav.prix', { sub: 'calcul', ch: 'trav', name: 'Prix moyen d\'un mélange', target: 65 }, (R, d) => {
  if (d === 1) {
    let q1, p1, q2, p2, pm; do { q1 = R.int(1, 5); q2 = R.int(1, 5); p1 = R.int(8, 20); p2 = R.int(8, 24); pm = (q1 * p1 + q2 * p2) / (q1 + q2); } while (p1 === p2 || !Number.isInteger(pm));
    const m = mcq(R, pm, [(p1 + p2) / 2, pm + 1, pm - 1, (q1 * p1 + q2 * p2) / 2].map((x) => round(x, 2)), { render: (x) => eur(x) + '/kg' });
    return { q: P(`Un torréfacteur mélange ${q1} kg de café à ${eur(p1)}/kg et ${q2} kg de café à ${eur(p2)}/kg. Quel est le prix au kilo du mélange ?`), ...m, expl: steps(`Coût total : ${q1} ${X} ${p1} + ${q2} ${X} ${p2} = ${q1 * p1 + q2 * p2} €.`, `Pour ${q1 + q2} kg : ${q1 * p1 + q2 * p2} ${DV} ${q1 + q2} = ${eur(pm)}/kg.`) + res(eur(pm) + '/kg') };
  }
  const [a, b, t] = R.pick([[12, 20, 15], [10, 18, 12], [8, 16, 14], [15, 25, 18], [6, 14, 9], [20, 30, 24]]);
  const ra = b - t, rb = t - a, g = gcd(ra, rb);
  const qa = R.pick([10, 15, 20, 30, 40]) * (ra / g) / (ra / g) * (ra / g);
  const qb = qa * rb / ra;
  const m = mcq(R, qb, [qa * ra / rb, qa, qa / 2, qb + 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'kg') });
  return { q: P(`On veut obtenir un café à ${eur(t)}/kg en mélangeant un café à ${eur(a)}/kg et un café à ${eur(b)}/kg. Pour ${unit(qa, 'kg')} du premier, combien faut-il du second ?`), ...m, expl: steps(`Règle de la balance : le rapport des quantités est l'inverse du rapport des écarts au prix visé.`, `Écarts : ${t} ${MINUS} ${a} = ${rb} et ${b} ${MINUS} ${t} = ${ra}. Quantités dans le rapport ${ra} : ${rb}.`, `Pour ${fmt(qa)} kg du premier : ${fmt(qa)} ${X} ${rb} ${DV} ${ra} = ${unit(qb, 'kg')}.`, `Vérification : (${fmt(qa)} ${X} ${a} + ${fmt(qb)} ${X} ${b}) ${DV} ${fmt(qa + qb)} = ${fmt(round((qa * a + qb * b) / (qa + qb), 2))} €/kg ✔.`) + res(unit(qb, 'kg')) };
});

/* ---------------- Chapitre 11 : Arithmétique ---------------- */
chapter({
  id: 'arith', sub: 'calcul', order: 11, title: 'Arithmétique : divisibilité, PGCD, cycles', short: 'Arithmétique',
  lesson: `
<h3><span class="hl">1. Critères de divisibilité</span></h3>
<div class="tablewrap"><table>
<tr><th>Par</th><th>Si…</th><th>Exemple</th></tr>
<tr><td>2</td><td>le nombre est pair</td><td>358</td></tr>
<tr><td>3</td><td>la somme des chiffres est divisible par 3</td><td>471 → 4+7+1 = 12</td></tr>
<tr><td>4</td><td>les deux derniers chiffres forment un multiple de 4</td><td>1 316 → 16</td></tr>
<tr><td>5</td><td>il finit par 0 ou 5</td><td>2 375</td></tr>
<tr><td>6</td><td>divisible par 2 ET par 3</td><td>942</td></tr>
<tr><td>9</td><td>la somme des chiffres est divisible par 9</td><td>3 978 → 27</td></tr>
<tr><td>11</td><td>(somme des chiffres de rang impair) − (somme de rang pair) est divisible par 11</td><td>2 728 → (2+2) − (7+8) = −11</td></tr>
<tr><td>25</td><td>il finit par 00, 25, 50 ou 75</td><td>1 175</td></tr>
</table></div>
<h3><span class="hl">2. Nombres premiers</span></h3>
<p>Divisibles seulement par 1 et eux-mêmes : 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97.</p>
<div class="trap"><b>Faux premiers à connaître :</b> 51 = 3 × 17 ; 57 = 3 × 19 ; 91 = 7 × 13 ; 87 = 3 × 29 ; 119 = 7 × 17 ; 143 = 11 × 13.</div>
<p>Pour tester un nombre, il suffit d'essayer les premiers jusqu'à sa racine carrée.</p>
<h3><span class="hl">3. PGCD et PPCM : lequel utiliser ?</span></h3>
<ul><li><b>PPCM</b> (plus petit multiple commun) : quand des choses se <b>répètent</b> et qu'on cherche quand elles <b>coïncident</b>. Bus toutes les 12 et 18 min → ensemble toutes les 36 min.</li><li><b>PGCD</b> (plus grand diviseur commun) : quand on <b>partage</b> en paquets identiques le plus grands possible. 84 roses et 60 tulipes → 12 bouquets au maximum.</li></ul>
<div class="formula">PGCD × PPCM = a × b &nbsp;&nbsp; ex : 12 et 18 → PGCD 6, PPCM 36, et 6 × 36 = 12 × 18</div>
<h3><span class="hl">4. Cycles et restes</span></h3>
<p><b>Jours de la semaine</b> : dans 100 jours, 100 = 14 × 7 + 2, donc même jour + 2.</p>
<p><b>Chiffre des unités des puissances</b> : il revient en boucle.</p>
<div class="tablewrap"><table><tr><th>2</th><td>2, 4, 8, 6</td></tr><tr><th>3</th><td>3, 9, 7, 1</td></tr><tr><th>7</th><td>7, 9, 3, 1</td></tr><tr><th>8</th><td>8, 4, 2, 6</td></tr><tr><th>4 et 9</th><td>4, 6 · 9, 1</td></tr><tr><th>0, 1, 5, 6</th><td>toujours le même</td></tr></table></div>
<p>Unités de 7<sup>2026</sup> : cycle de 4, 2026 = 4 × 506 + 2 → 2e terme du cycle → <b>9</b>.</p>
<h3><span class="hl">5. Parité et entiers consécutifs</span></h3>
<p>pair + pair = pair ; impair + impair = pair ; pair + impair = impair ; un produit est impair seulement si tous les facteurs sont impairs.</p>
<p>La somme de 5 entiers consécutifs vaut 5 fois celui du milieu : 135 ÷ 5 = 27 → 25, 26, 27, 28, 29.</p>
<p><b>Nombre de diviseurs</b> : 72 = 2³ × 3² → (3 + 1) × (2 + 1) = 12 diviseurs.</p>`,
});

const DIV_RULES = { 3: 'somme des chiffres divisible par 3', 4: 'deux derniers chiffres multiples de 4', 6: 'pair ET somme des chiffres divisible par 3', 9: 'somme des chiffres divisible par 9', 11: 'différence des sommes alternées divisible par 11', 12: 'divisible par 3 ET par 4', 15: 'divisible par 3 ET par 5', 25: 'finit par 00, 25, 50 ou 75' };
gen('ar.div', { sub: 'calcul', ch: 'arith', name: 'Critères de divisibilité', target: 45 }, (R, d) => {
  const N = R.pick(d === 1 ? [3, 4, 9, 25] : d === 2 ? [6, 9, 4, 15] : [11, 12, 6, 15]);
  const lo = d === 1 ? 100 : 1000, hi = d === 1 ? 999 : 9999;
  let good; do { good = R.int(lo, hi); } while (good % N !== 0);
  const bad = []; let g = 0;
  while (bad.length < 4 && g++ < 500) { const x = good + R.sign() * R.int(1, Math.max(12, N * 3)); if (x >= lo && x <= hi && x % N !== 0 && !bad.includes(x)) bad.push(x); }
  const sumd = (x) => String(x).split('').reduce((a, c) => a + +c, 0);
  const all = R.shuffle([good, ...bad]);
  let detail;
  if (N === 3 || N === 9) detail = all.map((x) => `${fmt(x)} → ${sumd(x)}`).join(' ; ');
  else if (N === 4) detail = all.map((x) => `${fmt(x)} → ${String(x).slice(-2)}`).join(' ; ');
  else if (N === 25) detail = all.map((x) => `${fmt(x)} finit par ${String(x).slice(-2)}`).join(' ; ');
  else detail = all.map((x) => `${fmt(x)} ${x % N === 0 ? '✔' : '✘'}`).join(' ; ');
  return { q: P(`Lequel de ces nombres est divisible par <b>${N}</b> ?`), choices: all.map((x) => fmt(x)), answer: all.indexOf(good), expl: steps(`Critère : ${DIV_RULES[N]}.`, `Vérification : ${detail}.`, `Seul ${fmt(good)} convient (${fmt(good)} = ${N} ${X} ${fmt(good / N)}).`) + res(fmt(good)) };
});
gen('ar.prem', { sub: 'calcul', ch: 'arith', name: 'Nombres premiers', target: 45 }, (R, d) => {
  const fakes = [[51, '3 × 17'], [57, '3 × 19'], [91, '7 × 13'], [87, '3 × 29'], [119, '7 × 17'], [133, '7 × 19'], [143, '11 × 13'], [161, '7 × 23'], [187, '11 × 17'], [209, '11 × 19'], [221, '13 × 17'], [69, '3 × 23'], [77, '7 × 11'], [93, '3 × 31'], [111, '3 × 37'], [117, '9 × 13'], [123, '3 × 41'], [129, '3 × 43'], [169, '13 × 13'], [203, '7 × 29']];
  const primes = (d === 1 ? [53, 59, 61, 67, 71, 73, 79, 83, 89, 97] : [101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199]);
  const pool = d === 1 ? fakes.filter((f) => f[0] < 100) : fakes;
  const wantPrime = R.chance(0.6);
  let items, correct;
  if (wantPrime) { const p = R.pick(primes); const f = R.sample(pool, 4); items = R.shuffle([[p, 'premier'], ...f]); correct = p; }
  else { const f = R.pick(pool); const ps = R.sample(primes, 4).map((p) => [p, 'premier']); items = R.shuffle([f, ...ps]); correct = f[0]; }
  const detail = items.map(([n, w]) => `${n} = ${w === 'premier' ? 'premier' : w}`).join(' ; ');
  return { q: P(wantPrime ? 'Lequel de ces nombres est <b>premier</b> ?' : 'Lequel de ces nombres <b>n\'est pas</b> premier ?'), choices: items.map((x) => fmt(x[0])), answer: items.findIndex((x) => x[0] === correct), expl: steps(`On teste la divisibilité par 3, 7, 11, 13… (jusqu'à la racine carrée).`, detail + '.') + res(fmt(correct)), trap: '<b>Piège :</b> 51, 57, 87, 91, 119, 133, 143 ressemblent à des nombres premiers mais n\'en sont pas.' };
});
gen('ar.pp', { sub: 'calcul', ch: 'arith', name: 'PGCD et PPCM en situation', target: 60 }, (R, d) => {
  if (d === 1) {
    const [a, b] = R.pick([[12, 18], [8, 12], [10, 15], [6, 8], [9, 12], [15, 20], [14, 21], [16, 24], [20, 30], [12, 16]]);
    const val = lcm(a, b);
    const m = mcq(R, val, [a * b, gcd(a, b), a + b, val + a, Math.max(a, b) * 2 === val ? val + b : Math.max(a, b) * 2], { valid: Number.isInteger });
    return { q: P(`Deux bus partent ensemble du terminus à 8 h. L'un repart toutes les ${a} minutes, l'autre toutes les ${b} minutes. Dans combien de minutes repartiront-ils de nouveau ensemble ?`), ...m, expl: steps(`On cherche le premier multiple commun de ${a} et ${b} : c'est le PPCM.`, `Multiples de ${Math.max(a, b)} : ${[1, 2, 3, 4, 5].map((k) => k * Math.max(a, b)).join(', ')}… Le premier divisible par ${Math.min(a, b)} est ${val}.`) + res(plural(val, 'minute')), trap: `<b>Piège :</b> ${a} ${X} ${b} = ${a * b} est un multiple commun, mais pas le plus petit.` };
  }
  if (d === 2) {
    const g = R.pick([6, 8, 9, 12, 14, 15, 18]), x = R.int(2, 9), y = R.intNot(2, 9, [x]);
    if (gcd(x, y) !== 1) return TM.gens['ar.pp'].make(R, 2);
    const A = g * x, B = g * y;
    const m = mcq(R, g, [lcm(A, B), Math.min(A, B), g / 2, g * 2, x + y], { valid: Number.isInteger });
    return { q: P(`Un fleuriste a ${A} roses et ${B} tulipes. Il veut faire le plus grand nombre possible de bouquets identiques en utilisant toutes les fleurs. Combien de bouquets fera-t-il ?`), ...m, expl: steps(`Le nombre de bouquets doit diviser ${A} et ${B} : on cherche le PGCD.`, `${A} = ${g} ${X} ${x} et ${B} = ${g} ${X} ${y}, avec ${x} et ${y} sans diviseur commun.`, `PGCD = ${g} : ${g} bouquets de ${x} roses et ${y} tulipes.`) + res(plural(g, 'bouquet')) };
  }
  const g = R.pick([15, 20, 25, 30, 40, 45, 60]), x = R.int(2, 9), y = R.intNot(2, 9, [x]);
  if (gcd(x, y) !== 1) return TM.gens['ar.pp'].make(R, 3);
  const L = g * x, l = g * y, n = x * y;
  const m = mcq(R, n, [L * l / 100, x + y, n * 2, (x + 1) * (y + 1)], { valid: Number.isInteger });
  return { q: P(`On veut carreler une pièce rectangulaire de ${fmt(L)} cm sur ${fmt(l)} cm avec des carreaux carrés identiques, les plus grands possibles, sans découpe. Combien de carreaux faut-il ?`), ...m, expl: steps(`Le côté du carreau doit diviser ${L} et ${l} : le plus grand possible est le PGCD = ${g} cm.`, `${L} ${DV} ${g} = ${x} carreaux en longueur, ${l} ${DV} ${g} = ${y} en largeur.`, `Total : ${x} ${X} ${y} = ${n} carreaux.`) + res(fmt(n)) };
});
gen('ar.cycle', { sub: 'calcul', ch: 'arith', name: 'Cycles : jours et chiffres des unités', target: 55 }, (R, d) => {
  if (d === 1) {
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const s = R.int(0, 6), n = R.int(15, 400), e = (s + n) % 7;
    const opts = R.shuffle([e, (e + 1) % 7, (e + 6) % 7, (e + 2) % 7, (e + 3) % 7]);
    return { q: P(`Nous sommes un ${days[s]}. Quel jour serons-nous dans ${n} jours ?`), choices: opts.map((x) => days[x]), answer: opts.indexOf(e), expl: steps(`Une semaine = 7 jours : seul le reste de ${n} ${DV} 7 compte.`, `${n} = 7 ${X} ${Math.floor(n / 7)} + ${n % 7}.`, `${days[s]} + ${n % 7} jour${n % 7 > 1 ? 's' : ''} = ${days[e]}.`) + res(days[e]) };
  }
  const cyc = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 4: [4, 6], 9: [9, 1] };
  const b = R.pick(d === 2 ? [2, 3, 7] : [7, 8, 4, 9, 3]), cy = cyc[b], n = R.int(20, 2030);
  const idx = (n - 1) % cy.length, val = cy[idx];
  const others = [...new Set(cy.filter((x) => x !== val).concat(R.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== val))))].slice(0, 4);
  const opts = R.shuffle([val, ...others]);
  const base = d === 3 ? b + 10 * R.int(1, 9) : b;
  return { q: P(`Quel est le chiffre des unités de ${big(PW(base, n))} ?`), choices: opts.map(String), answer: opts.indexOf(val), expl: steps(d === 3 ? `Seul le chiffre des unités de ${base} compte : ${b}.` : '', `Les unités des puissances de ${b} forment un cycle : ${cy.join(', ')} (longueur ${cy.length}).`, `${n} = ${cy.length} ${X} ${Math.floor(n / cy.length)} + ${n % cy.length} → on prend le ${n % cy.length === 0 ? cy.length : n % cy.length}e terme du cycle.`, `Le chiffre des unités est ${val}.`) + res(String(val)) };
});
gen('ar.consec', { sub: 'calcul', ch: 'arith', name: 'Entiers consécutifs et parité', target: 55 }, (R, d) => {
  if (d < 3) {
    const k = d === 1 ? R.pick([3, 5]) : R.pick([4, 5, 6, 7]), even = d === 2 && R.chance(0.5), step = even ? 2 : 1;
    const first = even ? 2 * R.int(3, 40) : R.int(5, 90), list = Array.from({ length: k }, (_, i) => first + i * step), S = list.reduce((a, b) => a + b, 0);
    const askMax = R.chance(0.5), val = askMax ? list[k - 1] : list[0];
    const m = mcq(R, val, [askMax ? list[0] : list[k - 1], Math.round(S / k), val + step, val - step, S / k + k], { valid: Number.isInteger });
    return { q: P(`La somme de ${k} entiers ${even ? 'pairs ' : ''}consécutifs vaut ${S}. Quel est le ${askMax ? 'plus grand' : 'plus petit'} ?`), ...m, expl: steps(`La moyenne de nombres régulièrement espacés est le nombre du milieu : ${S} ${DV} ${k} = ${fmt(S / k)}.`, `Les nombres sont donc ${list.join(', ')}.`) + res(fmt(val)) };
  }
  const items = R.pick([
    { q: 'Si a est impair et b est pair, lequel de ces nombres est forcément impair ?', c: 'a + b', w: ['a × b', '2a + b', 'b²', 'a + 3'], e: 'impair + pair = impair. Les autres sont pairs (a × b contient le facteur pair b ; 2a + b et b² sont pairs ; a + 3 = impair + impair = pair).' },
    { q: 'Si n est un entier, lequel de ces nombres est toujours pair ?', c: 'n(n + 1)', w: ['n + 1', '2n + 1', 'n²', '3n'], e: 'n et n + 1 sont consécutifs : l\'un des deux est pair, donc leur produit est pair.' },
    { q: 'Si a et b sont impairs, lequel de ces nombres est impair ?', c: 'a × b', w: ['a + b', 'a − b', 'a² + b²', '2ab'], e: 'impair × impair = impair. Les sommes et différences de deux impairs sont paires.' },
    { q: 'Si n est un entier, lequel de ces nombres est toujours divisible par 3 ?', c: 'n(n + 1)(n + 2)', w: ['n(n + 1)', 'n² + 1', '3n + 1', 'n + 3'], e: 'Parmi trois entiers consécutifs, il y en a toujours un multiple de 3.' },
  ]);
  const m = shuffleChoices(R, [items.c, ...items.w]);
  return { q: P(items.q), ...m, expl: P(items.e) + res(items.c), tip: '<b>Méthode express :</b> teste avec de petits nombres (n = 1, n = 2) pour éliminer.' };
});
gen('ar.ndiv', { sub: 'calcul', ch: 'arith', name: 'Nombre de diviseurs', target: 60, diffs: [2, 3] }, (R, d) => {
  const ps = d === 2 ? [[2, R.int(1, 4)], [3, R.int(1, 2)]] : [[2, R.int(1, 3)], [3, R.int(1, 2)], [5, 1]];
  const N = ps.reduce((a, [p, e]) => a * Math.pow(p, e), 1), val = ps.reduce((a, [, e]) => a * (e + 1), 1);
  const m = mcq(R, val, [ps.reduce((a, [, e]) => a * e, 1), ps.reduce((a, [, e]) => a + e, 0), val + 2, val - 1, ps.reduce((a, [, e]) => a + e + 1, 0)], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Combien le nombre ${big(fmt(N))} a-t-il de diviseurs (1 et lui-même compris) ?`), ...m, expl: steps(`Décomposition : ${fmt(N)} = ${ps.map(([p, e]) => (e > 1 ? PW(p, e) : p)).join(` ${X} `)}.`, `On ajoute 1 à chaque exposant et on multiplie : ${ps.map(([, e]) => `(${e} + 1)`).join(` ${X} `)} = ${val}.`) + res(fmt(val)) };
});

/* ---------------- Chapitre 12 : Dénombrement & probabilités ---------------- */
chapter({
  id: 'proba', sub: 'calcul', order: 12, title: 'Dénombrement & probabilités', short: 'Probabilités',
  lesson: `
<h3><span class="hl">1. Compter : le principe multiplicatif</span></h3>
<p>3 entrées, 4 plats, 2 desserts → 3 × 4 × 2 = <b>24 menus</b>. À chaque étape, on multiplie par le nombre de choix possibles.</p>
<div class="tablewrap"><table>
<tr><th>Situation</th><th>Calcul</th><th>Exemple</th></tr>
<tr><td>Ranger n objets (l'ordre compte, tous)</td><td>n! = n × (n−1) × … × 1</td><td>5 livres : 120</td></tr>
<tr><td>Choisir k parmi n, l'ordre compte</td><td>n × (n−1) × … (k facteurs)</td><td>Podium de 3 parmi 8 : 8 × 7 × 6 = 336</td></tr>
<tr><td>Choisir k parmi n, l'ordre ne compte pas</td><td>${F('n × (n−1) × …', 'k!')}</td><td>2 délégués parmi 10 : ${F('10 × 9', 2)} = 45</td></tr>
<tr><td>Codes avec répétition</td><td>(nombre de symboles)<sup>longueur</sup></td><td>Code à 4 chiffres : 10⁴</td></tr>
</table></div>
<div class="tip"><b>Poignées de main</b> entre n personnes : ${F('n × (n − 1)', 2)}. Entre 12 personnes : 66.</div>
<p><b>Question clé : l'ordre compte-t-il ?</b> Un podium (1er, 2e, 3e) : oui. Une équipe de 3 : non.</p>
<h3><span class="hl">2. Probabilités</span></h3>
<div class="formula">P = ${F('nombre de cas favorables', 'nombre de cas possibles')}</div>
<ul><li><b>Contraire</b> : P(non A) = 1 − P(A).</li><li><b>« Au moins un »</b> : passe TOUJOURS par le contraire. P(au moins un 6 en 2 lancers) = 1 − ${F(5, 6)} × ${F(5, 6)} = 1 − ${F(25, 36)} = ${F(11, 36)}.</li><li><b>Événements successifs</b> : on multiplie. Deux piles de suite : ${F(1, 2)} × ${F(1, 2)} = ${F(1, 4)}.</li></ul>
<div class="ex"><b>Tirage sans remise</b><span>Urne de 5 rouges et 3 bleues, on tire 2 boules sans remise. P(2 rouges) = ${F(5, 8)} × ${F(4, 7)} = ${F(20, 56)} = ${F(5, 14)}.</span><span>Avec remise : ${F(5, 8)} × ${F(5, 8)} = ${F(25, 64)}.</span></div>
<h3><span class="hl">3. Deux dés : 36 cas</span></h3>
<p>Nombre de façons d'obtenir chaque somme : 2 → 1 · 3 → 2 · 4 → 3 · 5 → 4 · 6 → 5 · <b>7 → 6</b> · 8 → 5 · 9 → 4 · 10 → 3 · 11 → 2 · 12 → 1.</p>
<h3><span class="hl">4. Ensembles (diagrammes de Venn)</span></h3>
<div class="formula">nb(A ou B) = nb(A) + nb(B) − nb(A et B)</div>
<p>40 élèves : 25 font de l'anglais, 18 de l'espagnol, 7 les deux. Au moins une langue : 25 + 18 − 7 = 36. Aucune : 40 − 36 = <b>4</b>.</p>
<div class="trap"><b>Piège :</b> oublier de retirer ceux qui sont comptés deux fois.</div>`,
});

gen('pb.simple', { sub: 'calcul', ch: 'proba', name: 'Probabilités simples', target: 50 }, (R, d) => {
  if (R.chance(0.5)) {
    const r = R.int(2, 9), b = R.int(2, 9), v = R.int(1, 7), n = r + b + v;
    const t = d === 1 ? 0 : d === 2 ? 1 : 2;
    const fav = t === 0 ? r : t === 1 ? n - r : r + v;
    const lab = t === 0 ? 'rouge' : t === 1 ? 'qui ne soit pas rouge' : 'rouge ou verte';
    const val = new Fr(fav, n);
    const m = mcq(R, val, [new Fr(fav, n - fav || 1), new Fr(r, b + v), new Fr(1, 3), new Fr(fav + 1, n), new Fr(n - fav, n)].filter((f) => f.n > 0 && f.val() <= 1));
    return { q: P(`Une urne contient ${r} boules rouges, ${b} bleue${b > 1 ? 's' : ''} et ${v} verte${v > 1 ? 's' : ''}. On tire une boule au hasard. Quelle est la probabilité de tirer une boule ${lab} ?`), ...m, expl: steps(`Nombre total de boules : ${r} + ${b} + ${v} = ${n}.`, `Cas favorables : ${fav}.`, `P = ${frRaw(fav, n)}${val.d !== n ? ' = ' + val.html() : ''}.`) + res(val.html()) };
  }
  const cases = [
    { q: 'd\'obtenir un nombre pair avec un dé à 6 faces', f: 3, n: 6, e: '2, 4, 6' },
    { q: 'd\'obtenir au moins 5 avec un dé à 6 faces', f: 2, n: 6, e: '5, 6' },
    { q: 'd\'obtenir un multiple de 3 avec un dé à 6 faces', f: 2, n: 6, e: '3, 6' },
    { q: 'de tirer un roi dans un jeu de 32 cartes', f: 4, n: 32, e: '4 rois' },
    { q: 'de tirer un cœur dans un jeu de 32 cartes', f: 8, n: 32, e: '8 cœurs' },
    { q: 'de tirer une figure (valet, dame ou roi) dans un jeu de 32 cartes', f: 12, n: 32, e: '3 figures × 4 couleurs = 12' },
    { q: 'de tirer une figure (valet, dame ou roi) dans un jeu de 52 cartes', f: 12, n: 52, e: '3 × 4 = 12' },
    { q: 'de tirer un as rouge dans un jeu de 52 cartes', f: 2, n: 52, e: 'as de cœur et as de carreau' },
    { q: 'd\'obtenir un nombre premier avec un dé à 6 faces', f: 3, n: 6, e: '2, 3, 5' },
  ];
  const c = R.pick(cases), val = new Fr(c.f, c.n);
  const m = mcq(R, val, [new Fr(c.f, c.n - c.f), new Fr(1, c.f), new Fr(c.f + 1, c.n), new Fr(1, 2), new Fr(1, 3)].filter((f) => f.val() < 1));
  return { q: P(`Quelle est la probabilité ${c.q} ?`), ...m, expl: steps(`Cas favorables : ${c.e} → ${c.f}.`, `Cas possibles : ${c.n}.`, `P = ${frRaw(c.f, c.n)} = ${val.html()}.`) + res(val.html()) };
});
gen('pb.tirages', { sub: 'calcul', ch: 'proba', name: 'Tirages avec ou sans remise', target: 70 }, (R, d) => {
  const r = R.int(3, 7), b = R.int(2, 6), n = r + b, sans = d >= 2 ? true : R.chance(0.3);
  if (d < 3) {
    const val = sans ? new Fr(r * (r - 1), n * (n - 1)) : new Fr(r * r, n * n);
    const other = sans ? new Fr(r * r, n * n) : new Fr(r * (r - 1), n * (n - 1));
    const m = mcq(R, val, [other, new Fr(r, n), new Fr(2 * r, n), new Fr(r * (r - 1), n * n), new Fr(r - 1, n - 1)].filter((f) => f.val() < 1));
    return { q: P(`Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire successivement deux jetons ${sans ? '<b>sans remise</b>' : '<b>avec remise</b>'}. Quelle est la probabilité que les deux soient rouges ?`), ...m, expl: steps(`1er tirage : ${F(r, n)}.`, sans ? `2e tirage (un rouge en moins, un jeton en moins) : ${F(r - 1, n - 1)}.` : `2e tirage (on a remis le jeton) : ${F(r, n)}.`, `P = ${F(r, n)} ${X} ${sans ? F(r - 1, n - 1) : F(r, n)} = ${val.html()}.`) + res(val.html()) };
  }
  const val = new Fr(2 * r * b, n * (n - 1));
  const m = mcq(R, val, [new Fr(r * b, n * (n - 1)), new Fr(2 * r * b, n * n), new Fr(1, 2), new Fr(r * b, n * n)].filter((f) => f.val() < 1));
  return { q: P(`Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire deux jetons sans remise. Quelle est la probabilité d'obtenir un jeton de chaque couleur ?`), ...m, expl: steps(`Rouge puis bleu : ${F(r, n)} ${X} ${F(b, n - 1)} = ${frRaw(r * b, n * (n - 1))}.`, `Bleu puis rouge : ${F(b, n)} ${X} ${F(r, n - 1)} = ${frRaw(r * b, n * (n - 1))}.`, `Total : ${frRaw(2 * r * b, n * (n - 1))} = ${val.html()}.`) + res(val.html()), trap: '<b>Piège :</b> oublier l\'ordre inverse (bleu puis rouge).' };
});
gen('pb.aumoins', { sub: 'calcul', ch: 'proba', name: '« Au moins un »', target: 65 }, (R, d) => {
  const cases = d === 1 ? [{ q: 'd\'obtenir au moins une fois pile en lançant 3 fois une pièce', p: new Fr(1, 2), k: 3, txt: 'face' }, { q: 'd\'obtenir au moins une fois pile en lançant 2 fois une pièce', p: new Fr(1, 2), k: 2, txt: 'face' }]
    : d === 2 ? [{ q: 'd\'obtenir au moins un 6 en lançant 2 fois un dé', p: new Fr(5, 6), k: 2, txt: '« pas de 6 »' }, { q: 'd\'obtenir au moins une fois pile en lançant 4 fois une pièce', p: new Fr(1, 2), k: 4, txt: 'face' }]
      : [{ q: 'd\'obtenir au moins un 6 en lançant 3 fois un dé', p: new Fr(5, 6), k: 3, txt: '« pas de 6 »' }, { q: 'qu\'au moins un des deux tireurs touche la cible, sachant que l\'un touche 2 fois sur 3 et l\'autre 3 fois sur 4', p: null }];
  const c = R.pick(cases);
  if (!c.p) {
    const val = new Fr(1).sub(new Fr(1, 3).mul(new Fr(1, 4)));
    const m = mcq(R, val, [new Fr(2, 3).mul(new Fr(3, 4)), new Fr(17, 12).sub(1), new Fr(1, 12), new Fr(5, 6)].filter((f) => f.val() <= 1));
    return { q: P(`Quelle est la probabilité ${c.q} ?`), ...m, expl: steps(`On passe par le contraire : aucun ne touche.`, `P(aucun) = ${F(1, 3)} ${X} ${F(1, 4)} = ${F(1, 12)}.`, `P(au moins un) = 1 ${MINUS} ${F(1, 12)} = ${val.html()}.`) + res(val.html()) };
  }
  let none = new Fr(1); for (let i = 0; i < c.k; i++) none = none.mul(c.p);
  const val = new Fr(1).sub(none);
  const naive = new Fr(1).sub(c.p).mul(c.k);
  const m = mcq(R, val, [naive, none, new Fr(1).sub(c.p), new Fr(1, 2)].filter((f) => f.val() <= 1 && f.n > 0));
  return { q: P(`Quelle est la probabilité ${c.q} ?`), ...m, expl: steps(`On passe par le contraire : n'obtenir que des ${c.txt}.`, `P(contraire) = (${c.p.html()})<sup>${c.k}</sup> = ${none.html()}.`, `P(au moins un) = 1 ${MINUS} ${none.html()} = ${val.html()}.`) + res(val.html()), trap: `<b>Piège :</b> additionner les probabilités (${naive.html()}).` };
});
gen('pb.des', { sub: 'calcul', ch: 'proba', name: 'Somme de deux dés', target: 55 }, (R, d) => {
  const ways = (s) => 6 - Math.abs(s - 7);
  if (d < 3) {
    const s = d === 1 ? R.pick([7, 6, 8, 12, 2]) : R.pick([4, 5, 9, 10, 11, 3]);
    const val = new Fr(ways(s), 36);
    const m = mcq(R, val, [new Fr(1, 11), new Fr(ways(s), 12), new Fr(ways(s) + 1, 36), new Fr(1, 6), new Fr(s, 36)].filter((f) => f.val() < 1));
    const list = []; for (let a = 1; a <= 6; a++) { const b = s - a; if (b >= 1 && b <= 6) list.push(`(${a}, ${b})`); }
    return { q: P(`On lance deux dés équilibrés. Quelle est la probabilité que la somme vaille ${s} ?`), ...m, expl: steps(`Il y a 6 ${X} 6 = 36 résultats possibles.`, `Somme ${s} : ${list.join(', ')} → ${ways(s)} cas.`, `P = ${frRaw(ways(s), 36)}${val.d !== 36 ? ' = ' + val.html() : ''}.`) + res(val.html()), trap: '<b>Piège :</b> (2, 5) et (5, 2) sont deux cas différents.' };
  }
  const t = R.pick([9, 10, 8]);
  let f = 0; for (let s = t; s <= 12; s++) f += ways(s);
  const val = new Fr(f, 36);
  const m = mcq(R, val, [new Fr(13 - t, 11), new Fr(f - 1, 36), new Fr(f, 30), new Fr(1, 4)].filter((x) => x.val() < 1));
  return { q: P(`On lance deux dés. Quelle est la probabilité que la somme soit supérieure ou égale à ${t} ?`), ...m, expl: steps(`Cas par somme : ${Array.from({ length: 13 - t }, (_, i) => `${t + i} → ${ways(t + i)}`).join(' ; ')}.`, `Total : ${f} cas sur 36.`, `P = ${val.html()}.`) + res(val.html()) };
});
gen('dn.mult', { sub: 'calcul', ch: 'proba', name: 'Principe multiplicatif', target: 45 }, (R, d) => {
  if (d === 1) {
    const a = R.int(2, 6), b = R.int(2, 6), c = R.int(2, 5), val = a * b * c;
    const m = mcq(R, val, [a + b + c, a * b + c, val * 2, (a + b) * c], { valid: Number.isInteger });
    return { q: P(`Un restaurant propose ${a} entrées, ${b} plats et ${c} desserts. Combien de menus différents (entrée + plat + dessert) peut-on composer ?`), ...m, expl: steps(`On multiplie les choix : ${a} ${X} ${b} ${X} ${c} = ${val}.`) + res(fmt(val)) };
  }
  if (d === 2) {
    const L = R.pick([3, 4]), distinct = R.chance(0.5), val = distinct ? arr(10, L) : Math.pow(10, L);
    const m = mcq(R, val, [distinct ? Math.pow(10, L) : arr(10, L), 10 * L, comb(10, L), Math.pow(9, L)], { valid: Number.isInteger });
    return { q: P(`Combien de codes de ${L} chiffres (de 0 à 9) ${distinct ? '<b>tous différents</b>' : '(les répétitions sont autorisées)'} peut-on former ?`), ...m, expl: steps(distinct ? `1er chiffre : 10 choix, 2e : 9, 3e : 8${L === 4 ? ', 4e : 7' : ''}.` : `Chaque chiffre a 10 choix.`, `${distinct ? Array.from({ length: L }, (_, i) => 10 - i).join(` ${X} `) : `10<sup>${L}</sup>`} = ${fmt(val)}.`) + res(fmt(val)) };
  }
  const lettres = R.pick([[2, 3], [3, 2]]), v2 = Math.pow(26, lettres[0]) * Math.pow(10, lettres[1]);
  const m = mcq(R, v2, [26 * lettres[0] + 10 * lettres[1], arr(26, lettres[0]) * arr(10, lettres[1]), Math.pow(36, lettres[0] + lettres[1]), v2 / 2], { valid: Number.isInteger });
  return { q: P(`Un identifiant est formé de ${lettres[0]} lettres (A à Z) suivies de ${lettres[1]} chiffres, répétitions autorisées. Combien d'identifiants différents existe-t-il ?`), ...m, expl: steps(`Lettres : 26 choix chacune → 26<sup>${lettres[0]}</sup>. Chiffres : 10 choix chacun → 10<sup>${lettres[1]}</sup>.`, `Total : ${fmt(Math.pow(26, lettres[0]))} ${X} ${fmt(Math.pow(10, lettres[1]))} = ${fmt(v2)}.`) + res(fmt(v2)) };
});
gen('dn.perm', { sub: 'calcul', ch: 'proba', name: 'Permutations et arrangements', target: 50 }, (R, d) => {
  if (d === 1) { const n = R.int(4, 6), val = fact(n); const m = mcq(R, val, [n * n, n * (n - 1), fact(n - 1), Math.pow(2, n)], { valid: Number.isInteger }); return { q: P(`De combien de façons peut-on ranger ${n} livres différents sur une étagère ?`), ...m, expl: steps(`1re place : ${n} choix, puis ${n - 1}, ${n - 2}… jusqu'à 1.`, `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(` ${X} `)} = ${val}.`) + res(fmt(val)) }; }
  if (d === 2) { const n = R.int(6, 10), k = 3, val = arr(n, k); const m = mcq(R, val, [comb(n, k), Math.pow(n, k), n * k, arr(n, k - 1)], { valid: Number.isInteger }); return { q: P(`${n} coureurs participent à une course. Combien y a-t-il de podiums possibles (1er, 2e, 3e) ?`), ...m, expl: steps(`L'ordre compte. 1er : ${n} choix, 2e : ${n - 1}, 3e : ${n - 2}.`, `${n} ${X} ${n - 1} ${X} ${n - 2} = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ${comb(n, 3)} compterait les groupes de 3 sans ordre.` }; }
  const w = R.pick([['PAPA', 6, '4! ÷ (2! × 2!)'], ['ELLE', 6, '4! ÷ (2! × 2!)'], ['RADAR', 30, '5! ÷ (2! × 2!)'], ['ANNA', 6, '4! ÷ (2! × 2!)'], ['LILAS', 30, '5! ÷ (2! × 2!)'], ['NANA', 6, '4! ÷ (2! × 2!)'], ['TOTO', 6, '4! ÷ (2! × 2!)'], ['ANANAS', 60, '6! ÷ (3! × 2!)']]);
  const m = mcq(R, w[1], [fact(w[0].length), fact(w[0].length) / 2, w[1] * 2, w[1] + 4], { valid: Number.isInteger });
  return { q: P(`Combien d'anagrammes (avec ou sans signification) peut-on former avec les lettres du mot ${big(w[0])} ?`), ...m, expl: steps(`Si toutes les lettres étaient différentes : ${w[0].length}! = ${fact(w[0].length)}.`, `On divise par les permutations des lettres répétées : ${w[2]} = ${w[1]}.`) + res(fmt(w[1])) };
});
gen('dn.comb', { sub: 'calcul', ch: 'proba', name: 'Combinaisons (l\'ordre ne compte pas)', target: 55 }, (R, d) => {
  if (d === 1) { const n = R.int(6, 15), val = comb(n, 2); const hs = R.chance(0.5); const m = mcq(R, val, [n * (n - 1), n * n, val + n, 2 * n], { valid: Number.isInteger }); return { q: P(hs ? `${n} personnes se serrent toutes la main une fois. Combien de poignées de main sont échangées ?` : `De combien de façons peut-on choisir 2 délégués parmi ${n} élèves ?`), ...m, expl: steps(`Choix ordonnés : ${n} ${X} ${n - 1} = ${n * (n - 1)}.`, `Chaque paire est comptée 2 fois (A-B et B-A) : ${n * (n - 1)} ${DV} 2 = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ${n * (n - 1)} compte chaque paire deux fois.` }; }
  if (d === 2) { const n = R.int(6, 10), val = comb(n, 3); const m = mcq(R, val, [arr(n, 3), comb(n, 2), val * 2, n * 3], { valid: Number.isInteger }); return { q: P(`De combien de façons peut-on former une équipe de 3 personnes parmi ${n} ?`), ...m, expl: steps(`Choix ordonnés : ${n} ${X} ${n - 1} ${X} ${n - 2} = ${arr(n, 3)}.`, `Une même équipe est comptée 3! = 6 fois : ${arr(n, 3)} ${DV} 6 = ${val}.`) + res(fmt(val)) }; }
  const f = R.int(4, 7), g = R.int(3, 6), val = comb(f, 2) * g;
  const m = mcq(R, val, [comb(f + g, 3), comb(f, 2) + g, arr(f, 2) * g, f * g], { valid: Number.isInteger });
  return { q: P(`Dans une classe de ${f} filles et ${g} garçons, on forme un comité de 2 filles et 1 garçon. Combien de comités différents peut-on former ?`), ...m, expl: steps(`2 filles parmi ${f} : ${F(`${f} ${X} ${f - 1}`, 2)} = ${comb(f, 2)}.`, `1 garçon parmi ${g} : ${g}.`, `Total : ${comb(f, 2)} ${X} ${g} = ${val}.`) + res(fmt(val)) };
});
gen('dn.venn', { sub: 'calcul', ch: 'proba', name: 'Ensembles et diagrammes de Venn', target: 60 }, (R, d) => {
  const both = R.int(2, 12), onlyA = R.int(3, 20), onlyB = R.int(3, 20), none = R.int(1, 12), N = both + onlyA + onlyB + none, A = onlyA + both, B = onlyB + both;
  if (d === 1) {
    const m = mcq(R, none, [N - A - B > 0 ? N - A - B : none + both + 1, both, none + both, N - A], { valid: (v) => Number.isInteger(v) && v >= 0 });
    return { q: P(`Sur ${N} élèves, ${A} font de l'anglais, ${B} de l'espagnol et ${both} font les deux. Combien ne font ni l'un ni l'autre ?`), ...m, expl: steps(`Au moins une langue : ${A} + ${B} ${MINUS} ${both} = ${A + B - both} (on retire ceux comptés deux fois).`, `Aucune : ${N} ${MINUS} ${A + B - both} = ${none}.`) + res(fmt(none)) };
  }
  if (d === 2) {
    const m = mcq(R, both, [A + B - N, none, both + none, Math.abs(A - B) || both + 2], { valid: (v) => Number.isInteger(v) && v >= 0 });
    return { q: P(`Dans un club de ${N} membres, ${A} pratiquent le tennis, ${B} le golf, et ${none} ne pratiquent aucun des deux. Combien pratiquent les deux ?`), ...m, expl: steps(`Au moins un sport : ${N} ${MINUS} ${none} = ${N - none}.`, `Les deux : ${A} + ${B} ${MINUS} ${N - none} = ${both}.`) + res(fmt(both)) };
  }
  const m = mcq(R, onlyA, [A, both, A - B, onlyA + both + 1], { valid: (v) => Number.isInteger(v) && v >= 0 });
  return { q: P(`Sur ${N} clients, ${A} ont acheté le produit X, ${B} le produit Y, et ${none} n'ont acheté ni X ni Y. Combien de clients ont acheté X <b>mais pas</b> Y ?`), ...m, expl: steps(`Au moins un produit : ${N} ${MINUS} ${none} = ${N - none}.`, `Les deux : ${A} + ${B} ${MINUS} ${N - none} = ${both}.`, `X seulement : ${A} ${MINUS} ${both} = ${onlyA}.`) + res(fmt(onlyA)), tip: '<b>Méthode :</b> dessine les deux cercles et remplis d\'abord l\'intersection.' };
});

/* ---------------- Chapitre 13 : Géométrie ---------------- */
chapter({
  id: 'geo', sub: 'calcul', order: 13, title: 'Géométrie', short: 'Géométrie',
  lesson: `
<h3><span class="hl">1. Aires et périmètres</span></h3>
<div class="tablewrap"><table>
<tr><th>Figure</th><th>Périmètre</th><th>Aire</th></tr>
<tr><td>Rectangle L × l</td><td>2(L + l)</td><td>L × l</td></tr>
<tr><td>Carré de côté a</td><td>4a</td><td>a²</td></tr>
<tr><td>Triangle</td><td>somme des côtés</td><td>${F('base × hauteur', 2)}</td></tr>
<tr><td>Trapèze</td><td>somme des côtés</td><td>${F('(B + b) × h', 2)}</td></tr>
<tr><td>Disque de rayon r</td><td>2πr</td><td>πr²</td></tr>
<tr><td>Losange</td><td>4 × côté</td><td>${F('D × d', 2)}</td></tr>
</table></div>
<h3><span class="hl">2. Pythagore</span></h3>
<div class="formula">Dans un triangle rectangle : hypoténuse² = côté² + côté²</div>
<p><b>Triplets à connaître</b> (et leurs multiples) : 3-4-5 · 5-12-13 · 8-15-17 · 7-24-25. Ex : 6-8-10, 9-12-15, 15-20-25.</p>
<p>Diagonale d'un carré de côté a : <b>a${SQ(2)}</b> (≈ 1,41a). Hauteur d'un triangle équilatéral de côté a : <b>${F(`a${SQ(3)}`, 2)}</b>.</p>
<h3><span class="hl">3. Angles</span></h3>
<ul><li>Somme des angles d'un triangle : <b>180°</b> ; d'un quadrilatère : <b>360°</b>.</li><li>Polygone à n côtés : somme des angles = (n − 2) × 180°. Hexagone régulier : 720° ÷ 6 = 120° par angle.</li><li>Horloge : l'aiguille des heures avance de 30° par heure et de 0,5° par minute ; celle des minutes de 6° par minute.</li></ul>
<h3><span class="hl">4. Volumes</span></h3>
<div class="formula">Cube a³ · Pavé L × l × h · Cylindre πr²h · Cône ${F('πr²h', 3)} · Sphère ${F(4, 3)}πr³ &nbsp;&nbsp;|&nbsp;&nbsp; 1 dm³ = 1 L</div>
<h3><span class="hl">5. Agrandissement / réduction</span></h3>
<p>Si les longueurs sont multipliées par k : les aires sont multipliées par <b>k²</b>, les volumes par <b>k³</b>.</p>
<div class="ex"><b>Exemple</b><span>Côtés d'un carré +20 % → × 1,2. Aire → × 1,2² = × 1,44, soit <b>+44 %</b>.</span></div>
<div class="trap"><b>Piège :</b> doubler le rayon d'un disque ne double pas son aire : il la multiplie par 4.</div>`,
});

gen('geo.aire', { sub: 'calcul', ch: 'geo', name: 'Aires et périmètres', target: 55 }, (R, d) => {
  if (d === 1) {
    if (R.chance(0.5)) { const L = R.int(4, 20), l = R.int(2, L - 1), askA = R.chance(0.5), val = askA ? L * l : 2 * (L + l); const m = mcq(R, val, [askA ? 2 * (L + l) : L * l, L + l, val + L, val - l], { valid: Number.isInteger, render: (v) => unit(v, askA ? 'cm²' : 'cm') }); return { q: P(`Un rectangle mesure ${L} cm sur ${l} cm. Quel est son ${askA ? 'aire' : 'périmètre'} ?`), ...m, expl: steps(askA ? `Aire = L ${X} l = ${L} ${X} ${l} = ${val} cm².` : `Périmètre = 2 ${X} (L + l) = 2 ${X} ${L + l} = ${val} cm.`) + res(askA ? unit(val, 'cm²') : unit(val, 'cm')) }; }
    const b = 2 * R.int(2, 10), h = R.int(3, 15), val = b * h / 2; const m = mcq(R, val, [b * h, b + h, val + h, val / 2], { valid: (v) => v > 0, render: (v) => unit(v, 'cm²') });
    return { q: P(`Un triangle a une base de ${b} cm et une hauteur de ${h} cm. Quelle est son aire ?`), ...m, expl: steps(`Aire = ${F('base × hauteur', 2)} = ${F(`${b} ${X} ${h}`, 2)} = ${val} cm².`) + res(unit(val, 'cm²')), trap: '<b>Piège :</b> oublier de diviser par 2.' };
  }
  if (d === 2) {
    if (R.chance(0.5)) { const B = R.int(8, 20), b = R.int(3, B - 2), h = 2 * R.int(2, 8), val = (B + b) * h / 2; const m = mcq(R, val, [(B + b) * h, B * b * h / 2, val + h, B * h], { valid: Number.isInteger, render: (v) => unit(v, 'cm²') }); return { q: P(`Un trapèze a des bases de ${B} cm et ${b} cm, et une hauteur de ${h} cm. Quelle est son aire ?`), ...m, expl: steps(`Aire = ${F('(B + b) × h', 2)} = ${F(`(${B} + ${b}) ${X} ${h}`, 2)} = ${F((B + b) * h, 2)} = ${val} cm².`) + res(unit(val, 'cm²')) }; }
    const L = R.int(8, 16), l = R.int(6, 12), a = R.int(2, L - 4), b = R.int(2, l - 3), val = L * l - a * b;
    const m = mcq(R, val, [L * l, L * l - a - b, val + a * b / 2, 2 * (L + l)], { valid: Number.isInteger, render: (v) => unit(v, 'm²') });
    return { q: P(`Une pièce a la forme d'un rectangle de ${L} m sur ${l} m auquel on a retiré, dans un coin, un rectangle de ${a} m sur ${b} m. Quelle est son aire ?`), ...m, expl: steps(`Grand rectangle : ${L} ${X} ${l} = ${L * l} m².`, `Partie retirée : ${a} ${X} ${b} = ${a * b} m².`, `Aire : ${L * l} ${MINUS} ${a * b} = ${val} m².`) + res(unit(val, 'm²')) };
  }
  const k = R.int(2, 4), l = R.int(2, 9), L = k * l, Pm = 2 * (L + l), val = L * l;
  const m = mcq(R, val, [Pm * k, (Pm / 4) * (Pm / 4), val + l, val * 2], { valid: Number.isInteger, render: (v) => unit(v, 'cm²') });
  return { q: P(`Un rectangle a un périmètre de ${Pm} cm et sa longueur vaut ${k} fois sa largeur. Quelle est son aire ?`), ...m, expl: steps(`Largeur l, longueur ${k}l : périmètre = 2(${k}l + l) = ${2 * (k + 1)}l = ${Pm}.`, `l = ${Pm} ${DV} ${2 * (k + 1)} = ${l} cm, L = ${L} cm.`, `Aire : ${L} ${X} ${l} = ${val} cm².`) + res(unit(val, 'cm²')) };
});
gen('geo.pyth', { sub: 'calcul', ch: 'geo', name: 'Théorème de Pythagore', target: 55 }, (R, d) => {
  const tr = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [20, 21, 29]]);
  if (d === 1) {
    const [a, b, c] = tr;
    const m = mcq(R, c, [a + b, c + 1, c + 2, b + 2], { valid: Number.isInteger, render: (v) => unit(v, 'cm') });
    return { q: P(`Un triangle rectangle a des côtés de l'angle droit de ${a} cm et ${b} cm. Quelle est la longueur de l'hypoténuse ?`), ...m, expl: steps(`hyp² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`, `hyp = ${SQ(c * c)} = ${c} cm.`) + res(unit(c, 'cm')), trap: `<b>Piège :</b> l'hypoténuse n'est pas ${a} + ${b} = ${a + b}.` };
  }
  if (d === 2) {
    const [a, b, c] = tr, k = R.int(1, 3), A = a * k, B = b * k, C = c * k;
    const ladder = R.chance(0.5);
    const m = mcq(R, B, [C - A, B + 1, A, Math.round(Math.sqrt(C * C + A * A))], { valid: (v) => Number.isInteger(v) && v > 0, render: (v) => unit(v, ladder ? 'm' : 'cm') });
    return { q: P(ladder ? `Une échelle de ${C} m est posée contre un mur vertical. Son pied est à ${A} m du mur. À quelle hauteur touche-t-elle le mur ?` : `Dans un triangle rectangle, l'hypoténuse mesure ${C} cm et un côté de l'angle droit mesure ${A} cm. Combien mesure l'autre côté ?`), ...m, expl: steps(`${C}² = ${A}² + x², donc x² = ${C * C} ${MINUS} ${A * A} = ${B * B}.`, `x = ${SQ(B * B)} = ${B}.`) + res(unit(B, ladder ? 'm' : 'cm')) };
  }
  if (R.chance(0.5)) {
    const a = R.int(2, 12);
    const c = `${a}${SQ(2)}`;
    const m = mcq(R, c, [`${2 * a}`, `${a}${SQ(3)}`, `${2 * a}${SQ(2)}`, `${a + 1}${SQ(2)}`], { sort: 'none', fill: (RR) => `${a + RR.int(2, 6)}${SQ(RR.pick([2, 3]))}` });
    return { q: P(`Quelle est la longueur de la diagonale d'un carré de côté ${a} cm ?`), ...m, expl: steps(`d² = ${a}² + ${a}² = ${2 * a * a}.`, `d = ${SQ(2 * a * a)} = ${SQ(`${a * a} ${X} 2`)} = ${c} cm.`) + res(c + NB + 'cm') };
  }
  const [a, b, c] = R.pick([[6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
  const area = a * b;
  const m = mcq(R, area, [a * c, b * c, area / 2, (a + b) * 2], { valid: Number.isInteger, render: (v) => unit(v, 'cm²') });
  return { q: P(`Un rectangle a une diagonale de ${c} cm et une largeur de ${a} cm. Quelle est son aire ?`), ...m, expl: steps(`Longueur : ${SQ(`${c}² ${MINUS} ${a}²`)} = ${SQ(c * c - a * a)} = ${b} cm.`, `Aire : ${a} ${X} ${b} = ${area} cm².`) + res(unit(area, 'cm²')) };
});
gen('geo.cercle', { sub: 'calcul', ch: 'geo', name: 'Cercles et disques', target: 50 }, (R, d) => {
  const pi = (k) => (k === 1 ? 'π' : fmt(k) + 'π');
  if (d === 1) {
    const r = R.int(2, 12), askA = R.chance(0.5), k = askA ? r * r : 2 * r;
    const m = mcq(R, k, [askA ? 2 * r : r * r, askA ? 2 * r * r : r, k * 2, k + r], { render: (v) => pi(v) + (askA ? ' cm²' : ' cm'), valid: Number.isInteger });
    return { q: P(`Un disque a un rayon de ${r} cm. Quel est ${askA ? 'son aire' : 'le périmètre du cercle'} ?`), ...m, expl: steps(askA ? `Aire = πr² = π ${X} ${r}² = ${pi(k)} cm².` : `Périmètre = 2πr = 2 ${X} π ${X} ${r} = ${pi(k)} cm.`) + res(pi(k) + (askA ? ' cm²' : ' cm')) };
  }
  if (d === 2) {
    if (R.chance(0.5)) { const k = R.pick([2, 3, 4]), val = k * k; const m = mcq(R, val, [k, 2 * k, k * k * k, k + 1], { render: (v) => '× ' + v }); return { q: P(`Si on multiplie par ${k} le rayon d'un disque, par combien son aire est-elle multipliée ?`), ...m, expl: steps(`Aire = πr². Avec un rayon ${k}r : π(${k}r)² = ${k * k}πr².`) + res('× ' + val), trap: `<b>Piège :</b> l'aire n'est pas multipliée par ${k}.` }; }
    const R1 = R.int(4, 10), R2 = R.int(1, R1 - 1), val = R1 * R1 - R2 * R2;
    const m = mcq(R, val, [(R1 - R2) * (R1 - R2), R1 * R1, 2 * (R1 - R2), val + R2], { render: (v) => pi(v) + ' cm²', valid: (v) => v > 0 });
    return { q: P(`Une couronne est comprise entre deux cercles de même centre, de rayons ${R1} cm et ${R2} cm. Quelle est son aire ?`), ...m, expl: steps(`Grand disque : π ${X} ${R1}² = ${pi(R1 * R1)}. Petit disque : π ${X} ${R2}² = ${pi(R2 * R2)}.`, `Couronne : ${pi(R1 * R1)} ${MINUS} ${pi(R2 * R2)} = ${pi(val)} cm².`) + res(pi(val) + ' cm²'), trap: `<b>Piège :</b> π(${R1} ${MINUS} ${R2})² = ${pi((R1 - R2) ** 2)} est faux.` };
  }
  const r = R.int(2, 10);
  if (R.chance(0.5)) { const val = 2 * r * r; const m = mcq(R, val, [r * r, 4 * r * r, val / 2 + r, Math.round(Math.PI * r * r)], { render: (v) => unit(v, 'cm²') }); return { q: P(`Un carré est inscrit dans un cercle de rayon ${r} cm (ses 4 sommets sont sur le cercle). Quelle est l'aire du carré ?`), ...m, expl: steps(`La diagonale du carré est un diamètre : ${2 * r} cm.`, `Aire d'un carré = ${F('diagonale²', 2)} = ${F(`${2 * r}²`, 2)} = ${val} cm².`) + res(unit(val, 'cm²')) }; }
  const a = 2 * r, val = r * r;
  const m = mcq(R, val, [a * a, 2 * r, 4 * r * r / 2, r], { render: (v) => pi(v) + ' cm²' });
  return { q: P(`Un disque est inscrit dans un carré de côté ${a} cm (il touche les 4 côtés). Quelle est l'aire du disque ?`), ...m, expl: steps(`Le diamètre du disque égale le côté du carré : rayon = ${a} ${DV} 2 = ${r} cm.`, `Aire = π ${X} ${r}² = ${pi(val)} cm².`) + res(pi(val) + ' cm²') };
});
gen('geo.vol', { sub: 'calcul', ch: 'geo', name: 'Volumes et contenances', target: 55 }, (R, d) => {
  if (d === 1) {
    const L = R.int(2, 12), l = R.int(2, 10), h = R.int(2, 9), val = L * l * h;
    const m = mcq(R, val, [L + l + h, 2 * (L * l + l * h + L * h), val * 2, L * l], { valid: Number.isInteger, render: (v) => unit(v, 'cm³') });
    return { q: P(`Quel est le volume d'un pavé droit de ${L} cm × ${l} cm × ${h} cm ?`), ...m, expl: steps(`V = L ${X} l ${X} h = ${L} ${X} ${l} ${X} ${h} = ${val} cm³.`) + res(unit(val, 'cm³')) };
  }
  if (d === 2) {
    const r = R.int(1, 6), h = R.int(2, 12), k = r * r * h;
    const m = mcq(R, k, [2 * r * h, r * h, k * 2, r * r + h], { render: (v) => (v === 1 ? 'π' : fmt(v) + 'π') + ' cm³', valid: Number.isInteger });
    return { q: P(`Quel est le volume d'un cylindre de rayon ${r} cm et de hauteur ${h} cm ?`), ...m, expl: steps(`V = πr²h = π ${X} ${r}² ${X} ${h} = ${fmt(k)}π cm³.`) + res(fmt(k) + 'π cm³') };
  }
  if (R.chance(0.5)) {
    const b = R.pick([1, 2, 3, 5]), k = R.int(2, 5), A = b * k, n = k ** 3;
    const m = mcq(R, n, [3 * k, k * k, n * 2, n + k], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Combien de petits cubes de ${b} cm d'arête faut-il pour remplir exactement un grand cube de ${A} cm d'arête ?`), ...m, expl: steps(`Sur chaque arête, on aligne ${A} ${DV} ${b} = ${k} petits cubes.`, `Il en faut ${k} ${X} ${k} ${X} ${k} = ${n}.`) + res(fmt(n)), trap: `<b>Piège :</b> ${k * k} ne remplirait qu'une seule couche.` };
  }
  const L = R.int(2, 8), l = R.int(2, 5), h = R.int(2, 6), V = L * l * h;
  const m = mcq(R, V, [V * 10, V / 10, V * 100, V + 10].map((v) => round(v, 3)), { render: (v) => unit(v, 'L') });
  return { q: P(`Un aquarium mesure ${L} dm de long, ${l} dm de large et ${h * 10} cm de haut. Combien de litres contient-il quand il est plein ?`), ...m, expl: steps(`On met tout dans la même unité : ${h * 10} cm = ${h} dm.`, `Volume : ${L} ${X} ${l} ${X} ${h} = ${V} dm³.`, `1 dm³ = 1 L, donc ${unit(V, 'L')}.`) + res(unit(V, 'L')), trap: `<b>Piège :</b> multiplier ${L} ${X} ${l} ${X} ${h * 10} sans convertir donne 10 fois trop.` };
});
gen('geo.angle', { sub: 'calcul', ch: 'geo', name: 'Angles', target: 50 }, (R, d) => {
  if (d === 1) {
    const a = R.int(20, 100), b = R.int(20, 160 - a), val = 180 - a - b;
    const m = mcq(R, val, [360 - a - b, 90 - Math.min(a, b) > 0 ? 90 - Math.min(a, b) : val + 15, val + 10, val - 10], { render: (v) => v + '°', valid: (v) => v > 0 });
    return { q: P(`Dans un triangle, deux angles mesurent ${a}° et ${b}°. Combien mesure le troisième ?`), ...m, expl: steps(`La somme des angles d'un triangle vaut 180°.`, `180 ${MINUS} ${a} ${MINUS} ${b} = ${val}°.`) + res(val + '°') };
  }
  if (d === 2) {
    if (R.chance(0.5)) { const top = 2 * R.int(10, 70), val = (180 - top) / 2; const m = mcq(R, val, [top, 180 - top, val + 10, 90 - top / 2 + 10], { render: (v) => v + '°', valid: (v) => v > 0 }); return { q: P(`Un triangle isocèle a un angle au sommet (entre les deux côtés égaux) de ${top}°. Combien mesure chacun des deux autres angles ?`), ...m, expl: steps(`Les deux angles à la base sont égaux.`, `(180 ${MINUS} ${top}) ${DV} 2 = ${val}°.`) + res(val + '°') }; }
    const n = R.pick([5, 6, 8, 10, 12]), val = (n - 2) * 180 / n;
    const m = mcq(R, val, [360 / n, 180 - 360 / n === val ? val + 12 : 180 - 360 / n, (n - 2) * 180, val + 15], { render: (v) => fmt(v) + '°' });
    return { q: P(`Combien mesure chaque angle intérieur d'un polygone régulier à ${n} côtés ?`), ...m, expl: steps(`Somme des angles : (${n} ${MINUS} 2) ${X} 180 = ${(n - 2) * 180}°.`, `Chaque angle : ${(n - 2) * 180} ${DV} ${n} = ${fmt(val)}°.`) + res(fmt(val) + '°') };
  }
  const h = R.int(1, 11), mm = R.pick([0, 10, 15, 20, 30, 40, 45, 50]);
  const ah = (h % 12) * 30 + mm * 0.5, am = mm * 6;
  let val = Math.abs(ah - am); if (val > 180) val = 360 - val;
  const naive = Math.abs((h % 12) * 30 - am) > 180 ? 360 - Math.abs((h % 12) * 30 - am) : Math.abs((h % 12) * 30 - am);
  const m = mcq(R, val, [naive, val + 15, val + 30, Math.abs(val - 30)], { render: (v) => fmt(v) + '°', valid: (v) => v >= 0 && v <= 180 });
  return { q: P(`Quel est le plus petit angle formé par les aiguilles d'une horloge à ${h} h ${String(mm).padStart(2, '0')} ?`), ...m, expl: steps(`Aiguille des minutes : ${mm} ${X} 6 = ${am}° (depuis midi).`, `Aiguille des heures : ${h % 12} ${X} 30 + ${mm} ${X} 0,5 = ${fmt(ah)}°.`, `Écart : ${fmt(Math.abs(ah - am))}°${Math.abs(ah - am) > 180 ? `, donc le plus petit angle vaut 360 ${MINUS} ${fmt(Math.abs(ah - am))} = ${fmt(val)}°` : ''}.`) + res(fmt(val) + '°'), trap: '<b>Piège :</b> l\'aiguille des heures avance aussi pendant les minutes (0,5° par minute).' };
});
gen('geo.agr', { sub: 'calcul', ch: 'geo', name: 'Agrandissement et réduction', target: 55 }, (R, d) => {
  if (d === 1) {
    const k = R.pick([2, 3, 4]), vol = R.chance(0.5), val = vol ? k ** 3 : k ** 2;
    const m = mcq(R, val, [k, vol ? k * k : k ** 3, 2 * k, val * 2], { render: (v) => '× ' + v });
    return { q: P(`On multiplie toutes les longueurs d'un ${vol ? 'cube' : 'carré'} par ${k}. Par combien ${vol ? 'son volume' : 'son aire'} est-${vol ? 'il' : 'elle'} multiplié${vol ? '' : 'e'} ?`), ...m, expl: steps(`Longueurs × ${k} → aires × ${k}² = ${k * k} → volumes × ${k}³ = ${k ** 3}.`) + res('× ' + val) };
  }
  const t = R.pick(d === 2 ? [10, 20, 50, -10, -20, 30] : [10, 20, 50, -10, -20, -50, 100]), vol = d === 3 && R.chance(0.5);
  const kk = 1 + t / 100, val = round(((vol ? kk ** 3 : kk ** 2) - 1) * 100, 2);
  const m = mcq(R, val, [vol ? 3 * t : 2 * t, t, round(val + 4, 2), round((kk ** (vol ? 2 : 3) - 1) * 100, 2)], { render: sgnPc, positive: false });
  return { q: P(`Toutes les longueurs d'un ${vol ? 'cube' : 'carré'} ${t > 0 ? 'augmentent' : 'diminuent'} de ${pc(Math.abs(t))}. De quel pourcentage ${vol ? 'son volume' : 'son aire'} varie-t-${vol ? 'il' : 'elle'} ?`), ...m, expl: steps(`Longueurs × ${fmt(kk)}.`, `${vol ? 'Volume' : 'Aire'} × ${fmt(kk)}${vol ? '³' : '²'} = × ${fmt(round(vol ? kk ** 3 : kk ** 2, 4))}.`, `Soit ${sgnPc(val)}.`) + res(sgnPc(val)), trap: `<b>Piège :</b> répondre ${sgnPc(vol ? 3 * t : 2 * t)}.` };
});

/* ---------------- Chapitre 14 : Suites & intérêts ---------------- */
chapter({
  id: 'suite', sub: 'calcul', order: 14, title: 'Suites & intérêts', short: 'Suites',
  lesson: `
<h3><span class="hl">1. Suite arithmétique : on ajoute toujours le même nombre</span></h3>
<p>5, 8, 11, 14… (raison r = 3). Le n-ième terme : <b>u<sub>n</sub> = u<sub>1</sub> + (n − 1) × r</b>. Le 20e terme : 5 + 19 × 3 = 62.</p>
<p><b>Nombre de termes</b> entre a et b (pas r) : ${F('b − a', 'r')} + 1. De 7 à 97 de 5 en 5 : ${F(90, 5)} + 1 = 19 termes.</p>
<div class="formula">Somme = nombre de termes × ${F('premier + dernier', 2)}</div>
<p>1 + 2 + … + 100 = 100 × ${F(101, 2)} = <b>5 050</b>. Pairs de 2 à 50 : 25 termes × ${F(52, 2)} = 650.</p>
<h3><span class="hl">2. Suite géométrique : on multiplie toujours par le même nombre</span></h3>
<p>3, 6, 12, 24… (raison q = 2). <b>u<sub>n</sub> = u<sub>1</sub> × q<sup>n−1</sup></b>.</p>
<div class="ex"><b>Doublement</b><span>Des bactéries doublent toutes les 20 min. En 3 h (9 périodes) : × 2⁹ = × 512.</span></div>
<div class="trap"><b>Piège du nénuphar :</b> un nénuphar double chaque jour et couvre le lac en 30 jours. Il en couvrait la moitié… le 29e jour (pas le 15e).</div>
<h3><span class="hl">3. Intérêts simples et composés</span></h3>
<ul><li><b>Simples</b> : on gagne chaque année t % du capital <b>initial</b>. 1 000 € à 5 % pendant 3 ans → 1 000 + 3 × 50 = 1 150 €.</li><li><b>Composés</b> : les intérêts produisent eux-mêmes des intérêts → × (1 + t)<sup>n</sup>. 1 000 € à 5 % pendant 2 ans → 1 000 × 1,05² = 1 102,50 €.</li></ul>`,
});

gen('su.arith', { sub: 'calcul', ch: 'suite', name: 'Suites arithmétiques et sommes', target: 55 }, (R, d) => {
  if (d === 1) { const u1 = R.int(-5, 20), r = R.int(2, 9), n = R.int(10, 40), val = u1 + (n - 1) * r; const m = mcq(R, val, [u1 + n * r, n * r, val + r, val - 2 * r], { positive: false, valid: Number.isInteger }); return { q: P(`Une suite commence par ${u1}, ${u1 + r}, ${u1 + 2 * r}, ${u1 + 3 * r}… Quel est son ${n}e terme ?`), ...m, expl: steps(`Raison : +${r}. Du 1er au ${n}e terme, on ajoute ${n - 1} fois ${r}.`, `${u1} + ${n - 1} ${X} ${r} = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ajouter ${n} fois la raison au lieu de ${n - 1}.` }; }
  if (d === 2) { const r = R.pick([3, 4, 5, 6, 7]), a = R.int(2, 20), n = R.int(10, 30), b = a + (n - 1) * r; const m = mcq(R, n, [n - 1, n + 1, Math.round((b - a) / r * 1.1), Math.round(b / r)], { valid: (v) => Number.isInteger(v) && v > 0 }); return { q: P(`Combien y a-t-il de nombres dans la liste ${a}, ${a + r}, ${a + 2 * r}, …, ${b} ?`), ...m, expl: steps(`Nombre de termes = ${F('dernier − premier', 'raison')} + 1.`, `${F(`${b} ${MINUS} ${a}`, r)} + 1 = ${(b - a) / r} + 1 = ${n}.`) + res(fmt(n)), trap: '<b>Piège des piquets :</b> ne pas oublier le +1.' }; }
  const t = R.int(0, 1);
  if (t === 0) { const n = R.pick([20, 30, 40, 50, 60, 80, 100]), val = n * (n + 1) / 2; const m = mcq(R, val, [n * n / 2, n * (n - 1) / 2, val + n, n * (n + 1)], { valid: Number.isInteger }); return { q: P(`Combien vaut la somme ${big(`1 + 2 + 3 + … + ${n}`)} ?`), ...m, expl: steps(`Somme = nombre de termes ${X} ${F('premier + dernier', 2)}.`, `${n} ${X} ${F(`1 + ${n}`, 2)} = ${n} ${X} ${fmt((n + 1) / 2)} = ${fmt(val)}.`) + res(fmt(val)) }; }
  const n = R.pick([25, 30, 40, 50]), val = n * (n + 1);
  const m = mcq(R, val, [n * n, 2 * n * (2 * n + 1) / 2, val / 2, val + 2 * n], { valid: Number.isInteger });
  return { q: P(`Combien vaut la somme des nombres pairs de 2 à ${2 * n} ?`), ...m, expl: steps(`Il y a ${n} nombres pairs de 2 à ${2 * n}.`, `Somme : ${n} ${X} ${F(`2 + ${2 * n}`, 2)} = ${n} ${X} ${n + 1} = ${fmt(val)}.`) + res(fmt(val)) };
});
gen('su.geom', { sub: 'calcul', ch: 'suite', name: 'Doublements et suites géométriques', target: 55 }, (R, d) => {
  if (d === 1) { const per = R.pick([10, 15, 20, 30]), H = R.pick([1, 2, 3]), k = H * 60 / per, val = Math.pow(2, k); const m = mcq(R, val, [2 * k, k * k, val / 2, val * 2], { render: (v) => '× ' + fmt(v), valid: Number.isInteger }); return { q: P(`Une population de bactéries double toutes les ${per} minutes. Par combien est-elle multipliée en ${plural(H, 'heure')} ?`), ...m, expl: steps(`${plural(H, 'heure')} = ${H * 60} min = ${k} périodes de ${per} min.`, `× 2 à chaque période : 2<sup>${k}</sup> = ${fmt(val)}.`) + res('× ' + fmt(val)), trap: `<b>Piège :</b> × ${2 * k} serait un doublement « additif ».` }; }
  if (d === 2) { const u1 = R.int(1, 5), q = R.pick([2, 3]), n = R.int(4, 7), val = u1 * Math.pow(q, n - 1); const m = mcq(R, val, [u1 * Math.pow(q, n), u1 + (n - 1) * q, val / q + 1, u1 * q * n], { valid: Number.isInteger }); return { q: P(`Une suite commence par ${u1}, ${u1 * q}, ${u1 * q * q}… (on multiplie à chaque fois par ${q}). Quel est son ${n}e terme ?`), ...m, expl: steps(`u<sub>n</sub> = u<sub>1</sub> ${X} q<sup>n−1</sup> = ${u1} ${X} ${q}<sup>${n - 1}</sup> = ${u1} ${X} ${Math.pow(q, n - 1)} = ${val}.`) + res(fmt(val)) }; }
  if (R.chance(0.5)) { const D = R.pick([20, 24, 30, 40, 48, 60]), frac = R.pick([[2, 1, 'la moitié'], [4, 2, 'le quart']]); const val = D - frac[1]; const m = mcq(R, val, [D / frac[0], D / 2, D - 2 * frac[1], D - frac[1] - 1, D / 4 * 3], { render: (v) => 'le ' + v + 'e jour', valid: (v) => Number.isInteger(v) && v > 0 && v < D }); return { q: P(`Un nénuphar double de surface chaque jour. Il recouvre entièrement un étang le ${D}e jour. Quel jour en recouvrait-il ${frac[2]} ?`), ...m, expl: steps(`Il double chaque jour : la veille d'être complet, il couvrait la moitié.`, frac[1] === 1 ? `Moitié → jour ${D} ${MINUS} 1 = ${val}.` : `Quart → deux jours avant : jour ${D} ${MINUS} 2 = ${val}.`) + res('le ' + val + 'e jour'), trap: `<b>Piège :</b> répondre le ${D / frac[0]}e jour (raisonnement proportionnel).` }; }
  const t = R.pick([10, 20, 50]), n = R.pick([2, 3]), val = round((Math.pow(1 + t / 100, n) - 1) * 100, 2);
  const m = mcq(R, val, [t * n, round(val - 1, 2), round(val + 5, 2), round(t * (n + 1), 2)], { render: sgnPc });
  return { q: P(`Une population augmente de ${pc(t)} par an pendant ${n} ans. De quel pourcentage a-t-elle augmenté au total ?`), ...m, expl: steps(`CM sur ${n} ans : ${fmt(1 + t / 100)}<sup>${n}</sup> = ${fmt(round(Math.pow(1 + t / 100, n), 4))}.`, `Hausse : ${sgnPc(val)}.`) + res(sgnPc(val)), trap: `<b>Piège :</b> ${sgnPc(t * n)} oublie que les hausses se cumulent.` };
});
gen('su.int', { sub: 'calcul', ch: 'suite', name: 'Intérêts simples et composés', target: 60 }, (R, d) => {
  const C = R.pick([1000, 2000, 5000, 10000, 500]), t = R.pick([2, 4, 5, 10]), n = d === 1 ? R.int(2, 5) : d === 2 ? 2 : 3;
  const simple = d === 1;
  const val = simple ? C * (1 + t * n / 100) : round(C * Math.pow(1 + t / 100, n), 2);
  const m = mcq(R, val, [simple ? round(C * Math.pow(1 + t / 100, n), 2) : C * (1 + t * n / 100), C * t * n / 100, round(val + C * t / 100, 2), C + t * n].map((v) => round(v, 2)), { render: eur2 });
  return { q: P(`On place ${eur(C)} à ${pc(t)} par an, à intérêts <b>${simple ? 'simples' : 'composés'}</b>. De quelle somme dispose-t-on au bout de ${n} ans ?`), ...m, expl: simple ? steps(`Intérêts simples : chaque année, ${pc(t)} de ${fmt(C)} = ${fmt(C * t / 100)} €.`, `Sur ${n} ans : ${n} ${X} ${fmt(C * t / 100)} = ${fmt(C * t * n / 100)} €.`, `Total : ${eur2(val)}.`) + res(eur2(val)) : steps(`Intérêts composés : × ${fmt(1 + t / 100)} chaque année.`, `${fmt(C)} ${X} ${fmt(1 + t / 100)}<sup>${n}</sup> = ${fmt(C)} ${X} ${fmt(round(Math.pow(1 + t / 100, n), 6))} = ${eur2(val)}.`) + res(eur2(val)) };
});
