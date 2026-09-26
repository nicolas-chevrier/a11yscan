import browserPolyfill from "webextension-polyfill";
import type { ScoreReport } from "a11yscan/types";
import { renderReportHtml } from "./reportHtml.js";

const browser = browserPolyfill as unknown as typeof chrome;

async function main(): Promise<void> {
  const root = document.getElementById("root") as HTMLDivElement;
  const { lastReport } = await browser.storage.local.get("lastReport");
  root.classList.remove("loading");
  if (!lastReport) {
    root.textContent = "Aucun rapport disponible — lance un scan depuis le popup.";
    return;
  }
  root.innerHTML = renderReportHtml(lastReport as ScoreReport);
}

main();
