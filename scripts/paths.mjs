import { join } from "node:path";
import { homedir } from "node:os";

const home = homedir();

export const POWER_DIR = join(home, ".cursor-power");
export const TASKS_DIR = join(POWER_DIR, "tasks");
export const QUESTIONS_DIR = join(POWER_DIR, "questions");
export const LOGS_DIR = join(POWER_DIR, "logs");
export const PLANS_DIR = join(POWER_DIR, "plans");
export const SCRIPTS_DIR = join(POWER_DIR, "scripts");
export const ACCEPTANCE_DIR = join(POWER_DIR, "acceptance");
export const CONFIG_PATH = join(POWER_DIR, "config.json");
export const ISSUES_PATH = join(POWER_DIR, "issues.json");

/** `agent --worktree` の名前に `/` は使えない。ブランチ名もスラッシュなし（`type-title-id`）に統一するため、`add-task.mjs` でブランチ生成時にもこの関数を使う */
export function agentWorktreeLabel(branch) {
  return String(branch).replace(/\//g, "-");
}
