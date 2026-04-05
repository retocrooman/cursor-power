#!/usr/bin/env node
/**
 * Launch an acceptance-test child agent in a separate session on the same worktree.
 * Reads acceptance/<taskId>.json, validates it exists and has items, then spawns
 * an agent session with a verification-only prompt.
 */
import { readFileSync, writeFileSync, mkdirSync, openSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { TASKS_DIR, CONFIG_PATH, LOGS_DIR, ACCEPTANCE_DIR, agentWorktreeLabel } from "./paths.mjs";
import { buildAcceptancePrompt } from "./prompt.mjs";

const { values } = parseArgs({
  options: {
    "task-id": { type: "string" },
  },
});

const taskId = values["task-id"];
if (!taskId) {
  console.error(JSON.stringify({ error: "--task-id is required" }));
  process.exit(1);
}

const taskPath = join(TASKS_DIR, `${taskId}.json`);
const task = JSON.parse(readFileSync(taskPath, "utf-8"));

const acceptancePath = join(ACCEPTANCE_DIR, `${taskId}.json`);
if (!existsSync(acceptancePath)) {
  console.error(
    JSON.stringify({
      error: `acceptance file not found: ${acceptancePath}`,
      hint: "Create the acceptance checklist before running acceptance tests",
    }),
  );
  process.exit(1);
}

let acceptanceData;
try {
  acceptanceData = JSON.parse(readFileSync(acceptancePath, "utf-8"));
} catch (e) {
  console.error(JSON.stringify({ error: `invalid acceptance JSON: ${e.message}` }));
  process.exit(1);
}

if (!acceptanceData.items || acceptanceData.items.length === 0) {
  console.error(
    JSON.stringify({
      error: "acceptance file has no items",
      hint: "Add items to the acceptance checklist",
    }),
  );
  process.exit(1);
}

const missingFields = ["repoPath", "branch", "baseBranch"].filter((f) => !task[f]);
if (missingFields.length > 0) {
  console.error(
    JSON.stringify({ error: `task is missing required fields: ${missingFields.join(", ")}` }),
  );
  process.exit(1);
}

let defaultModel = "sonnet-4";
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  if (config.defaultModel) defaultModel = config.defaultModel;
} catch {}

const model = task.model || defaultModel;
const fullPrompt = buildAcceptancePrompt(taskId);

const args = [
  "--print",
  "--yolo",
  "--worktree",
  agentWorktreeLabel(task.branch),
  "--worktree-base",
  task.baseBranch,
  "--output-format",
  "json",
  "--workspace",
  task.repoPath,
  "--model",
  model,
  fullPrompt,
];

mkdirSync(LOGS_DIR, { recursive: true });
const logPath = join(LOGS_DIR, `${taskId}-acceptance.log`);
const logFd = openSync(logPath, "w");

const child = spawn("agent", args, {
  detached: true,
  stdio: ["ignore", logFd, logFd],
});

task.acceptancePid = child.pid;
task.acceptanceLogPath = logPath;
task.updatedAt = new Date().toISOString();
writeFileSync(taskPath, JSON.stringify(task, null, 2));

child.unref();

console.log(JSON.stringify({ taskId, acceptancePid: child.pid, acceptanceLogPath: logPath }));
