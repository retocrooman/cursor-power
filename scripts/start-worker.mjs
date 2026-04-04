#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { TASKS_DIR, CONFIG_PATH, QUESTIONS_DIR, LOGS_DIR } from "./paths.mjs";

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
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  if (config.defaultModel) defaultModel = config.defaultModel;
} catch {}

const model = task.model || defaultModel;

const promptSuffix = `

---
質問がある場合は ${QUESTIONS_DIR}/${taskId}.json に以下の形式で書いてください:
{
  "taskId": "${taskId}",
  "question": "質問内容",
  "askedAt": "ISO 8601 日時"
}
質問を書いたら作業を中断し、回答を待ってください。

完了したら gh pr create でPRを作成してください。`;

const fullPrompt = task.prompt + promptSuffix;

const args = [
  "--print",
  "--yolo",
  "--worktree",
  `task-${taskId}`,
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
