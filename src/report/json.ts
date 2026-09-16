import { writeFile } from "node:fs/promises";
import type { ScoreReport } from "../types.js";

export async function writeJsonReport(report: ScoreReport, outPath: string): Promise<void> {
  await writeFile(outPath, JSON.stringify(report, null, 2), "utf-8");
}
