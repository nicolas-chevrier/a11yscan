import type { ScoreReport } from "a11yscan/types";

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

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

function renderGauge(score: number): string {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return `
    <svg class="gauge" width="152" height="152" viewBox="0 0 152 152">
      <circle class="gauge-track" cx="76" cy="76" r="${radius}" fill="none" stroke-width="13" />
      <circle
        class="gauge-value ${scoreTier(score)}"
        cx="76" cy="76" r="${radius}" fill="none" stroke-width="13"
        stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(1)}"
        stroke-dashoffset="${offset.toFixed(1)}"
        transform="rotate(-90 76 76)"
      />
      <text x="76" y="70" text-anchor="middle" class="gauge-number">${score}</text>
      <text x="76" y="92" text-anchor="middle" class="gauge-suffix">/ 100</text>
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

export function renderReportHtml(report: ScoreReport): string {
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

  return `
    <style>
      :root {
        color-scheme: light dark;
        --fg: #17171f;
        --fg-muted: #64647a;
        --bg: #fbfbfd;
        --card-bg: #ffffff;
        --track: #ebebf3;
        --border: #e4e4ee;
        --good: #16a34a;
        --warn: #d97706;
        --bad: #dc2626;
        --accent: #4f46e5;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --fg: #eeeef4;
          --fg-muted: #9999ac;
          --bg: #15151c;
          --card-bg: #1e1e28;
          --track: #2a2a36;
          --border: #2a2a36;
        }
      }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
        max-width: 880px;
        margin: 0 auto;
        padding: 40px 24px 64px;
        color: var(--fg);
        background: var(--bg);
      }

      .report-header { display: flex; align-items: center; gap: 32px; margin-bottom: 36px; }
      .header-text { flex: 1; min-width: 0; }
      .header-title { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .header-title img { width: 30px; height: 30px; border-radius: 8px; }
      .header-title h1 { font-size: 1.3em; margin: 0; }
      .header-url { font-size: 0.85em; color: var(--fg-muted); word-break: break-all; }
      .header-time { font-size: 0.78em; color: var(--fg-muted); margin-top: 2px; }

      .gauge { flex-shrink: 0; }
      .gauge-track { stroke: var(--track); }
      .gauge-value { transition: stroke-dashoffset 0.6s ease; }
      .gauge-value.good { stroke: var(--good); }
      .gauge-value.warn { stroke: var(--warn); }
      .gauge-value.bad { stroke: var(--bad); }
      .gauge-number { font-size: 34px; font-weight: 800; fill: var(--fg); }
      .gauge-suffix { font-size: 12px; fill: var(--fg-muted); }

      h2 { font-size: 0.95em; text-transform: uppercase; letter-spacing: 0.04em; color: var(--fg-muted); margin: 0 0 12px; }

      .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 40px; }
      .category-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
      .category-name { font-size: 0.78em; color: var(--fg-muted); margin-bottom: 4px; }
      .category-score { font-size: 1.5em; font-weight: 800; margin-bottom: 8px; }
      .category-score.good { color: var(--good); }
      .category-score.warn { color: var(--warn); }
      .category-score.bad { color: var(--bad); }
      .category-bar-track { height: 5px; border-radius: 999px; background: var(--track); overflow: hidden; }
      .category-bar-fill { height: 100%; border-radius: 999px; }
      .category-bar-fill.good { background: var(--good); }
      .category-bar-fill.warn { background: var(--warn); }
      .category-bar-fill.bad { background: var(--bad); }

      .rule-section { margin-bottom: 28px; }
      .rule-list { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
      .rule-row { display: flex; gap: 12px; padding: 13px 16px; border-bottom: 1px solid var(--border); }
      .rule-row:last-child { border-bottom: none; }
      .rule-icon { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75em; font-weight: 800; color: #fff; margin-top: 1px; }
      .rule-icon.good { background: var(--good); }
      .rule-icon.warn { background: var(--warn); }
      .rule-icon.bad { background: var(--bad); }
      .rule-body { flex: 1; min-width: 0; }
      .rule-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 2px; }
      .rule-label { font-weight: 600; font-size: 0.95em; }
      .rgaa-badge { display: inline-block; font-size: 0.78em; font-weight: 700; color: #fff; background: var(--accent); border-radius: 4px; padding: 1px 7px; margin-right: 8px; }
      .rule-score { flex-shrink: 0; font-size: 0.85em; font-weight: 700; white-space: nowrap; }
      .rule-score.good { color: var(--good); }
      .rule-score.warn { color: var(--warn); }
      .rule-score.bad { color: var(--bad); }
      .rule-message { font-size: 0.85em; color: var(--fg-muted); line-height: 1.4; }
    </style>

    <div class="report-header">
      <div class="header-text">
        <div class="header-title">
          <img src="icons/icon32.png" alt="" />
          <h1>A11yscan</h1>
        </div>
        <div class="header-url">${escapeHtml(report.url)}</div>
        <div class="header-time">Scanné le ${escapeHtml(formatTimestamp(report.timestamp))} — axe-core ${escapeHtml(report.axeVersion)}</div>
      </div>
      ${renderGauge(report.overallScore)}
    </div>

    <div class="category-grid">${categoryCards}</div>

    ${categorySections}
    ${reviewSection}
  `;
}
