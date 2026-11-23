/* ===== Fiches mémo (cartes recto/verso, répétition espacée) ===== */
TM.decks = [];
function deck(id, sub, name, desc, cards) { TM.decks.push({ id, sub, name, desc, cards: cards.map(([f, b], i) => ({ id: id + ':' + i, f, b })) }); }

deck('m.frac', 'calcul', 'Fractions, décimaux, %', 'Le tableau de conversion à connaître par cœur', [
  [F(1, 2), '0,5 = 50 %'], [F(1, 4), '0,25 = 25 %'], [F(3, 4), '0,75 = 75 %'], [F(1, 5), '0,2 = 20 %'], [F(2, 5), '0,4 = 40 %'],
  [F(3, 5), '0,6 = 60 %'], [F(4, 5), '0,8 = 80 %'], [F(1, 8), '0,125 = 12,5 %'], [F(3, 8), '0,375 = 37,5 %'], [F(5, 8), '0,625 = 62,5 %'],
  [F(7, 8), '0,875 = 87,5 %'], [F(1, 3), '≈ 0,333 = 33,3 %'], [F(2, 3), '≈ 0,667 = 66,7 %'], [F(1, 6), '≈ 0,167 = 16,7 %'], [F(1, 9), '≈ 0,111 = 11,1 %'],
  [F(1, 10), '0,1 = 10 %'], [F(1, 20), '0,05 = 5 %'], [F(1, 25), '0,04 = 4 %'], [F(1, 40), '0,025 = 2,5 %'], [F(1, 50), '0,02 = 2 %'],
  ['12,5 %', F(1, 8)], ['37,5 %', F(3, 8)], ['0,75', F(3, 4)], ['35 %', F(7, 20)], ['0,04', F(1, 25)],
]);
deck('m.carres', 'calcul', 'Carrés, puissances, racines', 'Gagne des secondes sur chaque calcul', [
  ['11²', '121'], ['12²', '144'], ['13²', '169'], ['14²', '196'], ['15²', '225'], ['16²', '256'], ['17²', '289'], ['18²', '324'], ['19²', '361'], ['21²', '441'], ['24²', '576'], ['25²', '625'],
  [PW(2, 5), '32'], [PW(2, 6), '64'], [PW(2, 7), '128'], [PW(2, 8), '256'], [PW(2, 9), '512'], [PW(2, 10), '1 024'], [PW(3, 3), '27'], [PW(3, 4), '81'], [PW(3, 5), '243'], [PW(5, 3), '125'], [PW(5, 4), '625'],
  [SQ(169), '13'], [SQ(256), '16'], [SQ(324), '18'], [SQ(0.49).replace('0.49', '0,49'), '0,7'], [SQ(2) + ' ≈ ?', '1,41'], [SQ(3) + ' ≈ ?', '1,73'],
]);
deck('m.formules', 'calcul', 'Formules essentielles', 'Toutes les formules du calcul en une seule pile', [
  ['Vitesse', 'v = distance ÷ temps'], ['Distance', 'd = vitesse × temps'], ['Temps', 't = distance ÷ vitesse'],
  ['Vitesse moyenne d\'un aller-retour (v₁, v₂)', F('2 × v₁ × v₂', 'v₁ + v₂') + ' (jamais la moyenne simple)'], ['km/h → m/s', 'diviser par 3,6'],
  ['Aire d\'un triangle', F('base × hauteur', 2)], ['Aire d\'un trapèze', F('(B + b) × h', 2)], ['Aire d\'un disque', 'π × r²'], ['Périmètre d\'un cercle', '2 × π × r'],
  ['Pythagore', 'hypoténuse² = a² + b²'], ['Triplets de Pythagore', '3-4-5 · 5-12-13 · 8-15-17 · 7-24-25'], ['Diagonale d\'un carré de côté a', 'a' + SQ(2)], ['Volume d\'un cylindre', 'π × r² × h'],
  ['Somme 1 + 2 + … + n', F('n × (n + 1)', 2)], ['Nombre de termes de a à b (pas r)', F('b − a', 'r') + ' + 1'], ['Intérêts composés', 'C × (1 + t)<sup>n</sup>'],
  ['Hausse de t %', '× (1 + t/100)'], ['Baisse de t %', '× (1 − t/100)'], ['Taux d\'évolution', F('final − initial', 'initial')],
  ['Moyenne', 'somme ÷ nombre, donc somme = moyenne × nombre'], ['Deux robinets (a h et b h)', F('a × b', 'a + b') + ' heures'], ['Produit pur d\'un mélange', 'volume × concentration'],
  ['P(au moins un)', '1 − P(aucun)'], ['Choisir 2 parmi n', F('n × (n − 1)', 2)], ['Ranger n objets', 'n! = n × (n − 1) × … × 1'],
  ['PGCD ou PPCM ? Bus qui repartent ensemble', 'PPCM'], ['PGCD ou PPCM ? Bouquets identiques', 'PGCD'], ['Seuil de rentabilité', F('coûts fixes', 'PV − CV unitaire')], ['Taux de marge / de marque', 'marge ÷ prix d\'achat / marge ÷ prix de vente'],
]);
deck('m.pct', 'calcul', 'Pourcentages réflexes', 'Les évolutions qu\'il faut reconnaître sans calculer', [
  ['+20 % puis −20 %', '−4 % (1,2 × 0,8 = 0,96)'], ['+10 % puis +10 %', '+21 %'], ['+25 % puis −20 %', '0 % (1,25 × 0,8 = 1)'], ['+50 % puis −50 %', '−25 %'], ['−50 % puis +100 %', '0 %'],
  ['Pour annuler +25 %', '−20 %'], ['Pour annuler −20 %', '+25 %'], ['Pour annuler +50 %', '≈ −33,3 %'], ['Pour annuler −50 %', '+100 %'], ['Pour annuler +100 %', '−50 %'],
  ['De 8 % à 10 %', '+2 points, soit +25 %'], ['TTC → HT (TVA 20 %)', 'diviser par 1,2'], ['15 % de N', '10 % + 5 % (la moitié de 10 %)'], ['8 % de 50', '= 50 % de 8 = 4'], ['Après −20 %, prix 64 €. Avant ?', '64 ÷ 0,8 = 80 €'],
]);
deck('m.durees', 'calcul', 'Durées et vitesses', 'Heures décimales et conversions express', [
  ['0,1 h', '6 min'], ['0,2 h', '12 min'], ['0,25 h', '15 min'], ['0,4 h', '24 min'], ['0,75 h', '45 min'], ['1,2 h', '1 h 12'], ['2,4 h', '2 h 24'],
  ['20 min', F(1, 3) + ' h'], ['40 min', F(2, 3) + ' h'], ['1 h 15', '1,25 h'], ['1 h 45', '1,75 h'], ['36 min', '0,6 h'],
  ['60 km/h', '1 km par minute'], ['90 km/h', '1,5 km par minute'], ['120 km/h', '2 km par minute'], ['72 km/h', '20 m/s'], ['90 km/h en m/s', '25 m/s'], ['36 km/h', '10 m/s'],
]);
deck('m.cm', 'cm', 'Conditions minimales', 'Les 5 réponses et les pièges', [
  ['Réponse A', '(1) seule suffit, pas (2) seule'], ['Réponse B', '(2) seule suffit, pas (1) seule'], ['Réponse C', 'Les deux ensemble, aucune seule'], ['Réponse D', 'Chacune suffit seule'], ['Réponse E', 'Même ensemble, ça ne suffit pas'],
  ['Ordre de la méthode', '(1) seule → (2) seule → ensemble'], ['x² = 16 suffit-il pour x ?', 'Non : x = 4 ou x = −4'], ['« x + y = 10 » et « 2x + 2y = 20 »', 'Une seule équation : ensemble, ça ne suffit pas'],
  ['Pour connaître a/b', 'Une relation comme 2a = 3b suffit, pas besoin de a et b'], ['Question oui / non', 'Un « non » certain est une réponse : la condition suffit'], ['Faut-il finir le calcul ?', 'Non, savoir qu\'on PEUT trouver suffit'], ['Effectifs inconnus, proportion connue', 'Suffit pour une moyenne pondérée'],
]);
deck('m.log', 'logique', 'Logique : repères', 'Rangs des lettres et schémas fréquents', [
  ['E', '5'], ['J', '10'], ['O', '15'], ['T', '20'], ['Y', '25'], ['H', '8'], ['M', '13'], ['R', '18'], ['W', '23'], ['K', '11'], ['P', '16'], ['U', '21'],
  ['Dominos : après 6 ?', '0 (on compte modulo 7)'], ['Cartes : valeurs', 'As 1 · Valet 11 · Dame 12 · Roi 13'], ['Suite bloquée ?', 'Regarde une case sur deux'], ['2, 3, 5, 8, 13…', 'Fibonacci : somme des deux précédents'], ['1, 3, 7, 15, 31…', '× 2 + 1'], ['3, 5, 9, 15, 23…', 'Écarts +2, +4, +6, +8 → 33'],
]);
deck('m.ra', 'ra', 'Logique et sophismes', 'Raisonnement & Argumentation', [
  ['« Si A alors B » : contraposée', 'Si non B, alors non A (toujours vraie)'], ['« Si A alors B » : réciproque', 'Si B alors A (pas forcément vraie)'], ['Condition nécessaire', 'Sans elle, impossible ; mais elle ne garantit rien'], ['Condition suffisante', 'Elle garantit le résultat'],
  ['« Tous les A sont B »', 'Ne veut pas dire que tous les B sont A'], ['Hypothèse implicite : le test', 'Nier la réponse : si l\'argument s\'effondre, c\'est la bonne'],
  ['Corrélation ≠ causalité', 'Deux choses liées n\'impliquent pas que l\'une cause l\'autre'], ['Généralisation hâtive', 'Conclure à partir de trop peu de cas'], ['Faux dilemme', 'Présenter deux options comme les seules possibles'], ['Pente glissante', 'Enchaîner des conséquences de plus en plus graves sans preuve'],
  ['Ad hominem', 'Attaquer la personne au lieu de l\'argument'], ['Appel à l\'autorité', 'S\'appuyer sur quelqu\'un qui n\'est pas compétent'], ['Raisonnement circulaire', 'Utiliser la conclusion comme preuve'], ['Biais de sélection', 'Comparer des groupes qui n\'étaient pas comparables au départ'], ['Homme de paille', 'Déformer la position de l\'autre pour la réfuter plus facilement'], ['« Seuls les X ont Y »', 'Avoir Y implique être X (condition nécessaire)'],
]);
deck('m.paro', 'expr', 'Paronymes', 'Les mots qui se ressemblent', [
  ['éminent / imminent', 'remarquable / qui va arriver bientôt'], ['effraction / infraction', 'entrée en forçant / violation d\'une règle'], ['conjecture / conjoncture', 'hypothèse / situation du moment'], ['perpétrer / perpétuer', 'commettre / faire durer'],
  ['prodige / prodigue', 'surdoué, miracle / dépensier'], ['recouvrer / recouvrir', 'retrouver / couvrir entièrement'], ['acception / acceptation', 'sens d\'un mot / fait d\'accepter'], ['partial / partiel', 'injuste / incomplet'],
  ['opprimer / oppresser', 'tyranniser / gêner la respiration'], ['émigrer / immigrer', 'quitter son pays / s\'installer dans un pays'], ['compréhensif / compréhensible', 'indulgent / qu\'on peut comprendre'], ['avènement / événement', 'arrivée au pouvoir / fait marquant'],
  ['collision / collusion', 'choc / entente secrète'], ['inclinaison / inclination', 'pente / penchant, goût'], ['allocution / allocation', 'discours / somme versée'], ['éruption / irruption', 'sortie brutale (volcan) / entrée brutale'],
]);
deck('m.vocab', 'expr', 'Vocabulaire soutenu', 'Les mots qui tombent', [
  ['laconique', 'bref, concis'], ['prolixe', 'trop long, bavard'], ['éphémère', 'qui dure peu'], ['pérenne', 'durable'], ['fortuit', 'dû au hasard'], ['vétuste', 'abîmé par le temps'], ['sibyllin', 'obscur, énigmatique'],
  ['pusillanime', 'qui manque de courage'], ['acerbe', 'mordant, agressif'], ['exhaustif', 'complet'], ['idoine', 'approprié'], ['véhément', 'fougueux, emporté'], ['ubuesque', 'absurde et grotesque'], ['obsolète', 'dépassé'],
  ['prosaïque', 'banal, terre à terre'], ['dithyrambique', 'extrêmement élogieux'], ['gageure', 'action très difficile à réussir'], ['abscons', 'difficile à comprendre'], ['inique', 'très injuste'], ['probe', 'honnête, intègre'],
]);
deck('m.regles', 'expr', 'Règles de grammaire', 'Accords, modes et constructions', [
  ['Participe passé avec avoir', 'Accord avec le COD seulement s\'il est AVANT'], ['« Elles se sont lavé les mains »', 'Pas d\'accord : le COD (les mains) est après'], ['« Ils se sont parlé »', 'Pas d\'accord : on parle À quelqu\'un (COI)'], ['« Fait » + infinitif', 'Toujours invariable'],
  ['Après « bien que »', 'Subjonctif'], ['Après « après que »', 'Indicatif'], ['Après « avant que »', 'Subjonctif'], ['« Si j\'… su »', 'avais (jamais de conditionnel après si)'],
  ['Se rappeler / se souvenir', 'se rappeler QUELQUE CHOSE / se souvenir DE quelque chose'], ['Pallier', 'pallier un problème (sans « à »)'], ['« Malgré que »', 'Fautif : écrire « bien que »'], ['Des chaussures marron', 'Couleur issue d\'un nom : invariable'],
  ['« Tout » + adjectif féminin à consonne', 's\'accorde : elles sont toutes honteuses'], ['Midi et demi / une heure et demie', 'demi s\'accorde avec le nom qui précède'], ['Je vous … gré', 'saurais (verbe savoir)'], ['Davantage / d\'avantage', 'davantage = plus'],
]);
function deckStats(dk) {
  const C = Store.S.cards || {}, now = Date.now();
  let seen = 0, mastered = 0, due = 0;
  dk.cards.forEach((c) => { const s = C[c.id]; if (s) { seen++; if (s.box >= 4) mastered++; if (s.due <= now) due++; } });
  return { seen, mastered, due, total: dk.cards.length, fresh: dk.cards.length - seen };
}
function cardQueue(deckIds, max = 15) {
  const C = Store.S.cards || {}, now = Date.now();
  const decks = TM.decks.filter((d) => !deckIds || deckIds.includes(d.id));
  const all = [].concat(...decks.map((d) => d.cards.map((c) => Object.assign({ deck: d }, c))));
  const due = all.filter((c) => C[c.id] && C[c.id].due <= now).sort((a, b) => C[a.id].due - C[b.id].due);
  const fresh = all.filter((c) => !C[c.id]);
  const R = makeRng(newSeed());
  return due.concat(R.shuffle(fresh)).slice(0, max);
}
function rateCard(id, knew) {
  const C = Store.S.cards || (Store.S.cards = {});
  const s = C[id] || { box: 0, due: 0 };
  s.box = knew ? Math.min(5, s.box + 1) : 1;
  s.due = Date.now() + (knew ? [0, 1, 3, 7, 16, 35][s.box] * DAY_MS : 10 * 60000);
  C[id] = s;
}
