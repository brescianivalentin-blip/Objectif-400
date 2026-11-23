/* ===== IA (Claude) : explications, prof particulier, génération de questions ===== */
function toPlain(html) {
  if (typeof document === 'undefined') return String(html || '').replace(/<[^>]+>/g, ' ');
  const d = document.createElement('div');
  d.innerHTML = html || '';
  d.querySelectorAll('svg').forEach((s) => s.replaceWith('[figure]'));
  let guard = 0, inner;
  while ((inner = Array.from(d.querySelectorAll('.fr')).filter((f) => !f.querySelector('.fr'))).length && guard++ < 50) {
    inner.forEach((f) => { const [a, b] = f.children; f.replaceWith(`(${a ? a.textContent : ''})/(${b ? b.textContent : ''})`); });
  }
  d.querySelectorAll('.sq').forEach((s) => { const r = s.querySelector('.sq-r'); s.replaceWith(`√(${r ? r.textContent : ''})`); });
  d.querySelectorAll('sup').forEach((s) => s.replaceWith('^' + s.textContent));
  d.querySelectorAll('li').forEach((li) => li.prepend('- '));
  d.querySelectorAll('p, li, div, br').forEach((n) => n.append('\n'));
  return d.textContent.replace(/[ \t ]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

const AI_THEMES = ['la semaine de quatre jours', 'l\'intelligence artificielle et l\'emploi', 'la mode éphémère (fast fashion)', 'le tourisme de masse', 'la sobriété énergétique', 'les cryptomonnaies', 'le marketing d\'influence', 'la désinformation en ligne', 'la revitalisation des villes moyennes', 'le sport professionnel et l\'argent', 'la voiture électrique', 'l\'économie du partage', 'la gratuité des services publics', 'la place des seniors dans l\'entreprise', 'le commerce en ligne et les centres-villes', 'la souveraineté industrielle', 'le bien-être au travail', 'l\'endettement des États', 'la publicité ciblée', 'les start-up et la prise de risque'];

const AI = {
  fn: null,
  off: false,
  ready: false,
  async init() {
    if (typeof window === 'undefined' || !window.claude || typeof window.claude.use !== 'function') { this.ready = true; return; }
    try { this.fn = await window.claude.use('sample'); } catch (e) { this.fn = null; }
    this.ready = true;
  },
  available() { return !!this.fn && !this.off; },
  errMsg(e) {
    const c = e && e.code;
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) { this.off = true; return 'Claude n\'est pas autorisé sur cette page. L\'app fonctionne sans l\'IA ; tu peux l\'autoriser depuis le menu Autorisations de l\'artifact.'; }
    if (c === 'rate_limited') return 'Limite d\'utilisation de Claude atteinte pour le moment. Réessaie un peu plus tard.';
    if (c === 'session_expired') return 'Ta session Claude a expiré : reconnecte-toi puis réessaie.';
    if (c === 'refused') return 'Claude n\'a pas pu répondre à cette demande. Reformule ta question.';
    if (c === 'invalid_json') return 'La réponse de Claude était incomplète. Réessaie.';
    if (c === 'prompt_too_large') return 'La demande est trop longue. Raccourcis ton message.';
    if (c === 'cancelled') return '';
    return 'Problème de connexion avec Claude. Réessaie dans un instant.';
  },
  profile() {
    const p = Store.S.profile;
    return `Profil de l'élève : ${p.about || 'non renseigné'} Objectif : ${p.target}/600.${p.examDate ? ' Date du test : ' + p.examDate + '.' : ' Date du test : pas encore fixée.'}`;
  },
  rules: 'Règles d\'écriture : français, tutoiement, phrases courtes, pas de LaTeX ni de balises ; écris les fractions sous la forme a/b, utilise ×, ÷, √ et le symbole %, numérote les étapes de calcul.',

  questionText(q, chosen) {
    const sub = SUB[q.sub] ? SUB[q.sub].name : q.sub;
    let t = `Sous-test : ${sub}.\n`;
    if (q.passageTitle || q.passage) t += `TEXTE (extrait) : ${toPlain(q.passage || '').slice(0, 2500)}\n`;
    t += `QUESTION : ${q.aiq || toPlain(q.q)}\n`;
    if (q.visual && !q.aiq) t += `(La question comporte une figure : ${toPlain(q.visual).slice(0, 300)})\n`;
    if (q.stmts) t += `Condition (1) : ${toPlain(q.stmts[0])}\nCondition (2) : ${toPlain(q.stmts[1])}\n`;
    const ch = q.aic || q.choices.map(toPlain);
    t += 'CHOIX :\n' + ch.map((c, i) => `${LETTERS[i]}) ${c}`).join('\n') + '\n';
    t += `BONNE RÉPONSE : ${LETTERS[q.answer]}\n`;
    t += chosen == null ? 'L\'élève n\'a pas répondu.\n' : chosen === q.answer ? 'L\'élève a trouvé la bonne réponse mais veut mieux comprendre.\n' : `RÉPONSE DE L'ÉLÈVE : ${LETTERS[chosen]}\n`;
    t += `CORRECTION DE L'APP : ${toPlain(q.expl || '')}\n`;
    return t;
  },

  async explain(q, chosen, onText, signal) {
    const wrong = chosen != null && chosen !== q.answer;
    const prompt = `Tu es un professeur particulier expert du Tage Mage (test d'admission des écoles de commerce françaises). ${this.profile()}\n\n${this.questionText(q, chosen)}\nExplique autrement et très simplement, pour quelqu'un qui a un bac STMG et qui est lent en calcul mental :\n${wrong ? '1. l\'erreur de raisonnement que l\'élève a probablement faite,\n2.' : '1.'} la méthode la plus rapide pour trouver la bonne réponse en moins de 80 secondes le jour du test,\n${wrong ? '3.' : '2.'} un réflexe ou une astuce à retenir pour la prochaine fois.\n180 mots maximum. ${this.rules}`;
    const r = await this.fn(prompt, { onText, signal, cache: { gcTime: 3600000 } });
    return r.text;
  },

  async chat(turns, onText, signal) {
    const rules = `Tu es « Prof », le professeur particulier de l'élève dans son application de révision du Tage Mage « Objectif 400 ». ${this.profile()}\nBilan calculé par l'application : ${statsSummary()}\nRappels : le Tage Mage comporte 6 sous-tests de 15 questions en 20 minutes (Compréhension de textes, Calcul, Raisonnement & Argumentation, Conditions minimales, Expression, Logique), QCM à 5 choix, pas de calculatrice, score sur 600. Barème utilisé dans l'app : ${scoringPenalty() ? '+4 par bonne réponse, −1 par mauvaise' : '+4 par bonne réponse, 0 pour une mauvaise ou une absence de réponse'}.\nTa mission : expliquer simplement, donner des méthodes rapides et des astuces de calcul mental, proposer des mini-exercices (une seule question à la fois ; attends la réponse de l'élève avant de corriger), et motiver sans infantiliser. Si on te parle d'autre chose, ramène gentiment vers la préparation.\nRéponses courtes (150 mots maximum sauf si l'élève demande plus). ${this.rules}`;
    const msgs = [{ role: 'user', content: rules }, { role: 'assistant', content: 'Compris. Je suis prêt à aider l\'élève.' }, ...turns.slice(-16)];
    const r = await this.fn(msgs, { onText, signal, cache: false });
    return r.text;
  },

  async coach(onText, signal) {
    const prompt = `Tu es le coach Tage Mage de l'élève. ${this.profile()}\nVoici ses statistiques calculées par l'application : ${statsSummary()}\nDonne-lui un diagnostic honnête et un plan pour les 7 prochains jours : 1) ses 3 priorités (chapitres précis), 2) ce qu'il fait déjà bien, 3) un programme jour par jour réaliste avec ${Store.S.profile.dailyMin} minutes par jour, 4) une phrase de motivation. 220 mots maximum. ${this.rules}`;
    const r = await this.fn(prompt, { onText, signal, cache: false });
    return r.text;
  },

  validItem(x, nCh = 5) {
    return x && Array.isArray(x.choix) && x.choix.length === nCh && x.choix.every((c) => typeof c === 'string' && c.trim()) &&
      new Set(x.choix.map((c) => c.trim().toLowerCase())).size === nCh && Number.isInteger(x.bonne) && x.bonne >= 0 && x.bonne < nCh && typeof x.explication === 'string';
  },
  mkQ(sub, skillCat, qHtml, x, extra = {}) {
    return Object.assign({ id: 'ai-' + uid(), kind: 'qcm', sub, skill: sub + '.' + skillCat, diff: 2, q: qHtml, choices: x.choix.map((c) => inlineMd(esc(c.trim()))), answer: x.bonne, expl: md(x.explication), ai: true, target: 80 }, extra);
  },

  async generate(sub, n, opts = {}) {
    const lvl = opts.level || 'difficile, comparable au vrai test';
    let prompt, data;
    if (sub === 'ra') {
      prompt = `Crée ${n} questions ORIGINALES du sous-test « Raisonnement & Argumentation » du Tage Mage, niveau ${lvl}, en français.\nChaque question : un court raisonnement (3 à 5 phrases) sur un thème d'économie, de management, de société ou d'actualité, suivi d'une consigne parmi : trouver la conclusion, l'hypothèse implicite, ce qui affaiblit le plus, ce qui renforce le plus, la faille du raisonnement, le raisonnement de même structure, ce que l'on peut déduire avec certitude, ce qui explique un paradoxe. Varie les consignes et les thèmes.\n5 choix plausibles et une seule réponse indiscutable. Les mauvaises réponses doivent correspondre à des pièges classiques (trop fort, hors sujet, réciproque, simple reprise d'une prémisse…).\nRéponds UNIQUEMENT avec un tableau JSON de cette forme : [{"argument": "…", "consigne": "…", "choix": ["…", "…", "…", "…", "…"], "bonne": 2, "explication": "…"}] où "bonne" est l'indice (0 à 4) de la bonne réponse. Place la bonne réponse à des positions variées. L'explication (2 à 4 phrases) dit pourquoi la bonne réponse est juste et pourquoi le piège principal est faux.`;
      data = await this.fn.json(prompt, { cache: false });
      if (!Array.isArray(data)) throw { code: 'invalid_json' };
      return data.filter((x) => this.validItem(x) && x.argument && x.consigne).slice(0, n).map((x) => this.mkQ('ra', 'ia', `<p class="arg">${inlineMd(esc(x.argument))}</p><p><b>${inlineMd(esc(x.consigne))}</b></p>`, x));
    }
    if (sub === 'expr') {
      const focus = opts.focus || 'mélange : accords du participe passé, conjugaison et modes (subjonctif, concordance des temps), homophones, paronymes, sens de mots soutenus, constructions verbales, pléonasmes, connecteurs logiques';
      prompt = `Crée ${n} questions ORIGINALES du sous-test « Expression » du Tage Mage (français écrit soutenu), niveau ${lvl}. Thèmes : ${focus}.\nFormats : phrase à compléter (avec ____), « Quelle phrase est correcte ? », « Que signifie le mot … ? ».\n5 choix, une seule réponse correcte selon la norme (Académie française, grammaires de référence), sans aucune ambiguïté.\nRéponds UNIQUEMENT avec un tableau JSON : [{"question": "…", "choix": ["…", "…", "…", "…", "…"], "bonne": 0, "explication": "la règle en 1 ou 2 phrases"}] ; "bonne" est l'indice de 0 à 4, à des positions variées.`;
      data = await this.fn.json(prompt, { cache: false });
      if (!Array.isArray(data)) throw { code: 'invalid_json' };
      return data.filter((x) => this.validItem(x) && x.question).slice(0, n).map((x) => this.mkQ('expr', 'ia', `<p>${inlineMd(esc(x.question))}</p>`, x));
    }
    if (sub === 'cdt') {
      const theme = opts.theme || AI_THEMES[Math.floor(Math.random() * AI_THEMES.length)];
      prompt = `Écris un texte ORIGINAL de 450 à 550 mots, niveau universitaire, sur le thème : « ${theme} ». Style d'article d'analyse (presse économique ou essai), avec une thèse claire, des nuances, des exemples et des connecteurs logiques.\nPuis écris 5 questions de compréhension type Tage Mage, dans cet ordre de types : idée principale, détail, inférence, vocabulaire en contexte, position de l'auteur ou rôle d'un exemple. 5 choix par question, une seule bonne réponse justifiable par le texte ; les mauvaises réponses sont des pièges classiques (trop fort, déformation, hors texte, trop étroit).\nRéponds UNIQUEMENT avec un objet JSON : {"titre": "…", "texte": ["paragraphe 1", "paragraphe 2", "…"], "questions": [{"type": "idee", "question": "…", "choix": ["…", "…", "…", "…", "…"], "bonne": 0, "explication": "… (cite le passage utile)"}]} ; "bonne" est l'indice de 0 à 4, à des positions variées.`;
      data = await this.fn.json(prompt, { cache: false });
      if (!data || !Array.isArray(data.texte) || !Array.isArray(data.questions)) throw { code: 'invalid_json' };
      const html = data.texte.filter((p) => typeof p === 'string').map((p) => `<p>${esc(p)}</p>`).join('');
      const title = esc(data.titre || theme);
      const types = ['idee', 'detail', 'inference', 'vocab', 'auteur'];
      return data.questions.filter((x) => this.validItem(x) && x.question).slice(0, 5).map((x, i) => this.mkQ('cdt', types.includes(x.type) ? x.type : types[i] || 'idee', `<p><b>${inlineMd(esc(x.question))}</b></p>`, x, { passage: html, passageTitle: title }));
    }
    throw { code: 'invalid_request' };
  },
};

/* Résumé texte des statistiques, pour le prof et le coach */
function statsSummary() {
  const S = Store.S, lines = [];
  for (const s of SUBS) {
    const h = (S.subs[s.id] && S.subs[s.id].hist) || [];
    const p = projectSub(s.id);
    const acc = h.length ? Math.round(100 * h.reduce((a, x) => a + x[0], 0) / h.length) : null;
    lines.push(`${s.name} : ${h.length ? `${h.length} réponses récentes, ${acc} % de réussite` : 'pas encore travaillé'}${p != null ? `, estimation ${p}/60` : ''}`);
  }
  const weak = Object.values(TM.chapters).map((c) => ({ c, m: chapterMastery(c.id) })).filter((x) => x.m != null).sort((a, b) => a.m - b.m).slice(0, 4).map((x) => `${x.c.title} (${x.m} %)`);
  const pt = projectTotal();
  return lines.join(' ; ') + '. ' + (weak.length ? 'Chapitres les plus faibles : ' + weak.join(', ') + '. ' : '') + (pt.total != null ? `Projection actuelle : ${pt.total}/600. ` : '') + `Série de jours de travail : ${streakDays()}.`;
}
