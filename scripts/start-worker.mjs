#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { parseArgs } from "node:util";
import { TASKS_DIR, CONFIG_PATH, QUESTIONS_DIR } from "./paths.mjs";

const { values } = parseArgs({
  options: {
    "task-id": { type: "string" },
  },
});

const taskId = values["task-id"];
if (!taskId) {
  console.error(JSON.stringify({ error: "--task-id is required" }));
  process.exit(1);
}

const taskPath = join(TASKS_DIR, `${taskId}.json`);
const task = JSON.parse(readFileSync(taskPath, "utf-8"));

let defaultModel = "sonnet-4";
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  if (config.defaultModel) defaultModel = config.defaultModel;
} catch {}

const model = task.model || defaultModel;

const promptSuffix = `

---
質問がある場合は ${QUESTIONS_DIR}/${taskId}.json に以下の形式で書いてください:
{
  "taskId": "${taskId}",
  "question": "質問内容",
  "askedAt": "ISO 8601 日時"
}
質問を書いたら作業を中断し、回答を待ってください。

完了したら gh pr create でPRを作成してください。`;

const fullPrompt = task.prompt + promptSuffix;

const cmd = [
  "agent",
  "--print",
  "--yolo",
  "--worktree",
  `task-${taskId}`,
  "--worktree-base",
  task.baseBranch,
  "--output-format",
  "json",
  "--workspace",
  task.repoPath,
  "--model",
  model,
  JSON.stringify(fullPrompt),
].join(" ");

task.status = "running";
task.updatedAt = new Date().toISOString();
writeFileSync(taskPath, JSON.stringify(task, null, 2));

try {
  const result = execSync(cmd, {
    encoding: "utf-8",
    timeout: 300_000,
    maxBuffer: 10 * 1024 * 1024,
  });

  const lines = result.trim().split("\n");
  let jsonResult = null;
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.session_id) jsonResult = parsed;
    } catch {}
  }

  if (jsonResult) {
    task.sessionId = jsonResult.session_id;
  }

  const prMatch = result.match(
    /https:\/\/github\.com\/[^\s"]+\/pull\/\d+/
  );
  if (prMatch) {
    task.prUrl = prMatch[0];
    task.status = "pr_created";
  }

  task.updatedAt = new Date().toISOString();
  writeFileSync(taskPath, JSON.stringify(task, null, 2));

  console.log(JSON.stringify(task));
} catch (err) {
  task.status = "failed";
  task.updatedAt = new Date().toISOString();
  writeFileSync(taskPath, JSON.stringify(task, null, 2));

  console.error(
    JSON.stringify({ error: err.message, taskId, status: "failed" })
  );
  process.exit(1);
}
