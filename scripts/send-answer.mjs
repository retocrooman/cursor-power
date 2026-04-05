#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { TASKS_DIR, LOGS_DIR, CONFIG_PATH, agentWorktreeLabel } from "./paths.mjs";
import { buildResumePrompt } from "./prompt.mjs";

const { values } = parseArgs({
  options: {
    "task-id": { type: "string" },
    answer: { type: "string" },
  },
});

const taskId = values["task-id"];
const answer = values.answer;

if (!taskId || !answer) {
  console.error(JSON.stringify({ error: "--task-id and --answer are required" }));
  process.exit(1);
}

const taskPath = join(TASKS_DIR, `${taskId}.json`);
const task = JSON.parse(readFileSync(taskPath, "utf-8"));

if (!task.sessionId) {
  console.error(JSON.stringify({ error: "no sessionId for this task" }));
  process.exit(1);
}

const missingFields = ["repoPath", "branch", "baseBranch"]
  .filter((f) => !task[f]);
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
  "--resume",
  task.sessionId,
  buildResumePrompt(answer),
];

mkdirSync(LOGS_DIR, { recursive: true });
const logPath = join(LOGS_DIR, `${taskId}.log`);
const logFd = openSync(logPath, "a");

const child = spawn("agent", args, {
  detached: true,
  stdio: ["ignore", logFd, logFd],
});

task.status = "running";
task.pid = child.pid;
task.updatedAt = new Date().toISOString();
writeFileSync(taskPath, JSON.stringify(task, null, 2));

child.unref();

console.log(JSON.stringify({ taskId, pid: child.pid, resumed: true }));
