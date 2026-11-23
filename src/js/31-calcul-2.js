/* ===== CALCUL (2/3) : proportionnalité, durées, vitesses, moyennes, équations ===== */
const cx = (k, v = 'x') => (k === 1 ? v : k === -1 ? MINUS + v : fmt(k) + v);
const NAMES = ['Léa', 'Tom', 'Inès', 'Hugo', 'Sarah', 'Yanis', 'Chloé', 'Nathan', 'Emma', 'Adam', 'Jade', 'Lucas'];

/* ---------------- Chapitre 5 : Proportionnalité, partages, ratios ---------------- */
chapter({
  id: 'prop', sub: 'calcul', order: 5, title: 'Proportionnalité, partages & ratios', short: 'Proportionnalité',
  lesson: `
<p>Deux grandeurs sont proportionnelles quand on passe de l'une à l'autre en multipliant toujours par le même nombre : prix et quantité, distance et durée à vitesse fixe, recette et nombre de personnes…</p>
<h3><span class="hl">1. La règle de trois</span></h3>
<p>5 kg coûtent 12 €. Combien coûtent 8 kg ?</p>
<ul><li><b>Par l'unité</b> : 1 kg coûte 12 ÷ 5 = 2,40 €, donc 8 kg coûtent 8 × 2,40 = <b>19,20 €</b>.</li><li><b>Produit en croix</b> : 12 × 8 ÷ 5 = 96 ÷ 5 = <b>19,20 €</b>.</li></ul>
<div class="formula">${F('a', 'b')} = ${F('c', 'x')} &nbsp;⇒&nbsp; x = ${F('b × c', 'a')}</div>
<h3><span class="hl">2. La proportionnalité inverse</span></h3>
<p>Quand l'une augmente, l'autre diminue, et c'est leur <b>produit</b> qui reste constant : ouvriers × jours, vitesse × temps, débit × durée.</p>
<div class="ex"><b>Exemple</b><span>6 ouvriers mettent 10 jours : le chantier représente 6 × 10 = 60 « jours-ouvrier ».</span><span>Avec 4 ouvriers : 60 ÷ 4 = <b>15 jours</b>.</span></div>
<div class="trap"><b>Piège :</b> faire une règle de trois directe (on trouverait 6,67 jours). Moins d'ouvriers = plus de jours !</div>
<h3><span class="hl">3. Le partage proportionnel</span></h3>
<p>Partager 540 € proportionnellement à 2, 3 et 4 : on compte les parts (2 + 3 + 4 = 9), une part vaut 540 ÷ 9 = 60 €, donc on distribue <b>120 €, 180 € et 240 €</b>.</p>
<p>Partage <b>inversement</b> proportionnel à 2, 3 et 6 : on partage selon ${F(1, 2)}, ${F(1, 3)}, ${F(1, 6)}, c'est-à-dire selon 3, 2 et 1 (en multipliant tout par 6).</p>
<h3><span class="hl">4. Les ratios</span></h3>
<p>« Le rapport filles/garçons vaut 3/5 » (ou 3 : 5) : pour 3 filles il y a 5 garçons, soit des « paquets » de 8 élèves. Avec 48 élèves : 48 ÷ 8 = 6 paquets → <b>18 filles et 30 garçons</b>.</p>
<h3><span class="hl">5. Les échelles</span></h3>
<p>Échelle 1/25 000 : 1 cm sur la carte = 25 000 cm en vrai = 250 m. Donc 4 cm = 1 km.</p>
<div class="tip"><b>Conversion express :</b> 1 km = 100 000 cm. Pour passer des cm aux km, on enlève 5 zéros.</div>`,
});

gen('prop.trois', { sub: 'calcul', ch: 'prop', name: 'Règle de trois', target: 55 }, (R, d) => {
  if (d < 3) {
    const ctx = R.pick([['kg de pommes', 'coûtent', '€'], ['m de tissu', 'coûtent', '€'], ['L d\'essence', 'coûtent', '€']]);
    const p = d === 1 ? R.pick([1.5, 2, 2.5, 3, 4, 0.5]) : R.pick([1.2, 1.6, 2.4, 3.2, 1.25, 0.8, 1.75, 2.8]);
    const q1 = R.int(3, 9); let q2; do { q2 = R.int(2, 15); } while (q2 === q1);
    const t1 = round(p * q1, 2), val = round(p * q2, 2);
    const m = mcq(R, val, [round(t1 + (q2 - q1), 2), round(t1 * q1 / q2, 2), round(val + p, 2), round(val - p, 2), round(t1 / q1, 2)], { render: eur2 });
    return { q: P(`${q1} ${ctx[0]} ${ctx[1]} ${eur2(t1)}. Combien coûtent ${q2} ${ctx[0]} ?`), ...m, expl: steps(`Prix d'une unité : ${eur2(t1)} ${DV} ${q1} = ${eur2(p)}.`, `${q2} ${X} ${fmt(p)} = ${eur2(val)}.`) + res(eur2(val)) };
  }
  const m1 = R.int(2, 5), h1 = R.int(2, 6), rate = R.int(3, 15), m2 = R.intNot(2, 8, [m1]), h2 = R.intNot(2, 9, [h1]);
  const n1 = m1 * h1 * rate, val = m2 * h2 * rate;
  const m = mcq(R, val, [n1 * m2 / m1, n1 * h2 / h1, n1 + (m2 - m1) + (h2 - h1), val + rate * m2, Math.round(n1 * m1 * h1 / (m2 * h2))], { valid: Number.isInteger });
  return { q: P(`${m1} machines identiques fabriquent ${n1} pièces en ${h1} heures. Combien de pièces fabriquent ${m2} machines en ${h2} heures ?`), ...m, expl: steps(`Une machine fabrique en une heure : ${n1} ${DV} (${m1} ${X} ${h1}) = ${rate} pièces.`, `${m2} machines pendant ${h2} h : ${rate} ${X} ${m2} ${X} ${h2} = ${val}.`) + res(fmt(val)), tip: '<b>Méthode :</b> ramène tout à « 1 machine pendant 1 heure ».' };
});

gen('prop.inv', { sub: 'calcul', ch: 'prop', name: 'Proportionnalité inverse', target: 60 }, (R, d) => {
  if (d === 1) {
    const total = R.pick([60, 72, 84, 90, 120, 144, 180]);
    const ws = divisors(total).filter((x) => x >= 2 && x <= 15 && total / x <= 40);
    const [w1, w2] = R.sample(ws, 2); const d1 = total / w1, val = total / w2;
    const m = mcq(R, val, [round(d1 * w2 / w1, 2), d1 + (w1 - w2), d1, val + 2].map((v) => round(v, 2)));
    return { q: P(`${w1} ouvriers mettent ${d1} jours pour construire un mur. Combien de jours faudrait-il à ${w2} ouvriers travaillant au même rythme ?`), ...m, expl: steps(`Le travail total vaut ${w1} ${X} ${d1} = ${total} jours-ouvrier.`, `Avec ${w2} ouvriers : ${total} ${DV} ${w2} = ${fmt(val)} jours.`) + res(plural(val, 'jour')), trap: '<b>Piège :</b> moins d\'ouvriers → plus de jours. Ce n\'est pas une règle de trois directe.' };
  }
  if (d === 2) {
    const [v1, t1, v2] = R.pick([[90, 2, 120], [60, 3, 90], [80, 1.5, 120], [100, 3, 120], [75, 2, 100], [120, 2.5, 100], [50, 3, 60]]);
    const dist = v1 * t1, t2 = dist / v2;
    const m = mcq(R, Math.round(t2 * 60), [Math.round(t1 * v2 / v1 * 60), Math.round(t2 * 60) + 10, Math.round(t2 * 60) - 15, Math.round((t1 - (v2 - v1) / 60) * 60), Math.round(t2 * 100)], { render: (v) => hm(v / 60) });
    return { q: P(`À ${v1} km/h, un trajet dure ${hm(t1)}. Combien de temps dure-t-il à ${v2} km/h ?`), ...m, expl: steps(`Distance : ${v1} ${X} ${fmt(t1)} = ${dist} km.`, `Durée à ${v2} km/h : ${dist} ${DV} ${v2} = ${fmt(round(t2, 4))} h = ${hm(t2)}.`) + res(hm(t2)) };
  }
  const people = R.pick([10, 12, 15, 20]), days = R.pick([20, 24, 30, 36]), after = R.pick([4, 5, 6, 10]);
  const rem = people * (days - after);
  const cands = []; for (let x = 2; x < people - 1; x++) if (rem % (people - x) === 0) cands.push(x);
  const leave = R.pick(cands), val = rem / (people - leave);
  const m = mcq(R, val, [days - after, days, round(val * (people - leave) / people, 2), val + 5], { valid: (v) => v > 0 });
  return { q: P(`Une réserve permet de nourrir ${people} personnes pendant ${days} jours. Au bout de ${after} jours, ${leave} personnes s'en vont. Pendant combien de jours la réserve durera-t-elle encore ?`), ...m, expl: steps(`Réserve totale : ${people} ${X} ${days} = ${people * days} rations.`, `Après ${after} jours, il reste ${people * days} ${MINUS} ${people} ${X} ${after} = ${rem} rations.`, `Pour ${people - leave} personnes : ${rem} ${DV} ${people - leave} = ${fmt(val)} jours.`) + res(plural(val, 'jour')) };
});

