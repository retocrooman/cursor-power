#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { TASKS_DIR } from "./paths.mjs";

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function updateFromLog(task) {
  if (!task.logPath || !existsSync(task.logPath)) return;
  const log = readFileSync(task.logPath, "utf-8");

  if (!task.sessionId) {
    const lines = log.split("\n");
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.session_id) task.sessionId = parsed.session_id;
      } catch {}
    }
  }

  if (!task.prUrl) {
    const prMatch = log.match(/https:\/\/github\.com\/[^\s"]+\/pull\/\d+/);
    if (prMatch) {
      task.prUrl = prMatch[0];
      task.status = "pr_created";
    }
  }
}

let tasks = [];
try {
  tasks = readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")))
    .filter((t) => t.status !== "done");
} catch {}

const results = [];

for (const task of tasks) {
  let changed = false;
  const info = { id: task.id, status: task.status, prompt: task.prompt };

  if (task.status === "running" && task.pid) {
    const alive = isProcessAlive(task.pid);
    info.processAlive = alive;

    if (!alive) {
      updateFromLog(task);
      if (task.status === "running") {
        task.status = task.prUrl ? "pr_created" : "failed";
      }
      changed = true;
    } else {
      updateFromLog(task);
      if (task.prUrl && task.status === "running") {
        task.status = "pr_created";
        changed = true;
      }
    }
  }

  if (task.prUrl) {
    info.prUrl = task.prUrl;
    try {
      const prJson = execSync(
        `gh pr view "${task.prUrl}" --json state,mergedAt 2>/dev/null`,
        { encoding: "utf-8" }
      );
      const pr = JSON.parse(prJson);
      info.pr = pr;
      if (pr.state === "MERGED" && task.status !== "done") {
        task.status = "done";
        changed = true;
      }
    } catch {}
  }

  if (task.branch) {
    try {
      const log = execSync(
        `git -C "${task.repoPath}" log --oneline -3 ${task.branch} 2>/dev/null`,
        { encoding: "utf-8" }
      );
      info.recentCommits = log.trim().split("\n");
    } catch {}
  }

  if (changed) {
    task.updatedAt = new Date().toISOString();
    writeFileSync(
      join(TASKS_DIR, `${task.id}.json`),
      JSON.stringify(task, null, 2)
    );
  }

  info.status = task.status;
  results.push(info);
}

console.log(JSON.stringify(results, null, 2));
