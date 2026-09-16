import type { BudgetEvaluation, ScoreReport } from "a11yscan";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreTier(score: number): "good" | "warn" | "bad" {
  if (score >= 80) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

function renderGauge(score: number): string {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return `
    <svg class="gauge" width="132" height="132" viewBox="0 0 132 132">
      <circle class="gauge-track" cx="66" cy="66" r="${radius}" fill="none" stroke-width="11" />
      <circle
        class="gauge-value ${scoreTier(score)}"
        cx="66" cy="66" r="${radius}" fill="none" stroke-width="11"
        stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(1)}"
        stroke-dashoffset="${offset.toFixed(1)}"
        transform="rotate(-90 66 66)"
      />
      <text x="66" y="61" text-anchor="middle" class="gauge-number">${score}</text>
      <text x="66" y="80" text-anchor="middle" class="gauge-suffix">/ 100</text>
    </svg>`;
}

function renderRuleRow(r: ScoreReport["results"][number]): string {
  const tier = scoreTier(r.score);
  return `
    <div class="rule-row">
      <div class="rule-icon ${tier}">${r.pass ? "✓" : "✗"}</div>
      <div class="rule-body">
        <div class="rule-top">
          <span class="rule-label"><span class="rgaa-badge">RGAA ${escapeHtml(r.rgaaRef)}</span>${escapeHtml(r.label)}</span>
          <span class="rule-score ${tier}">${r.score}/100</span>
        </div>
        <div class="rule-message">${escapeHtml(r.message)}</div>
      </div>
    </div>`;
}

export function renderReportHtml(report: ScoreReport, budgetEval?: BudgetEvaluation): string {
  const categoryCards = Object.entries(report.byCategory)
    .map(
      ([category, score]) => `
      <div class="category-card">
        <div class="category-name">${escapeHtml(category)}</div>
        <div class="category-score ${scoreTier(score)}">${score}</div>
        <div class="category-bar-track"><div class="category-bar-fill ${scoreTier(score)}" style="width:${score}%"></div></div>
      </div>`
    )
    .join("");

  const categorySections = Object.keys(report.byCategory)
    .map((category) => {
      const rows = report.results
        .filter((r) => r.category === category)
        .map(renderRuleRow)
        .join("");
      return `
      <section class="rule-section">
        <h2>${escapeHtml(category)}</h2>
        <div class="rule-list">${rows}</div>
      </section>`;
    })
    .join("");

  const reviewSection =
    report.needsReview.length > 0
      ? `
      <section class="rule-section">
        <h2>À vérifier manuellement</h2>
        <div class="rule-list">
          ${report.needsReview
            .map(
              (r) => `
            <div class="rule-row">
              <div class="rule-icon warn">?</div>
              <div class="rule-body">
                <div class="rule-top"><span class="rule-label"><span class="rgaa-badge">RGAA ${escapeHtml(r.rgaaRef)}</span>${escapeHtml(r.label)}</span></div>
                <div class="rule-message">${escapeHtml(r.message)}</div>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </section>`
      : "";

  const budgetSection = budgetEval
    ? `
      <div class="budget ${budgetEval.pass ? "good" : "bad"}">
        ${budgetEval.pass ? "✓ Budget respecté" : "✗ Budget dépassé"}
        ${
          budgetEval.failures.length > 0
            ? `<ul>${budgetEval.failures.map((f) => `<li>${escapeHtml(f.label)} : ${f.score}/100</li>`).join("")}</ul>`
            : ""
        }
      </div>`
    : "";

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<style>
  body {
    font-family: var(--vscode-font-family, sans-serif);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 20px 24px 40px;
  }
  * { box-sizing: border-box; }
  .header { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
  .header-text { flex: 1; min-width: 0; }
  .header-text h1 { font-size: 1.3em; margin: 0 0 4px; }
  .header-meta { font-size: 0.85em; color: var(--vscode-descriptionForeground); }
  .gauge { flex-shrink: 0; }
  .gauge-track { stroke: var(--vscode-widget-border, #444); opacity: 0.4; }
  .gauge-value.good { stroke: var(--vscode-testing-iconPassed, #3fb950); }
  .gauge-value.warn { stroke: var(--vscode-editorWarning-foreground, #d29922); }
  .gauge-value.bad { stroke: var(--vscode-testing-iconFailed, #f85149); }
  .gauge-number { font-size: 28px; font-weight: 700; fill: var(--vscode-foreground); }
  .gauge-suffix { font-size: 11px; fill: var(--vscode-descriptionForeground); }

  h2 { font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.03em; color: var(--vscode-descriptionForeground); margin: 24px 0 10px; }

  .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 8px; }
  .category-card { border: 1px solid var(--vscode-widget-border, #444); border-radius: 8px; padding: 10px 12px; }
  .category-name { font-size: 0.78em; color: var(--vscode-descriptionForeground); margin-bottom: 2px; }
  .category-score { font-size: 1.3em; font-weight: 700; margin-bottom: 6px; }
  .category-score.good { color: var(--vscode-testing-iconPassed, #3fb950); }
  .category-score.warn { color: var(--vscode-editorWarning-foreground, #d29922); }
  .category-score.bad { color: var(--vscode-testing-iconFailed, #f85149); }
  .category-bar-track { height: 4px; border-radius: 999px; background: var(--vscode-widget-border, #444); overflow: hidden; }
  .category-bar-fill { height: 100%; }
  .category-bar-fill.good { background: var(--vscode-testing-iconPassed, #3fb950); }
  .category-bar-fill.warn { background: var(--vscode-editorWarning-foreground, #d29922); }
  .category-bar-fill.bad { background: var(--vscode-testing-iconFailed, #f85149); }

  .rule-list { border: 1px solid var(--vscode-widget-border, #444); border-radius: 8px; overflow: hidden; }
  .rule-row { display: flex; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--vscode-widget-border, #444); }
  .rule-row:last-child { border-bottom: none; }
  .rule-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7em; font-weight: 700; color: #fff; margin-top: 1px; }
  .rule-icon.good { background: var(--vscode-testing-iconPassed, #3fb950); }
  .rule-icon.warn { background: var(--vscode-editorWarning-foreground, #d29922); }
  .rule-icon.bad { background: var(--vscode-testing-iconFailed, #f85149); }
  .rule-body { flex: 1; min-width: 0; }
  .rule-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .rule-label { font-weight: 600; font-size: 0.92em; }
  .rgaa-badge { display: inline-block; font-size: 0.82em; font-weight: 700; color: var(--vscode-descriptionForeground); background: var(--vscode-widget-border, #444); border-radius: 4px; padding: 1px 6px; margin-right: 8px; }
  .rule-score { flex-shrink: 0; font-size: 0.82em; font-weight: 700; white-space: nowrap; }
  .rule-score.good { color: var(--vscode-testing-iconPassed, #3fb950); }
  .rule-score.warn { color: var(--vscode-editorWarning-foreground, #d29922); }
  .rule-score.bad { color: var(--vscode-testing-iconFailed, #f85149); }
  .rule-message { font-size: 0.85em; color: var(--vscode-descriptionForeground); margin-top: 2px; }

  .budget { margin-top: 24px; padding: 10px 14px; border-radius: 8px; font-weight: 600; }
  .budget.good { color: var(--vscode-testing-iconPassed, #3fb950); border: 1px solid var(--vscode-testing-iconPassed, #3fb950); }
  .budget.bad { color: var(--vscode-testing-iconFailed, #f85149); border: 1px solid var(--vscode-testing-iconFailed, #f85149); }
  .budget ul { margin: 6px 0 0; padding-left: 20px; font-weight: 400; font-size: 0.85em; }
</style>
</head>
<body>
  <div class="header">
    <div class="header-text">
      <h1>A11yscan</h1>
      <div class="header-meta">${escapeHtml(report.url)}</div>
      <div class="header-meta">axe-core ${escapeHtml(report.axeVersion)} — ${escapeHtml(report.timestamp)}</div>
    </div>
    ${renderGauge(report.overallScore)}
  </div>

  <div class="category-grid">${categoryCards}</div>

  ${categorySections}
  ${reviewSection}
  ${budgetSection}
</body>
</html>`;
}
