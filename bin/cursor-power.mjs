#!/usr/bin/env node
import { cpSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");
const home = homedir();

const subcommand = process.argv[2];

if (subcommand === "install") {
  install();
} else {
  console.log(`cursor-power v0.1.0

Usage:
  cursor-power install    配置先にファイルをインストール`);
}

function install() {
  const commandsDir = join(home, ".cursor", "commands");
  const powerDir = join(home, ".cursor-power");
  const scriptsDir = join(powerDir, "scripts");
  const tasksDir = join(powerDir, "tasks");
  const questionsDir = join(powerDir, "questions");
  const configPath = join(powerDir, "config.json");

  mkdirSync(commandsDir, { recursive: true });
  mkdirSync(scriptsDir, { recursive: true });
  mkdirSync(tasksDir, { recursive: true });
  mkdirSync(questionsDir, { recursive: true });

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

  console.log("\nインストール完了。Agent tab で /task-add が使えます。");
}
