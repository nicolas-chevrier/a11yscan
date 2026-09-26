# A11yscan (extension Firefox)

Même fonctionnalité que l'[extension Chrome](../chrome-extension) : scanne la page
active pour son accessibilité (RGAA, via axe-core). **Ne duplique aucun code** — le
build pointe directement vers `../chrome-extension/src/*.ts`.

## Installation (développement)

```bash
cd ../chrome-extension && npm install
cd ../firefox-extension && npm install
npm run build   # copie axe-core dans son propre vendor/ + bundle esbuild
```

Puis dans Firefox : `about:debugging#/runtime/this-firefox` → "Charger un module
complémentaire temporaire..." → sélectionner `manifest.json` dans ce dossier.

## Vérifié

`npx web-ext lint` : **0 erreur**. Avertissements restants (12) tous non bloquants :
`DANGEROUS_EVAL` vient du code minifié d'axe-core lui-même (`vendor/axe.min.js`,
tiers, hors de notre contrôle), `UNSAFE_VAR_ASSIGNMENT` est le pattern `innerHTML` du
rendu de rapport (contenu déjà échappé via `escapeHtml`).

## Limites connues

- `browser_specific_settings.gecko.id` est un placeholder — à changer avant toute
  publication AMO.
- Voir les limites du moteur (couverture RGAA partielle, mapping indicatif) dans le
  README à la racine du projet.
