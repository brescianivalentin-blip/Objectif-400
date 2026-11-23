/* ===== CALCUL : mathématiques commerciales (marge, CA, seuil de rentabilité) ===== */
chapter({
  id: 'com', sub: 'calcul', order: 4.5, title: 'Mathématiques commerciales', short: 'Maths commerciales',
  lesson: `
<p>Tu as vu ces notions en STMG : au Tage Mage, elles reviennent sous forme de problèmes de pourcentages. C'est un chapitre où ton bac est un vrai avantage.</p>
<h3><span class="hl">1. Le vocabulaire</span></h3>
<div class="tablewrap"><table>
<tr><th>Notion</th><th>Calcul</th></tr>
<tr><td>Marge</td><td>prix de vente HT − prix d'achat</td></tr>
<tr><td>Taux de marge</td><td>marge ÷ prix d'<b>achat</b></td></tr>
<tr><td>Taux de marque</td><td>marge ÷ prix de <b>vente</b></td></tr>
<tr><td>Coefficient multiplicateur</td><td>prix de vente ÷ prix d'achat</td></tr>
</table></div>
<div class="ex"><b>Exemple</b><span>Prix d'achat 80 €, prix de vente 100 € : marge = 20 €.</span><span>Taux de marge = 20 ÷ 80 = <b>25 %</b>. Taux de marque = 20 ÷ 100 = <b>20 %</b>.</span></div>
<div class="trap"><b>Piège n°1 :</b> le taux de marge se calcule sur le prix d'ACHAT, le taux de marque sur le prix de VENTE. Ils ne sont jamais égaux.</div>
<div class="formula">PV = PA × (1 + taux de marge)<br>PA = PV × (1 − taux de marque)<br>taux de marque = ${F('taux de marge', '1 + taux de marge')}</div>
<p>Exemple de conversion : un taux de marge de 25 % donne un taux de marque de 0,25 ÷ 1,25 = 20 %.</p>
<h3><span class="hl">2. Le chiffre d'affaires</span></h3>
<div class="formula">CA = prix × quantité</div>
<p>Si le prix augmente de 10 % et que la quantité vendue baisse de 10 %, le CA est multiplié par 1,1 × 0,9 = 0,99 : il <b>baisse</b> de 1 %.</p>
<div class="trap"><b>Piège n°2 :</b> +10 % et −10 % ne se compensent pas. On multiplie les coefficients, comme pour les évolutions successives.</div>
<h3><span class="hl">3. Coûts, bénéfice et seuil de rentabilité</span></h3>
<div class="formula">coûts totaux = coûts fixes + coût variable unitaire × quantité<br>bénéfice = CA − coûts totaux<br>seuil de rentabilité (en unités) = ${F('coûts fixes', 'prix de vente − coût variable unitaire')}</div>
<div class="ex"><b>Exemple</b><span>Coûts fixes 12 000 €, prix de vente 50 €, coût variable 30 € par unité.</span><span>Chaque unité rapporte 50 − 30 = 20 € de marge. Il faut vendre 12 000 ÷ 20 = <b>600 unités</b> pour couvrir les coûts fixes.</span></div>`,
});

