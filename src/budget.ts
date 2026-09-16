import { readFile } from "node:fs/promises";
import type { Budget, RuleResult, ScoreReport } from "./types.js";

export async function loadBudget(path: string): Promise<Budget> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as Budget;
}

export interface BudgetEvaluation {
  pass: boolean;
  failures: RuleResult[];
  overallFailure: boolean;
}

export function evaluateBudget(report: ScoreReport, budget: Budget): BudgetEvaluation {
  const failures: RuleResult[] = [];

  if (budget.minRuleScores) {
    for (const result of report.results) {
      const minScore = budget.minRuleScores[result.id];
      if (minScore !== undefined && result.score < minScore) {
        failures.push(result);
      }
    }
  }

  const overallFailure =
    budget.minOverallScore !== undefined && report.overallScore < budget.minOverallScore;

  return {
    pass: failures.length === 0 && !overallFailure,
    failures,
    overallFailure,
  };
}
