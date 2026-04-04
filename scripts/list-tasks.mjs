#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TASKS_DIR } from "./paths.mjs";

let tasks = [];
try {
  tasks = readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
} catch {}

const summary = {
  total: tasks.length,
  byStatus: {},
  tasks,
};

for (const t of tasks) {
  summary.byStatus[t.status] = (summary.byStatus[t.status] || 0) + 1;
}

console.log(JSON.stringify(summary, null, 2));
