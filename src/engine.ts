import puppeteer from "puppeteer";
import type { ScoreReport } from "./types.js";
import { buildReport, type RawAxeResults } from "./scoring.js";
import { AXE_SOURCE } from "./axeSource.generated.js";

export async function scanUrl(url: string): Promise<ScoreReport> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
    await page.evaluate(AXE_SOURCE);

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
