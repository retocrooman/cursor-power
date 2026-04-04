#!/usr/bin/env node
import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

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
  const configPath = join(powerDir, "config.json");

  mkdirSync(commandsDir, { recursive: true });
  mkdirSync(scriptsDir, { recursive: true });
  mkdirSync(tasksDir, { recursive: true });
  mkdirSync(questionsDir, { recursive: true });
  mkdirSync(logsDir, { recursive: true });

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

  if (!existsSync(configPath)) {
    writeFileSync(
      configPath,
      JSON.stringify(
        { defaultModel: "sonnet-4", maxConcurrency: 3 },
        null,
        2
      )
    );
    console.log(`config   -> ${configPath}`);
  } else {
    console.log(`config   -> ${configPath} (既存のため上書きなし)`);
  }

  console.log(`\ncursor-power v${pkg.version} インストール完了。`);
  console.log("Agent tab で /task-add, /task-list, /task-status, /task-check, /task-review, /task-clean が使えます。");
}