gen('prop.partage', { sub: 'calcul', ch: 'prop', name: 'Partages proportionnels', target: 60 }, (R, d) => {
  let parts, ask, total, intro, ex;
  if (d === 3) {
    const sets = [[2, 3, 6], [3, 4, 6], [2, 4, 4], [1, 2, 3]];
    const inv = R.pick(sets), L = inv.reduce((a, b) => lcm(a, b), 1);
    parts = inv.map((x) => L / x);
    const S = parts.reduce((a, b) => a + b, 0);
    total = S * R.int(10, 40) * 10; ask = R.int(0, 2);
    const val = total / S * parts[ask];
    const m = mcq(R, val, [total / inv.reduce((a, b) => a + b, 0) * inv[ask], total / 3, total / S * parts[2 - ask], val + total / S].map((v) => round(v, 2)), { render: eur });
    return { q: P(`On partage ${eur(total)} entre trois personnes, <b>inversement proportionnellement</b> à leur nombre d'absences : ${inv.join(', ')}. Combien reçoit la personne qui a ${inv[ask]} absence${inv[ask] > 1 ? 's' : ''} ?`), ...m, expl: steps(`Inversement proportionnel à ${inv.join(', ')} = proportionnel à ${inv.map((x) => F(1, x)).join(', ')}.`, `On multiplie par ${L} : proportionnel à ${parts.join(', ')} (total ${S} parts).`, `Une part vaut ${fmt(total)} ${DV} ${S} = ${fmt(total / S)} €, donc ${parts[ask]} parts = ${eur(val)}.`) + res(eur(val)), trap: '<b>Piège :</b> celui qui a le plus d\'absences reçoit le moins.' };
  }
  if (d === 1) { parts = R.sample([1, 2, 3, 4, 5, 6], 3); }
  else { const base = R.pick([500, 1000, 1500]); parts = R.sample([2, 3, 4, 5, 7], 3); intro = parts.map((p) => fmt(p * base) + NB + '€'); }
  const S = parts.reduce((a, b) => a + b, 0);
  total = S * R.int(4, 30) * 10; ask = R.int(0, 2);
  const val = total / S * parts[ask];
  const m = mcq(R, val, [total / 3, total / S * parts[(ask + 1) % 3], total / S * parts[(ask + 2) % 3], val + total / S, total / S].map((v) => round(v, 2)), { render: eur });
  const q = d === 1
    ? `On partage ${eur(total)} entre Ana, Ben et Cléo proportionnellement à ${parts.join(', ')}. Combien reçoit ${['Ana', 'Ben', 'Cléo'][ask]} ?`
    : `Trois associés ont apporté ${intro.join(', ')}. Ils se partagent un bénéfice de ${eur(total)} proportionnellement à leurs apports. Combien reçoit celui qui a apporté ${intro[ask]} ?`;
  ex = steps(d === 2 ? `Les apports sont proportionnels à ${parts.join(', ')} (on divise tout par le même nombre).` : `Nombre de parts : ${parts.join(' + ')} = ${S}.`, `Une part vaut ${fmt(total)} ${DV} ${S} = ${fmt(total / S)} €.`, `${parts[ask]} parts : ${parts[ask]} ${X} ${fmt(total / S)} = ${eur(val)}.`);
  return { q: P(q), ...m, expl: ex + res(eur(val)) };
});

gen('prop.ratio', { sub: 'calcul', ch: 'prop', name: 'Ratios', target: 60 }, (R, d) => {
  let a, b; do { a = R.int(1, 7); b = R.int(2, 9); } while (gcd(a, b) !== 1 || a === b);
  if (d === 1) {
    const k = R.int(3, 12), total = (a + b) * k, val = a * k;
    const m = mcq(R, val, [b * k, Math.round(total * a / b), total / 2, val + a, total - b], { valid: Number.isInteger });
    return { q: P(`Dans un club de ${total} membres, le rapport filles/garçons est de ${F(a, b)}. Combien y a-t-il de filles ?`), ...m, expl: steps(`Pour ${a} fille${a > 1 ? 's' : ''}, il y a ${b} garçons : des « paquets » de ${a + b} membres.`, `Nombre de paquets : ${total} ${DV} ${a + b} = ${k}.`, `Filles : ${a} ${X} ${k} = ${val}.`) + res(fmt(val)), trap: `<b>Piège :</b> ${F(a, b)} n'est pas la part des filles dans le club (qui vaut ${F(a, a + b)}).` };
  }
  if (d === 2) {
    if (a > b) [a, b] = [b, a];
    const k = R.int(3, 12), diff = (b - a) * k, val = a * k;
    const m = mcq(R, val, [b * k, diff, diff * a, val + k, (a + b) * k], { valid: Number.isInteger });
    return { q: P(`Le rapport filles/garçons d'une classe est de ${a} pour ${b}. Il y a ${diff} garçons de plus que de filles. Combien y a-t-il de filles ?`), ...m, expl: steps(`Dans chaque paquet (${plural(a, 'fille')}, ${plural(b, 'garçon')}), il y a ${plural(b - a, 'garçon')} de plus.`, `Nombre de paquets : ${diff} ${DV} ${b - a} = ${k}.`, `Filles : ${a} ${X} ${k} = ${val}.`) + res(fmt(val)) };
  }
  const [p, q, add, r, s] = R.pick([[2, 3, 5, 1, 1], [3, 5, 4, 1, 1], [1, 2, 6, 1, 1], [2, 5, 4, 2, 3], [3, 4, 3, 1, 1], [1, 3, 10, 1, 1]]);
  const k = (add * s) / (q * r - p * s);
  const boys = q * k, girls = p * k;
  const m = mcq(R, boys, [girls, girls + add, boys + add, k, boys * 2], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Le rapport filles/garçons d'un club est de ${p} pour ${q}. Après l'arrivée de ${add} nouvelles filles, il devient ${r} pour ${s}. Combien y a-t-il de garçons ?`), ...m, expl: steps(`Au départ : ${p}k filles et ${q}k garçons.`, `Après : (${p}k + ${add}) ${DV} ${q}k = ${F(r, s)}, donc ${s}(${p}k + ${add}) = ${r} ${X} ${q}k.`, `${s * p}k + ${s * add} = ${r * q}k → k = ${k}.`, `Garçons : ${q} ${X} ${k} = ${boys}.`) + res(fmt(boys)) };
});

gen('prop.echelle', { sub: 'calcul', ch: 'prop', name: 'Échelles', target: 55 }, (R, d) => {
  const sc = R.pick([10000, 20000, 25000, 50000, 100000, 200000]);
  if (d === 1) {
    const cm = R.int(2, 12) + (R.chance(0.3) ? 0.5 : 0), km = round(cm * sc / 100000, 3);
    const m = mcq(R, km, [km * 10, km / 10, round(cm * sc / 1000, 3), round(km + 1, 3)].map((v) => round(v, 3)), { render: (v) => unit(v, 'km') });
    return { q: P(`Sur une carte à l'échelle 1/${fmt(sc)}, deux villages sont distants de ${unit(cm, 'cm')}. Quelle est la distance réelle ?`), ...m, expl: steps(`1 cm sur la carte = ${fmt(sc)} cm en réalité.`, `${fmt(cm)} ${X} ${fmt(sc)} = ${fmt(cm * sc)} cm.`, `On enlève 5 zéros pour passer en km : ${unit(km, 'km')}.`) + res(unit(km, 'km')) };
  }
  if (d === 2) {
    const km = R.int(1, 30) * (sc >= 100000 ? 2 : 0.5), cm = round(km * 100000 / sc, 3);
    const m = mcq(R, cm, [cm * 10, cm / 10, round(cm * 2, 3), round(cm + 1, 3)].map((v) => round(v, 3)), { render: (v) => unit(v, 'cm') });
    return { q: P(`Deux villes sont distantes de ${unit(km, 'km')}. Quelle distance les sépare sur une carte à l'échelle 1/${fmt(sc)} ?`), ...m, expl: steps(`${unit(km, 'km')} = ${fmt(km * 100000)} cm.`, `On divise par ${fmt(sc)} : ${unit(cm, 'cm')}.`) + res(unit(cm, 'cm')) };
  }
  const s2 = R.pick([100, 200, 500, 1000]), a = R.int(2, 8), b = R.int(2, 9);
  const area = (a * s2 / 100) * (b * s2 / 100);
  const m = mcq(R, area, [a * b * s2 / 100, area * 100, area / 10, (a + b) * 2 * s2 / 100], { render: (v) => unit(v, 'm²') });
  return { q: P(`Sur un plan à l'échelle 1/${fmt(s2)}, un terrain rectangulaire mesure ${a} cm sur ${b} cm. Quelle est son aire réelle ?`), ...m, expl: steps(`Longueurs réelles : ${a} ${X} ${s2} = ${fmt(a * s2)} cm = ${fmt(a * s2 / 100)} m et ${b} ${X} ${s2} = ${fmt(b * s2)} cm = ${fmt(b * s2 / 100)} m.`, `Aire : ${fmt(a * s2 / 100)} ${X} ${fmt(b * s2 / 100)} = ${unit(area, 'm²')}.`) + res(unit(area, 'm²')), trap: '<b>Piège :</b> une échelle s\'applique aux longueurs. Pour une aire, l\'échelle joue deux fois.' };
});

/* ---------------- Chapitre 6 : Durées & conversions ---------------- */
chapter({
  id: 'conv', sub: 'calcul', order: 6, title: 'Durées & conversions', short: 'Durées',
  lesson: `
<p>Les durées piègent tout le monde parce qu'une heure fait <b>60</b> minutes, pas 100. C'est la base des vitesses : maîtrise ce chapitre avant d'attaquer le suivant.</p>
<h3><span class="hl">1. Heures décimales ↔ heures et minutes</span></h3>
<div class="tablewrap"><table>
<tr><th>Décimal</th><td>0,1 h</td><td>0,2 h</td><td>0,25 h</td><td>0,5 h</td><td>0,75 h</td><td>1,2 h</td><td>1,5 h</td></tr>
<tr><th>Minutes</th><td>6 min</td><td>12 min</td><td>15 min</td><td>30 min</td><td>45 min</td><td>1 h 12</td><td>1 h 30</td></tr>
</table></div>
<p>Pour convertir : <b>partie décimale × 60</b>. 2,4 h = 2 h + 0,4 × 60 min = <b>2 h 24</b>.</p>
<p>Dans l'autre sens : <b>minutes ÷ 60</b>. 1 h 45 = 1 + 45 ÷ 60 = <b>1,75 h</b>.</p>
<div class="formula">20 min = ${F(1, 3)} h &nbsp;·&nbsp; 40 min = ${F(2, 3)} h &nbsp;·&nbsp; 10 min = ${F(1, 6)} h &nbsp;·&nbsp; 50 min = ${F(5, 6)} h</div>
<div class="trap"><b>Piège n°1 :</b> 1 h 15 n'est PAS 1,15 h, c'est 1,25 h. Et 1,5 h n'est pas 1 h 50, c'est 1 h 30.</div>
<h3><span class="hl">2. Additionner des horaires</span></h3>
<p>On additionne les heures d'un côté, les minutes de l'autre, puis on convertit les minutes en trop. 9 h 47 + 2 h 38 = 11 h 85 = <b>12 h 25</b> (85 min = 1 h 25).</p>
<p>Durée entre 7 h 52 et 11 h 15 : de 7 h 52 à 8 h 00 = 8 min, de 8 h à 11 h 15 = 3 h 15, total <b>3 h 23</b>.</p>
<h3><span class="hl">3. Unités de longueur, d'aire et de volume</span></h3>
<ul><li><b>Longueurs</b> : on multiplie par 10 à chaque rang (km, hm, dam, m, dm, cm, mm).</li><li><b>Aires</b> : par 100 à chaque rang. 1 m² = 100 dm² = 10 000 cm². 1 ha = 10 000 m². 1 km² = 100 ha.</li><li><b>Volumes</b> : par 1 000 à chaque rang. 1 m³ = 1 000 dm³ = 1 000 000 cm³.</li></ul>
<div class="formula">1 L = 1 dm³ &nbsp;·&nbsp; 1 m³ = 1 000 L &nbsp;·&nbsp; 1 mL = 1 cm³</div>`,
});

