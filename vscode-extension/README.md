# A11yscan (extension VS Code)

Lance un scan d'accessibilité (RGAA, basé sur axe-core) sur une URL directement
depuis VS Code. Même moteur que le CLI a11yscan (dossier parent de ce repo) : le
code (`engine`, `scoring`, `rgaaMapping`, axe-core lui-même) est bundlé directement
dans l'extension via esbuild — pas de dépendance runtime au package npm.

## Statut

Prototype fonctionnel — `.vsix` installable manuellement, pas de publication
Marketplace prévue pour l'instant.

## Usage

1. Palette de commandes (`Ctrl+Shift+P`) → **A11yscan: Scanner une URL**
2. Saisir l'URL à scanner (mémorisée par workspace)
3. Le rapport s'ouvre dans un panneau à côté de l'éditeur — score global (jauge),
   scores par thématique RGAA, détail des règles avec référence RGAA, section "à
   vérifier manuellement" pour ce qu'axe-core ne peut pas trancher seul.

### Budget optionnel

Paramètre VS Code `a11yscan.budgetPath` — chemin relatif vers un fichier budget.json
(voir `budget.example.json` à la racine du projet).

## Développement

Le projet racine (`../`) doit être buildé au moins une fois avant l'extension (génère
`axeSource.generated.ts` et compile `dist/`) :

```bash
cd .. && npm run build && cd vscode-extension
npm install
npm run build       # bundle esbuild -> dist/extension.js (inclut axe-core, ~590 Ko)
npm run typecheck
```

Puis `F5` dans VS Code pour lancer une fenêtre de test avec l'extension chargée.

Pour un `.vsix` installable :

```bash
npx vsce package --allow-missing-repository
code --install-extension a11yscan-vscode-0.1.0.vsix --force
```

## Limites connues

- Le bundle (~590 Ko) inclut axe-core en clair — pas un problème pour un usage
  interne, mais à garder en tête si publication envisagée un jour.
- Un seul panneau de rapport à la fois.
- Pas de détection automatique du port du serveur de dev — URL saisie manuellement.
- Voir les limites du moteur (couverture RGAA partielle, mapping indicatif) dans le
  README à la racine du projet.
