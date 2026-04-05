#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { parseArgs } from "node:util";
import { POWER_DIR, ISSUES_PATH } from "./paths.mjs";

const { values } = parseArgs({
  options: {
    add: { type: "string" },
    list: { type: "boolean", default: false },
    delete: { type: "string" },
    get: { type: "string" },
  },
});

function loadIssues() {
  if (!existsSync(ISSUES_PATH)) {
    mkdirSync(POWER_DIR, { recursive: true });
    writeFileSync(ISSUES_PATH, "[]");
    return [];
  }
  return JSON.parse(readFileSync(ISSUES_PATH, "utf-8"));
}

function saveIssues(issues) {
  writeFileSync(ISSUES_PATH, JSON.stringify(issues, null, 2));
}

function nextId(issues) {
  if (issues.length === 0) return 1;
  return Math.max(...issues.map((i) => i.id)) + 1;
}

if (values.add) {
  const issues = loadIssues();
  const issue = {
    id: nextId(issues),
    text: values.add,
    createdAt: new Date().toISOString(),
  };
  issues.push(issue);
  saveIssues(issues);
  console.log(JSON.stringify(issue));
} else if (values.list) {
  const issues = loadIssues();
  console.log(JSON.stringify(issues));
} else if (values.delete) {
  const id = Number(values.delete);
  const issues = loadIssues();
  const idx = issues.findIndex((i) => i.id === id);
  if (idx === -1) {
    console.error(JSON.stringify({ error: `Issue #${id} not found` }));
    process.exit(1);
  }
  const [removed] = issues.splice(idx, 1);
  saveIssues(issues);
  console.log(JSON.stringify(removed));
} else if (values.get) {
  const id = Number(values.get);
  const issues = loadIssues();
  const issue = issues.find((i) => i.id === id);
  if (!issue) {
    console.error(JSON.stringify({ error: `Issue #${id} not found` }));
    process.exit(1);
  }
  console.log(JSON.stringify(issue));
} else {
  console.error("Usage: manage-issues.mjs --add <text> | --list | --delete <id> | --get <id>");
  process.exit(1);
}
