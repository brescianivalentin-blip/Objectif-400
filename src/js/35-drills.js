/* ===== Calcul mental : séries chronométrées à réponse tapée ===== */
function drill(id, meta, make) { TM.drills[id] = Object.assign({ id, sub: 'calcul', kb: 'num', make }, meta); }
const cn = (x) => String(round(x, 6)).replace('.', ',');
function normAns(s) {
  let t = String(s || '').trim().replace(/\s/g, '').replace(/\./g, ',').replace(/−/g, '-').replace(/^\+/, '').toUpperCase();
  if (/^-?,/.test(t)) t = t.replace(',', '0,');
  if (t.includes(',')) t = t.replace(/0+$/, '').replace(/,$/, '');
  if (/^-?0\d/.test(t)) t = t.replace(/^(-?)0+(\d)/, '$1$2');
  return t;
}

drill('dr.add', { name: 'Additions', desc: 'Poser de tête, de gauche à droite' }, (R, l) => {
  const a = l === 1 ? R.int(12, 89) : l === 2 ? R.int(23, 99) : R.int(123, 899), b = l === 1 ? R.int(3, 19) : l === 2 ? R.int(17, 89) : R.int(108, 799);
  return { p: `${a} + ${b}`, a: cn(a + b) };
});
drill('dr.sub', { name: 'Soustractions', desc: 'Compléter jusqu\'au nombre rond' }, (R, l) => {
  if (l === 3 && R.chance(0.4)) { const b = R.int(101, 899); return { p: `1${NB}000 ${MINUS} ${b}`, a: cn(1000 - b) }; }
  const a = l === 1 ? R.int(21, 99) : l === 2 ? R.int(51, 199) : R.int(301, 999), b = l === 1 ? R.int(3, 9) + (R.chance(0.5) ? 10 : 0) : l === 2 ? R.int(18, a - 10) : R.int(108, a - 50);
  return { p: `${a} ${MINUS} ${b}`, a: cn(a - b) };
});
drill('dr.tables', { name: 'Tables de multiplication', desc: 'Jusqu\'à 12, puis au-delà' }, (R, l) => {
  const a = l === 3 ? R.int(11, 19) : R.int(2, l === 1 ? 9 : 12), b = R.int(2, l === 1 ? 9 : 12);
  if (l >= 2 && R.chance(0.35)) return { p: `${a * b} = ${a} ${X} ?`, a: cn(b) };
  return { p: `${a} ${X} ${b}`, a: cn(a * b) };
});
drill('dr.mul', { name: 'Multiplications', desc: 'Décomposer : 23 × 14 = 230 + 92' }, (R, l) => {
  if (l === 1) { const a = R.int(12, 99), b = R.int(2, 9); return { p: `${a} ${X} ${b}`, a: cn(a * b) }; }
  if (l === 2) { const a = R.int(11, 49), b = R.pick([11, 12, 15, 20, 21, 25, 30]); return { p: `${a} ${X} ${b}`, a: cn(a * b) }; }
  const a = R.int(13, 79), b = R.int(13, 49); return { p: `${a} ${X} ${b}`, a: cn(a * b) };
});
drill('dr.div', { name: 'Divisions exactes', desc: 'Retrouver le facteur manquant' }, (R, l) => {
  const b = l === 3 ? R.int(11, 25) : R.int(2, 9), q = l === 1 ? R.int(2, 12) : R.int(12, l === 2 ? 99 : 40);
  return { p: `${fmt(b * q)} ${DV} ${b}`, a: cn(q) };
});
drill('dr.sq', { name: 'Carrés et racines', desc: 'Connaître 1² à 25² par cœur' }, (R, l) => {
  if (l === 3) { const t = R.int(0, 2); if (t === 0) { const n = R.int(11, 30); return { p: SQ(fmt(n * n)), a: cn(n) }; } if (t === 1) { const n = R.int(2, 10); return { p: PW(n, 3), a: cn(n ** 3) }; } const n = R.int(16, 30); return { p: PW(n, 2), a: cn(n * n) }; }
  const n = l === 1 ? R.int(2, 15) : R.int(11, 25);
  return { p: PW(n, 2), a: cn(n * n) };
});
drill('dr.pct', { name: 'Pourcentages de tête', desc: '10 %, 5 %, 25 %…' }, (R, l) => {
  const t = R.pick(l === 1 ? [10, 20, 25, 50] : l === 2 ? [5, 15, 30, 75, 12.5, 40] : [35, 45, 2.5, 17.5, 60, 8]);
  const unitN = 100 / gcd(Math.round(t * 10), 1000) * 10;
  const N = Math.round(unitN) * R.int(2, 12);
  return { p: `${pc(t)} de ${fmt(N)}`, a: cn(N * t / 100) };
});
drill('dr.frac', { name: 'Fractions → décimaux', desc: 'Le tableau à connaître par cœur' }, (R, l) => {
  const pool = l === 1 ? [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10]] : l === 2 ? [[1, 8], [3, 8], [5, 8], [7, 8], [1, 20], [3, 20], [7, 20], [9, 20], [1, 25], [3, 25]] : [[1, 16], [3, 16], [1, 40], [3, 40], [7, 25], [11, 20], [13, 25], [9, 8], [5, 4], [7, 5]];
  const [n, d] = R.pick(pool);
  return { p: F(n, d), a: cn(n / d) };
});
drill('dr.trick', { name: 'Astuces ×5 ×25 ×9 ×11', desc: 'Les raccourcis du cours' }, (R, l) => {
  const t = R.pick(l === 1 ? ['x5', 'x25', 'x10'] : l === 2 ? ['x9', 'x11', 'x15', 'x5'] : ['x99', 'x11', 'x25', 'x101']);
  const a = t === 'x11' ? R.int(12, 98) : t === 'x101' ? R.int(11, 99) : R.int(12, 96);
  const k = { x5: 5, x25: 25, x10: 10, x9: 9, x11: 11, x15: 15, x99: 99, x101: 101 }[t];
  return { p: `${a} ${X} ${k}`, a: cn(a * k) };
});
drill('dr.half', { name: 'Moitiés et doubles', desc: 'La base des pourcentages' }, (R, l) => {
  if (l === 1) { const n = 2 * R.int(11, 249); return R.chance(0.5) ? { p: `La moitié de ${n}`, a: cn(n / 2) } : { p: `Le double de ${n / 2}`, a: cn(n) }; }
  if (l === 2) { const n = R.int(51, 499) | 1; return { p: `La moitié de ${n}`, a: cn(n / 2) }; }
  const x = R.int(11, 99) / 10; return R.chance(0.5) ? { p: `La moitié de ${fmt(x)}`, a: cn(x / 2) } : { p: `Le double de ${fmt(x)}`, a: cn(x * 2) };
});
drill('dr.time', { name: 'Heures ↔ minutes', desc: '1,25 h = 75 min' }, (R, l) => {
  const t = R.int(0, l === 1 ? 0 : 1);
  if (t === 0) { const x = R.pick(l === 1 ? [0.5, 0.25, 0.75, 1.5, 1.25, 2.5, 0.1, 0.2] : [1.2, 2.4, 0.4, 1.75, 2.25, 0.6, 0.3, 1.8, 3.5]); return { p: `${fmt(x)}${NB}h = ? min`, a: cn(Math.round(x * 60)) }; }
  const m = R.pick([15, 30, 45, 12, 18, 24, 36, 42, 48, 54, 6, 90, 75, 105, 72]); return { p: `${m}${NB}min = ? h`, a: cn(round(m / 60, 4)) };
});
drill('dr.speed', { name: 'Vitesses express', desc: 'km/h, minutes, distances' }, (R, l) => {
  const t = R.int(0, l === 1 ? 0 : 2);
  if (t === 0) { const v = R.pick([60, 90, 120, 30, 45, 75, 80]), m = R.pick([20, 30, 40, 15, 45, 10]); if (!Number.isInteger(v * m / 60)) return { p: `60${NB}km/h pendant ${m}${NB}min = ? km`, a: cn(m) }; return { p: `${v}${NB}km/h pendant ${m}${NB}min = ? km`, a: cn(v * m / 60) }; }
  if (t === 1) { const [d, m] = R.pick([[60, 45], [40, 30], [50, 40], [30, 20], [90, 45], [20, 15], [100, 75], [45, 30]]); return { p: `${d}${NB}km en ${m}${NB}min = ? km/h`, a: cn(d * 60 / m) }; }
  const [d, v] = R.pick([[120, 80], [90, 60], [150, 100], [45, 90], [100, 80], [30, 40], [75, 50]]); return { p: `${d}${NB}km à ${v}${NB}km/h = ? min`, a: cn(d / v * 60) };
});
drill('dr.dec', { name: 'Décimaux', desc: 'Placer la virgule sans hésiter' }, (R, l) => {
  const t = R.int(0, 2);
  if (t === 0) { const a = R.int(2, 9), b = R.int(2, 9); return l === 1 ? { p: `0,${a} ${X} ${b}`, a: cn(a * b / 10) } : { p: `0,${a} ${X} 0,${b}`, a: cn(a * b / 100) }; }
  if (t === 1) { const dv = R.pick(l === 1 ? [0.5, 0.1] : [0.5, 0.25, 0.2, 0.05]), q = R.int(2, 40); const x = round(q * dv, 4); return { p: `${fmt(x)} ${DV} ${fmt(dv)}`, a: cn(q) }; }
  const k = R.pick([0.25, 0.5, 0.75, 0.2, 1.5]), n = R.int(2, 20) * 4; return { p: `${fmt(k)} ${X} ${n}`, a: cn(k * n) };
});
drill('dr.pow', { name: 'Puissances', desc: '2¹⁰ = 1 024, 3⁵ = 243…' }, (R, l) => {
  const [b, e] = R.pick(l === 1 ? [[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [5, 2], [10, 3], [4, 2]] : l === 2 ? [[2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [3, 4], [5, 3], [4, 3], [6, 2]] : [[2, 11], [2, 12], [3, 5], [3, 6], [5, 4], [7, 3], [4, 4], [6, 3], [9, 3]]);
  return { p: PW(b, e), a: cn(b ** e) };
});
drill('dr.mix', { name: 'Grand mélange', desc: 'Tout le calcul mental à la fois' }, (R, l) => {
  const ids = ['dr.add', 'dr.sub', 'dr.tables', 'dr.mul', 'dr.div', 'dr.sq', 'dr.pct', 'dr.frac', 'dr.trick', 'dr.half', 'dr.time', 'dr.dec', 'dr.pow'];
  return TM.drills[R.pick(ids)].make(R, l);
});
drill('dr.alpha', { name: 'Rang des lettres', desc: 'A = 1, B = 2… indispensable en logique', sub: 'logique' }, (R, l) => {
  if (l === 1) { const i = R.int(0, 12); return { p: ALPHA[i], a: cn(i + 1) }; }
  if (l === 2) { const i = R.int(0, 25); return { p: ALPHA[i], a: cn(i + 1) }; }
  const i = R.int(0, 25); return { p: `Lettre n°${i + 1}`, a: ALPHA[i], kb: 'alpha' };
});
drill('dr.suites', { name: 'Termes suivants', desc: 'Repérer l\'écart en un coup d\'œil', sub: 'logique' }, (R, l) => {
  const t = R.int(0, l === 1 ? 1 : 3);
  if (t === 0) { const a = R.int(1, 30), r = R.int(2, 9) * R.sign(); const s = [0, 1, 2, 3].map((i) => a + 20 + i * r); return { p: s.join(', ') + ', ?', a: cn(a + 20 + 4 * r) }; }
  if (t === 1) { const a = R.int(1, 5), q = R.pick([2, 3]); const s = [0, 1, 2, 3].map((i) => a * q ** i); return { p: s.join(', ') + ', ?', a: cn(a * q ** 4) }; }
  if (t === 2) { const a = R.int(1, 10), d0 = R.int(1, 4); const s = [a]; for (let i = 1; i < 5; i++) s.push(s[i - 1] + d0 + (i - 1)); return { p: s.slice(0, 4).join(', ') + ', ?', a: cn(s[4]) }; }
  const a = R.int(1, 5), b = R.int(1, 5); const s = [a, b]; for (let i = 2; i < 6; i++) s.push(s[i - 1] + s[i - 2]); return { p: s.slice(0, 5).join(', ') + ', ?', a: cn(s[5]) };
});
