#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { execFileSync } from "node:child_process";
import { CONFIG_PATH, POWER_DIR } from "./paths.mjs";
import { DEFAULTS } from "./defaults.mjs";

const { values } = parseArgs({
  options: {
    set: { type: "string", multiple: true },
    "list-models": { type: "boolean", default: false },
  },
  allowPositionals: false,
});

function readConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) };
  } catch {
    return { ...DEFAULTS };
  }
}

function writeConfig(config) {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

function coerce(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  const num = Number(value);
  if (!Number.isNaN(num) && value.trim() !== "") return num;
  return value;
}

if (values["list-models"]) {
  try {
    const out = execFileSync("agent", ["--list-models"], {
      encoding: "utf-8",
      timeout: 15_000,
    });
    console.log(JSON.stringify({ models: out.trim().split("\n") }));
  } catch (e) {
    console.error(JSON.stringify({ error: "Failed to list models", detail: e.message }));
    process.exit(1);
  }
  process.exit(0);
}

if (values.set && values.set.length > 0) {
  const config = readConfig();
  for (const pair of values.set) {
    const eq = pair.indexOf("=");
    if (eq === -1) {
      console.error(JSON.stringify({ error: `Invalid format: "${pair}". Use key=value` }));
      process.exit(1);
    }
    const key = pair.slice(0, eq);
    const raw = pair.slice(eq + 1);
    config[key] = coerce(raw);
  }
  config.updatedAt = new Date().toISOString();
  writeConfig(config);
  console.log(JSON.stringify(config));
  process.exit(0);
}

console.log(JSON.stringify(readConfig()));
