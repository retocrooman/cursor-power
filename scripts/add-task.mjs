#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import {
  writeFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { TASKS_DIR, CONFIG_PATH, PLANS_DIR, POWER_DIR } from "./paths.mjs";

const ISSUES_PATH = join(POWER_DIR, "issues.json");

const { values } = parseArgs({
  options: {
    prompt: { type: "string" },
    plan: { type: "string" },
    repo: { type: "string" },
    base: { type: "string", default: "main" },
    model: { type: "string" },
    type: { type: "string" },
    title: { type: "string" },
    acceptance: { type: "boolean", default: false },
    "close-issue": { type: "string" },
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
let acceptanceByDefault = false;
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  if (config.maxConcurrency) maxConcurrency = config.maxConcurrency;
  if (config.acceptanceByDefault === true) acceptanceByDefault = true;
} catch {}

const existing = readdirSync(TASKS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(TASKS_DIR, f), "utf-8")));

const activeCount = existing.filter(
  (t) => t.status === "running" || t.status === "blocked" || t.status === "fixing" || t.status === "acceptance_running"
).length;

const id = randomUUID().slice(0, 8);
const now = new Date().toISOString();

let branch;
if (values.type && values.title) {
  branch = `${values.type}/${values.title}-${id}`;
} else {
  branch = `task-${id}`;
}

const canStart = activeCount < maxConcurrency;

const acceptance = values.acceptance || acceptanceByDefault;

const task = {
  id,
  status: "pending",
  prompt,
  planId: values.plan || null,
  sessionId: null,
  repoPath: values.repo,
  branch,
  baseBranch: values.base,
  model: values.model || null,
  acceptance,
  prUrl: null,
  worktreePath: null,
  createdAt: now,
  updatedAt: now,
};

writeFileSync(join(TASKS_DIR, `${id}.json`), JSON.stringify(task, null, 2));

if (values["close-issue"]) {
  const issueId = Number(values["close-issue"]);
  if (Number.isNaN(issueId)) {
    console.error(
      JSON.stringify({ warning: `Invalid issue id: ${values["close-issue"]}` })
    );
  } else if (!existsSync(ISSUES_PATH)) {
    console.error(
      JSON.stringify({ warning: `issues.json not found, skipping close-issue` })
    );
  } else {
    const issues = JSON.parse(readFileSync(ISSUES_PATH, "utf-8"));
    const idx = issues.findIndex((i) => i.id === issueId);
    if (idx === -1) {
      console.error(
        JSON.stringify({ warning: `Issue #${issueId} not found` })
      );
    } else {
      issues.splice(idx, 1);
      writeFileSync(ISSUES_PATH, JSON.stringify(issues, null, 2));
    }
  }
}

console.log(JSON.stringify({ ...task, canStart }));