gen('conv.h', { sub: 'calcul', ch: 'conv', name: 'Heures décimales ↔ minutes', target: 35 }, (R, d) => {
  if (d === 1) {
    const h = R.int(0, 4), dec = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.3]), x = round(h + dec, 2);
    const mins = Math.round(x * 60);
    const wrong = [h * 60 + Math.round(dec * 100), mins + 6, mins - 6, h * 60 + Math.round(dec * 10)];
    const m = mcq(R, mins, wrong, { render: (v) => hm(v / 60) });
    return { q: P(`Combien vaut ${big(fmt(x) + NB + 'h')} en heures et minutes ?`), ...m, expl: steps(`On garde ${h} h et on convertit la partie décimale : ${fmt(dec)} ${X} 60 = ${Math.round(dec * 60)} min.`) + res(hm(x)), trap: `<b>Piège :</b> ${fmt(x)} h n'est pas ${h} h ${String(Math.round(dec * 100)).padStart(2, '0')}.` };
  }
  if (d === 2) {
    const h = R.int(0, 3), mm = R.pick([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54]), val = round(h + mm / 60, 4);
    const m = mcq(R, val, [round(h + mm / 100, 4), round(val + 0.1, 4), round(val - 0.05, 4), round(h + mm / 10, 4)], { render: (v) => fmt(v) + NB + 'h' });
    return { q: P(`Écrire ${big(hm(h + mm / 60))} en heures décimales.`), ...m, expl: steps(`${mm} min = ${mm} ${DV} 60 h = ${fmt(mm / 60)} h.`, `Total : ${h} + ${fmt(mm / 60)} = ${fmt(val)} h.`) + res(fmt(val) + NB + 'h'), trap: `<b>Piège :</b> ${hm(h + mm / 60)} n'est pas ${fmt(h + mm / 100)} h.` };
  }
  if (R.chance(0.5)) {
    const [mm, f] = R.pick([[20, new Fr(1, 3)], [40, new Fr(2, 3)], [10, new Fr(1, 6)], [50, new Fr(5, 6)], [45, new Fr(3, 4)], [12, new Fr(1, 5)], [35, new Fr(7, 12)]]);
    const m = mcq(R, f, [new Fr(mm, 100), new Fr(1, 2), new Fr(mm, 6), f.add(new Fr(1, 12))]);
    return { q: P(`Quelle fraction d'heure représentent ${big(mm + NB + 'min')} ?`), ...m, expl: steps(`${mm} min = ${F(mm, 60)} h.`, `On simplifie : ${f.html()} h.`) + res(f.html() + NB + 'h') };
  }
  const x = R.pick([1.2, 2.4, 3.5, 0.3, 1.8, 4.25, 2.6, 0.45]), sec = Math.round(x * 60);
  const m = mcq(R, sec, [Math.floor(x) * 60 + Math.round((x % 1) * 100), sec + 6, sec - 12, Math.round(x * 100)], { render: (v) => Math.floor(v / 60) + NB + 'min' + NB + String(v % 60).padStart(2, '0') + NB + 's' });
  return { q: P(`Combien vaut ${big(fmt(x) + NB + 'min')} en minutes et secondes ?`), ...m, expl: steps(`On garde ${Math.floor(x)} min et on convertit : ${fmt(round(x % 1, 2))} ${X} 60 = ${Math.round((x % 1) * 60)} s.`) + res(Math.floor(sec / 60) + ' min ' + String(sec % 60).padStart(2, '0') + ' s') };
});

gen('conv.add', { sub: 'calcul', ch: 'conv', name: 'Horaires et durées', target: 45 }, (R, d) => {
  const rend = (v) => hmClock(v);
  if (d === 1) {
    const dep = R.int(6, 15) * 60 + R.int(5, 55), dur = R.int(0, 4) * 60 + R.int(15, 55), arr = dep + dur;
    const m = mcq(R, arr, [dep + Math.floor(dur / 60) * 100 + (dur % 60), arr + 10, arr - 60, arr + 40, arr - 10], { render: rend, sort: 'asc' });
    return { q: P(`Un train part à ${hmClock(dep)} et le trajet dure ${hm(dur / 60)}. À quelle heure arrive-t-il ?`), ...m, expl: steps(`Heures : ${Math.floor(dep / 60)} + ${Math.floor(dur / 60)} = ${Math.floor(dep / 60) + Math.floor(dur / 60)} h ; minutes : ${dep % 60} + ${dur % 60} = ${(dep % 60) + (dur % 60)} min.`, (dep % 60) + (dur % 60) >= 60 ? `${(dep % 60) + (dur % 60)} min = 1 h ${String((dep % 60) + (dur % 60) - 60).padStart(2, '0')} : on ajoute 1 h.` : '', `Arrivée : ${hmClock(arr)}.`) + res(hmClock(arr)) };
  }
  if (d === 2) {
    const a = R.int(6, 12) * 60 + R.int(31, 58), b = a + R.int(1, 5) * 60 + R.int(5, 50), dur = b - a;
    const naive = (Math.floor(b / 60) - Math.floor(a / 60)) * 100 + ((b % 60) - (a % 60));
    const m = mcq(R, dur, [dur + 40, dur - 40, dur + 10, Math.floor(naive / 100) * 60 + Math.abs(naive % 100)], { render: (v) => hm(v / 60) });
    return { q: P(`Un cours commence à ${hmClock(a)} et se termine à ${hmClock(b)}. Combien de temps dure-t-il ?`), ...m, expl: steps(`De ${hmClock(a)} à ${Math.floor(a / 60) + 1} h 00 : ${60 - (a % 60)} min.`, `De ${Math.floor(a / 60) + 1} h 00 à ${hmClock(b)} : ${hm((b - (Math.floor(a / 60) + 1) * 60) / 60)}.`, `Total : ${hm(dur / 60)}.`) + res(hm(dur / 60)), tip: '<b>Méthode :</b> passe par l\'heure ronde suivante, c\'est plus sûr.' };
  }
  const dep = R.int(20, 23) * 60 + R.pick([10, 20, 30, 40, 50]), durH = R.pick([2.5, 3.75, 4.2, 5.25, 1.8, 2.4, 6.5]), arr = dep + Math.round(durH * 60);
  const m = mcq(R, arr % 1440, [(dep + Math.floor(durH) * 60 + Math.round((durH % 1) * 100)) % 1440, (arr + 30) % 1440, (arr - 60) % 1440, (arr + 15) % 1440], { render: rend, sort: 'none' });
  return { q: P(`Un avion décolle à ${hmClock(dep)} pour un vol de ${fmt(durH)} heures. À quelle heure (heure du départ) atterrit-il ?`), ...m, expl: steps(`${fmt(durH)} h = ${hm(durH)}.`, `${hmClock(dep)} + ${hm(durH)} = ${Math.floor(arr / 60)} h ${String(arr % 60).padStart(2, '0')}, c'est-à-dire ${hmClock(arr)} le lendemain.`) + res(hmClock(arr)) };
});

gen('conv.unit', { sub: 'calcul', ch: 'conv', name: 'Unités d\'aire et de volume', target: 45 }, (R, d) => {
  const items = d === 1
    ? [[3.5, 'm²', 'cm²', 10000], [0.8, 'L', 'cm³', 1000], [2500, 'L', 'm³', 0.001], [4, 'ha', 'm²', 10000], [1.2, 'km', 'm', 1000], [45, 'cL', 'L', 0.01]]
    : d === 2
      ? [[0.35, 'km²', 'ha', 100], [7200, 'cm²', 'm²', 0.0001], [0.06, 'm³', 'L', 1000], [1.5, 'dm³', 'mL', 1000], [250, 'mm²', 'cm²', 0.01], [3, 'm³', 'dm³', 1000]]
      : null;
  if (items) {
    const [x, u1, u2, f] = R.pick(items), val = round(x * f, 6);
    const m = mcq(R, val, [val * 10, val / 10, val * 100, val / 100].map((v) => round(v, 6)), { render: (v) => unit(v, u2) });
    return { q: P(`Convertir ${big(unit(x, u1))} en ${u2}.`), ...m, expl: steps(`1 ${u1} = ${fmt(f >= 1 ? f : f, 6)} ${u2}.`, `${fmt(x)} ${X} ${fmt(f, 6)} = ${unit(val, u2)}.`) + res(unit(val, u2)), trap: '<b>Piège :</b> ×100 par rang pour les aires, ×1 000 pour les volumes.' };
  }
  const L = R.int(4, 12), l = R.int(2, 6), h = R.pick([1.2, 1.5, 1.6, 2, 0.8]);
  const val = round(L * l * h * 1000, 2);
  const m = mcq(R, val, [val / 10, val * 10, round(L * l * h * 100, 2), round((L + l) * 2 * h * 1000, 2)], { render: (v) => unit(v, 'L') });
  return { q: P(`Une piscine a la forme d'un pavé de ${L} m de long, ${l} m de large et ${fmt(h)} m de profondeur. Combien de litres d'eau faut-il pour la remplir ?`), ...m, expl: steps(`Volume : ${L} ${X} ${l} ${X} ${fmt(h)} = ${fmt(round(L * l * h, 3))} m³.`, `1 m³ = 1 000 L, donc ${unit(val, 'L')}.`) + res(unit(val, 'L')) };
});

