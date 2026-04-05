import { join } from "node:path";
import { homedir } from "node:os";

const home = homedir();

export const POWER_DIR = join(home, ".cursor-power");
export const TASKS_DIR = join(POWER_DIR, "tasks");
export const QUESTIONS_DIR = join(POWER_DIR, "questions");
export const LOGS_DIR = join(POWER_DIR, "logs");
export const PLANS_DIR = join(POWER_DIR, "plans");
export const CONFIG_PATH = join(POWER_DIR, "config.json");

/** `agent --worktree` の名前に `/` は使えない。Git ブランチ名はスラッシュのままにし、CLI に渡すときだけ置換する */
export function agentWorktreeLabel(branch) {
  return String(branch).replace(/\//g, "-");
}
