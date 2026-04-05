#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { getTaskStatuses } from "./task-reader.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const results = getTaskStatuses();
console.log(JSON.stringify(results, null, 2));

const child = spawn(process.execPath, [join(__dirname, "sync-status.mjs")], {
  detached: true,
  stdio: "ignore",
});
child.unref();