/* ---------------- Chapitre 7 : Vitesses ---------------- */
chapter({
  id: 'vit', sub: 'calcul', order: 7, title: 'Vitesses, distances, temps', short: 'Vitesses',
  lesson: `
<p>Ce chapitre fait peur, mais tout repose sur <b>une seule formule</b> et <b>une seule règle sur les unités</b>.</p>
<h3><span class="hl">1. La formule</span></h3>
<div class="formula">vitesse = ${F('distance', 'temps')}<br>distance = vitesse × temps<br>temps = ${F('distance', 'vitesse')}</div>
<p><b>Moyen mnémotechnique</b> : le triangle <b>D</b> en haut, <b>V</b> et <b>T</b> en bas. Cache ce que tu cherches : D = V × T ; V = D / T ; T = D / V.</p>
<h3><span class="hl">2. La règle d'or des unités</span></h3>
<p>Si la vitesse est en <b>km/h</b>, le temps doit être en <b>heures</b> (décimales). On convertit donc les minutes : <b>minutes ÷ 60</b>.</p>
<div class="tablewrap"><table><tr><th>Durée</th><td>15 min</td><td>20 min</td><td>30 min</td><td>45 min</td><td>1 h 15</td><td>1 h 20</td><td>2 h 30</td></tr><tr><th>En heures</th><td>0,25</td><td>${F(1, 3)}</td><td>0,5</td><td>0,75</td><td>1,25</td><td>${F(4, 3)}</td><td>2,5</td></tr></table></div>
<div class="ex"><b>Exemple 1 — trouver une vitesse</b><span>Un train parcourt 150 km en 1 h 15. 1 h 15 = 1,25 h.</span><span>v = 150 ÷ 1,25 = <b>120 km/h</b>. (Astuce : 150 ÷ 1,25 = 150 × 0,8 = 120.)</span></div>
<div class="ex"><b>Exemple 2 — trouver une distance</b><span>À 90 km/h pendant 20 min : 20 min = ${F(1, 3)} h.</span><span>d = 90 × ${F(1, 3)} = <b>30 km</b>.</span></div>
<div class="ex"><b>Exemple 3 — trouver un temps</b><span>100 km à 80 km/h : t = 100 ÷ 80 = 1,25 h = <b>1 h 15</b>.</span></div>
<div class="tip"><b>Astuce « par minute » :</b> 60 km/h = 1 km par minute ; 90 km/h = 1,5 km/min ; 120 km/h = 2 km/min. 45 min à 120 km/h → 45 × 2 = 90 km.</div>
<h3><span class="hl">3. La vitesse moyenne (LE piège du Tage Mage)</span></h3>
<div class="formula">vitesse moyenne = ${F('distance TOTALE', 'temps TOTAL')}</div>
<p>Ce n'est presque jamais la moyenne des vitesses !</p>
<div class="ex"><b>Exemple — aller-retour</b><span>Aller : 120 km à 60 km/h → 2 h. Retour : 120 km à 40 km/h → 3 h.</span><span>Total : 240 km en 5 h → <b>48 km/h</b> (et non 50 km/h).</span></div>
<p>Pour un aller-retour (même distance), il y a une formule rapide :</p>
<div class="formula">v<sub>moy</sub> = ${F('2 × v₁ × v₂', 'v₁ + v₂')} &nbsp;&nbsp; ex : ${F('2 × 60 × 40', '60 + 40')} = ${F(4800, 100)} = 48</div>
<p>La moyenne simple des vitesses ne marche que si les deux trajets durent <b>le même temps</b>.</p>
<h3><span class="hl">4. Croisement et rattrapage</span></h3>
<ul><li><b>Ils se rapprochent</b> (face à face) : les vitesses s'<b>additionnent</b>. Deux voitures à 300 km l'une de l'autre, à 70 et 80 km/h : elles se rapprochent de 150 km chaque heure → rencontre au bout de 300 ÷ 150 = <b>2 h</b>.</li><li><b>L'un rattrape l'autre</b> (même sens) : les vitesses se <b>soustraient</b>. B à 90 km/h part 1 h après A à 60 km/h : A a 60 km d'avance, B gagne 30 km par heure → rattrapage en 60 ÷ 30 = <b>2 h</b>.</li></ul>
<h3><span class="hl">5. km/h ↔ m/s</span></h3>
<div class="formula">km/h → m/s : ÷ 3,6 &nbsp;·&nbsp; m/s → km/h : × 3,6 &nbsp;&nbsp; (36 km/h = 10 m/s · 72 km/h = 20 m/s · 90 km/h = 25 m/s)</div>`,
});

