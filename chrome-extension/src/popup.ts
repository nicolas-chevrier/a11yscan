import { buildReport } from "a11yscan/scoring";
import type { RawAxeResults } from "a11yscan/scoring";
import type { ScoreReport } from "a11yscan/types";

const statusTextEl = document.getElementById("status-text") as HTMLSpanElement;
const spinnerEl = document.getElementById("spinner") as HTMLSpanElement;
const urlEl = document.getElementById("tab-url") as HTMLParagraphElement;
const btn = document.getElementById("scan-btn") as HTMLButtonElement;
const lastScoreEl = document.getElementById("last-score") as HTMLDivElement;
const lastScoreBadgeEl = document.getElementById("last-score-badge") as HTMLSpanElement;

function scoreBadgeClass(score: number): string {
  if (score >= 80) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

function setStatus(text: string, spinning: boolean): void {
  statusTextEl.textContent = text;
  spinnerEl.classList.toggle("spinning", spinning);
}

async function showLastScoreIfMatching(tabUrl: string): Promise<void> {
  const { lastReport } = await chrome.storage.local.get("lastReport");
  const report = lastReport as ScoreReport | undefined;
  if (!report || report.url !== tabUrl) return;

  lastScoreBadgeEl.textContent = `${report.overallScore}/100`;
  lastScoreBadgeEl.className = `badge ${scoreBadgeClass(report.overallScore)}`;
  lastScoreEl.classList.add("visible");
}

async function runScan(tabId: number, url: string): Promise<void> {
  setStatus("Injection d'axe-core...", true);
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["vendor/axe.min.js"],
  });

  setStatus("Analyse de la page en cours...", true);
  const injectionResults = await chrome.scripting.executeScript({
    target: { tabId },
    func: async () => {
      // @ts-expect-error injecté globalement par vendor/axe.min.js
      return await window.axe.run(document, {
        resultTypes: ["violations", "passes", "incomplete"],
      });
    },
  });

  const raw = injectionResults[0]?.result as RawAxeResults | undefined;
  if (!raw) {
    setStatus("Échec de l'analyse (aucun résultat retourné).", false);
    return;
  }

  const report = buildReport(url, raw);
  await chrome.storage.local.set({ lastReport: report });
  await chrome.tabs.create({ url: chrome.runtime.getURL("results.html") });
  setStatus("Rapport ouvert dans un nouvel onglet.", false);
}

async function init(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isScannable = !!tab?.id && /^https?:/.test(tab.url ?? "");

  urlEl.textContent = tab?.url ?? "";
  btn.disabled = !isScannable;

  if (!isScannable) {
    setStatus(
      "Cette page ne peut pas être scannée (pages internes du navigateur, fichiers locaux…).",
      false
    );
    return;
  }

  await showLastScoreIfMatching(tab.url ?? "");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      await runScan(tab.id!, tab.url!);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(`Erreur : ${message}`, false);
    } finally {
      btn.disabled = false;
    }
  });
}

init();
