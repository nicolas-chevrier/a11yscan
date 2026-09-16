import * as vscode from "vscode";
import { scanUrl, loadBudget, evaluateBudget } from "a11yscan";
import type { BudgetEvaluation, ScoreReport } from "a11yscan";
import { renderReportHtml } from "./reportHtml.js";

const LAST_URL_KEY = "a11yscan.lastUrl";

let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("a11yscan.scanUrl", () =>
    runScan(context)
  );
  context.subscriptions.push(disposable);
}

async function runScan(context: vscode.ExtensionContext): Promise<void> {
  const lastUrl = context.workspaceState.get<string>(
    LAST_URL_KEY,
    "http://localhost:3000"
  );

  const url = await vscode.window.showInputBox({
    title: "A11yscan — URL à scanner",
    value: lastUrl,
    prompt: "URL complète du site ou du serveur de dev (ex: http://localhost:3000)",
    validateInput: (value) => {
      try {
        new URL(value);
        return null;
      } catch {
        return "URL invalide";
      }
    },
  });
  if (!url) return;

  await context.workspaceState.update(LAST_URL_KEY, url);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `A11yscan : scan de ${url}...`,
      cancellable: false,
    },
    async () => {
      let report: ScoreReport;
      try {
        report = await scanUrl(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`A11yscan : échec du scan — ${message}`);
        return;
      }

      const budgetEval = await tryEvaluateBudget(report);
      showReport(report, budgetEval);
    }
  );
}

async function tryEvaluateBudget(report: ScoreReport): Promise<BudgetEvaluation | undefined> {
  const budgetPath = vscode.workspace
    .getConfiguration("a11yscan")
    .get<string>("budgetPath", "")
    ?.trim();
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!budgetPath || !workspaceFolder) return undefined;

  try {
    const fullPath = vscode.Uri.joinPath(workspaceFolder.uri, budgetPath).fsPath;
    const budget = await loadBudget(fullPath);
    return evaluateBudget(report, budget);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showWarningMessage(
      `A11yscan : impossible de charger le budget "${budgetPath}" — ${message}`
    );
    return undefined;
  }
}

function showReport(report: ScoreReport, budgetEval?: BudgetEvaluation): void {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Beside);
  } else {
    currentPanel = vscode.window.createWebviewPanel(
      "a11yscanReport",
      "A11yscan",
      vscode.ViewColumn.Beside,
      { enableScripts: false }
    );
    currentPanel.onDidDispose(() => {
      currentPanel = undefined;
    });
  }
  currentPanel.title = `A11yscan — ${report.overallScore}/100`;
  currentPanel.webview.html = renderReportHtml(report, budgetEval);
}

export function deactivate(): void {}
