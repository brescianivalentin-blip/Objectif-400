/* ===== LOGIQUE : suites, dominos, cartes, grilles, figures, horloges ===== */
chapter({
  id: 'log-suites', sub: 'logique', order: 1, title: 'Suites de nombres et de lettres', short: 'Suites',
  lesson: `
<p>Le sous-test de Logique te présente des séries : il faut trouver l'élément manquant. 15 questions en 20 minutes : l'enjeu est de <b>reconnaître les schémas</b> très vite.</p>
<h3><span class="hl">1. Le réflexe des écarts</span></h3>
<p>Écris l'écart entre deux termes consécutifs. Si ce n'est pas constant, écris les écarts des écarts.</p>
<div class="ex"><b>Exemple</b><span>3, 5, 9, 15, 23, ? → écarts +2, +4, +6, +8 → le prochain est +10 → <b>33</b>.</span></div>
<h3><span class="hl">2. Les schémas qui reviennent</span></h3>
<div class="tablewrap"><table>
<tr><th>Schéma</th><th>Exemple</th></tr>
<tr><td>Écart constant</td><td>7, 11, 15, 19 → +4</td></tr>
<tr><td>Multiplication constante</td><td>3, 6, 12, 24 → × 2</td></tr>
<tr><td>Écarts qui augmentent</td><td>2, 3, 5, 8, 12 → +1, +2, +3, +4</td></tr>
<tr><td>Deux opérations alternées</td><td>2, 5, 10, 13, 26 → +3, × 2, +3, × 2</td></tr>
<tr><td>Deux suites entrelacées</td><td>1, 20, 3, 18, 5, 16 → une case sur deux</td></tr>
<tr><td>Carrés, cubes</td><td>1, 4, 9, 16, 25 · 2, 5, 10, 17 (n² + 1)</td></tr>
<tr><td>Fibonacci</td><td>2, 3, 5, 8, 13 → somme des deux précédents</td></tr>
<tr><td>× 2 + 1</td><td>1, 3, 7, 15, 31</td></tr>
<tr><td>Nombres premiers</td><td>7, 11, 13, 17, 19, 23</td></tr>
</table></div>
<div class="tip"><b>Si rien ne marche :</b> regarde une case sur deux. C'est le schéma le plus souvent raté.</div>
<h3><span class="hl">3. Les lettres : pense en nombres</span></h3>
<p>Convertis chaque lettre en son rang : A = 1, B = 2… Z = 26. Repères à connaître : <b>E = 5, J = 10, O = 15, T = 20, Y = 25</b>. Après Z, on revient à A.</p>
<div class="formula">A1 B2 C3 D4 E5 F6 G7 H8 I9 J10 K11 L12 M13<br>N14 O15 P16 Q17 R18 S19 T20 U21 V22 W23 X24 Y25 Z26</div>
<div class="ex"><b>Exemple</b><span>B, E, H, K, ? → 2, 5, 8, 11 → +3 → 14 = <b>N</b>.</span></div>
<p>Entraîne-toi avec la série « Rang des lettres » : elle te fera gagner de précieuses secondes.</p>`,
});
chapter({
  id: 'log-dominos', sub: 'logique', order: 2, title: 'Dominos et cartes', short: 'Dominos & cartes',
  lesson: `
<h3><span class="hl">1. Les dominos</span></h3>
<p>Chaque domino a deux moitiés de <b>0 à 6 points</b>. On analyse <b>séparément</b> la moitié haute et la moitié basse.</p>
<p>Les valeurs tournent en boucle : après 6 vient 0 (on compte « modulo 7 »). Donc 5 + 3 = 1, et 1 − 2 = 6.</p>
<div class="ex"><b>Exemple</b><span>Haut : 1, 2, 3, 4 → +1 → 5. Bas : 5, 3, 1, 6 → −2 à chaque fois (1 − 2 = 6) → 4.</span></div>
<p><b>Autres schémas fréquents :</b></p>
<ul><li>Une moitié reste fixe pendant que l'autre avance.</li><li>Le haut d'un domino reprend le bas du précédent (effet « chaîne »).</li><li>Les écarts s'accélèrent : +1, +2, +3…</li><li>La somme des deux moitiés est constante.</li></ul>
<h3><span class="hl">2. Les cartes</span></h3>
<p><b>Valeur</b> : As = 1, Valet = 11, Dame = 12, Roi = 13, puis on revient à l'As. <b>Couleur</b> : souvent un cycle (♠ ♥ ♦ ♣) ou une alternance rouge / noir.</p>
<div class="tip"><b>Méthode :</b> traite la valeur et la couleur comme deux suites indépendantes, puis élimine les réponses qui ne respectent pas l'une ou l'autre.</div>`,
});
chapter({
  id: 'log-figures', sub: 'logique', order: 3, title: 'Figures, grilles et horloges', short: 'Figures',
  lesson: `
<h3><span class="hl">1. Les figures</span></h3>
<p>Isole chaque caractéristique, une par une :</p>
<ul><li><b>Rotation</b> : de combien de degrés ? Dans quel sens ? (90° = un quart de tour, 45° = un huitième)</li><li><b>Couleur</b> : alternance plein / vide ?</li><li><b>Position</b> d'un petit élément : tourne-t-il d'un coin à l'autre ?</li><li><b>Nombre de côtés</b> : triangle, carré, pentagone…</li></ul>
<div class="tip"><b>Élimination :</b> vérifie une caractéristique à la fois et barre les réponses qui ne la respectent pas. Deux caractéristiques suffisent souvent.</div>
<h3><span class="hl">2. Les grilles de nombres</span></h3>
<p>Cherche une relation qui marche sur <b>chaque ligne</b> (ou chaque colonne) : a + b = c, a × b = c, a − b = c, 2 × (a + b) = c… Vérifie-la sur deux lignes avant de l'appliquer.</p>
<h3><span class="hl">3. Les horloges</h3>
<p>Convertis chaque horloge en heure, puis calcule l'écart en minutes entre deux horloges. Attention : l'écart peut augmenter (+10, +20, +30 min…).</p>`,
});

