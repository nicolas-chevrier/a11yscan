import type { RuleResult, ScoreReport } from "./types.js";
import { resolveRgaaMapping, UNMAPPED_CATEGORY } from "./rgaaMapping.js";

export interface RawAxeNode {
  target: string[];
  html: string;
}

export interface RawAxeResult {
  id: string;
  description: string;
  impact: string | null;
  tags: string[];
  nodes: RawAxeNode[];
}

export interface RawAxeResults {
  violations: RawAxeResult[];
  passes: RawAxeResult[];
  incomplete: RawAxeResult[];
  testEngine?: { version: string };
}

// Pénalité de score par élément fautif, modulée par la sévérité axe-core.
// Plafonnée à 3 éléments comptés pour éviter qu'une règle avec des centaines
// d'occurrences (ex: contraste sur tout un texte) n'écrase mécaniquement le
// score à 0 sans nuance.
const IMPACT_SCORE_PENALTY: Record<string, number> = {
  minor: 10,
  moderate: 20,
  serious: 35,
  critical: 50,
};

interface MergedRule {
  id: string;
  description: string;
  impact: string | null;
  tags: string[];
  violationNodes: RawAxeNode[];
  passNodes: RawAxeNode[];
  incompleteNodes: RawAxeNode[];
}

// axe-core évalue une règle par élément du DOM : sur une même page, une
// règle peut donc apparaître à la fois dans violations (pour certains
// éléments) et dans passes (pour d'autres) — ce n'est pas une incohérence,
// c'est le fonctionnement normal du moteur. On fusionne par id de règle
// avant scoring pour éviter d'afficher deux lignes contradictoires
// (ex: "region: ✗ 80/100" puis "region: ✓ 100/100" pour la même règle).
function mergeByRuleId(raw: RawAxeResults): Map<string, MergedRule> {
  const merged = new Map<string, MergedRule>();

  const getOrCreate = (r: RawAxeResult): MergedRule => {
    let entry = merged.get(r.id);
    if (!entry) {
      entry = {
        id: r.id,
        description: r.description,
        impact: r.impact,
        tags: r.tags,
        violationNodes: [],
        passNodes: [],
        incompleteNodes: [],
      };
      merged.set(r.id, entry);
    }
    // L'impact "le plus sévère" rencontré prévaut pour le scoring.
    if (impactRank(r.impact) > impactRank(entry.impact)) {
      entry.impact = r.impact;
    }
    return entry;
  };

  for (const v of raw.violations) getOrCreate(v).violationNodes.push(...v.nodes);
  for (const p of raw.passes) getOrCreate(p).passNodes.push(...p.nodes);
  for (const i of raw.incomplete) getOrCreate(i).incompleteNodes.push(...i.nodes);

  return merged;
}

function impactRank(impact: string | null): number {
  const order = ["minor", "moderate", "serious", "critical"];
  const idx = impact ? order.indexOf(impact) : -1;
  return idx;
}

function toRuleResult(m: MergedRule): RuleResult {
  const mapping = resolveRgaaMapping(m.id, m.tags);
  const totalChecked = m.violationNodes.length + m.passNodes.length;

  let status: RuleResult["status"];
  let score: number;
  let pass: boolean;
  let nodeCount: number;
  let examples: RuleResult["examples"];
  let message: string;

  if (m.violationNodes.length > 0) {
    status = "violation";
    pass = false;
    nodeCount = m.violationNodes.length;
    examples = m.violationNodes.slice(0, 5).map((n) => ({
      target: n.target.join(" "),
      html: n.html,
    }));
    const penalty = IMPACT_SCORE_PENALTY[m.impact ?? "moderate"] ?? 20;
    score = Math.max(0, 100 - penalty * Math.min(nodeCount, 3));
    const plural = nodeCount > 1 ? "s" : "";
    message =
      totalChecked > nodeCount
        ? `${m.description} (${nodeCount}/${totalChecked} élément${plural} non conforme${plural})`
        : `${m.description} (${nodeCount} élément${plural} concerné${plural})`;
  } else if (m.incompleteNodes.length > 0) {
    status = "incomplete";
    pass = false;
    score = 0;
    nodeCount = m.incompleteNodes.length;
    examples = m.incompleteNodes.slice(0, 5).map((n) => ({
      target: n.target.join(" "),
      html: n.html,
    }));
    const plural = nodeCount > 1 ? "s" : "";
    message = `${m.description} — à vérifier manuellement (${nodeCount} élément${plural})`;
  } else {
    status = "pass";
    pass = true;
    score = 100;
    nodeCount = m.passNodes.length;
    examples = [];
    message = `${m.description} — conforme`;
  }

  return {
    id: m.id,
    category: mapping.category,
    label: m.description,
    rgaaRef: mapping.rgaaRef,
    status,
    pass,
    score,
    impact: (m.impact as RuleResult["impact"]) ?? null,
    message,
    nodeCount,
    examples,
  };
}

export function buildReport(url: string, raw: RawAxeResults): ScoreReport {
  const merged = mergeByRuleId(raw);

  const mappedResults: RuleResult[] = [];
  const needsReview: RuleResult[] = [];
  let unmappedPassCount = 0;

  for (const m of merged.values()) {
    const result = toRuleResult(m);
    if (result.category === UNMAPPED_CATEGORY) {
      if (result.status === "pass") unmappedPassCount++;
      continue;
    }
    if (result.status === "incomplete") {
      needsReview.push(result);
    } else {
      mappedResults.push(result);
    }
  }

  const byCategory: Record<string, number[]> = {};
  for (const r of mappedResults) {
    byCategory[r.category] ??= [];
    byCategory[r.category].push(r.score);
  }
  const byCategoryAvg: Record<string, number> = {};
  for (const [category, scores] of Object.entries(byCategory)) {
    byCategoryAvg[category] = Math.round(
      scores.reduce((sum, s) => sum + s, 0) / scores.length
    );
  }
  const overallScore = mappedResults.length
    ? Math.round(
        mappedResults.reduce((sum, r) => sum + r.score, 0) / mappedResults.length
      )
    : 100;

  return {
    url,
    overallScore,
    byCategory: byCategoryAvg,
    results: mappedResults,
    needsReview,
    unmappedPassCount,
    axeVersion: raw.testEngine?.version ?? "inconnue",
    timestamp: new Date().toISOString(),
  };
}
