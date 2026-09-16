export type AxeImpact = "minor" | "moderate" | "serious" | "critical";

export interface RgaaMappingEntry {
  rgaaRef: string;
  category: string;
}

export interface AxeNodeSummary {
  target: string;
  html: string;
}

export interface RuleResult {
  id: string; // identifiant de règle axe-core
  category: string; // thématique RGAA
  label: string; // description de la règle axe-core
  rgaaRef: string; // "1.1", ou "Non mappé (wcagXXX)" si absent de la table
  status: "violation" | "pass" | "incomplete";
  pass: boolean;
  score: number; // 0-100 ; absente du calcul de score global si status="incomplete"
  impact: AxeImpact | null;
  message: string;
  nodeCount: number;
  examples: AxeNodeSummary[];
}

export interface ScoreReport {
  url: string;
  overallScore: number;
  byCategory: Record<string, number>;
  results: RuleResult[];
  needsReview: RuleResult[]; // règles "incomplete" nécessitant une vérification manuelle
  unmappedPassCount: number; // règles axe-core hors table RGAA, passées avec succès
  axeVersion: string;
  timestamp: string;
}

export interface Budget {
  minOverallScore?: number;
  minRuleScores?: Record<string, number>;
}