/* ---------- Rendu SVG ---------- */
const PIPS = { 0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function pipsSVG(n, oy) { return PIPS[n].map((i) => `<circle class="pip" cx="${[12, 23, 34][i % 3]}" cy="${oy + [11, 22, 33][Math.floor(i / 3)]}" r="4.1"/>`).join(''); }
function domSVG(t, b, w = 38) {
  return `<svg class="dom" viewBox="0 0 46 88" width="${w}" height="${Math.round(w * 88 / 46)}" role="img" aria-label="domino ${t} et ${b}"><rect class="face" x="1" y="1" width="44" height="86" rx="7"/><line class="mid" x1="6" y1="44" x2="40" y2="44" stroke-width="1.5"/>${pipsSVG(t, 0)}${pipsSVG(b, 44)}</svg>`;
}
function domQ(w = 38) { return `<svg class="dom qm" viewBox="0 0 46 88" width="${w}" height="${Math.round(w * 88 / 46)}"><rect class="face" x="1" y="1" width="44" height="86" rx="7"/><text x="23" y="52" text-anchor="middle" font-size="24">?</text></svg>`; }
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = { 1: 'A', 11: 'V', 12: 'D', 13: 'R' };
const rankTxt = (v) => RANKS[v] || String(v);
const cardH = (v, s) => `<div class="pcard${s === 1 || s === 2 ? ' red' : ''}" aria-label="${rankTxt(v)} ${SUITS[s]}"><span class="rk">${rankTxt(v)}</span><span class="st">${SUITS[s]}</span></div>`;
const cardQ = '<div class="pcard q">?</div>';
function clockSVG(min, w = 64) {
  const m = ((min % 720) + 720) % 720, h = Math.floor(m / 60), mm = m % 60;
  const ah = (h * 30 + mm * 0.5) * Math.PI / 180, am = mm * 6 * Math.PI / 180;
  let ticks = '';
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180, r1 = i % 3 === 0 ? 22 : 25; ticks += `<line class="tick" x1="${32 + r1 * Math.sin(a)}" y1="${32 - r1 * Math.cos(a)}" x2="${32 + 28 * Math.sin(a)}" y2="${32 - 28 * Math.cos(a)}"/>`; }
  return `<svg class="clk" viewBox="0 0 64 64" width="${w}" height="${w}" role="img" aria-label="horloge"><circle class="face" cx="32" cy="32" r="30"/>${ticks}<line class="h" x1="32" y1="32" x2="${32 + 14 * Math.sin(ah)}" y2="${32 - 14 * Math.cos(ah)}"/><line class="m" x1="32" y1="32" x2="${32 + 22 * Math.sin(am)}" y2="${32 - 22 * Math.cos(am)}"/><circle class="c" cx="32" cy="32" r="2.6"/></svg>`;
}
const clockQ = (w = 64) => `<svg class="dom qm" viewBox="0 0 64 64" width="${w}" height="${w}"><rect class="face" x="2" y="2" width="60" height="60" rx="30"/><text x="32" y="41" text-anchor="middle" font-size="24">?</text></svg>`;
const CORNERS = [[12, 12], [52, 12], [52, 52], [12, 52]];
function figSVG(f, w = 64) {
  let shape;
  if (f.kind === 'arrow') shape = `<path class="shape${f.fill ? ' full' : ''}" d="M32 13 L45 29 L37 29 L37 51 L27 51 L27 29 L19 29 Z" transform="rotate(${f.rot} 32 32)"/>`;
  else { const pts = []; for (let i = 0; i < f.sides; i++) { const a = (-90 + f.rot + i * 360 / f.sides) * Math.PI / 180; pts.push((32 + 17 * Math.cos(a)).toFixed(1) + ',' + (32 + 17 * Math.sin(a)).toFixed(1)); } shape = `<polygon class="shape${f.fill ? ' full' : ''}" points="${pts.join(' ')}"/>`; }
  const dot = f.dot == null ? '' : `<circle class="dotm" cx="${CORNERS[f.dot][0]}" cy="${CORNERS[f.dot][1]}" r="5"/>`;
  return `<svg class="fig" viewBox="0 0 64 64" width="${w}" height="${w}" role="img" aria-label="figure"><rect class="frame" x="1" y="1" width="62" height="62" rx="9"/>${shape}${dot}</svg>`;
}
const figQ = (w = 64) => `<svg class="dom qm" viewBox="0 0 64 64" width="${w}" height="${w}"><rect class="face" x="1" y="1" width="62" height="62" rx="9"/><text x="32" y="41" text-anchor="middle" font-size="24">?</text></svg>`;
const seqRow = (items) => `<div class="seq">${items.join('')}</div>`;
const cell = (x) => `<span class="cell">${x}</span>`;
const cellQ = '<span class="cell q">?</span>';
const sgn = (r) => (r >= 0 ? '+' : MINUS) + Math.abs(r);

