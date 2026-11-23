/* ===== Exercices guidés pas à pas (calcul) ===== */
TM.guides = {};
function guide(id, meta, make) { TM.guides[id] = Object.assign({ id, make }, meta); }
const guidesOf = (chId) => Object.values(TM.guides).filter((g) => g.ch === chId);
function parseNum(s) {
  const t = normAns(s);
  if (!t) return NaN;
  if (t.includes('/')) { const [a, b] = t.split('/'); const x = parseFloat(a.replace(',', '.')), y = parseFloat((b || '').replace(',', '.')); return y ? x / y : NaN; }
  return /^-?\d+(,\d+)?$/.test(t) ? Number(t.replace(',', '.')) : NaN;
}
function sameAns(inp, exp) {
  const a = parseNum(inp), b = parseNum(exp);
  if (isFinite(a) && isFinite(b)) return Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
  return normAns(inp) === normAns(exp);
}
const divHint = (d, t) => (Number.isInteger(t * 4) && !Number.isInteger(t) ? `Pour diviser par ${fmt(t)}, multiplie les deux nombres par 4 : ${fmt(d)} ${DV} ${fmt(t)} = ${fmt(d * 4)} ${DV} ${fmt(t * 4)}.` : `Pose la division ${fmt(d)} ${DV} ${fmt(t)}.`);

