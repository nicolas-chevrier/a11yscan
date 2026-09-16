import puppeteer from "puppeteer";
import { createRequire } from "node:module";
import type { ScoreReport } from "./types.js";
import { buildReport, type RawAxeResults } from "./scoring.js";

const require = createRequire(import.meta.url);
const axeCorePath = require.resolve("axe-core/axe.min.js");

export async function scanUrl(url: string): Promise<ScoreReport> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
    await page.addScriptTag({ path: axeCorePath });

    const raw = (await page.evaluate(async () => {
      // @ts-expect-error injecté globalement par axe.min.js
      return await window.axe.run(document, {
        resultTypes: ["violations", "passes", "incomplete"],
      });
    })) as RawAxeResults;

    return buildReport(url, raw);
  } finally {
    await browser.close();
  }
}