/* ---------- Suites de nombres ---------- */
gen('log.num', { sub: 'logique', ch: 'log-suites', name: 'Suites de nombres', target: 60 }, (R, d) => {
  const t = R.pick(d === 1 ? ['arith', 'geom', 'diff'] : d === 2 ? ['diff', 'alt', 'inter', 'sq', 'fib', 'geom'] : ['alt', 'inter', 'x2p1', 'diffgeom', 'prime', 'fib', 'sq']);
  let s = [], rule = '', wrong = [];
  if (t === 'arith') { const r = R.pick([3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15]) * R.sign(), a = r > 0 ? R.int(1, 40) : R.int(90, 140); for (let i = 0; i < 6; i++) s.push(a + i * r); rule = `On ajoute ${fmt(r)} à chaque fois (écart constant ${sgn(r)}).`; wrong = [s[5] + r, s[5] - 1, s[5] + 1, s[4] + 2 * r]; }
  else if (t === 'geom') { const q = d === 1 ? 2 : R.pick([2, 3]), a = R.int(1, 6); for (let i = 0; i < 6; i++) s.push(a * q ** i); rule = `On multiplie par ${q} à chaque fois.`; wrong = [s[4] + 2 * (s[4] - s[3]), s[5] + a, s[5] - a, s[4] * (q + 1)]; }
  else if (t === 'diff') { const d0 = R.int(1, 5), c = R.pick([1, 2, 3]), a = R.int(1, 20); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + d0 + (i - 1) * c); const ds = s.slice(1).map((x, i) => x - s[i]); rule = `Les écarts augmentent de ${c} : ${ds.map(sgn).join(', ')}.`; wrong = [s[4] + ds[3], s[5] + c, s[5] - c, s[5] + 1]; }
  else if (t === 'alt') { const a = R.int(1, 6), p = R.int(2, 7), m = R.pick([2, 3]); s = [a]; for (let i = 1; i < 7; i++) s.push(i % 2 ? s[i - 1] + p : s[i - 1] * m); rule = `On alterne deux opérations : +${p}, puis × ${m}, puis +${p}…`; wrong = [s[5] * m, s[5] + p + 1, s[6] + p, s[6] - p]; s = s.slice(0, 7); }
  else if (t === 'inter') { const a = R.int(1, 10), r1 = R.int(2, 6), b = R.int(30, 60), r2 = -R.int(2, 7); s = []; for (let i = 0; i < 7; i++) s.push(i % 2 === 0 ? a + (i / 2) * r1 : b + ((i - 1) / 2) * r2); rule = `Deux suites entrelacées : les cases impaires font ${sgn(r1)} (${[0, 2, 4, 6].map((i) => s[i]).join(', ')}), les cases paires font ${sgn(r2)}.`; wrong = [s[5] + r2, s[4] + r1 + 1, s[6] + r1, s[6] - 1]; }
  else if (t === 'sq') { const st = R.int(1, 6), k = d === 2 ? R.pick([0, 1, -1]) : R.pick([2, -2, 3]); for (let i = 0; i < 6; i++) s.push((st + i) ** 2 + k); rule = `Carrés${k ? ` ${k > 0 ? '+' : MINUS} ${Math.abs(k)}` : ''} : ${[0, 1, 2].map((i) => `${st + i}²${k ? (k > 0 ? '+' : MINUS) + Math.abs(k) : ''}`).join(', ')}…`; wrong = [s[5] + 2, s[4] + (s[4] - s[3]), (st + 5) ** 2, s[5] + 1]; }
  else if (t === 'fib') { const a = R.int(1, 5), b = R.int(a, 8); s = [a, b]; for (let i = 2; i < 7; i++) s.push(s[i - 1] + s[i - 2]); rule = 'Chaque terme est la somme des deux précédents.'; wrong = [s[5] + (s[5] - s[4]), s[6] + 1, s[6] - 1, s[5] * 2]; s = s.slice(0, 7); }
  else if (t === 'x2p1') { const m = R.pick([2, 3]), c = m === 2 ? R.pick([1, -1, 2]) : R.pick([-1, 1]), a = R.int(1, 4); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] * m + c); rule = `On multiplie par ${m} puis on ${c > 0 ? 'ajoute' : 'retire'} ${Math.abs(c)}.`; wrong = [s[5] + 2, s[4] * m, s[5] - 2, s[4] * m + 2 * c]; }
  else if (t === 'diffgeom') { const d0 = R.int(1, 3), a = R.int(1, 10); s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + d0 * 2 ** (i - 1)); rule = `Les écarts doublent : ${s.slice(1).map((x, i) => sgn(x - s[i])).join(', ')}.`; wrong = [s[4] + 2 * (s[4] - s[3]) + 1, s[5] + d0, s[5] - 2, s[4] + 3 * (s[4] - s[3])]; }
  else { const pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]; const st = R.int(0, 9); s = pr.slice(st, st + 6); rule = 'Ce sont les nombres premiers successifs.'; wrong = [s[5] + 2, s[5] - 2, s[5] + 4, s[5] + 1].filter((x) => !isPrime(x)); }
  let h = s.length - 1;
  if (d === 3 && R.chance(0.35)) h = R.int(2, s.length - 2);
  const ans = s[h];
  const ex = steps(rule, `L'élément manquant est donc ${fmt(ans)}.`);
  if (h !== s.length - 1) wrong = [ans + 1, ans - 1, ans + 2, ans - 3];
  const m = mcq(R, ans, wrong, { positive: false, valid: Number.isInteger });
  return { q: P('Quel nombre remplace le point d\'interrogation ?'), visual: seqRow(s.map((x, i) => (i === h ? cellQ : cell(fmt(x))))), ...m, expl: ex + res(fmt(ans)), tip: '<b>Réflexe :</b> écris les écarts. Si ça ne donne rien, regarde une case sur deux.' };
});

