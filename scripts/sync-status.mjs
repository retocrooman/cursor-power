#!/usr/bin/env node
/**
 * Background sync: updates task JSON files with process liveness,
 * log parsing, and GitHub PR state. Spawned by check-status.mjs.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { TASKS_DIR, QUESTIONS_DIR } from "./paths.mjs";

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
} catch {
  process.exit(0);
}

for (const task of tasks) {
  let changed = false;

  if (task.status === "running" && task.pid) {
    const alive = isProcessAlive(task.pid);

    if (!alive) {
      updateFromLog(task);
      if (task.status === "running") {
        const hasQuestion = existsSync(join(QUESTIONS_DIR, `${task.id}.json`));
        if (hasQuestion) {
          const q = JSON.parse(
            readFileSync(join(QUESTIONS_DIR, `${task.id}.json`), "utf-8")
          );
          if (!q.answer) {
            task.status = "blocked";
          } else {
            task.status = task.prUrl ? "pr_created" : "failed";
          }
        } else {
          task.status = task.prUrl ? "pr_created" : "failed";
        }
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
    try {
      const prJson = execSync(
        `gh pr view "${task.prUrl}" --json state,mergedAt 2>/dev/null`,
        { encoding: "utf-8" }
      );
      const pr = JSON.parse(prJson);
      if (pr.state === "MERGED" && task.status !== "done") {
        task.status = "done";
        changed = true;
      }
    } catch {}
  }

  if (changed) {
    task.updatedAt = new Date().toISOString();
    writeFileSync(
      join(TASKS_DIR, `${task.id}.json`),
      JSON.stringify(task, null, 2)
    );
  }
}
