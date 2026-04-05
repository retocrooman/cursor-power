#!/usr/bin/env node
import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { DEFAULTS } from "../scripts/defaults.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf-8"));
const home = homedir();

const subcommand = process.argv[2];

if (subcommand === "install") {
  install();
} else {
  console.log(`cursor-power v${pkg.version}

Usage:
  cursor-power install    コマンドとスクリプトをインストール`);
}

function install() {
  const commandsDir = join(home, ".cursor", "commands");
  const powerDir = join(home, ".cursor-power");
  const scriptsDir = join(powerDir, "scripts");
  const tasksDir = join(powerDir, "tasks");
  const questionsDir = join(powerDir, "questions");
  const logsDir = join(powerDir, "logs");
  const plansDir = join(powerDir, "plans");
  const acceptanceDir = join(powerDir, "acceptance");
  const configPath = join(powerDir, "config.json");

  mkdirSync(commandsDir, { recursive: true });
  mkdirSync(scriptsDir, { recursive: true });
  mkdirSync(tasksDir, { recursive: true });
  mkdirSync(questionsDir, { recursive: true });
  mkdirSync(logsDir, { recursive: true });
  mkdirSync(plansDir, { recursive: true });
  mkdirSync(acceptanceDir, { recursive: true });

  cpSync(join(pkgRoot, "commands"), commandsDir, {
    recursive: true,
    force: true,
  });
  console.log(`commands -> ${commandsDir}`);

  cpSync(join(pkgRoot, "scripts"), scriptsDir, {
    recursive: true,
    force: true,
  });
  console.log(`scripts  -> ${scriptsDir}`);

  const issuesPath = join(powerDir, "issues.json");
  if (!existsSync(issuesPath)) {
    writeFileSync(issuesPath, "[]");
    console.log(`issues   -> ${issuesPath}`);
  } else {
    console.log(`issues   -> ${issuesPath} (既存のため上書きなし)`);
  }

  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(DEFAULTS, null, 2) + "\n");
    console.log(`config   -> ${configPath}`);
  } else {
    const existing = JSON.parse(readFileSync(configPath, "utf-8"));
    let added = 0;
    for (const key of Object.keys(DEFAULTS)) {
      if (!(key in existing)) {
        existing[key] = DEFAULTS[key];
        added++;
      }
    }
    if (added > 0) {
      writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n");
      console.log(`config   -> ${configPath} (${added} 件の新規キーを追加)`);
    } else {
      console.log(`config   -> ${configPath} (変更なし)`);
    }
  }

  console.log(`\ncursor-power v${pkg.version} インストール完了。`);
  console.log("Agent tab で /task-add, /task-plan, /task-promote, /task-list, /task-status, /task-check,");
  console.log("/task-review, /task-clean, /task-config, /issue-add, /issue-list, /dashboard, /tutorial が使えます。");
  console.log("\nWeb ダッシュボード: node ~/.cursor-power/scripts/dashboard.mjs (http://127.0.0.1:3820)");
  console.log(
    "\n受け入れテスト機能を使う場合は ~/.cursor-power/acceptance/<taskId>.json にチェックリストを配置してください。"
  );
}