const VIT_T = {
  1: [[1, '1 h'], [2, '2 h'], [3, '3 h'], [0.5, '30 min'], [1.5, '1 h 30'], [2.5, '2 h 30']],
  2: [[1.25, '1 h 15'], [0.75, '45 min'], [1.75, '1 h 45'], [2.25, '2 h 15'], [1 / 3, '20 min'], [2 / 3, '40 min'], [4 / 3, '1 h 20']],
  3: [[5 / 6, '50 min'], [1.2, '1 h 12'], [1.6, '1 h 36'], [2.4, '2 h 24'], [0.3, '18 min'], [1.1, '1 h 06'], [0.4, '24 min']],
};
function misreadH(t) { const h = Math.floor(t + 1e-9), mm = Math.round((t - h) * 60); return h + mm / 100; }
function vitPair(R, d) {
  const [t, lab] = R.pick(VIT_T[d]);
  let v, dist, g = 0;
  do { v = R.int(d === 1 ? 4 : 3, 15) * (d === 1 ? 10 : R.pick([6, 12, 15, 9])); dist = round(v * t, 6); g++; } while ((!Number.isInteger(dist) || v > 150 || v < 24) && g < 300);
  return { t, lab, v, dist };
}
gen('vit.v', { sub: 'calcul', ch: 'vit', name: 'Calculer une vitesse', target: 60 }, (R, d) => {
  const { t, lab, v, dist } = vitPair(R, d);
  const mr = misreadH(t);
  const m = mcq(R, v, [round(dist / mr, 1), round(dist * t, 1), v + 10, v - 10, round(dist / (Math.round(t * 60) / 100), 1)].map((x) => round(x, 1)), { render: (x) => unit(x, 'km/h') });
  const who = v <= 35 ? 'Un cycliste' : v <= 130 ? 'Une voiture' : 'Un train';
  return { q: P(`${who} parcourt ${unit(dist, 'km')} en ${lab}. Quelle est sa vitesse moyenne ?`), ...m, expl: steps(t === Math.round(t) ? `La durée est déjà en heures : ${fmt(t)} h.` : `On convertit la durée en heures : ${lab} = ${Number.isInteger(round(t * 100, 6)) ? fmt(t) : new Fr(Math.round(t * 60), 60).html()} h.`, `v = d ${DV} t = ${fmt(dist)} ${DV} ${Number.isInteger(round(t * 100, 6)) ? fmt(t) : new Fr(Math.round(t * 60), 60).html()} = ${unit(v, 'km/h')}.`) + res(unit(v, 'km/h')), trap: t !== Math.round(t) ? `<b>Piège :</b> ${lab} ne s'écrit pas ${fmt(mr)} h.` : '' };
});
gen('vit.d', { sub: 'calcul', ch: 'vit', name: 'Calculer une distance', target: 55 }, (R, d) => {
  const { t, lab, v, dist } = vitPair(R, d);
  const mr = misreadH(t);
  const m = mcq(R, dist, [round(v * mr, 1), round(v / t, 1), dist + v / 4, dist - 10, round(v * Math.round(t * 60) / 100, 1)].map((x) => round(x, 1)), { render: (x) => unit(x, 'km') });
  const tTxt = Number.isInteger(round(t * 100, 6)) ? fmt(t) : new Fr(Math.round(t * 60), 60).html();
  return { q: P(`Une voiture roule à ${unit(v, 'km/h')} pendant ${lab}. Quelle distance parcourt-elle ?`), ...m, expl: steps(t % 1 ? `${lab} = ${tTxt} h.` : '', `d = v ${X} t = ${v} ${X} ${tTxt} = ${unit(dist, 'km')}.`, d > 1 ? `Astuce : ${v} km/h = ${fmt(v / 60)} km par minute${lab.includes('h') ? `, et ${lab} = ${Math.round(t * 60)} min` : ''} → ${fmt(v / 60)} ${X} ${Math.round(t * 60)} = ${fmt(dist)} km.` : '') + res(unit(dist, 'km')) };
});
gen('vit.t', { sub: 'calcul', ch: 'vit', name: 'Calculer une durée', target: 55 }, (R, d) => {
  const { t, v, dist } = vitPair(R, d);
  const mins = Math.round(t * 60);
  const dec = round(t, 4), decTxt = Number.isInteger(round(t * 100, 6)) ? fmt(dec) : new Fr(mins, 60).html();
  const naive = Math.floor(t) * 60 + Math.round((t % 1) * 100);
  const m = mcq(R, mins, [naive, mins + 10, mins - 10, mins + 30, Math.round(v / dist * 60)], { render: (x) => hm(x / 60), valid: (x) => x > 0 });
  return { q: P(`À ${unit(v, 'km/h')}, combien de temps faut-il pour parcourir ${unit(dist, 'km')} ?`), ...m, expl: steps(`t = d ${DV} v = ${fmt(dist)} ${DV} ${v} = ${decTxt} h.`, `On convertit en minutes : ${decTxt} ${X} 60 = ${mins} min${mins >= 60 ? ' = ' + hm(t) : ''}.`) + res(hm(t)), trap: t % 1 ? `<b>Piège :</b> ${fmt(round(t, 2))} h ne veut pas dire ${Math.floor(t)} h ${String(Math.round((t % 1) * 100)).padStart(2, '0')}.` : '' };
});
gen('vit.conv', { sub: 'calcul', ch: 'vit', name: 'km/h ↔ m/s', target: 45 }, (R, d) => {
  if (d === 1) { const ms = R.pick([5, 10, 15, 20, 25, 30, 35, 40]), kmh = ms * 3.6; const m = mcq(R, ms, [kmh / 60, kmh / 3, ms * 2, ms + 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'm/s') }); return { q: P(`Convertir ${big(unit(kmh, 'km/h'))} en m/s.`), ...m, expl: steps(`1 km/h = 1 000 m en 3 600 s, donc on divise par 3,6.`, `${fmt(kmh)} ${DV} 3,6 = ${unit(ms, 'm/s')}.`) + res(unit(ms, 'm/s')) }; }
  if (d === 2) { const ms = R.pick([5, 12, 15, 25, 30, 45, 50]), kmh = round(ms * 3.6, 2); const m = mcq(R, kmh, [ms * 60, round(ms / 3.6, 2), ms * 3, round(kmh + 10, 2)], { render: (x) => unit(x, 'km/h') }); return { q: P(`Un guépard court à ${big(unit(ms, 'm/s'))}. Quelle est sa vitesse en km/h ?`), ...m, expl: steps(`m/s → km/h : on multiplie par 3,6.`, `${ms} ${X} 3,6 = ${unit(kmh, 'km/h')}.`) + res(unit(kmh, 'km/h')) }; }
  const kmh = R.pick([54, 72, 90, 108, 36]), ms = kmh / 3.6, Lt = R.pick([100, 150, 200, 250]), tun = R.pick([350, 550, 800, 1000, 1250]);
  const tt = round((Lt + tun) / ms, 2);
  const m = mcq(R, tt, [round(tun / ms, 2), round((Lt + tun) / kmh, 2), round(tt + 10, 2), round((tun - Lt) / ms, 2)], { render: (x) => unit(x, 's') });
  return { q: P(`Un train de ${Lt} m de long roule à ${unit(kmh, 'km/h')}. Combien de temps met-il pour traverser entièrement un tunnel de ${fmt(tun)} m (de l'entrée de la locomotive à la sortie du dernier wagon) ?`), ...m, expl: steps(`Vitesse : ${kmh} ${DV} 3,6 = ${fmt(ms)} m/s.`, `Le train doit parcourir le tunnel PLUS sa propre longueur : ${fmt(tun)} + ${Lt} = ${fmt(Lt + tun)} m.`, `t = ${fmt(Lt + tun)} ${DV} ${fmt(ms)} = ${unit(tt, 's')}.`) + res(unit(tt, 's')), trap: '<b>Piège :</b> oublier la longueur du train.' };
});
gen('vit.moy', { sub: 'calcul', ch: 'vit', name: 'Vitesse moyenne (aller-retour)', target: 70 }, (R, d) => {
  if (d === 1) {
    const [v1, v2] = R.shuffle(R.pick([[60, 40], [30, 20], [90, 60], [120, 80], [100, 150], [50, 75], [12, 24], [45, 90], [60, 90], [40, 60]]));
    const vm = 2 * v1 * v2 / (v1 + v2);
    const m = mcq(R, vm, [(v1 + v2) / 2, Math.abs(v1 - v2), vm + 5, Math.max(v1, v2) - 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'km/h') });
    const D = lcm(v1, v2);
    return { q: P(`Un automobiliste fait l'aller à ${unit(v1, 'km/h')} et le retour, par la même route, à ${unit(v2, 'km/h')}. Quelle est sa vitesse moyenne sur l'aller-retour ?`), ...m, expl: steps(`Prenons une distance pratique, ${D} km (divisible par les deux vitesses).`, `Aller : ${D} ${DV} ${v1} = ${fmt(D / v1)} h. Retour : ${D} ${DV} ${v2} = ${fmt(D / v2)} h.`, `Total : ${2 * D} km en ${fmt(D / v1 + D / v2)} h → ${fmt(2 * D)} ${DV} ${fmt(D / v1 + D / v2)} = ${unit(vm, 'km/h')}.`, `Formule rapide : ${F(`2 ${X} ${v1} ${X} ${v2}`, `${v1} + ${v2}`)} = ${fmt(vm)}.`) + res(unit(vm, 'km/h')), trap: `<b>Piège :</b> ${unit((v1 + v2) / 2, 'km/h')} (la moyenne des vitesses) est faux, car on passe plus de temps au retour lent.` };
  }
  if (d === 2) {
    const [d1, v1, d2, v2] = R.pick([[120, 60, 120, 120], [180, 90, 60, 60], [100, 50, 200, 100], [90, 45, 150, 75], [60, 30, 180, 90], [240, 80, 60, 30]]);
    const T = d1 / v1 + d2 / v2, vm = (d1 + d2) / T;
    const m = mcq(R, vm, [(v1 + v2) / 2, (d1 * v1 + d2 * v2) / (d1 + d2), vm + 10, vm - 5].map((x) => round(x, 2)), { render: (x) => unit(x, 'km/h') });
    return { q: P(`Un coureur parcourt ${d1} km à ${unit(v1, 'km/h')}, puis ${d2} km à ${unit(v2, 'km/h')}. Quelle est sa vitesse moyenne sur l'ensemble du parcours ?`), ...m, expl: steps(`Temps 1 : ${d1} ${DV} ${v1} = ${fmt(d1 / v1)} h. Temps 2 : ${d2} ${DV} ${v2} = ${fmt(d2 / v2)} h.`, `Distance totale : ${d1 + d2} km ; temps total : ${fmt(T)} h.`, `v moyenne = ${d1 + d2} ${DV} ${fmt(T)} = ${unit(vm, 'km/h')}.`) + res(unit(vm, 'km/h')), trap: '<b>Rappel :</b> vitesse moyenne = distance totale ÷ temps total.' };
  }
  const [v1, T, v2] = R.pick([[60, 80, 120], [40, 48, 60], [90, 72, 60], [50, 60, 75], [100, 120, 150], [30, 40, 60], [45, 60, 90], [60, 90, 180]]);
  const m = mcq(R, v2, [2 * T - v1, T, v2 + 20, Math.round((v2 + T) / 2)], { render: (x) => unit(x, 'km/h') });
  return { q: P(`Un cycliste fait l'aller à ${unit(v1, 'km/h')}. À quelle vitesse doit-il faire le retour (même distance) pour que sa vitesse moyenne sur l'aller-retour soit de ${unit(T, 'km/h')} ?`), ...m, expl: steps(`Prenons une distance de ${lcm(lcm(v1, T), v2)} km pour l'aller (et autant au retour).`, `Temps total autorisé : ${2 * lcm(lcm(v1, T), v2)} ${DV} ${T} = ${fmt(2 * lcm(lcm(v1, T), v2) / T)} h. L'aller prend déjà ${fmt(lcm(lcm(v1, T), v2) / v1)} h.`, `Il reste ${fmt(2 * lcm(lcm(v1, T), v2) / T - lcm(lcm(v1, T), v2) / v1)} h pour ${lcm(lcm(v1, T), v2)} km → ${unit(v2, 'km/h')}.`) + res(unit(v2, 'km/h')), trap: `<b>Piège :</b> répondre ${unit(2 * T - v1, 'km/h')} (en raisonnant comme si on faisait la moyenne des vitesses).` };
});
gen('vit.croise', { sub: 'calcul', ch: 'vit', name: 'Croisements', target: 70 }, (R, d) => {
  const t = R.pick(d === 1 ? [1, 2, 3, 1.5] : [1.5, 2.5, 0.75, 1.25, 2, 3]);
  let v1, v2; do { v1 = R.int(4, 12) * 10; v2 = R.int(4, 12) * 10; } while (v1 === v2 || !Number.isInteger(round((v1 + v2) * t, 6)));
  const D = (v1 + v2) * t;
  if (d === 1) {
    const mins = Math.round(t * 60);
    const m = mcq(R, mins, [Math.round(D / Math.abs(v1 - v2) * 60), Math.round(D / ((v1 + v2) / 2) * 60), mins + 30, mins - 15], { render: (x) => hm(x / 60), valid: (x) => x > 0 && x < 2000 });
    return { q: P(`Deux villes A et B sont distantes de ${unit(D, 'km')}. Une voiture part de A vers B à ${unit(v1, 'km/h')} ; au même moment, une autre part de B vers A à ${unit(v2, 'km/h')}. Au bout de combien de temps se croisent-elles ?`), ...m, expl: steps(`Elles se rapprochent de ${v1} + ${v2} = ${v1 + v2} km chaque heure.`, `t = ${fmt(D)} ${DV} ${v1 + v2} = ${fmt(t)} h${t % 1 ? ' = ' + hm(t) : ''}.`) + res(hm(t)) };
  }
  if (d === 2) {
    const dA = v1 * t;
    const m = mcq(R, dA, [D / 2, v2 * t, D - dA + 10, dA + 15], { render: (x) => unit(x, 'km') });
    return { q: P(`A et B sont distantes de ${unit(D, 'km')}. Un train part de A vers B à ${unit(v1, 'km/h')} et, au même moment, un autre part de B vers A à ${unit(v2, 'km/h')}. À quelle distance de A se croisent-ils ?`), ...m, expl: steps(`Vitesse de rapprochement : ${v1} + ${v2} = ${v1 + v2} km/h.`, `Ils se croisent au bout de ${fmt(D)} ${DV} ${v1 + v2} = ${fmt(t)} h.`, `Le train parti de A a alors parcouru ${v1} ${X} ${fmt(t)} = ${unit(dA, 'km')}.`) + res(unit(dA, 'km')) };
  }
  const lag = R.pick([0.5, 1]);
  const D2 = D + v1 * lag;
  const mins = Math.round(t * 60);
  const m = mcq(R, mins, [Math.round(D2 / (v1 + v2) * 60), mins + Math.round(lag * 60), mins - 15, mins + 20], { render: (x) => hm(x / 60), valid: (x) => x > 0 });
  return { q: P(`A et B sont distantes de ${unit(D2, 'km')}. Une voiture part de A vers B à ${unit(v1, 'km/h')}. ${hm(lag)} plus tard, une seconde voiture part de B vers A à ${unit(v2, 'km/h')}. Combien de temps après le départ de la seconde voiture se croisent-elles ?`), ...m, expl: steps(`Pendant ${hm(lag)}, la première parcourt ${v1} ${X} ${fmt(lag)} = ${fmt(v1 * lag)} km. Il reste ${fmt(D2)} ${MINUS} ${fmt(v1 * lag)} = ${fmt(D)} km entre elles.`, `Ensuite elles se rapprochent de ${v1 + v2} km/h : ${fmt(D)} ${DV} ${v1 + v2} = ${fmt(t)} h${t % 1 ? ' = ' + hm(t) : ''}.`) + res(hm(t)) };
});
gen('vit.rattrape', { sub: 'calcul', ch: 'vit', name: 'Rattrapages', target: 75, diffs: [2, 3] }, (R, d) => {
  const [v1, v2, lag] = R.pick([[60, 90, 1], [40, 60, 0.5], [80, 120, 1], [50, 75, 1], [90, 120, 0.5], [15, 20, 1], [12, 18, 0.5], [70, 105, 1]]);
  const tc = v1 * lag / (v2 - v1);
  if (d === 2) {
    const mins = Math.round(tc * 60);
    const m = mcq(R, mins, [Math.round(v1 * lag / (v1 + v2) * 60), Math.round(lag * 60), mins + 30, mins * 2], { render: (x) => hm(x / 60), valid: (x) => x > 0 });
    return { q: P(`Une voiture part à ${unit(v1, 'km/h')}. ${hm(lag)} plus tard, une seconde voiture part du même endroit, sur la même route, à ${unit(v2, 'km/h')}. Combien de temps après son départ la seconde rattrape-t-elle la première ?`), ...m, expl: steps(`Avance de la première : ${v1} ${X} ${fmt(lag)} = ${fmt(v1 * lag)} km.`, `La seconde gagne ${v2} ${MINUS} ${v1} = ${v2 - v1} km par heure.`, `Temps : ${fmt(v1 * lag)} ${DV} ${v2 - v1} = ${fmt(tc)} h${tc % 1 ? ' = ' + hm(tc) : ''}.`) + res(hm(tc)), trap: '<b>Piège :</b> dans le même sens, on SOUSTRAIT les vitesses.' };
  }
  const h0 = R.int(7, 14) * 60 + R.pick([0, 15, 30, 45]), catchAt = h0 + Math.round((lag + tc) * 60);
  const m = mcq(R, catchAt, [h0 + Math.round(tc * 60), catchAt + 30, catchAt - 30, h0 + Math.round((lag + v1 * lag / (v1 + v2)) * 60)], { render: hmClock });
  return { q: P(`Un camion part à ${hmClock(h0)} à ${unit(v1, 'km/h')}. Une moto part du même point à ${hmClock(h0 + lag * 60)}, sur la même route, à ${unit(v2, 'km/h')}. À quelle heure la moto rattrape-t-elle le camion ?`), ...m, expl: steps(`Quand la moto part, le camion a ${fmt(v1 * lag)} km d'avance.`, `La moto gagne ${v2 - v1} km/h : rattrapage en ${fmt(v1 * lag)} ${DV} ${v2 - v1} = ${hm(tc)}.`, `${hmClock(h0 + lag * 60)} + ${hm(tc)} = ${hmClock(catchAt)}.`) + res(hmClock(catchAt)) };
});

