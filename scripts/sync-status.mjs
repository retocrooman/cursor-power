#!/usr/bin/env node
/**
 * Background sync: updates task JSON files with process liveness,
 * log parsing, and GitHub PR state. Spawned by check-status.mjs.
 *
 * For acceptance-enabled tasks, also handles:
 * - Auto-launching acceptance child when implementation child finishes
 * - Checking acceptance result and transitioning to pr_created or fixing
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TASKS_DIR, QUESTIONS_DIR, ACCEPTANCE_DIR } from "./paths.mjs";
import { buildFixingPrompt } from "./prompt.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

function readAcceptanceResult(taskId) {
  const path = join(ACCEPTANCE_DIR, `${taskId}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function launchAcceptance(taskId) {
  const child = spawn(
    process.execPath,
    [join(__dirname, "run-acceptance.mjs"), "--task-id", taskId],
    { detached: true, stdio: "ignore" },
  );
  child.unref();
}

function resumeImplementor(task, answer) {
  if (!task.sessionId) return;
  const child = spawn(
    process.execPath,
    [join(__dirname, "send-answer.mjs"), "--task-id", task.id, "--answer", answer],
    { detached: true, stdio: "ignore" },
  );
  child.unref();
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

  // Backfill sessionId from log regardless of status
  if (!task.sessionId && task.logPath) {
    updateFromLog(task);
    if (task.sessionId) changed = true;
  }

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
          } else if (task.acceptance && !task.prUrl) {
            // Acceptance-enabled task: implementation child done → launch acceptance
            launchAcceptance(task.id);
            task.status = "acceptance_running";
          } else {
            task.status = task.prUrl ? "pr_created" : "failed";
          }
        } else if (task.acceptance && !task.prUrl) {
          launchAcceptance(task.id);
          task.status = "acceptance_running";
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

  // Handle acceptance child completion
  if (task.status === "acceptance_running" && task.acceptancePid) {
    const alive = isProcessAlive(task.acceptancePid);
    if (!alive) {
      const result = readAcceptanceResult(task.id);
      if (result && result.result === "passed") {
        resumeImplementor(task, "受け入れテストに合格しました。PR を作成してください。\n\n作業が完了したら以下を順番に実行:\n1. git push -u origin HEAD（未 push のコミットがあれば）\n2. gh pr create --base " + task.baseBranch + " でPRを作成\n\nPRのタイトルは Conventional Commits 形式にする。");
        task.status = "running";
      } else {
        task.status = "fixing";
      }
      delete task.acceptancePid;
      changed = true;
    }
  } else if (task.status === "fixing" && task.sessionId) {
    // Resume implementor with fix instructions (runs on next sync cycle after fixing was set)
    resumeImplementor(task, buildFixingPrompt(task.id));
    task.status = "running";
    changed = true;
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

// After all status updates, try to start pending tasks in free slots
const drainChild = spawn(
  process.execPath,
  [join(__dirname, "drain-pending.mjs")],
  { detached: true, stdio: "ignore" },
);
drainChild.unref();
