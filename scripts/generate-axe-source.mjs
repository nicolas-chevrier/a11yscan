// Génère src/axeSource.generated.ts : embarque le contenu de axe-core en
// constante string plutôt que de résoudre son chemin au runtime via
// import.meta.url/require.resolve. Ce dernier point casse silencieusement
// quand ce module est ensuite bundlé en CJS par esbuild (VS Code extension) —
// import.meta.url devient une chaîne vide dans ce contexte, et
// createRequire("") lève une exception au runtime.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const source = readFileSync(axePath, "utf-8");

const output = `// Généré automatiquement par scripts/generate-axe-source.mjs — ne pas éditer à la main.
export const AXE_SOURCE: string = ${JSON.stringify(source)};
`;

writeFileSync(new URL("../src/axeSource.generated.ts", import.meta.url), output);
console.log(`src/axeSource.generated.ts généré (${source.length} caractères)`);
