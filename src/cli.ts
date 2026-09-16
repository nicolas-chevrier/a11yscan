#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { scanUrl } from "./engine.js";
import { loadBudget, evaluateBudget } from "./budget.js";
import { printConsoleReport } from "./report/console.js";
import { writeJsonReport } from "./report/json.js";

const program = new Command();

program
  .name("a11yscan")
  .description("Scanner d'accessibilité (RGAA) pour équipes dev, basé sur axe-core")
  .version("0.1.0");

program
  .command("run")
  .description("Scanne une URL et calcule un score d'accessibilité RGAA")
  .requiredOption("--url <url>", "URL à scanner")
  .option("--budget <path>", "Chemin vers un fichier budget.json")
  .option("--out <path>", "Écrit le rapport JSON dans ce fichier")
  .option("--format <format>", "console | json", "console")
  .action(async (options) => {
    // stderr, pas stdout : --format json doit rester piped-friendly.
    console.error(pc.dim(`Scan de ${options.url}...`));
    const report = await scanUrl(options.url);

    let budgetEval;
    if (options.budget) {
      const budget = await loadBudget(options.budget);
      budgetEval = evaluateBudget(report, budget);
    }

    if (options.format === "json") {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printConsoleReport(report, budgetEval);
    }

    if (options.out) {
      await writeJsonReport(report, options.out);
      console.error(pc.dim(`Rapport JSON écrit dans ${options.out}`));
    }

    if (budgetEval && !budgetEval.pass) {
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(pc.red("Erreur:"), err.message ?? err);
  process.exitCode = 1;
});