/* ---------------- Chapitre 8 : Moyennes ---------------- */
chapter({
  id: 'moy', sub: 'calcul', order: 8, title: 'Moyennes', short: 'Moyennes',
  lesson: `
<h3><span class="hl">1. La définition… et la vraie clé</span></h3>
<div class="formula">moyenne = ${F('somme des valeurs', 'nombre de valeurs')} &nbsp;&nbsp;⇔&nbsp;&nbsp; <b>somme = moyenne × nombre</b></div>
<p>La deuxième écriture résout 80 % des exercices. « 8 nombres ont pour moyenne 15 » veut dire : leur somme vaut 8 × 15 = 120.</p>
<div class="ex"><b>Note manquante</b><span>Notes 12, 15 et 9. Quelle 4e note pour avoir 13 de moyenne ?</span><span>Il faut une somme de 4 × 13 = 52. On a déjà 36. Il manque <b>16</b>.</span></div>
<h3><span class="hl">2. L'astuce des écarts (calcul mental)</span></h3>
<p>Moyenne de 47, 52, 49 et 56 ? On choisit une base, 50 : écarts −3, +2, −1, +6 → total +4 → +4 ÷ 4 = +1 → moyenne <b>51</b>.</p>
<h3><span class="hl">3. La moyenne pondérée</span></h3>
<p>Chaque note compte autant de fois que son coefficient : (14 × 3 + 10 × 1) ÷ (3 + 1) = 52 ÷ 4 = <b>13</b>.</p>
<h3><span class="hl">4. Moyenne de deux groupes</span></h3>
<p>20 filles ont 14 de moyenne et 10 garçons ont 11 : (20 × 14 + 10 × 11) ÷ 30 = 390 ÷ 30 = <b>13</b>.</p>
<div class="trap"><b>Piège :</b> faire (14 + 11) ÷ 2 = 12,5. Le groupe le plus nombreux pèse plus lourd.</div>
<h3><span class="hl">5. Ajouter ou retirer une valeur</span></h3>
<p>Moyenne de 8 nombres = 15 (somme 120). On ajoute 24 : nouvelle somme 144 pour 9 nombres → <b>16</b>.</p>`,
});

gen('moy.simple', { sub: 'calcul', ch: 'moy', name: 'Moyenne simple et note manquante', target: 50 }, (R, d) => {
  if (d === 1 || d === 3) {
    const n = d === 1 ? 5 : 4, base = d === 1 ? R.int(10, 16) : R.pick([1500, 250, 980, 2000, 75]);
    const spread = d === 1 ? 4 : base >= 1000 ? 15 : 6;
    let devs; do { devs = Array.from({ length: n }, () => R.int(-spread, spread)); } while (devs.reduce((a, b) => a + b, 0) % n !== 0);
    const vals = devs.map((x) => base + x), avg = base + devs.reduce((a, b) => a + b, 0) / n;
    const m = mcq(R, avg, [avg + 1, avg - 1, avg + 2, base, avg - 2].map((x) => round(x, 2)), { valid: (x) => x !== avg });
    return { q: P(`Quelle est la moyenne de : ${big(vals.map((x) => fmt(x)).join(' ; '))} ?`), ...m, expl: steps(`On prend ${fmt(base)} comme base. Écarts : ${devs.map((x) => (x >= 0 ? '+' : MINUS) + Math.abs(x)).join(', ')}.`, `Somme des écarts : ${fmt(devs.reduce((a, b) => a + b, 0))} ; divisée par ${n} : ${fmt(devs.reduce((a, b) => a + b, 0) / n)}.`, `Moyenne : ${fmt(base)} ${devs.reduce((a, b) => a + b, 0) >= 0 ? '+' : MINUS} ${fmt(Math.abs(devs.reduce((a, b) => a + b, 0) / n))} = ${fmt(avg)}.`) + res(fmt(avg)), tip: '<b>Astuce des écarts :</b> beaucoup plus rapide que d\'additionner de gros nombres.' };
  }
  const n = R.int(3, 5), target = R.int(11, 15);
  let notes, miss; do { notes = Array.from({ length: n }, () => R.int(7, 18)); miss = target * (n + 1) - notes.reduce((a, b) => a + b, 0); } while (miss < 4 || miss > 20);
  const m = mcq(R, miss, [target, round(target * 2 - notes.reduce((a, b) => a + b, 0) / n, 1), miss + 1, miss - 2, miss + 3], { valid: (x) => x >= 0 });
  return { q: P(`${R.pick(NAMES)} a obtenu ${notes.join(', ')}. Quelle note doit-il obtenir au prochain devoir pour avoir exactement ${target} de moyenne ?`), ...m, expl: steps(`Avec ${n + 1} notes, il faut une somme de ${n + 1} ${X} ${target} = ${(n + 1) * target}.`, `Somme actuelle : ${notes.join(' + ')} = ${notes.reduce((a, b) => a + b, 0)}.`, `Il manque ${(n + 1) * target} ${MINUS} ${notes.reduce((a, b) => a + b, 0)} = ${miss}.`) + res(fmt(miss)) };
});
gen('moy.pond', { sub: 'calcul', ch: 'moy', name: 'Moyenne pondérée', target: 60 }, (R, d) => {
  const k = d === 1 ? 2 : d === 2 ? 3 : 4;
  let notes, coefs, S, C; do { notes = Array.from({ length: k }, () => R.int(6, 19)); coefs = Array.from({ length: k }, () => R.int(1, d === 1 ? 3 : 5)); S = notes.reduce((a, x, i) => a + x * coefs[i], 0); C = coefs.reduce((a, b) => a + b, 0); } while (S % C !== 0 && !(d === 3 && Number.isInteger(round(S / C * 2, 6))));
  const avg = round(S / C, 2);
  const simple = round(notes.reduce((a, b) => a + b, 0) / k, 2);
  const m = mcq(R, avg, [simple, round(avg + 1, 2), round(avg - 1, 2), round(S / k, 2)], { valid: (x) => x <= 20 });
  const rows = notes.map((x, i) => `${x} (coef. ${coefs[i]})`).join(', ');
  return { q: P(`Un étudiant obtient ${rows}. Quelle est sa moyenne ?`), ...m, expl: steps(`Somme pondérée : ${notes.map((x, i) => `${x} ${X} ${coefs[i]}`).join(' + ')} = ${S}.`, `Somme des coefficients : ${coefs.join(' + ')} = ${C}.`, `Moyenne : ${S} ${DV} ${C} = ${fmt(avg)}.`) + res(fmt(avg)), trap: `<b>Piège :</b> la moyenne simple (${fmt(simple)}) ignore les coefficients.` };
});
gen('moy.groupes', { sub: 'calcul', ch: 'moy', name: 'Moyenne de deux groupes', target: 65 }, (R, d) => {
  if (d < 3) {
    let n1, n2, m1, m2, avg; do { n1 = R.int(5, 30); n2 = R.int(5, 30); m1 = R.int(8, 16); m2 = R.int(8, 16); avg = (n1 * m1 + n2 * m2) / (n1 + n2); } while (m1 === m2 || !Number.isInteger(round(avg * (d === 1 ? 1 : 2), 6)));
    const m = mcq(R, avg, [(m1 + m2) / 2, avg + 0.5, avg - 1, Math.max(m1, m2) - 0.5].map((x) => round(x, 2)));
    return { q: P(`Dans une classe, les ${n1} filles ont une moyenne de ${m1} et les ${n2} garçons une moyenne de ${m2}. Quelle est la moyenne de la classe ?`), ...m, expl: steps(`Somme des notes des filles : ${n1} ${X} ${m1} = ${n1 * m1}. Des garçons : ${n2} ${X} ${m2} = ${n2 * m2}.`, `Total : ${n1 * m1 + n2 * m2} points pour ${n1 + n2} élèves.`, `Moyenne : ${n1 * m1 + n2 * m2} ${DV} ${n1 + n2} = ${fmt(avg)}.`) + res(fmt(avg)), trap: `<b>Piège :</b> ${fmt((m1 + m2) / 2)} (moyenne des deux moyennes) ignore la taille des groupes.` };
  }
  let f, mF, mG, M, g; do { f = R.int(6, 24); mF = R.int(12, 16); mG = R.int(7, 11); M = R.int(mG + 1, mF - 1); g = f * (mF - M) / (M - mG); } while (!Number.isInteger(g) || g < 3 || g > 40);
  const m = mcq(R, g, [f, Math.round(f * (M - mG) / (mF - M)) || g + 3, g + 2, g - 3, f + g], { valid: (x) => Number.isInteger(x) && x > 0 });
  return { q: P(`Une classe a ${M} de moyenne. Les ${f} filles ont ${mF} de moyenne et les garçons ${mG}. Combien y a-t-il de garçons ?`), ...m, expl: steps(`Soit g le nombre de garçons : ${f} ${X} ${mF} + ${mG}g = ${M}(${f} + g).`, `${f * mF} + ${mG}g = ${M * f} + ${M}g → ${f * mF - M * f} = ${cx(M - mG, 'g')}.`, M - mG === 1 ? `Donc g = ${g}.` : `g = ${f * mF - M * f} ${DV} ${M - mG} = ${g}.`) + res(fmt(g)), tip: '<b>Astuce :</b> chaque fille est à +' + (mF - M) + ' de la moyenne, chaque garçon à −' + (M - mG) + '. Les écarts doivent se compenser.' };
});
gen('moy.ajout', { sub: 'calcul', ch: 'moy', name: 'Ajouter ou retirer des valeurs', target: 55 }, (R, d) => {
  const n = R.int(5, 12), a = R.int(10, 20), S = n * a;
  if (d === 1) {
    let x, na; do { x = R.int(a - 10, a + 25); na = (S + x) / (n + 1); } while (!Number.isInteger(na) || x === a);
    const m = mcq(R, na, [(a + x) / 2, a + 1, na + 1, na - 1].map((v) => round(v, 2)));
    return { q: P(`La moyenne de ${n} nombres est ${a}. On ajoute le nombre ${x}. Quelle est la nouvelle moyenne ?`), ...m, expl: steps(`Somme des ${n} nombres : ${n} ${X} ${a} = ${S}.`, `Nouvelle somme : ${S} + ${x} = ${S + x}, pour ${n + 1} nombres.`, `${S + x} ${DV} ${n + 1} = ${fmt(na)}.`) + res(fmt(na)) };
  }
  if (d === 2) {
    let x, na; do { x = R.int(a - 10, a + 20); na = (S - x) / (n - 1); } while (!Number.isInteger(na) || x === a);
    const m = mcq(R, na, [a - (x - a) / n, (S - x) / n, na + 1, na - 1].map((v) => round(v, 2)));
    return { q: P(`La moyenne de ${n} nombres est ${a}. On retire le nombre ${x}. Quelle est la moyenne des nombres restants ?`), ...m, expl: steps(`Somme : ${n} ${X} ${a} = ${S}.`, `Après retrait : ${S} ${MINUS} ${x} = ${S - x}, pour ${n - 1} nombres.`, `${S - x} ${DV} ${n - 1} = ${fmt(na)}.`) + res(fmt(na)) };
  }
  const n0 = R.pick([10, 12, 20]), a0 = R.int(12, 20), k = R.pick([2, 4]), mk = R.int(8, 14);
  const na = round((n0 * a0 - k * mk) / (n0 - k), 2);
  const m = mcq(R, na, [round(a0 + (a0 - mk) / 2, 2), round((n0 * a0 - mk) / (n0 - 1), 2), round(na + 0.5, 2), a0], {});
  return { q: P(`La moyenne de ${n0} valeurs est ${a0}. On retire ${k} valeurs dont la moyenne est ${mk}. Quelle est la moyenne des valeurs restantes ?`), ...m, expl: steps(`Somme totale : ${n0} ${X} ${a0} = ${n0 * a0}. Somme retirée : ${k} ${X} ${mk} = ${k * mk}.`, `Il reste ${n0 * a0 - k * mk} pour ${n0 - k} valeurs.`, `${n0 * a0 - k * mk} ${DV} ${n0 - k} = ${fmt(na)}.`) + res(fmt(na)) };
});