gen('com.marge', { sub: 'calcul', ch: 'com', name: 'Marge, taux de marge et taux de marque', target: 60 }, (R, d) => {
  if (d === 1) {
    const t = R.pick([10, 20, 25, 40, 50]), PA = R.int(2, 30) * 20, PV = round(PA * (1 + t / 100), 2);
    const m = mcq(R, PV, [round(PA + t, 2), round(PA / (1 - t / 100), 2), round(PA * t / 100, 2), round(PV + PA * 0.05, 2)], { render: eur2 });
    return { q: P(`Un commerçant achète un article ${eur(PA)} et applique un taux de marge de ${pc(t)}. À quel prix le revend-il (hors taxes) ?`), ...m, expl: steps(`Le taux de marge porte sur le prix d'achat : marge = ${pc(t)} de ${fmt(PA)} = ${eur2(PA * t / 100)}.`, `Prix de vente = ${fmt(PA)} ${X} ${fmt(1 + t / 100)} = ${eur2(PV)}.`) + res(eur2(PV)) };
  }
  if (d === 2) {
    const [PA, PV] = R.pick([[80, 100], [60, 75], [120, 150], [40, 50], [200, 250], [75, 100], [150, 200], [50, 75]]);
    const askMarge = R.chance(0.5);
    const tm = round((PV - PA) / PA * 100, 2), tq = round((PV - PA) / PV * 100, 2);
    const val = askMarge ? tm : tq;
    const m = mcq(R, val, [askMarge ? tq : tm, PV - PA, round(PA / PV * 100, 2), round(val + 5, 2)], { render: pc });
    return { q: P(`Un article acheté ${eur(PA)} est revendu ${eur(PV)} hors taxes. Quel est le <b>taux de ${askMarge ? 'marge' : 'marque'}</b> ?`), ...m, expl: steps(`Marge = ${PV} ${MINUS} ${PA} = ${PV - PA} €.`, askMarge ? `Taux de marge = marge ${DV} prix d'ACHAT = ${PV - PA} ${DV} ${PA} = ${fmt(tm / 100)}, soit ${pc(tm)}.` : `Taux de marque = marge ${DV} prix de VENTE = ${PV - PA} ${DV} ${PV} = ${fmt(tq / 100)}, soit ${pc(tq)}.`) + res(pc(val)), trap: `<b>Piège :</b> le taux de ${askMarge ? 'marque' : 'marge'} vaut ${pc(askMarge ? tq : tm)}, ce n'est pas ce qu'on demande.` };
  }
  if (R.chance(0.5)) {
    const [tm, tq] = R.pick([[25, 20], [50, 100 / 3], [100, 50], [20, 100 / 6], [60, 37.5], [150, 60], [300, 75]]);
    const fromMarge = R.chance(0.5);
    const val = round(fromMarge ? tq : tm, 1), giv = fromMarge ? tm : tq;
    const approx = !Number.isInteger(round(val * 10, 6) / 10) || !Number.isInteger(val);
    const rend = (v) => (approx && !Number.isInteger(v) ? '≈ ' : '') + pc(round(v, 1));
    const m = mcq(R, val, [giv, round(fromMarge ? giv * 0.9 : giv * 1.1, 1), round(100 - giv, 1), round(val + 5, 1)], { render: rend });
    return { q: P(`Un produit est vendu avec un taux de ${fromMarge ? 'marge' : 'marque'} de ${pc(round(giv, 2))}. Quel est son taux de ${fromMarge ? 'marque' : 'marge'} ?`), ...m, expl: steps(`Prenons un prix ${fromMarge ? 'd\'achat de 100 €' : 'de vente de 100 €'}.`, fromMarge ? `Marge = ${fmt(giv)} €, donc prix de vente = ${fmt(100 + giv)} €.` : `Marge = ${fmt(round(giv, 2))} €, donc prix d'achat = ${fmt(round(100 - giv, 2))} €.`, fromMarge ? `Taux de marque = ${fmt(giv)} ${DV} ${fmt(100 + giv)} ≈ ${pc(round(val, 1))}.` : `Taux de marge = ${fmt(round(giv, 2))} ${DV} ${fmt(round(100 - giv, 2))} = ${pc(round(val, 1))}.`) + res(rend(val)), tip: '<b>Méthode :</b> raisonne sur un prix de 100 €, tout devient concret.' };
  }
  const tq = R.pick([20, 25, 40, 50]), PV = R.int(2, 25) * 20, PA = round(PV * (1 - tq / 100), 2);
  const m = mcq(R, PA, [round(PV / (1 + tq / 100), 2), round(PV - tq, 2), round(PV * tq / 100, 2), round(PA + 10, 2)], { render: eur2 });
  return { q: P(`Un article est vendu ${eur(PV)} hors taxes avec un taux de marque de ${pc(tq)}. Quel était son prix d'achat ?`), ...m, expl: steps(`Le taux de marque porte sur le prix de vente : marge = ${pc(tq)} de ${fmt(PV)} = ${eur2(PV * tq / 100)}.`, `Prix d'achat = ${fmt(PV)} ${MINUS} ${fmt(PV * tq / 100)} = ${eur2(PA)}.`) + res(eur2(PA)), trap: `<b>Piège :</b> diviser ${fmt(PV)} par ${fmt(1 + tq / 100)} reviendrait à traiter ${pc(tq)} comme un taux de marge.` };
});
gen('com.ca', { sub: 'calcul', ch: 'com', name: 'Chiffre d\'affaires', target: 55 }, (R, d) => {
  if (d === 1) {
    const p = R.pick([12, 15, 20, 25, 8, 40]), q = R.int(3, 40) * 10, ca = p * q;
    const m = mcq(R, ca, [p + q, ca / 10, ca * 10, ca + p * 10], { render: eur });
    return { q: P(`Une boutique vend ${fmt(q)} articles à ${eur(p)} l'unité. Quel est son chiffre d'affaires ?`), ...m, expl: steps(`CA = prix ${X} quantité = ${p} ${X} ${fmt(q)} = ${eur(ca)}.`) + res(eur(ca)) };
  }
  if (d === 2) {
    const [a, b] = R.pick([[10, -10], [20, -10], [-20, 25], [10, 10], [25, -20], [-10, 20], [30, -20], [50, -40]]);
    const tot = round(((1 + a / 100) * (1 + b / 100) - 1) * 100, 2);
    const m = mcq(R, tot, [a + b, round(tot + 2, 2), -tot, round((a + b) / 2, 2)], { render: sgnPc, positive: false });
    return { q: P(`Le prix d'un produit évolue de ${sgnPc(a)} et la quantité vendue de ${sgnPc(b)}. De combien varie le chiffre d'affaires ?`), ...m, expl: steps(`CA = prix ${X} quantité : on multiplie les coefficients.`, `${fmt(1 + a / 100)} ${X} ${fmt(1 + b / 100)} = ${fmt(round((1 + a / 100) * (1 + b / 100), 4))}.`, `Soit ${sgnPc(tot)}.`) + res(sgnPc(tot)), trap: `<b>Piège :</b> additionner (${sgnPc(a + b)}).` };
  }
  const [a, need] = R.pick([[25, -20], [-20, 25], [50, -33.33], [100, -50], [-50, 100], [60, -37.5], [-25, 33.33]]);
  const val = round(need, 2), approx = !Number.isInteger(val);
  const rend = (v) => (approx ? '≈ ' : '') + sgnPc(round(v, 1));
  const m = mcq(R, round(val, 1), [-a, round(-a * 0.8, 1), round(val + (val > 0 ? 10 : -10), 1), round(val / 2, 1)], { render: rend, positive: false });
  return { q: P(`Une entreprise augmente ou baisse son prix de ${sgnPc(a)}. De combien doit varier la quantité vendue pour que le chiffre d'affaires reste identique ?`), ...m, expl: steps(`Il faut ${fmt(1 + a / 100)} ${X} CM(quantité) = 1.`, `CM(quantité) = 1 ${DV} ${fmt(1 + a / 100)} = ${fmt(round(1 / (1 + a / 100), 4))}.`, `Soit ${rend(val)}.`) + res(rend(val)), trap: `<b>Piège :</b> répondre ${sgnPc(-a)} (c'est l'évolution réciproque qu'il faut).` };
});
gen('com.seuil', { sub: 'calcul', ch: 'com', name: 'Seuil de rentabilité', target: 65 }, (R, d) => {
  const mu = R.pick([5, 8, 10, 12, 15, 20, 25, 40]), units = R.int(2, 30) * (d === 1 ? 50 : 20), CF = mu * units;
  const cv = R.pick([10, 15, 20, 30, 35, 45]), pv = cv + mu;
  if (d === 1) {
    const m = mcq(R, units, [CF / pv, CF / cv, units * 2, units + mu], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Une entreprise a ${eur(CF)} de coûts fixes. Chaque produit vendu lui rapporte une marge de ${eur(mu)}. Combien de produits doit-elle vendre pour couvrir ses coûts fixes ?`), ...m, expl: steps(`Seuil = coûts fixes ${DV} marge unitaire = ${fmt(CF)} ${DV} ${mu} = ${fmt(units)}.`) + res(fmt(units) + ' produits') };
  }
  if (d === 2) {
    const m = mcq(R, units, [Math.round(CF / pv), Math.round(CF / cv), units * 2, Math.round(units * 1.5)], { valid: (v) => Number.isInteger(v) && v > 0 });
    return { q: P(`Coûts fixes : ${eur(CF)}. Prix de vente : ${eur(pv)} par unité. Coût variable : ${eur(cv)} par unité. Quel est le seuil de rentabilité, en nombre d'unités ?`), ...m, expl: steps(`Marge par unité : ${pv} ${MINUS} ${cv} = ${mu} €.`, `Seuil = ${fmt(CF)} ${DV} ${mu} = ${fmt(units)} unités.`) + res(fmt(units) + ' unités'), trap: `<b>Piège :</b> diviser par le prix de vente (${pv} €) oublie le coût variable.` };
  }
  const B = mu * R.int(2, 20) * 10, q = (CF + B) / mu;
  const m = mcq(R, q, [units, CF / mu + B / pv, q + units, Math.round(B / mu)], { valid: (v) => Number.isInteger(v) && v > 0 });
  return { q: P(`Coûts fixes : ${eur(CF)}. Prix de vente : ${eur(pv)} par unité. Coût variable : ${eur(cv)} par unité. Combien d'unités faut-il vendre pour réaliser un bénéfice de ${eur(B)} ?`), ...m, expl: steps(`Marge par unité : ${pv} ${MINUS} ${cv} = ${mu} €.`, `Il faut couvrir les coûts fixes ET dégager le bénéfice : ${fmt(CF)} + ${fmt(B)} = ${fmt(CF + B)} €.`, `${fmt(CF + B)} ${DV} ${mu} = ${fmt(q)} unités.`) + res(fmt(q) + ' unités') };
});
gen('com.benef', { sub: 'calcul', ch: 'com', name: 'Coûts et bénéfice', target: 60 }, (R, d) => {
  const q = R.int(5, 40) * 10, cv = R.pick([6, 8, 12, 15, 18, 25]), pv = cv + R.pick([4, 5, 7, 10, 12]), CF = R.int(5, 40) * 100;
  const ben = q * (pv - cv) - CF;
  if (d === 1) {
    const ca = q * pv, ct = CF + q * cv;
    const m = mcq(R, ben, [ca - CF, ca - q * cv, ct - ca, ben + CF / 2], { positive: false, render: eur });
    return { q: P(`Une entreprise vend ${fmt(q)} unités à ${eur(pv)}. Ses coûts fixes sont de ${eur(CF)} et chaque unité lui coûte ${eur(cv)} à produire. Quel est son bénéfice ?`), ...m, expl: steps(`CA = ${fmt(q)} ${X} ${pv} = ${eur(ca)}.`, `Coûts totaux = ${fmt(CF)} + ${fmt(q)} ${X} ${cv} = ${eur(ct)}.`, `Bénéfice = ${fmt(ca)} ${MINUS} ${fmt(ct)} = ${eur(ben)}.`) + res(eur(ben)) };
  }
  const target = R.int(2, 20) * 100, needPV = round(cv + (CF + target) / q, 2);
  const m = mcq(R, needPV, [round((CF + target) / q, 2), round(cv + CF / q, 2), round(needPV + 1, 2), round(cv + target / q, 2)], { render: eur2 });
  return { q: P(`Une entreprise prévoit de vendre ${fmt(q)} unités. Coûts fixes : ${eur(CF)} ; coût variable : ${eur(cv)} par unité. À quel prix doit-elle vendre pour faire un bénéfice de ${eur(target)} ?`), ...m, expl: steps(`Il faut couvrir ${fmt(CF)} + ${fmt(target)} = ${fmt(CF + target)} € en plus des coûts variables.`, `Par unité : ${fmt(CF + target)} ${DV} ${fmt(q)} = ${eur2((CF + target) / q)}.`, `Prix = ${cv} + ${fmt(round((CF + target) / q, 2))} = ${eur2(needPV)}.`) + res(eur2(needPV)) };
});
