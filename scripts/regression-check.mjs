#!/usr/bin/env node
/**
 * Lightweight regression checks for cursor-power.
 *
 * Statically verifies invariants that sync-status.mjs and run-acceptance.mjs
 * rely on, so regressions like Issue #2 (acceptance_running set without
 * acceptancePid) are caught early.
 *
 * Exit code 0 = all checks passed, 1 = at least one failure.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

let passed = 0;
let failed = 0;

function check(name, ok, detail) {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
    if (detail) console.error(`    → ${detail}`);
  }
}

function readSource(relPath) {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, "utf-8");
}

// ---------------------------------------------------------------------------
// 1. paths.mjs exports required by other scripts
// ---------------------------------------------------------------------------
console.log("\n[paths.mjs exports]");
{
  const src = readSource("scripts/paths.mjs");
  check("paths.mjs exists", src !== null);
  if (src) {
    const requiredExports = [
      "POWER_DIR",
      "TASKS_DIR",
      "QUESTIONS_DIR",
      "LOGS_DIR",
      "PLANS_DIR",
      "SCRIPTS_DIR",
      "ACCEPTANCE_DIR",
      "CONFIG_PATH",
      "agentWorktreeLabel",
    ];
    for (const name of requiredExports) {
      check(
        `exports ${name}`,
        src.includes(`export`) && src.includes(name),
        `"${name}" not found in paths.mjs`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 2. sync-status.mjs — acceptance_running must only be set after
//    launchAcceptance() so that acceptancePid is written by run-acceptance
// ---------------------------------------------------------------------------
console.log("\n[sync-status.mjs — acceptance flow]");
{
  const src = readSource("scripts/sync-status.mjs");
  check("sync-status.mjs exists", src !== null);
  if (src) {
    check(
      "imports ACCEPTANCE_DIR from paths",
      src.includes("ACCEPTANCE_DIR"),
      "ACCEPTANCE_DIR import missing — readAcceptanceResult will break",
    );

    check(
      "launchAcceptance() is defined",
      /function\s+launchAcceptance/.test(src),
      "launchAcceptance helper missing",
    );

    check(
      "calls launchAcceptance before setting acceptance_running",
      src.indexOf("launchAcceptance(") < src.indexOf('"acceptance_running"'),
      "acceptance_running may be set without spawning the acceptance child (Issue #2)",
    );

    check(
      "checks acceptancePid before processing acceptance result",
      /task\.acceptancePid/.test(src),
      "acceptancePid is never checked — dead acceptance child won't be detected",
    );

    check(
      "reads acceptance result from file",
      /readAcceptanceResult/.test(src),
      "readAcceptanceResult not called — acceptance pass/fail can't be determined",
    );

    check(
      "deletes acceptancePid after acceptance child exits",
      /delete\s+task\.acceptancePid/.test(src),
      "acceptancePid is not cleaned up after child exits",
    );
  }
}

// ---------------------------------------------------------------------------
// 3. run-acceptance.mjs — guards against missing/empty acceptance file
// ---------------------------------------------------------------------------
console.log("\n[run-acceptance.mjs — pre-condition guards]");
{
  const src = readSource("scripts/run-acceptance.mjs");
  check("run-acceptance.mjs exists", src !== null);
  if (src) {
    check(
      "guards: acceptance file existence check",
      src.includes("existsSync(acceptancePath)"),
      "missing existence check — script may throw on readFileSync",
    );

    check(
      "guards: empty items check",
      /items\.length\s*===\s*0/.test(src) || /items\.length\s*<\s*1/.test(src),
      "missing empty-items guard — empty checklist silently spawns agent",
    );

    check(
      "guards: required task fields validated",
      /repoPath.*branch.*baseBranch/.test(src) ||
        (src.includes("repoPath") && src.includes("branch") && src.includes("baseBranch") && src.includes("missingFields")),
      "task field validation missing — agent may start with incomplete config",
    );

    check(
      "writes acceptancePid back to task JSON",
      /acceptancePid/.test(src) && /writeFileSync/.test(src),
      "acceptancePid not persisted — sync-status can't track the child (Issue #2)",
    );

    check(
      "exits with code 1 on missing acceptance file",
      src.includes("process.exit(1)"),
      "script doesn't exit on failure — caller can't distinguish success from error",
    );
  }
}

// ---------------------------------------------------------------------------
// 4. start-worker.mjs — task field validation consistency
// ---------------------------------------------------------------------------
console.log("\n[start-worker.mjs — field validation]");
{
  const src = readSource("scripts/start-worker.mjs");
  check("start-worker.mjs exists", src !== null);
  if (src) {
    const requiredFields = ["repoPath", "branch", "baseBranch"];
    for (const field of requiredFields) {
      check(
        `validates ${field}`,
        src.includes(`"${field}"`),
        `"${field}" not in validation list — worker may start with missing data`,
      );
    }

    check(
      "writes pid back to task JSON",
      src.includes("task.pid") && src.includes("writeFileSync"),
      "pid not persisted — sync-status can't track the worker",
    );
  }
}

// ---------------------------------------------------------------------------
// 5. check-status.mjs spawns sync-status.mjs
// ---------------------------------------------------------------------------
console.log("\n[check-status.mjs — sync trigger]");
{
  const src = readSource("scripts/check-status.mjs");
  check("check-status.mjs exists", src !== null);
  if (src) {
    check(
      "spawns sync-status.mjs",
      src.includes("sync-status.mjs"),
      "sync-status is never triggered — task states won't update",
    );
  }
}

// ---------------------------------------------------------------------------
// 6. prompt.mjs — acceptance prompt references ACCEPTANCE_DIR
// ---------------------------------------------------------------------------
console.log("\n[prompt.mjs — acceptance prompt]");
{
  const src = readSource("scripts/prompt.mjs");
  check("prompt.mjs exists", src !== null);
  if (src) {
    check(
      "buildAcceptancePrompt is exported",
      src.includes("export") && src.includes("buildAcceptancePrompt"),
      "run-acceptance.mjs imports buildAcceptancePrompt — export missing",
    );

    check(
      "buildFixingPrompt is exported",
      src.includes("export") && src.includes("buildFixingPrompt"),
      "sync-status.mjs imports buildFixingPrompt — export missing",
    );

    check(
      "acceptance prompt references ACCEPTANCE_DIR",
      src.includes("ACCEPTANCE_DIR"),
      "acceptance prompt won't include correct file path",
    );
  }
}

// ---------------------------------------------------------------------------
// 7. drain-pending.mjs — respects concurrency and status filter
// ---------------------------------------------------------------------------
console.log("\n[drain-pending.mjs — concurrency guard]");
{
  const src = readSource("scripts/drain-pending.mjs");
  check("drain-pending.mjs exists", src !== null);
  if (src) {
    check(
      "counts acceptance_running as active",
      src.includes("acceptance_running"),
      "acceptance_running tasks not counted — may exceed maxConcurrency",
    );

    check(
      "re-reads task before starting to prevent double-start",
      /fresh\.status\s*!==\s*"pending"/.test(src) || src.includes("fresh.status"),
      "TOCTOU race — task may be started twice",
    );
  }
}

// ---------------------------------------------------------------------------
// 8. package.json — basic integrity
// ---------------------------------------------------------------------------
console.log("\n[package.json — integrity]");
{
  const src = readSource("package.json");
  check("package.json exists", src !== null);
  if (src) {
    let pkg;
    try {
      pkg = JSON.parse(src);
      check("package.json is valid JSON", true);
    } catch (e) {
      check("package.json is valid JSON", false, e.message);
    }
    if (pkg) {
      check("type is module", pkg.type === "module", `got "${pkg.type}"`);
      check("engines.node >= 18", />=\s*18/.test(pkg.engines?.node || ""), "node engine constraint missing");
    }
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed + failed} checks: ${passed} passed, ${failed} failed`);
console.log("─".repeat(50));

process.exit(failed > 0 ? 1 : 0);
