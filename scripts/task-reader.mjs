/**
 * Shared task-reading logic used by check-status.mjs and dashboard.mjs.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { TASKS_DIR, QUESTIONS_DIR } from "./paths.mjs";

/** Read all task JSON files (excluding "done" by default). */
export function readTasks({ includeDone = false } = {}) {
  try {
    const tasks = readdirSync(TASKS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")));
    return includeDone ? tasks : tasks.filter((t) => t.status !== "done");
  } catch {
    return [];
  }
}

/** Backfill sessionId from log file if missing. */
function backfillSessionId(task) {
  if (task.sessionId || !task.logPath || !existsSync(task.logPath)) return;
  try {
    const log = readFileSync(task.logPath, "utf-8");
    for (const line of log.split("\n")) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.session_id) {
          task.sessionId = parsed.session_id;
          break;
        }
      } catch {}
    }
  } catch {}
}

/**
 * Build status summaries identical to what check-status.mjs outputs.
 * Returned array is used by both the CLI and the dashboard API.
 */
export function getTaskStatuses({ includeDone = false, sort = "updatedAt_desc" } = {}) {
  const tasks = readTasks({ includeDone });
  const results = [];

  for (const task of tasks) {
    const info = { id: task.id, status: task.status, prompt: task.prompt };

    if (task.pid) info.processAlive = undefined;
    info.prUrl = task.prUrl || null;
    if (task.branch) info.branch = task.branch;
    if (task.repoPath) info.repoPath = task.repoPath;
    if (task.createdAt) info.createdAt = task.createdAt;
    if (task.updatedAt) info.updatedAt = task.updatedAt;

    backfillSessionId(task);
    info.sessionId = task.sessionId || null;

    if (task.acceptance) info.acceptance = true;
    if (task.status === "acceptance_running") {
      info.acceptancePid = task.acceptancePid || null;
    }

    const questionPath = join(QUESTIONS_DIR, `${task.id}.json`);
    if (existsSync(questionPath)) {
      try {
        const q = JSON.parse(readFileSync(questionPath, "utf-8"));
        if (q.question && !q.answer) {
          info.blocked = true;
          info.question = q.question;
        }
      } catch {}
    }

    results.push(info);
  }

  if (sort === "updatedAt_desc") {
    results.sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });
  }

  return results;
}
