#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { QUESTIONS_DIR } from "./paths.mjs";

const { values } = parseArgs({
  options: {
    answer: { type: "string" },
    "task-id": { type: "string" },
  },
});

if (values.answer && values["task-id"]) {
  const qPath = join(QUESTIONS_DIR, `${values["task-id"]}.json`);
  if (!existsSync(qPath)) {
    console.error(JSON.stringify({ error: "question not found" }));
    process.exit(1);
  }
  const q = JSON.parse(readFileSync(qPath, "utf-8"));
  q.answer = values.answer;
  q.answeredAt = new Date().toISOString();
  writeFileSync(qPath, JSON.stringify(q, null, 2));
  console.log(JSON.stringify(q));
  process.exit(0);
}

let questions = [];
try {
  questions = readdirSync(QUESTIONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(QUESTIONS_DIR, f), "utf-8")));
} catch {}

const unanswered = questions.filter((q) => q.answer === null || q.answer === undefined);

console.log(JSON.stringify({ total: questions.length, unanswered }, null, 2));
