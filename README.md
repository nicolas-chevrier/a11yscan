# a11yscan

Scanner d'accessibilité numérique (RGAA) intégrable en CI/CD pour les équipes dev,
propulsé par [axe-core](https://github.com/dequelabs/axe-core) (moteur de test
d'accessibilité standard de l'industrie, utilisé par Google, Microsoft, Deque).

Même logique que [ecoscan](../ecoscan) pour l'écoconception : charge une page réelle,
exécute des vérifications automatisées, mappe les résultats vers les critères RGAA
correspondants, calcule un score, et peut faire échouer une build si un budget défini
est dépassé.

## Statut

MVP fonctionnel — CLI + moteur réutilisable. Testé sur des sites réels (résultats
variés et cohérents, contraste/alt/labels détectés correctement).

## Pourquoi axe-core plutôt que des règles écrites à la main

Contrairement à ecoscan (où aucune librairie standard n'existe pour l'écoconception),
axe-core couvre déjà des dizaines de critères WCAG 2.x de façon fiable et maintenue.
Le travail de ce projet est donc le **mapping axe-core → RGAA** (voir
`src/rgaaMapping.ts`) et la présentation des résultats par thématique RGAA plutôt que
par règle technique — pas la détection elle-même.

## Installation

```bash
npm install
```

## Usage

```bash
npx tsx src/cli.ts run --url https://example.com
```

> **Windows/PowerShell** : comme pour ecoscan, évite `npm run dev -- run --url ...`
> (npm avale `--url` sur PowerShell). Utilise `npx tsx` ou `node dist/cli.js`
> directement.

Avec un budget (fait échouer la commande si le budget n'est pas respecté) :

```bash
npx tsx src/cli.ts run --url https://example.com --budget budget.example.json
```

Rapport JSON :

```bash
npx tsx src/cli.ts run --url https://example.com --out report.json
```

## Build

```bash
npm run build
node dist/cli.js run --url https://example.com
```

## Structure du rapport

Pour chaque règle axe-core mappée à un critère RGAA :

- **violation** — élément(s) non conforme(s) détecté(s), score dégradé selon la
  sévérité axe-core (minor/moderate/serious/critical) et le nombre d'éléments
  concernés (plafonné à 3 pour éviter qu'une règle à centaines d'occurrences
  n'écrase le score sans nuance).
- **pass** — conforme, score 100.
- **incomplete** — axe-core ne peut pas trancher automatiquement (ex: contraste sur
  fond en image, mécanisme d'évitement à tester manuellement). Exclu du score
  global, listé séparément sous "À vérifier manuellement".

Une règle axe-core peut apparaître comme conforme sur certains éléments et non
conforme sur d'autres au sein d'une même page (comportement normal du moteur) — le
rapport fusionne ces résultats en une seule ligne par règle plutôt que d'afficher des
lignes contradictoires.

Les règles axe-core hors de la table de correspondance RGAA (`src/rgaaMapping.ts`)
sont exclues du score et comptées séparément ("N autre(s) vérification(s)... hors
table RGAA") plutôt que rattachées arbitrairement à un critère.

## Extensions

Le moteur (`buildReport`, `rgaaMapping`, types) est exposé via `src/index.ts` et des
sous-chemins (`a11yscan/scoring`, `a11yscan/rgaaMapping`, `a11yscan/types`) pour être
réutilisé sans dépendre de Puppeteer :

- [extension VS Code](vscode-extension) — scanne une URL depuis l'éditeur (utilise
  Puppeteer, comme le CLI).
- [extension Chrome](chrome-extension) — scanne l'onglet actif, sans Puppeteer :
  axe-core est injecté directement dans la page.
- [extension Firefox](firefox-extension) — même code que l'extension Chrome (via
  `browser.*`/webextension-polyfill), dossier réduit au manifeste Firefox.

## Limites connues

- **La table RGAA (`rgaaMapping.ts`) est indicative**, construite à partir de la
  correspondance WCAG ↔ RGAA généralement admise, mais à vérifier contre le
  référentiel en vigueur avant tout usage en audit officiel ou appel d'offres.
- **axe-core ne couvre pas tout le RGAA.** Le RGAA compte 106 critères, dont une
  bonne partie nécessite un jugement humain (pertinence d'un texte alternatif,
  cohérence de la navigation, qualité d'une transcription...). axe-core détecte ce
  qui est mécaniquement vérifiable ; le reste doit rester un audit manuel.
- Un seul run = un seul scan ponctuel de la page chargée, pas de test d'interaction
  clavier/lecteur d'écran réel, pas de test multi-pages.
