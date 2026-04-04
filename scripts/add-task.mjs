#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { TASKS_DIR, CONFIG_PATH, PLANS_DIR } from "./paths.mjs";

const { values } = parseArgs({
  options: {
    prompt: { type: "string" },
    plan: { type: "string" },
    repo: { type: "string" },
    base: { type: "string", default: "main" },
    model: { type: "string" },
  },
});

let prompt = values.prompt;
if (values.plan) {
  const planPath = join(PLANS_DIR, `${values.plan}.md`);
  prompt = readFileSync(planPath, "utf-8");
}

if (!prompt || !values.repo) {
  console.error(JSON.stringify({ error: "--prompt (or --plan) and --repo are required" }));
  process.exit(1);
}

mkdirSync(TASKS_DIR, { recursive: true });

let maxConcurrency = 3;
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  if (config.maxConcurrency) maxConcurrency = config.maxConcurrency;
} catch {}

const existing = readdirSync(TASKS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")));

const activeCount = existing.filter(
  (t) => t.status === "running" || t.status === "blocked"
).length;

const id = randomUUID().slice(0, 8);
const now = new Date().toISOString();

const task = {
  id,
  status: activeCount >= maxConcurrency ? "pending" : "pending",
  prompt,
  planId: values.plan || null,
  sessionId: null,
  repoPath: values.repo,
  branch: `task-${id}`,
  baseBranch: values.base,
  model: values.model || null,
  prUrl: null,
  worktreePath: null,
  createdAt: now,
  updatedAt: now,
};

writeFileSync(join(TASKS_DIR, `${id}.json`), JSON.stringify(task, null, 2));

console.log(JSON.stringify(task));