/* ---------- Suites de lettres ---------- */
gen('log.let', { sub: 'logique', ch: 'log-suites', name: 'Suites de lettres', target: 55 }, (R, d) => {
  const L = (i) => ALPHA[((i % 26) + 26) % 26];
  const rk = (i) => `${L(i)}(${(((i % 26) + 26) % 26) + 1})`;
  const t = R.pick(d === 1 ? ['step', 'step', 'pairs'] : d === 2 ? ['alt', 'dec', 'pairs', 'step'] : ['inter', 'wrap', 'mirror', 'alt']);
  let idx = [], rule = '', ansTxt, wrongTxt = [], items;
  if (t === 'step' || t === 'wrap') {
    const k = R.int(2, 5), s0 = t === 'wrap' ? R.int(26 - 4 * k, 24) : R.int(0, 25 - 5 * k);
    for (let i = 0; i < 6; i++) idx.push(s0 + i * k);
    rule = `On avance de ${k} lettres à chaque fois : ${idx.slice(0, 4).map(rk).join(' → ')}…${t === 'wrap' ? ' Après Z, on repart à A.' : ''}`;
    ansTxt = L(idx[5]); wrongTxt = [L(idx[5] + 1), L(idx[5] - 1), L(idx[5] + k), L(idx[4] + k + 2)];
    items = idx.map((i) => L(i));
  } else if (t === 'alt') {
    const a = R.int(1, 3), b = R.int(a + 1, 5), s0 = R.int(0, 6); idx = [s0];
    for (let i = 1; i < 6; i++) idx.push(idx[i - 1] + (i % 2 ? a : b));
    rule = `Les écarts alternent : +${a}, +${b}, +${a}, +${b}… (${idx.map(rk).slice(0, 4).join(', ')}…)`;
    ansTxt = L(idx[5]); wrongTxt = [L(idx[4] + a), L(idx[5] + 1), L(idx[5] - 1), L(idx[4] + b + 1)];
    items = idx.map((i) => L(i));
  } else if (t === 'dec') {
    const s0 = R.int(22, 25); idx = [s0];
    for (let i = 1; i < 6; i++) idx.push(idx[i - 1] - i);
    rule = `On recule de 1, puis 2, puis 3… : ${idx.slice(0, 4).map(rk).join(' → ')}…`;
    ansTxt = L(idx[5]); wrongTxt = [L(idx[5] + 1), L(idx[5] - 1), L(idx[4] - 4), L(idx[5] - 2)];
    items = idx.map((i) => L(i));
  } else if (t === 'pairs') {
    const k = R.int(2, 4), s0 = R.int(0, 6); const pr = []; for (let i = 0; i < 5; i++) pr.push(L(s0 + i * (k + 1)) + L(s0 + i * (k + 1) + 1));
    rule = `Chaque groupe est formé de deux lettres consécutives, et chaque groupe commence ${k + 1} lettres après le précédent.`;
    ansTxt = pr[4]; const a0 = s0 + 4 * (k + 1); wrongTxt = [L(a0 + 1) + L(a0 + 2), L(a0 - 1) + L(a0), L(a0) + L(a0 + 2), L(a0 + k) + L(a0 + k + 1)];
    items = pr;
  } else if (t === 'mirror') {
    const s0 = R.int(0, 6); const pr = []; for (let i = 0; i < 5; i++) pr.push(L(s0 + i) + L(25 - s0 - i));
    rule = `La 1re lettre avance d'un rang (${L(s0)}, ${L(s0 + 1)}, ${L(s0 + 2)}…), la 2e recule d'un rang depuis la fin de l'alphabet (${L(25 - s0)}, ${L(24 - s0)}…).`;
    ansTxt = pr[4]; wrongTxt = [L(s0 + 4) + L(22 - s0), L(s0 + 5) + L(21 - s0), L(s0 + 4) + L(20 - s0), L(s0 + 3) + L(21 - s0)];
    items = pr;
  } else {
    const a = R.int(0, 5), b = R.int(14, 22), r1 = R.int(1, 3), r2 = R.int(1, 3); idx = [];
    for (let i = 0; i < 7; i++) idx.push(i % 2 === 0 ? a + (i / 2) * r1 : b - ((i - 1) / 2) * r2);
    rule = `Deux suites entrelacées : cases impaires +${r1} (${[0, 2, 4].map((i) => L(idx[i])).join(', ')}…), cases paires ${MINUS}${r2} (${[1, 3, 5].map((i) => L(idx[i])).join(', ')}…).`;
    ansTxt = L(idx[6]); wrongTxt = [L(idx[5] - r2), L(idx[6] + 1), L(idx[6] - 1), L(idx[4] + r1 + 1)];
    items = idx.map((i) => L(i));
  }
  const shown = items.slice(0, items.length - 1).map((x) => cell(x)).concat([cellQ]);
  const ar = ALPHA.indexOf(ansTxt[0]);
  const fillL = ansTxt.length === 1 ? (RR) => L(ar + RR.pick([-4, -3, -2, 2, 3, 4, 5])) : (RR) => { const sh = RR.pick([-3, -2, -1, 1, 2, 3]); return ansTxt.split('').map((ch, j) => L(ALPHA.indexOf(ch) + (j === 0 ? sh : RR.pick([sh, -sh, 1])))).join(''); };
  const m = mcq(R, ansTxt, wrongTxt, { sort: 'none', fill: fillL });
  return { q: P('Quelle lettre (ou groupe de lettres) complète la série ?'), visual: seqRow(shown), ...m, expl: steps(rule, `Réponse : ${ansTxt}.`) + res(ansTxt), tip: '<b>Repères :</b> E = 5, J = 10, O = 15, T = 20, Y = 25.' };
});

