#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { TASKS_DIR, QUESTIONS_DIR } from "./paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

let tasks = [];
try {
  tasks = readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")))
    .filter((t) => t.status !== "done");
} catch {}

const results = [];

for (const task of tasks) {
  const info = { id: task.id, status: task.status, prompt: task.prompt };

  if (task.pid) info.processAlive = undefined;
  if (task.prUrl) info.prUrl = task.prUrl;

  // Backfill sessionId from log if missing (sync phase)
  if (!task.sessionId && task.logPath && existsSync(task.logPath)) {
    try {
      const log = readFileSync(task.logPath, "utf-8");
      for (const line of log.split("\n")) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.session_id) { task.sessionId = parsed.session_id; break; }
        } catch {}
      }
    } catch {}
  }

  if (task.sessionId) info.sessionId = task.sessionId;
  if (task.acceptance) info.acceptance = true;
  if (task.status === "acceptance_running") info.acceptancePid = task.acceptancePid || null;

  const questionPath = join(QUESTIONS_DIR, `${task.id}.json`);
  if (existsSync(questionPath)) {
    try {
      const q = JSON.parse(readFileSync(questionPath, "utf-8"));
      if (q.question && !q.answer) info.blocked = true;
    } catch {}
  }

  results.push(info);
}

console.log(JSON.stringify(results, null, 2));

const child = spawn(process.execPath, [join(__dirname, "sync-status.mjs")], {
  detached: true,
  stdio: "ignore",
});
child.unref();