/* ---------------- Chapitre 9 : Équations & mise en équation ---------------- */
chapter({
  id: 'eq', sub: 'calcul', order: 9, title: 'Équations & mise en équation', short: 'Équations',
  lesson: `
<h3><span class="hl">1. Résoudre une équation du 1er degré</span></h3>
<p>Le but : isoler x. Tout ce qu'on fait d'un côté, on le fait de l'autre.</p>
<div class="formula">3x − 7 = 2x + 5 &nbsp;→&nbsp; 3x − 2x = 5 + 7 &nbsp;→&nbsp; x = 12</div>
<p>Avec des fractions, on multiplie tout par le dénominateur commun : ${F('x', 3)} + ${F('x', 4)} = 14 → (× 12) 4x + 3x = 168 → 7x = 168 → x = 24.</p>
<h3><span class="hl">2. Les systèmes de deux équations</span></h3>
<p><b>Par combinaison</b> : x + y = 30 et x − y = 8. On additionne : 2x = 38 → x = 19, puis y = 11.</p>
<div class="tip"><b>Astuce Tage Mage :</b> on demande souvent x + y, pas x et y séparément. 2x + 3y = 23 et 3x + 2y = 22 : on additionne → 5x + 5y = 45 → <b>x + y = 9</b>, sans résoudre !</div>
<h3><span class="hl">3. Mettre un problème en équation</span></h3>
<ol><li>Nommer l'inconnue (« soit x le nombre de lapins »).</li><li>Traduire chaque phrase en égalité.</li><li>Résoudre.</li><li>Vérifier avec l'énoncé (et regarder les réponses proposées : tester est parfois plus rapide !).</li></ol>
<div class="ex"><b>Poules et lapins</b><span>35 têtes, 94 pattes. Si tout était poule : 70 pattes. Il y a 24 pattes en trop, et chaque lapin en apporte 2 de plus → <b>12 lapins</b>.</span></div>
<div class="ex"><b>Âges</b><span>Un père a 3 fois l'âge de son fils. Dans 12 ans, il aura 2 fois son âge. Fils : f ; père : 3f.</span><span>3f + 12 = 2(f + 12) → 3f + 12 = 2f + 24 → <b>f = 12</b>.</span></div>
<div class="trap"><b>Piège des âges :</b> dans X ans, les DEUX personnes vieillissent de X ans.</div>
<h3><span class="hl">4. Le second degré (les cas utiles)</span></h3>
<p>(x − 2)(x − 3) = 0 ⇔ x = 2 ou x = 3. Pour x² − 5x + 6 = 0, on cherche deux nombres de <b>somme 5</b> et de <b>produit 6</b> : 2 et 3.</p>
<h3><span class="hl">5. Les inéquations</span></h3>
<div class="trap"><b>Règle d'or :</b> si on multiplie ou divise par un nombre <b>négatif</b>, on <b>retourne</b> le signe. −2x &gt; 6 ⇔ x &lt; −3.</div>`,
});

