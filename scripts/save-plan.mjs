#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { PLANS_DIR } from "./paths.mjs";

const { values } = parseArgs({
  options: {
    content: { type: "string" },
  },
});

if (!values.content) {
  console.error(JSON.stringify({ error: "--content is required" }));
  process.exit(1);
}

mkdirSync(PLANS_DIR, { recursive: true });

const id = randomUUID().slice(0, 8);
const planPath = join(PLANS_DIR, `${id}.md`);

writeFileSync(planPath, values.content);

console.log(JSON.stringify({ id, path: planPath }));
