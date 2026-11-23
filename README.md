# Objectif 400

Application de révision du Tage Mage, pensée pour le téléphone : un onglet par sous-test (Calcul, Conditions minimales, Logique, Compréhension de textes, Raisonnement & Argumentation, Expression), des cours repris depuis les bases, des exercices générés à l'infini, des épreuves chronométrées de 15 questions en 20 minutes, un Tage Mage blanc complet, un cahier d'erreurs à révisions espacées et des statistiques.

Également : des exercices guidés pas à pas (le problème est découpé en étapes, avec indices), des fiches mémo à répétition espacée, un test de positionnement, un indicateur de rythme pendant les épreuves et un guide « stratégie le jour J ».

Application personnelle et non officielle, sans lien avec la FNEGE. Les questions sont originales.

## Deux versions

- **Lien Claude** : la version publiée sur claude.ai. La progression est synchronisée avec le compte Claude, et l'IA (explications, prof particulier, questions illimitées en verbal) y est disponible.
- **Hors-ligne (ce dépôt)** : la même application en PWA, servie par GitHub Pages. Elle fonctionne sans connexion une fois installée ; la progression reste sur le téléphone. Le menu Réglages permet de copier un code de transfert pour passer d'une version à l'autre.

## Installer sur iPhone

1. Dans le dépôt GitHub : **Settings → Pages → Source : Deploy from a branch → Branch : `main` / `(root)` → Save**.
2. Après une ou deux minutes, ouvrir l'adresse indiquée par GitHub (de la forme `https://<pseudo>.github.io/Objectif-400/`) **dans Safari**.
3. Bouton **Partager** → **Sur l'écran d'accueil** → **Ajouter**.

## Développement

Les sources sont dans `src/` (`styles.css` et les modules `src/js/*.js`, concaténés dans l'ordre des noms).

```bash
python3 build.py
```

Ce script produit `app.js`, `index.html`, `sw.js` et `manifest.webmanifest` à la racine (version hors-ligne), ainsi que `dist/artifact/` (version claude.ai) et `dist/test-bundle.js`.

```bash
node tests/run-tests.js
```

Les tests génèrent des centaines de questions par générateur et vérifient qu'il y a toujours 5 choix distincts, une bonne réponse valide et aucune valeur cassée.