guide('g.vit.duree', { ch: 'vit', name: 'Convertir une durée puis trouver la vitesse' }, (R) => {
  const [h, m] = R.pick([[1, 15], [1, 30], [0, 45], [2, 15], [1, 45], [2, 30], [0, 30], [3, 15]]);
  const t = h + m / 60;
  let v, d; do { v = R.int(4, 26) * 5; d = round(v * t, 6); } while (!Number.isInteger(d));
  const who = v <= 35 ? 'Un cycliste' : 'Une voiture';
  return {
    q: `${who} parcourt ${unit(d, 'km')} en ${hm(t)}. Quelle est sa vitesse moyenne ?`,
    steps: [
      { p: `Convertis ${m} minutes en heure décimale (minutes ${DV} 60).`, a: cn(m / 60), u: 'h', hint: `${m} ${DV} 60 = ${F(m, 60)} = ${frH(m, 60)} d'heure. Écris-le en décimal.` },
      h ? { p: `Donc ${hm(t)} correspond à combien d'heures ?`, a: cn(t), u: 'h', hint: `${h} h + ${fmt(m / 60)} h.` } : null,
      { p: `Vitesse = distance ${DV} temps. Calcule ${fmt(d)} ${DV} ${fmt(t)}.`, a: cn(v), u: 'km/h', hint: divHint(d, t) },
    ].filter(Boolean),
    end: `La vitesse moyenne est de <b>${v} km/h</b>. À retenir : ${hm(t)} = <b>${fmt(t)} h</b>, et non ${h},${String(m).padStart(2, '0')} h.`,
  };
});
guide('g.vit.moy', { ch: 'vit', name: 'Vitesse moyenne d\'un aller-retour' }, (R) => {
  const [v1, v2] = R.shuffle(R.pick([[60, 40], [90, 60], [120, 80], [30, 20], [100, 150], [50, 75], [45, 90], [60, 90]]));
  const D = lcm(v1, v2), t1 = D / v1, t2 = D / v2, T = t1 + t2, vm = 2 * D / T;
  return {
    q: `Un automobiliste fait l'aller (${D} km) à ${v1} km/h, puis le retour (${D} km) à ${v2} km/h. Quelle est sa vitesse moyenne sur l'aller-retour ?`,
    steps: [
      { p: `Durée de l'aller : ${D} ${DV} ${v1} = ?`, a: cn(t1), u: 'h', hint: 'temps = distance ÷ vitesse' },
      { p: `Durée du retour : ${D} ${DV} ${v2} = ?`, a: cn(t2), u: 'h', hint: 'temps = distance ÷ vitesse' },
      { p: 'Distance totale parcourue (aller + retour) ?', a: cn(2 * D), u: 'km', hint: `${D} + ${D}` },
      { p: 'Durée totale ?', a: cn(T), u: 'h', hint: `${t1} + ${t2}` },
      { p: 'Vitesse moyenne = distance totale ÷ durée totale = ?', a: cn(vm), u: 'km/h', hint: `${2 * D} ${DV} ${T}` },
    ],
    end: `La vitesse moyenne est de <b>${vm} km/h</b>, et non ${fmt((v1 + v2) / 2)} km/h. On passe plus de temps à la vitesse la plus lente, donc la moyenne penche de son côté. Raccourci : ${F(`2 ${X} ${v1} ${X} ${v2}`, `${v1} + ${v2}`)} = ${vm}.`,
  };
});
guide('g.vit.croise', { ch: 'vit', name: 'Deux véhicules qui se croisent' }, (R) => {
  const t = R.pick([1.5, 2, 2.5, 3, 0.5, 1]);
  let v1, v2; do { v1 = R.int(4, 12) * 10; v2 = R.int(4, 12) * 10; } while (v1 === v2 || !Number.isInteger(round((v1 + v2) * t, 6)));
  const D = (v1 + v2) * t;
  return {
    q: `A et B sont distantes de ${unit(D, 'km')}. Une voiture part de A vers B à ${v1} km/h ; au même moment, une autre part de B vers A à ${v2} km/h. À quelle distance de A se croisent-elles ?`,
    steps: [
      { p: 'De combien de kilomètres se rapprochent-elles chaque heure ?', a: cn(v1 + v2), u: 'km/h', hint: 'Elles roulent l\'une vers l\'autre : on additionne les vitesses.' },
      { p: `Au bout de combien d'heures se croisent-elles ? (${fmt(D)} ${DV} ${v1 + v2})`, a: cn(t), u: 'h', hint: 'temps = distance ÷ vitesse de rapprochement' },
      { p: `Quelle distance a parcourue la voiture partie de A ? (${v1} ${X} ${fmt(t)})`, a: cn(v1 * t), u: 'km', hint: 'distance = vitesse × temps' },
    ],
    end: `Elles se croisent à <b>${fmt(v1 * t)} km de A</b>, au bout de ${hm(t)}. Vérification : l'autre a parcouru ${v2} ${X} ${fmt(t)} = ${fmt(v2 * t)} km, et ${fmt(v1 * t)} + ${fmt(v2 * t)} = ${fmt(D)} km ✔.`,
  };
});
guide('g.vit.rattrape', { ch: 'vit', name: 'Rattraper un véhicule' }, (R) => {
  const [v1, v2, lag] = R.pick([[60, 90, 1], [40, 60, 0.5], [80, 120, 1], [50, 75, 1], [90, 120, 0.5], [15, 20, 1], [70, 105, 1]]);
  const adv = v1 * lag, tc = adv / (v2 - v1);
  return {
    q: `Une voiture part à ${v1} km/h. ${hm(lag)} plus tard, une seconde voiture part du même endroit, sur la même route, à ${v2} km/h. Au bout de combien de temps (après son départ) la seconde rattrape-t-elle la première ?`,
    steps: [
      { p: `Quelle avance a la première voiture au départ de la seconde ? (${v1} ${X} ${fmt(lag)})`, a: cn(adv), u: 'km', hint: 'distance = vitesse × temps' },
      { p: 'De combien de kilomètres la seconde se rapproche-t-elle chaque heure ?', a: cn(v2 - v1), u: 'km/h', hint: 'Même sens : on soustrait les vitesses.' },
      { p: `Temps pour combler l'avance, en heures (${fmt(adv)} ${DV} ${v2 - v1}) ?`, a: cn(tc), u: 'h', hint: 'temps = avance ÷ vitesse de rapprochement' },
      { p: 'Ce temps, en minutes ?', a: cn(tc * 60), u: 'min', hint: `${fmt(tc)} ${X} 60` },
    ],
    end: `La seconde voiture rattrape la première au bout de <b>${hm(tc)}</b>.`,
  };
});
guide('g.pct.evol', { ch: 'pct', name: 'Calculer un taux d\'évolution' }, (R) => {
  const t = R.pick([10, 20, 25, 15, 40, -10, -20, -25, -15, -40, 50]);
  let V1; do { V1 = R.int(2, 40) * 10; } while (!Number.isInteger(round(V1 * (1 + t / 100), 6)));
  const V2 = round(V1 * (1 + t / 100), 4);
  return {
    q: `Le prix d'un abonnement passe de ${eur(V1)} à ${eur(V2)}. Quel est le taux d'évolution ?`,
    steps: [
      { p: 'Quelle est la variation (prix final − prix initial) ?', a: cn(V2 - V1), u: '€', hint: `${fmt(V2)} ${MINUS} ${fmt(V1)} (le résultat peut être négatif)` },
      { p: `Divise cette variation par le prix de DÉPART (${fmt(V1)}).`, a: cn(round((V2 - V1) / V1, 6)), u: '', hint: `${fmt(V2 - V1)} ${DV} ${fmt(V1)}` },
      { p: 'Exprime ce nombre en pourcentage (× 100).', a: cn(t), u: '%', hint: 'Décale la virgule de 2 rangs vers la droite.' },
    ],
    end: `Le taux d'évolution est de <b>${sgnPc(t)}</b>. On divise TOUJOURS par la valeur de départ.`,
  };
});
guide('g.pct.succ', { ch: 'pct', name: 'Enchaîner deux évolutions' }, (R) => {
  const [t1, t2] = R.pick([[20, -20], [10, 10], [25, -20], [50, -20], [30, -30], [-10, -10], [40, -25], [20, 20]]);
  const c1 = round(1 + t1 / 100, 4), c2 = round(1 + t2 / 100, 4), c = round(c1 * c2, 6), tot = round((c - 1) * 100, 4);
  return {
    q: `Un prix évolue de ${sgnPc(t1)}, puis de ${sgnPc(t2)}. Quelle est l'évolution globale ?`,
    steps: [
      { p: `Coefficient multiplicateur de la 1re évolution (${sgnPc(t1)}) ?`, a: cn(c1), u: '', hint: `1 ${t1 > 0 ? '+' : MINUS} ${fmt(Math.abs(t1) / 100)}` },
      { p: `Coefficient de la 2e évolution (${sgnPc(t2)}) ?`, a: cn(c2), u: '', hint: `1 ${t2 > 0 ? '+' : MINUS} ${fmt(Math.abs(t2) / 100)}` },
      { p: 'Coefficient global = produit des deux ?', a: cn(c), u: '', hint: `${fmt(c1)} ${X} ${fmt(c2)}` },
      { p: 'Évolution globale en % ? (tape un nombre négatif pour une baisse)', a: cn(tot), u: '%', hint: `(${fmt(c)} ${MINUS} 1) ${X} 100` },
    ],
    end: `L'évolution globale est de <b>${sgnPc(tot)}</b>, et non ${sgnPc(t1 + t2)}. Les pourcentages qui s'enchaînent se MULTIPLIENT.`,
  };
});
guide('g.pct.init', { ch: 'pct', name: 'Retrouver un prix avant remise' }, (R) => {
  const t = R.pick([10, 20, 25, 40, 30]);
  let V0; do { V0 = R.int(4, 60) * 10; } while (!Number.isInteger(round(V0 * (1 - t / 100), 6)));
  const V = round(V0 * (1 - t / 100), 4), c = round(1 - t / 100, 4);
  return {
    q: `Après une remise de ${pc(t)}, un manteau coûte ${eur(V)}. Quel était son prix avant la remise ?`,
    steps: [
      { p: `Coefficient multiplicateur d'une baisse de ${pc(t)} ?`, a: cn(c), u: '', hint: `1 ${MINUS} ${fmt(t / 100)}` },
      { p: `Prix initial ${X} ${fmt(c)} = ${fmt(V)}. Donc prix initial = ${fmt(V)} ${DV} ${fmt(c)} = ?`, a: cn(V0), u: '€', hint: `Pour diviser par ${fmt(c)}, multiplie les deux nombres par ${Math.pow(10, decs(c))} : ${fmt(V * Math.pow(10, decs(c)))} ${DV} ${fmt(round(c * Math.pow(10, decs(c)), 6))}.` },
    ],
    end: `Le prix initial était de <b>${eur(V0)}</b>. Vérification : ${fmt(V0)} ${X} ${fmt(c)} = ${fmt(V)} ✔. Erreur classique : ${fmt(V)} ${X} ${fmt(1 + t / 100)} = ${fmt(round(V * (1 + t / 100), 2))}, faux !`,
  };
});
guide('g.frac.add', { ch: 'frac', name: 'Additionner deux fractions' }, (R) => {
  let b, d2; do { b = R.int(2, 9); d2 = R.int(2, 9); } while (b === d2);
  const cop = (dd) => { let n; do { n = R.int(1, dd - 1); } while (gcd(n, dd) !== 1); return n; };
  const a = cop(b), c = cop(d2), L = lcm(b, d2), n1 = a * L / b, n2 = c * L / d2, s = new Fr(n1 + n2, L);
  return {
    q: `Calcule ${F(a, b)} + ${F(c, d2)}.`,
    steps: [
      { p: `Quel est le plus petit multiple commun de ${b} et ${d2} (le dénominateur commun) ?`, a: cn(L), u: '', hint: `Liste les multiples de ${Math.max(b, d2)} : ${[1, 2, 3, 4].map((k) => k * Math.max(b, d2)).join(', ')}… et prends le premier divisible par ${Math.min(b, d2)}.` },
      { p: `${F(a, b)} = ${F('?', L)} : quel numérateur ?`, a: cn(n1), u: '', hint: `On a multiplié ${b} par ${L / b} : fais pareil avec ${a}.` },
      { p: `${F(c, d2)} = ${F('?', L)} : quel numérateur ?`, a: cn(n2), u: '', hint: `On a multiplié ${d2} par ${L / d2} : fais pareil avec ${c}.` },
      { p: `Somme des numérateurs : ${n1} + ${n2} = ?`, a: cn(n1 + n2), u: '', hint: 'On additionne les numérateurs, on garde le dénominateur.' },
      { p: `Écris le résultat sous forme de fraction simplifiée (touche « / »).`, a: s.txt(), u: '', hint: `${F(n1 + n2, L)} : divise le haut et le bas par ${gcd(n1 + n2, L)}${gcd(n1 + n2, L) === 1 ? ' (elle est déjà simplifiée)' : ''}.` },
    ],
    end: `${F(a, b)} + ${F(c, d2)} = ${F(n1, L)} + ${F(n2, L)} = ${s.html()}. Jamais ${F(a + c, b + d2)} !`,
  };
});
guide('g.moy.manque', { ch: 'moy', name: 'Trouver la note manquante' }, (R) => {
  const n = R.int(3, 4), target = R.int(11, 14);
  let notes, miss; do { notes = Array.from({ length: n }, () => R.int(7, 18)); miss = target * (n + 1) - notes.reduce((x, y) => x + y, 0); } while (miss < 5 || miss > 20);
  const S0 = notes.reduce((x, y) => x + y, 0);
  return {
    q: `Inès a eu ${notes.join(', ')}. Quelle note doit-elle avoir au prochain devoir pour obtenir exactement ${target} de moyenne ?`,
    steps: [
      { p: `Avec ${n + 1} notes, quelle somme faut-il pour avoir ${target} de moyenne ?`, a: cn(target * (n + 1)), u: 'points', hint: `somme = moyenne ${X} nombre de notes = ${target} ${X} ${n + 1}` },
      { p: 'Quelle est la somme de ses notes actuelles ?', a: cn(S0), u: 'points', hint: notes.join(' + ') },
      { p: 'Quelle note lui manque-t-il ?', a: cn(miss), u: '', hint: `${target * (n + 1)} ${MINUS} ${S0}` },
    ],
    end: `Elle doit avoir <b>${miss}</b>. La clé : <b>somme = moyenne × nombre</b>.`,
  };
});
guide('g.moy.groupes', { ch: 'moy', name: 'Moyenne de deux groupes' }, (R) => {
  let n1, n2, m1, m2, avg; do { n1 = R.int(5, 25); n2 = R.int(5, 25); m1 = R.int(8, 16); m2 = R.int(8, 16); avg = (n1 * m1 + n2 * m2) / (n1 + n2); } while (m1 === m2 || !Number.isInteger(avg));
  return {
    q: `Dans une classe, les ${n1} filles ont ${m1} de moyenne et les ${n2} garçons ont ${m2}. Quelle est la moyenne de la classe ?`,
    steps: [
      { p: 'Total des points des filles ?', a: cn(n1 * m1), u: 'points', hint: `${n1} ${X} ${m1}` },
      { p: 'Total des points des garçons ?', a: cn(n2 * m2), u: 'points', hint: `${n2} ${X} ${m2}` },
      { p: 'Total des points de la classe ?', a: cn(n1 * m1 + n2 * m2), u: 'points', hint: 'On additionne les deux totaux.' },
      { p: 'Nombre d\'élèves ?', a: cn(n1 + n2), u: '', hint: `${n1} + ${n2}` },
      { p: 'Moyenne de la classe ?', a: cn(avg), u: '', hint: `${n1 * m1 + n2 * m2} ${DV} ${n1 + n2}` },
    ],
    end: `La moyenne est <b>${avg}</b>, et non ${fmt((m1 + m2) / 2)} : le groupe le plus nombreux pèse plus lourd.`,
  };
});
guide('g.pb.tirage', { ch: 'proba', name: 'Deux tirages sans remise' }, (R) => {
  const r = R.int(3, 7), b = R.int(2, 6), n = r + b, p = new Fr(r * (r - 1), n * (n - 1));
  return {
    q: `Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire deux jetons, l'un après l'autre, sans remise. Quelle est la probabilité que les deux soient rouges ?`,
    steps: [
      { p: 'Probabilité que le 1er jeton soit rouge ? (écris une fraction, touche « / »)', a: `${r}/${n}`, u: '', hint: `cas favorables ÷ cas possibles = ${r} ÷ ${n}` },
      { p: 'Le 1er était rouge. Probabilité que le 2e soit rouge aussi ?', a: `${r - 1}/${n - 1}`, u: '', hint: `Il reste ${r - 1} rouges sur ${n - 1} jetons.` },
      { p: 'Probabilité des deux à la suite (on multiplie) ?', a: p.txt(), u: '', hint: `${F(r, n)} ${X} ${F(r - 1, n - 1)} = ${F(r * (r - 1), n * (n - 1))}, puis simplifie.` },
    ],
    end: `La probabilité vaut <b>${p.html()}</b>. Sans remise, le 2e tirage a un jeton de moins : les deux fractions changent.`,
  };
});
guide('g.trav.rob', { ch: 'trav', name: 'Deux robinets ensemble' }, (R) => {
  const [a, b] = R.shuffle(R.pick([[3, 6], [2, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [6, 3]]));
  const s = new Fr(1, a).add(new Fr(1, b)), t = a * b / (a + b);
  return {
    q: `Un robinet remplit une cuve en ${a} heures, un autre en ${b} heures. En combien de temps la remplissent-ils ensemble ?`,
    steps: [
      { p: 'Quelle fraction de la cuve le 1er robinet remplit-il en 1 heure ?', a: `1/${a}`, u: '', hint: `Il lui faut ${a} heures pour une cuve entière.` },
      { p: 'Et le 2e robinet, en 1 heure ?', a: `1/${b}`, u: '', hint: `Il lui faut ${b} heures.` },
      { p: 'Ensemble, quelle fraction de la cuve en 1 heure ?', a: s.txt(), u: '', hint: `${F(1, a)} + ${F(1, b)} : mets au même dénominateur (${lcm(a, b)}).` },
      { p: 'Combien d\'heures pour remplir la cuve entière ?', a: cn(t), u: 'h', hint: `Si on remplit ${s.html()} par heure, il faut ${s.inv().html()} heures.` },
    ],
    end: `Ensemble, il faut <b>${hm(t)}</b>. Formule rapide : ${F(`${a} ${X} ${b}`, `${a} + ${b}`)} = ${fmt(t)}. Toujours moins que le plus rapide seul !`,
  };
});
guide('g.prop.trois', { ch: 'prop', name: 'Règle de trois' }, (R) => {
  const p = R.pick([1.2, 1.5, 2.4, 1.6, 2.5, 0.8, 3.5]), q1 = R.int(3, 9); let q2; do { q2 = R.int(2, 15); } while (q2 === q1);
  const t1 = round(p * q1, 2), t2 = round(p * q2, 2);
  return {
    q: `${q1} kg de pommes coûtent ${eur2(t1)}. Combien coûtent ${q2} kg ?`,
    steps: [
      { p: 'Prix d\'un seul kilo ?', a: cn(p), u: '€', hint: `${fmt(t1)} ${DV} ${q1}` },
      { p: `Prix de ${q2} kg ?`, a: cn(t2), u: '€', hint: `${q2} ${X} ${fmt(p)}` },
    ],
    end: `${q2} kg coûtent <b>${eur2(t2)}</b>. Passer par l'unité est la méthode la plus sûre.`,
  };
});
guide('g.com.marge', { ch: 'com', name: 'Marge, taux de marge et de marque' }, (R) => {
  const [PA, PV] = R.pick([[80, 100], [120, 150], [50, 100], [40, 100], [50, 80], [100, 160], [80, 200], [200, 250], [25, 40]]);
  const mg = PV - PA;
  return {
    q: `Un article acheté ${eur(PA)} est revendu ${eur(PV)} hors taxes. Calcule la marge, le taux de marge et le taux de marque.`,
    steps: [
      { p: 'Marge = prix de vente − prix d\'achat = ?', a: cn(mg), u: '€', hint: `${PV} ${MINUS} ${PA}` },
      { p: 'Taux de marge = marge ÷ prix d\'ACHAT, en % ?', a: cn(round(mg / PA * 100, 4)), u: '%', hint: `${mg} ${DV} ${PA}, puis × 100` },
      { p: 'Taux de marque = marge ÷ prix de VENTE, en % ?', a: cn(round(mg / PV * 100, 4)), u: '%', hint: `${mg} ${DV} ${PV}, puis × 100` },
    ],
    end: `Marge ${mg} € · taux de marge <b>${pc(round(mg / PA * 100, 2))}</b> · taux de marque <b>${pc(round(mg / PV * 100, 2))}</b>. Même marge, deux taux différents selon le prix de référence.`,
  };
});