/* ---------- Dominos ---------- */
gen('log.domino', { sub: 'logique', ch: 'log-dominos', name: 'Dominos', target: 70 }, (R, d) => {
  const mv = (x) => ((x % 7) + 7) % 7;
  const t = R.pick(d === 1 ? ['indep', 'fix'] : d === 2 ? ['indep', 'accel', 'indep'] : ['chain', 'accel', 'sum', 'indep']);
  const n = 5;
  let doms = [], rT = '', rB = '';
  if (t === 'fix') { const a = R.pick([1, 2, -1]), t0 = R.int(0, 6), b0 = R.int(0, 6), fixTop = R.chance(0.5); for (let i = 0; i < n; i++) doms.push(fixTop ? [b0, mv(t0 + i * a)] : [mv(t0 + i * a), b0]); rT = fixTop ? `le haut reste à ${b0}` : `le haut fait ${sgn(a)} à chaque domino`; rB = fixTop ? `le bas fait ${sgn(a)} à chaque domino` : `le bas reste à ${b0}`; }
  else if (t === 'indep') { const a = R.pick(d === 1 ? [1, 2] : [1, 2, 3, -1, -2, -3]), b = R.pick(d === 1 ? [1, -1, 2] : [1, 2, -1, -2, 3]), t0 = R.int(0, 6), b0 = R.int(0, 6); for (let i = 0; i < n; i++) doms.push([mv(t0 + i * a), mv(b0 + i * b)]); rT = `le haut fait ${sgn(a)} à chaque domino`; rB = `le bas fait ${sgn(b)}`; }
  else if (t === 'accel') { const t0 = R.int(0, 6), b0 = R.int(0, 6), b = R.pick([1, -1, 2]); let tv = t0; for (let i = 0; i < n; i++) { doms.push([mv(tv), mv(b0 + i * b)]); tv += i + 1; } rT = 'le haut avance de +1, puis +2, puis +3, puis +4'; rB = `le bas fait ${sgn(b)} à chaque domino`; }
  else if (t === 'chain') { const k = R.pick([1, 2, 3, -1, -2]); let tv = R.int(0, 6); for (let i = 0; i < n; i++) { const bv = mv(tv + k); doms.push([mv(tv), bv]); tv = bv; } rT = 'le haut de chaque domino reprend le bas du domino précédent'; rB = `le bas vaut le haut ${sgn(k)}`; }
  else { const S = R.int(4, 9), a = R.pick([1, 2, -1]), t0 = R.int(0, 6); for (let i = 0; i < n; i++) { const tv = mv(t0 + i * a); doms.push([tv, mv(S - tv)]); } rT = `le haut fait ${sgn(a)} à chaque domino`; rB = `haut + bas = ${S % 7 === S ? S : S + ' (modulo 7 : ' + S % 7 + ')'} sur chaque domino`; }
  const h = d === 3 && R.chance(0.3) ? R.int(1, 3) : n - 1;
  const [ta, ba] = doms[h];
  const key = (x) => x[0] + '-' + x[1];
  const cand = [[ba, ta], [mv(ta + 1), ba], [ta, mv(ba + 1)], [mv(ta - 1), ba], [ta, mv(ba - 1)], [mv(ta + 1), mv(ba - 1)]];
  const m = mcq(R, [ta, ba], cand, { render: (x) => domSVG(x[0], x[1], 34), key, sort: 'none' });
  const visual = seqRow(doms.map((x, i) => (i === h ? domQ() : domSVG(x[0], x[1]))));
  const listT = doms.map((x, i) => (i === h ? '?' : x[0])).join(', '), listB = doms.map((x, i) => (i === h ? '?' : x[1])).join(', ');
  return { q: P('Quel domino remplace le point d\'interrogation ?'), visual, ...m, vis: true, expl: steps(`Moitiés hautes : ${listT} → ${rT}.`, `Moitiés basses : ${listB} → ${rB}.`, `On compte en boucle : après 6 vient 0, et avant 0 vient 6.`, `Le domino manquant est ${ta} / ${ba}.`) + res(`${ta} en haut, ${ba} en bas`), tip: '<b>Méthode :</b> analyse le haut et le bas séparément, en comptant modulo 7.' };
});