gen('eq.lin', { sub: 'calcul', ch: 'eq', name: 'Équations du 1er degré', target: 50 }, (R, d) => {
  const x = R.int(-9, 15) || 4;
  if (d === 1) {
    const a = R.int(2, 9), b = R.intNot(-20, 20, [0]), c = a * x + b;
    const m = mcq(R, x, [(c + b) / a, (c - b) * a, c - b, -x, x + 1].map((v) => round(v, 2)), { positive: false });
    return { q: P(`Résoudre : ${big(`${a}x ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} = ${fmt(c)}`)}`), ...m, expl: steps(`On passe ${b >= 0 ? '+' : MINUS}${Math.abs(b)} de l'autre côté : ${a}x = ${fmt(c)} ${b >= 0 ? MINUS : '+'} ${Math.abs(b)} = ${fmt(c - b)}.`, `On divise par ${a} : x = ${fmt(x)}.`) + res('x = ' + fmt(x)) };
  }
  if (d === 2) {
    let a, c2; do { a = R.int(2, 9); c2 = R.int(1, 8); } while (a === c2);
    const b = R.int(-15, 15), dd = (a - c2) * x + b;
    const m = mcq(R, x, [(dd + b) / (a - c2), (dd - b) / (a + c2), -x, x + 2, (dd - b) / a].map((v) => round(v, 2)), { positive: false, valid: (v) => Number.isInteger(v) });
    return { q: P(`Résoudre : ${big(`${a}x ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} = ${c2}x ${dd >= 0 ? '+' : MINUS} ${Math.abs(dd)}`)}`), ...m, expl: steps(`Les x à gauche, les nombres à droite : ${a}x ${MINUS} ${c2}x = ${fmt(dd)} ${b >= 0 ? MINUS : '+'} ${Math.abs(b)}.`, `${cx(a - c2)} = ${fmt(dd - b)}.`, a - c2 === 1 ? '' : `x = ${fmt(dd - b)} ${DV} ${a - c2} = ${fmt(x)}.`) + res('x = ' + fmt(x)) };
  }
  const [p, q] = R.pick([[3, 4], [2, 3], [4, 6], [2, 5], [3, 6], [5, 10]]);
  const L = lcm(p, q), k = R.int(1, 6), X0 = L * k, c = X0 / p + X0 / q;
  const m = mcq(R, X0, [c * 2, round(c * p * q / (p + q) + 1, 2), X0 + L, X0 - L, round(c / 2, 2)], { valid: (v) => v > 0 });
  return { q: P(`Résoudre : ${big(`${F('x', p)} + ${F('x', q)} = ${fmt(c)}`)}`), ...m, expl: steps(`On multiplie tout par ${L} : ${L / p}x + ${L / q}x = ${fmt(c * L)}.`, `${L / p + L / q}x = ${fmt(c * L)}.`, `x = ${fmt(c * L)} ${DV} ${L / p + L / q} = ${fmt(X0)}.`) + res('x = ' + fmt(X0)) };
});
gen('eq.sys', { sub: 'calcul', ch: 'eq', name: 'Systèmes de deux équations', target: 65 }, (R, d) => {
  if (d === 1) {
    const x = R.int(5, 40), y = R.int(1, x - 1), S = x + y, D = x - y, askX = R.chance(0.5), val = askX ? x : y;
    const m = mcq(R, val, [askX ? y : x, S / 2, D, val + 1, val - 2], { valid: Number.isInteger });
    return { q: P(`Deux nombres ont pour somme ${S} et pour différence ${D}. Quel est le ${askX ? 'plus grand' : 'plus petit'} ?`), ...m, expl: steps(`x + y = ${S} et x ${MINUS} y = ${D}.`, `En additionnant : 2x = ${S + D}, donc x = ${x}.`, `y = ${S} ${MINUS} ${x} = ${y}.`) + res(fmt(val)) };
  }
  if (d === 2) {
    const x = R.int(1, 12), y = R.int(1, 12), a = R.int(1, 5), b = R.int(1, 5), c = R.int(1, 5), e = R.int(1, 5);
    if (a * e - b * c === 0) return TM.gens['eq.sys'].make(R, 1);
    const r1 = a * x + b * y, r2 = c * x + e * y, askX = R.chance(0.5), val = askX ? x : y;
    const m = mcq(R, val, [askX ? y : x, val + 1, val - 1, val + 2, Math.abs(r1 - r2)], { valid: (v) => Number.isInteger(v) && v > 0, fill: (RR) => RR.int(1, 24) });
    return { q: P(`On sait que ${big(`${cx(a)} + ${cx(b, 'y')} = ${r1}`)} et ${big(`${cx(c)} + ${cx(e, 'y')} = ${r2}`)}. Combien vaut ${askX ? 'x' : 'y'} ?`), ...m, expl: steps(`On élimine ${askX ? 'y' : 'x'} en combinant les deux équations (ou on remplace).`, `On trouve x = ${x} et y = ${y}.`, `Vérification : ${a} ${X} ${x} + ${b} ${X} ${y} = ${r1} ✔ et ${c} ${X} ${x} + ${e} ${X} ${y} = ${r2} ✔.`) + res(fmt(val)), tip: '<b>Astuce :</b> tester les réponses proposées dans les deux équations est souvent plus rapide.' };
  }
  let a, b, x, y; do { a = R.int(2, 7); b = R.int(1, 6); x = R.int(1, 15); y = R.int(1, 15); } while (a === b);
  const r1 = a * x + b * y, r2 = b * x + a * y, s = x + y;
  const m = mcq(R, s, [x, y, s + 1, Math.abs(x - y) || s + 3, s * 2], { valid: Number.isInteger });
  return { q: P(`Si ${big(`${cx(a)} + ${cx(b, 'y')} = ${r1}`)} et ${big(`${cx(b)} + ${cx(a, 'y')} = ${r2}`)}, combien vaut x + y ?`), ...m, expl: steps(`On additionne les deux équations : ${cx(a + b)} + ${cx(a + b, 'y')} = ${r1 + r2}.`, `Donc ${a + b}(x + y) = ${r1 + r2}, et x + y = ${r1 + r2} ${DV} ${a + b} = ${s}.`) + res(fmt(s)), tip: '<b>Inutile de trouver x et y !</b> Repère la symétrie et additionne.' };
});
gen('eq.pb', { sub: 'calcul', ch: 'eq', name: 'Problèmes à mettre en équation', target: 75 }, (R, d) => {
  const t = d === 1 ? 0 : d === 2 ? R.int(0, 2) : R.int(1, 3);
  if (t === 0) {
    const lap = R.int(3, 25), pou = R.int(3, 25), tetes = lap + pou, pattes = 4 * lap + 2 * pou;
    const m = mcq(R, lap, [pou, tetes / 2, (pattes - 2 * tetes), lap + 2, lap - 3], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Dans une ferme, on compte ${tetes} têtes et ${pattes} pattes, uniquement des poules et des lapins. Combien y a-t-il de lapins ?`), ...m, expl: steps(`Si tous les animaux étaient des poules : ${tetes} ${X} 2 = ${2 * tetes} pattes.`, `Il y a ${pattes} ${MINUS} ${2 * tetes} = ${pattes - 2 * tetes} pattes en trop ; chaque lapin en ajoute 2.`, `Lapins : ${pattes - 2 * tetes} ${DV} 2 = ${lap}.`) + res(fmt(lap)) };
  }
  if (t === 1) {
    const n10 = R.int(2, 20), n20 = R.int(2, 20), n = n10 + n20, tot = 10 * n10 + 20 * n20;
    const m = mcq(R, n20, [n10, n / 2, tot / 20, n20 + 1, n20 - 2], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Une caissière a ${n} billets de 10 € et de 20 €, pour un total de ${eur(tot)}. Combien a-t-elle de billets de 20 € ?`), ...m, expl: steps(`Si tous étaient des billets de 10 € : ${10 * n} €.`, `Il manque ${tot} ${MINUS} ${10 * n} = ${tot - 10 * n} € ; chaque billet de 20 € apporte 10 € de plus.`, `${tot - 10 * n} ${DV} 10 = ${n20} billets de 20 €.`) + res(fmt(n20)) };
  }
  if (t === 2) {
    const c = R.pick([1.2, 1.4, 1.5, 1.8, 2, 2.5]), k = R.pick([0.9, 1.1, 1.2, 1.3, 1.5, 1.6]);
    const a1 = R.int(2, 4), b1 = R.int(1, 3), a2 = R.int(1, 3), b2 = R.int(2, 4);
    if (a1 * b2 === a2 * b1) return TM.gens['eq.pb'].make(R, 2);
    const p1 = round(a1 * c + b1 * k, 2), p2 = round(a2 * c + b2 * k, 2);
    const m = mcq(R, c, [k, round(p1 / (a1 + b1), 2), round(c + 0.1, 2), round(c - 0.2, 2)], { render: eur2 });
    return { q: P(`${a1} cafés et ${b1} croissant${b1 > 1 ? 's' : ''} coûtent ${eur2(p1)}. ${a2} café${a2 > 1 ? 's' : ''} et ${b2} croissants coûtent ${eur2(p2)}. Quel est le prix d'un café ?`), ...m, expl: steps(`Soit c le prix d'un café et k celui d'un croissant : ${a1}c + ${b1}k = ${fmt(p1)} et ${a2}c + ${b2}k = ${fmt(p2)}.`, `On résout (par combinaison ou en testant les réponses) : c = ${fmt(c)} et k = ${fmt(k)}.`, `Vérification : ${a1} ${X} ${fmt(c)} + ${b1} ${X} ${fmt(k)} = ${fmt(p1)} ✔.`) + res(eur2(c)) };
  }
  const plein = R.pick([10, 12, 9, 11]), red = plein - R.pick([3, 4, 5]), np = R.int(20, 80), nr = R.int(20, 80), tot = np * plein + nr * red;
  const m = mcq(R, nr, [np, Math.round((np + nr) / 2), nr + 5, nr - 5], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Un cinéma vend des places à ${eur(plein)} (plein tarif) et ${eur(red)} (tarif réduit). Il a vendu ${np + nr} places pour une recette de ${eur(tot)}. Combien de places à tarif réduit a-t-il vendues ?`), ...m, expl: steps(`Si toutes les places étaient à plein tarif : ${np + nr} ${X} ${plein} = ${(np + nr) * plein} €.`, `Écart : ${(np + nr) * plein} ${MINUS} ${tot} = ${(np + nr) * plein - tot} € ; chaque place réduite coûte ${plein - red} € de moins.`, `${(np + nr) * plein - tot} ${DV} ${plein - red} = ${nr} places réduites.`) + res(fmt(nr)) };
});
gen('eq.age', { sub: 'calcul', ch: 'eq', name: 'Problèmes d\'âges', target: 70 }, (R, d) => {
  if (d === 1) {
    const s = R.int(5, 20), k = R.int(2, 4), dlt = (k - 1) * s, sum = s + k * s;
    const m = mcq(R, s, [k * s, sum / 2, s + 2, s - 2, dlt], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Une mère a ${k} fois l'âge de sa fille. À elles deux, elles ont ${sum} ans. Quel âge a la fille ?`), ...m, expl: steps(`Fille : f ; mère : ${k}f. Donc f + ${k}f = ${sum}.`, `${k + 1}f = ${sum} → f = ${s}.`) + res(plural(s, 'an')) };
  }
  if (d === 2) {
    let f, k, j, n; do { f = R.int(4, 20); k = R.int(3, 5); j = k - 1 >= 2 ? R.int(2, k - 1) : 2; n = (k - j) * f / (j - 1); } while (!Number.isInteger(n) || n <= 0 || n > 30 || j >= k);
    const m = mcq(R, f, [k * f, f + n, n, f + 2, f - 2], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Un père a ${k} fois l'âge de son fils. Dans ${n} ans, il aura ${j} fois l'âge de son fils. Quel âge a le fils aujourd'hui ?`), ...m, expl: steps(`Fils : f ; père : ${k}f. Dans ${n} ans : ${k}f + ${n} = ${j}(f + ${n}).`, `${k}f + ${n} = ${j}f + ${j * n} → ${k - j}f = ${j * n - n}.`, `f = ${j * n - n} ${DV} ${k - j} = ${f}.`) + res(plural(f, 'an')), trap: `<b>Piège :</b> dans ${n} ans, le fils aussi a vieilli de ${n} ans.` };
  }
  let a, b; do { a = R.int(25, 50); b = R.int(3, 18); } while (a - 2 * b <= 0 || a - 2 * b > 30);
  const X0 = a - 2 * b;
  const m = mcq(R, X0, [a - b, Math.round(a / 2) - b + 1, X0 + 3, X0 - 2, b], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Paul a ${a} ans et sa fille ${b} ans. Dans combien d'années Paul aura-t-il exactement le double de l'âge de sa fille ?`), ...m, expl: steps(`Dans x ans : ${a} + x = 2(${b} + x).`, `${a} + x = ${2 * b} + 2x → x = ${a} ${MINUS} ${2 * b} = ${X0}.`, `Vérification : ${a + X0} = 2 ${X} ${b + X0} ✔.`) + res(plural(X0, 'an')) };
});
gen('eq.deg2', { sub: 'calcul', ch: 'eq', name: 'Second degré (cas simples)', target: 70, diffs: [2, 3] }, (R, d) => {
  let r1, r2; do { r1 = R.int(-9, 9); r2 = R.int(-9, 9); } while (r1 === r2 || r1 === 0 || r2 === 0 || r1 + r2 === 0);
  const s = r1 + r2, p = r1 * r2;
  const poly = `x² ${s >= 0 ? MINUS : '+'} ${Math.abs(s) === 1 ? '' : Math.abs(s)}x ${p >= 0 ? '+' : MINUS} ${Math.abs(p)} = 0`.replace('  ', ' ');
  if (d === 2) {
    const val = Math.max(r1, r2);
    const m = mcq(R, val, [Math.min(r1, r2), -val, s, p, val + 1], { positive: false, valid: Number.isInteger });
    return { q: P(`Quelle est la plus grande solution de ${big(poly)} ?`), ...m, expl: steps(`On cherche deux nombres de somme ${fmt(s)} et de produit ${fmt(p)}.`, `Ce sont ${fmt(r1)} et ${fmt(r2)} : (x ${r1 >= 0 ? MINUS : '+'} ${Math.abs(r1)})(x ${r2 >= 0 ? MINUS : '+'} ${Math.abs(r2)}) = 0.`, `La plus grande solution est ${fmt(val)}.`) + res(fmt(val)) };
  }
  const askS = R.chance(0.5), val = askS ? s : p;
  const m = mcq(R, val, [askS ? -s : -p, askS ? p : s, val + 1, val - 2], { positive: false, valid: Number.isInteger });
  return { q: P(`${askS ? 'Quelle est la somme' : 'Quel est le produit'} des solutions de ${big(poly)} ?`), ...m, expl: steps(`Pour x² ${MINUS} Sx + P = 0, la somme des solutions vaut S et leur produit vaut P.`, `Ici les solutions sont ${fmt(r1)} et ${fmt(r2)} : somme ${fmt(s)}, produit ${fmt(p)}.`) + res(fmt(val)), trap: '<b>Piège :</b> le signe. Dans x² − 5x + 6, la somme vaut +5 (et non −5).' };
});
gen('eq.ineq', { sub: 'calcul', ch: 'eq', name: 'Inéquations', target: 60 }, (R, d) => {
  if (d < 3) {
    const a = d === 1 ? R.int(2, 9) : -R.int(2, 9), b = R.int(-15, 15), lim = R.int(-5, 10), c = a * lim + b + (d === 1 ? R.int(1, Math.abs(a) - 1 || 1) : -R.int(1, Math.abs(a) - 1 || 1));
    const bound = (c - b) / a;
    const val = d === 1 ? Math.ceil(bound) - 1 : Math.floor(bound) + 1;
    const ask = d === 1 ? 'le plus grand entier x' : 'le plus petit entier x';
    const sign = '&lt;';
    const m = mcq(R, val, [val + 1, val - 1, -val, Math.round(bound) + 2], { positive: false, valid: Number.isInteger });
    return { q: P(`Quel est ${ask} tel que ${big(`${cx(a)} ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} ${sign} ${fmt(c)}`)} ?`), ...m, expl: steps(`${cx(a)} ${sign} ${fmt(c)} ${b >= 0 ? MINUS : '+'} ${Math.abs(b)} = ${fmt(c - b)}.`, d === 1 ? `On divise par ${a} (positif, le sens ne change pas) : x &lt; ${fmt(round(bound, 3))}.` : `On divise par ${fmt(a)} (NÉGATIF, on retourne le sens) : x &gt; ${fmt(round(bound, 3))}.`, `${d === 1 ? 'Le plus grand' : 'Le plus petit'} entier qui convient est ${val}.`) + res(fmt(val)), trap: d === 2 ? '<b>Piège :</b> oublier de retourner le signe en divisant par un négatif.' : '' };
  }
  const a = R.pick([2, 3]), b = R.int(-5, 5), lo = R.int(-12, 0), hi = R.int(3, 18);
  const xs = []; for (let x = -50; x <= 50; x++) { const v = a * x + b; if (v > lo && v <= hi) xs.push(x); }
  const val = xs.length;
  const m = mcq(R, val, [val + 1, val - 1, hi - lo, Math.round((hi - lo) / a)], { valid: (v) => Number.isInteger(v) && v > 0, fill: (RR) => val + RR.int(-6, 9) });
  return { q: P(`Combien d'entiers x vérifient ${big(`${fmt(lo)} &lt; ${a}x ${b >= 0 ? '+' : MINUS} ${Math.abs(b)} ≤ ${hi}`)} ?`), ...m, expl: steps(`${b >= 0 ? 'On retire ' + b : 'On ajoute ' + Math.abs(b)} partout : ${fmt(lo - b)} &lt; ${a}x ≤ ${fmt(hi - b)}.`, `On divise par ${a} : ${fmt(round((lo - b) / a, 3))} &lt; x ≤ ${fmt(round((hi - b) / a, 3))}.`, `Entiers possibles : ${xs.join(', ')}, soit ${val}.`) + res(fmt(val)), tip: '<b>Attention aux bornes :</b> &lt; exclut, ≤ inclut.' };
});
