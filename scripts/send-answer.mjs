#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { TASKS_DIR, LOGS_DIR } from "./paths.mjs";

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

const args = [
  "--print",
  "--yolo",
  "--resume",
  task.sessionId,
  "--output-format",
  "json",
  `回答: ${answer}\n\nこの回答を踏まえて作業を続行し、完了したらcommit、push、gh pr createでPRを作成してください。`,
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