/* ---------- Cartes ---------- */
gen('log.cartes', { sub: 'logique', ch: 'log-dominos', name: 'Cartes à jouer', target: 65 }, (R, d) => {
  const mv13 = (x) => ((((x - 1) % 13) + 13) % 13) + 1;
  const step = d === 1 ? R.pick([1, 2]) : R.pick([2, 3, 4, -2, -3]);
  const v0 = R.int(1, 13), s0 = R.int(0, 3);
  const accel = d === 3 && R.chance(0.5);
  const suitMode = d === 1 ? 'const' : R.pick(['cycle', 'alt', 'cycle']);
  const alt2 = [s0, (s0 + 1) % 4];
  const cards = [];
  let v = v0;
  for (let i = 0; i < 5; i++) { const s = suitMode === 'const' ? s0 : suitMode === 'cycle' ? (s0 + i) % 4 : alt2[i % 2]; cards.push([mv13(v), s]); v += accel ? i + 1 : step; }
  const [va, sa] = cards[4];
  const key = (c) => c[0] + '-' + c[1];
  const cand = [[va, (sa + 1) % 4], [mv13(va + 1), sa], [mv13(va - 1), sa], [va, (sa + 2) % 4], [mv13(va + 1), (sa + 3) % 4]];
  const m = mcq(R, [va, sa], cand, { render: (c) => cardH(c[0], c[1]), key, sort: 'none' });
  const vals = cards.slice(0, 4).map((c) => `${rankTxt(c[0])} (${c[0]})`).join(', ');
  const ruleV = accel ? 'les écarts de valeur augmentent : +1, +2, +3, puis +4' : `la valeur fait ${sgn(step)} à chaque carte (après le Roi, on revient à l'As)`;
  const ruleS = suitMode === 'const' ? `la couleur reste ${SUITS[s0]}` : suitMode === 'cycle' ? 'la couleur suit le cycle ♠ → ♥ → ♦ → ♣' : `la couleur alterne ${SUITS[alt2[0]]} / ${SUITS[alt2[1]]}`;
  return { q: P('Quelle carte complète la série ?'), visual: seqRow(cards.slice(0, 4).map((c) => cardH(c[0], c[1])).concat([cardQ])), ...m, vis: true, expl: steps(`Valeurs : ${vals} → ${ruleV}.`, `Couleurs : ${ruleS}.`, `La carte manquante est ${rankTxt(va)} ${SUITS[sa]}.`) + res(`${rankTxt(va)} ${SUITS[sa]}`), tip: 'As = 1, Valet = 11, Dame = 12, Roi = 13.' };
});

