import { createRequire } from "node:module";
import { copyFileSync, mkdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

mkdirSync(new URL("../vendor/", import.meta.url), { recursive: true });
copyFileSync(axePath, new URL("../vendor/axe.min.js", import.meta.url));
console.log("vendor/axe.min.js synchronisé depuis", axePath);
