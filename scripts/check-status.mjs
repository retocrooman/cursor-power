#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { TASKS_DIR } from "./paths.mjs";

let tasks = [];
try {
  tasks = readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")))
    .filter((t) => t.status !== "done" && t.status !== "failed");
} catch {}

const results = [];

for (const task of tasks) {
  const info = { id: task.id, status: task.status, prompt: task.prompt };
  let changed = false;

  if (task.prUrl) {
    try {
      const prJson = execSync(
        `gh pr view "${task.prUrl}" --json state,mergedAt 2>/dev/null`,
        { encoding: "utf-8" }
      );
      const pr = JSON.parse(prJson);
      info.pr = pr;
      if (pr.state === "MERGED") {
        task.status = "done";
        changed = true;
      }
    } catch {}
  }

  if (task.worktreePath || task.branch) {
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