/* ---------- Grilles ---------- */
gen('log.grille', { sub: 'logique', ch: 'log-figures', name: 'Grilles de nombres', target: 60 }, (R, d) => {
  const rules = d === 1 ? ['sum', 'prod'] : d === 2 ? ['sum', 'prod', 'diff', 'dbl'] : ['dbl', 'sqp', 'prodm', 'diff2'];
  const r = R.pick(rules);
  const f = { sum: (a, b) => a + b, prod: (a, b) => a * b, diff: (a, b) => a - b, dbl: (a, b) => 2 * (a + b), sqp: (a, b) => a * a + b, prodm: (a, b) => a * b - a, diff2: (a, b) => (a - b) * 2 }[r];
  const desc = { sum: 'a + b = c', prod: 'a × b = c', diff: 'a − b = c', dbl: '2 × (a + b) = c', sqp: 'a² + b = c', prodm: 'a × b − a = c', diff2: '2 × (a − b) = c' }[r];
  const rows = [];
  for (let i = 0; i < 3; i++) { let a, b; do { a = R.int(2, r === 'prod' || r === 'prodm' || r === 'sqp' ? 9 : 15); b = R.int(1, r === 'prod' || r === 'prodm' ? 9 : 12); } while ((r === 'diff' || r === 'diff2') && a <= b); rows.push([a, b, f(a, b)]); }
  const hc = d === 2 && R.chance(0.4) ? R.int(0, 1) : 2;
  const ans = rows[2][hc];
  const others = Object.entries({ sum: (a, b) => a + b, prod: (a, b) => a * b, diff: (a, b) => a - b, dbl: (a, b) => 2 * (a + b) }).filter(([k]) => k !== r).map(([, g]) => g(rows[2][0], rows[2][1]));
  const wrong = hc === 2 ? [...others, ans + 1, ans - 1] : [ans + 1, ans - 1, ans + 2, rows[2][2] - rows[2][1 - hc]];
  const m = mcq(R, ans, wrong, { positive: false, valid: Number.isInteger });
  const grid = `<div class="grid3">${rows.map((row, i) => row.map((x, j) => (i === 2 && j === hc ? '<div class="q">?</div>' : `<div>${fmt(x)}</div>`)).join('')).join('')}</div>`;
  return { q: P('Quel nombre remplace le point d\'interrogation ?'), visual: grid, ...m, expl: steps(`Sur chaque ligne (a, b, c) : ${desc}.`, `Ligne 1 : ${rows[0].join(', ')} ✔. Ligne 2 : ${rows[1].join(', ')} ✔.`, `Ligne 3 : ${rows[2].map((x, j) => (j === hc ? '?' : x)).join(', ')} → ? = ${fmt(ans)}.`) + res(fmt(ans)), tip: '<b>Vérifie ta règle sur deux lignes</b> avant de l\'appliquer à la troisième.' };
});

