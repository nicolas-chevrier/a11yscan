import pc from "picocolors";
import type { ScoreReport } from "../types.js";
import type { BudgetEvaluation } from "../budget.js";

function scoreColor(score: number): (s: string) => string {
  if (score >= 80) return pc.green;
  if (score >= 50) return pc.yellow;
  return pc.red;
}

export function printConsoleReport(report: ScoreReport, budgetEval?: BudgetEvaluation): void {
  console.log("");
  console.log(pc.bold(`a11yscan — ${report.url}`));
  console.log(
    `Score global: ${scoreColor(report.overallScore)(`${report.overallScore}/100`)}`
  );
  console.log(pc.dim(`axe-core ${report.axeVersion}`));
  console.log("");

  console.log(pc.bold("Par thématique RGAA:"));
  for (const [category, score] of Object.entries(report.byCategory)) {
    console.log(`  ${category.padEnd(28)} ${scoreColor(score)(`${score}/100`)}`);
  }
  console.log("");

  console.log(pc.bold("Détail des règles:"));
  for (const result of report.results) {
    const icon = result.pass ? pc.green("✓") : pc.red("✗");
    const color = scoreColor(result.score);
    console.log(
      `  ${icon} [RGAA ${result.rgaaRef}] ${result.label.padEnd(45)} ${color(`${result.score}/100`)}`
    );
    console.log(`      ${pc.dim(result.message)}`);
  }

  if (report.needsReview.length > 0) {
    console.log("");
    console.log(pc.bold(pc.yellow("À vérifier manuellement:")));
    for (const r of report.needsReview) {
      console.log(`  ⚠ [RGAA ${r.rgaaRef}] ${r.label} — ${pc.dim(r.message)}`);
    }
  }

  if (report.unmappedPassCount > 0) {
    console.log("");
    console.log(
      pc.dim(
        `${report.unmappedPassCount} autre(s) vérification(s) axe-core conforme(s), hors table RGAA.`
      )
    );
  }

  if (budgetEval) {
    console.log("");
    if (budgetEval.pass) {
      console.log(pc.green(pc.bold("✓ Budget respecté")));
    } else {
      console.log(pc.red(pc.bold("✗ Budget dépassé")));
      if (budgetEval.overallFailure) {
        console.log(pc.red(`  Score global sous le seuil défini`));
      }
      for (const failure of budgetEval.failures) {
        console.log(pc.red(`  - ${failure.label}: ${failure.score}/100`));
      }
    }
  }
  console.log("");
}
