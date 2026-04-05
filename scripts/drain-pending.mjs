#!/usr/bin/env node
/**
 * Auto-start pending tasks when concurrency slots become available.
 * Called at the end of sync-status.mjs after status updates are written.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TASKS_DIR, CONFIG_PATH } from "./paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function loadTasks() {
  try {
    return readdirSync(TASKS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")));
  } catch {
    return [];
  }
}

const config = loadConfig();

if (config.autoStartPending === false) {
  process.exit(0);
}

const maxConcurrency = config.maxConcurrency || 3;
const tasks = loadTasks();

const activeCount = tasks.filter(
  (t) => t.status === "running" || t.status === "blocked" || t.status === "fixing" || t.status === "acceptance_running",
).length;

const freeSlots = maxConcurrency - activeCount;
if (freeSlots <= 0) {
  process.exit(0);
}

const pending = tasks
  .filter((t) => t.status === "pending")
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

if (pending.length === 0) {
  process.exit(0);
}

const toStart = pending.slice(0, freeSlots);
const startWorker = join(__dirname, "start-worker.mjs");

for (const task of toStart) {
  // Re-read task JSON right before starting to prevent double-start
  const freshPath = join(TASKS_DIR, `${task.id}.json`);
  if (!existsSync(freshPath)) continue;
  const fresh = JSON.parse(readFileSync(freshPath, "utf-8"));
  if (fresh.status !== "pending") continue;

  const child = spawn(process.execPath, [startWorker, "--task-id", task.id], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}
