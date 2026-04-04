#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { TASKS_DIR, CONFIG_PATH, LOGS_DIR } from "./paths.mjs";
import { buildInitialPrompt } from "./prompt.mjs";

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

let defaultModel = "sonnet-4";
let draftPR = false;
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  if (config.defaultModel) defaultModel = config.defaultModel;
  if (config.draftPR === true) draftPR = true;
} catch {}

const model = task.model || defaultModel;

const fullPrompt = buildInitialPrompt(taskId, task.prompt, { draftPR });

const args = [
  "--print",
  "--yolo",
  "--worktree",
  task.branch,
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
const logPath = join(LOGS_DIR, `${taskId}.log`);
const logFd = openSync(logPath, "w");

const child = spawn("agent", args, {
  detached: true,
  stdio: ["ignore", logFd, logFd],
});

task.status = "running";
task.pid = child.pid;
task.logPath = logPath;
task.updatedAt = new Date().toISOString();
writeFileSync(taskPath, JSON.stringify(task, null, 2));

child.unref();

console.log(JSON.stringify({ taskId, pid: child.pid, logPath }));