/* ---------- Figures ---------- */
gen('log.fig', { sub: 'logique', ch: 'log-figures', name: 'Figures en mouvement', target: 70 }, (R, d) => {
  const kind = d === 3 ? 'poly' : 'arrow';
  const rotStep = kind === 'arrow' ? R.pick(d === 1 ? [90, -90] : [45, -45, 90, 135]) : R.pick([0, 0, 15]);
  const fillAlt = d === 1 ? true : R.chance(0.6);
  const fill0 = R.chance(0.5);
  const dotStep = d === 1 ? 0 : R.pick([1, -1]);
  const r0 = kind === 'arrow' ? R.pick([0, 45, 90, 180, 270]) : 0, dot0 = R.int(0, 3), sides0 = 3;
  const mk = (i, o = {}) => ({ kind, sides: kind === 'poly' ? sides0 + i : 0, rot: r0 + i * rotStep, fill: fillAlt ? (i % 2 === 0 ? fill0 : !fill0) : fill0, dot: dotStep ? (((dot0 + i * dotStep) % 4) + 4) % 4 : null, ...o });
  const figs = [0, 1, 2, 3, 4].map((i) => mk(i));
  const c = figs[4];
  const norm = (rot) => ((rot % 360) + 360) % 360;
  const key = (f) => `${f.sides}|${kind === 'poly' ? norm(f.rot) % (360 / Math.max(1, f.sides)) : norm(f.rot)}|${f.fill}|${f.dot}`;
  const cand = [];
  if (kind === 'arrow') { cand.push({ ...c, rot: c.rot + rotStep }, { ...c, rot: c.rot - rotStep }, { ...c, rot: c.rot + 180 }); }
  else { cand.push({ ...c, sides: c.sides + 1 }, { ...c, sides: c.sides - 1 }); }
  cand.push({ ...c, fill: !c.fill });
  if (c.dot != null) cand.push({ ...c, dot: (c.dot + 1) % 4 }, { ...c, dot: (c.dot + 3) % 4 }, { ...c, dot: (c.dot + 2) % 4, fill: !c.fill });
  else cand.push({ ...c, fill: !c.fill, rot: c.rot + (kind === 'arrow' ? 90 : 0), sides: c.sides + (kind === 'poly' ? 1 : 0) });
  const m = mcq(R, c, R.shuffle(cand), { render: (f) => figSVG(f, 58), key, sort: 'none' });
  const dirTxt = rotStep > 0 ? 'dans le sens des aiguilles d\'une montre' : 'dans le sens inverse des aiguilles d\'une montre';
  const lines = [];
  if (kind === 'arrow') lines.push(`La flèche tourne de ${Math.abs(rotStep)}° ${dirTxt} à chaque étape.`);
  else lines.push(`Le nombre de côtés augmente de 1 à chaque étape : triangle, carré, pentagone, hexagone → <b>heptagone</b> (7 côtés).`);
  lines.push(fillAlt ? 'La couleur alterne : plein, vide, plein…' : `La couleur ne change pas (${fill0 ? 'pleine' : 'vide'}).`);
  if (c.dot != null) lines.push(`Le point tourne d'un coin à chaque étape, ${dotStep > 0 ? 'dans le sens des aiguilles d\'une montre' : 'dans le sens inverse'}.`);
  return { q: P('Quelle figure complète la série ?'), visual: seqRow(figs.slice(0, 4).map((f) => figSVG(f, 54)).concat([figQ(54)])), ...m, vis: true, expl: steps(...lines, 'On garde la seule réponse qui respecte toutes ces règles.') + res('la figure ' + LETTERS[m.answer]), tip: '<b>Une caractéristique à la fois :</b> élimine d\'abord avec la plus facile à voir.' };
});

/* ---------- Horloges ---------- */
gen('log.horloge', { sub: 'logique', ch: 'log-figures', name: 'Horloges', target: 65, diffs: [2, 3] }, (R, d) => {
  const t0 = R.int(0, 11) * 60 + R.pick([0, 15, 30, 45]);
  const accel = d === 3 && R.chance(0.6);
  const step = R.pick([75, 45, 130, 50, 105, 90]);
  const inc0 = R.pick([10, 15, 20]);
  const times = [t0];
  for (let i = 1; i < 5; i++) times.push(times[i - 1] + (accel ? inc0 * i : step));
  const ans = times[4];
  const mod = (x) => ((x % 720) + 720) % 720;
  const cand = [ans + 15, ans - 15, ans + 30, ans + 60, ans - 60].map(mod);
  const m = mcq(R, mod(ans), cand, { render: (x) => clockSVG(x, 58), key: (x) => String(mod(x)), sort: 'none' });
  const fmtT = (x) => { const mm = mod(x), h = Math.floor(mm / 60) || 12; return h + NB + 'h' + NB + String(mm % 60).padStart(2, '0'); };
  return { q: P('Quelle horloge complète la série ?'), visual: seqRow(times.slice(0, 4).map((x) => clockSVG(x, 56)).concat([clockQ(56)])), ...m, vis: true, expl: steps(`Lecture : ${times.slice(0, 4).map(fmtT).join(' → ')}.`, accel ? `Les écarts augmentent : +${inc0} min, +${2 * inc0} min, +${3 * inc0} min… le prochain est +${4 * inc0} min.` : `On avance de ${hm(step / 60)} à chaque horloge.`, `L'horloge manquante indique ${fmtT(ans)}.`) + res(fmtT(ans)) };
});
