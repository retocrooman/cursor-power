#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { TASKS_DIR, QUESTIONS_DIR, LOGS_DIR } from "./paths.mjs";

let tasks = [];
try {
  tasks = readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")))
    .filter((t) => t.status === "pr_created" || t.status === "done");
} catch {}

const results = [];

for (const task of tasks) {
  const result = { id: task.id, prUrl: task.prUrl, actions: [] };

  let prState = null;
  if (task.prUrl) {
    try {
      const prJson = execSync(
        `gh pr view "${task.prUrl}" --json state,mergedAt 2>/dev/null`,
        { encoding: "utf-8" }
      );
      const pr = JSON.parse(prJson);
      prState = pr.state;
      if (prState !== "MERGED" && prState !== "CLOSED") {
        result.skipped = "PR still open";
        results.push(result);
        continue;
      }
    } catch {
      result.skipped = "could not check PR state";
      results.push(result);
      continue;
    }
  }

  try {
    execSync(
      `git -C "${task.repoPath}" worktree remove "${task.worktreePath || `~/.cursor/worktrees/${task.repoPath.split("/").pop()}/task-${task.id}`}" --force 2>/dev/null`,
      { encoding: "utf-8" }
    );
    result.actions.push("worktree removed");
  } catch {
    result.actions.push("worktree already gone or not found");
  }

  try {
    execSync(
      `git -C "${task.repoPath}" branch -D ${task.branch} 2>/dev/null`,
      { encoding: "utf-8" }
    );
    result.actions.push("local branch deleted");
  } catch {
    result.actions.push("local branch already gone");
  }

  const qPath = join(QUESTIONS_DIR, `${task.id}.json`);
  if (existsSync(qPath)) {
    unlinkSync(qPath);
    result.actions.push("question file deleted");
  }

  const logPath = join(LOGS_DIR, `${task.id}.log`);
  if (existsSync(logPath)) {
    unlinkSync(logPath);
    result.actions.push("log file deleted");
  }

  const taskPath = join(TASKS_DIR, `${task.id}.json`);
  if (prState === "CLOSED") {
    unlinkSync(taskPath);
    result.actions.push("task JSON deleted (PR closed)");
  } else {
    task.status = "done";
    task.updatedAt = new Date().toISOString();
    writeFileSync(taskPath, JSON.stringify(task, null, 2));
    result.actions.push("task marked done");
  }

  results.push(result);
}

if (results.length === 0) {
  console.log(JSON.stringify({ message: "no tasks to clean" }));
} else {
  console.log(JSON.stringify(results, null, 2));
}
