# A11yscan (extension Chrome)

Scanne la page active pour son accessibilité (RGAA, via axe-core), directement
depuis la barre d'outils du navigateur.

Plus simple que l'extension Chrome d'ecoscan : axe-core est conçu pour tourner
directement dans la page (comme un content script), donc pas besoin de recharger la
page ni d'orchestrer `chrome.webRequest` — on injecte axe-core dans l'onglet actif,
on récupère ses résultats bruts, et on les passe à `buildReport` (`a11yscan/scoring`,
même code que le CLI et l'extension VS Code) pour le mapping RGAA et le scoring.

## Statut

Prototype fonctionnel — installation manuelle via "Load unpacked" uniquement.

## Usage

1. Cliquer sur l'icône A11yscan dans la barre d'outils
2. Cliquer sur **"Scanner cette page"**
3. Le rapport s'ouvre dans un nouvel onglet — pas de rechargement de page nécessaire,
   axe-core analyse la page telle qu'elle est actuellement affichée

## Installation (développement)

Le projet racine (`../`) doit être buildé au moins une fois. Depuis
`chrome-extension/` :

```bash
cd .. && npm run build && cd chrome-extension
npm install
npm run build       # copie axe-core dans vendor/ + bundle esbuild
npm run typecheck
```

Puis dans Chrome : `chrome://extensions` → Mode développeur → "Charger l'extension
non empaquetée" → sélectionner le dossier `chrome-extension/`.

Pas de packaging nécessaire (pas de `.vsix`/`.crx`) pour un usage personnel — Chrome
charge le dossier directement.

## Limites connues

- **Permissions plus légères que prévu initialement** : `activeTab` suffit (pas de
  `<all_urls>` ni `webRequest`) puisqu'axe-core n'a besoin ni de recharger la page ni
  d'inspecter les en-têtes réseau — juste d'accéder au DOM de l'onglet actif au
  moment du clic.
- Un seul onglet de résultats à la fois (un nouvel onglet est créé à chaque scan).
- Voir les limites du moteur (couverture RGAA partielle, mapping indicatif) dans le
  README à la racine du projet.
