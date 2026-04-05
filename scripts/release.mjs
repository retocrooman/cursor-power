#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
  },
});

const dryRun = values["dry-run"];

function exec(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

function getLatestTag() {
  try {
    return exec("git describe --tags --abbrev=0");
  } catch {
    return null;
  }
}

function getCommitsSinceTag(tag) {
  const range = tag ? `${tag}..HEAD` : "HEAD";
  const log = exec(`git log ${range} --pretty=format:"%H %s"`);
  if (!log) return [];
  return log.split("\n").map((line) => {
    const [hash, ...rest] = line.split(" ");
    return { hash, message: rest.join(" ") };
  });
}

function parseConventionalCommit(message) {
  const match = message.match(
    /^(feat|fix|refactor|docs|test|chore|style|perf|ci|build)(\(.+?\))?(!)?:\s*(.+)/
  );
  if (!match) return { type: "other", scope: null, breaking: false, description: message };
  return {
    type: match[1],
    scope: match[2] ? match[2].slice(1, -1) : null,
    breaking: !!match[3],
    description: match[4],
  };
}

function determineBump(commits) {
  let bump = "patch";
  for (const c of commits) {
    const parsed = parseConventionalCommit(c.message);
    if (parsed.breaking) return "major";
    if (parsed.type === "feat") bump = "minor";
  }
  return bump;
}

function bumpVersion(current, bump) {
  const [major, minor, patch] = current.split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function generateChangelog(commits, date) {
  const groups = { feat: [], fix: [], refactor: [], docs: [], other: [] };
  const groupLabels = {
    feat: "Features",
    fix: "Bug Fixes",
    refactor: "Refactoring",
    docs: "Documentation",
    other: "Other",
  };

  for (const c of commits) {
    const parsed = parseConventionalCommit(c.message);
    const key = groups[parsed.type] ? parsed.type : "other";
    const scope = parsed.scope ? `**${parsed.scope}:** ` : "";
    groups[key].push(`- ${scope}${parsed.description}`);
  }

  let md = `## ${date}\n\n`;
  for (const [key, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    md += `### ${groupLabels[key]}\n\n${items.join("\n")}\n\n`;
  }
  return md;
}

const latestTag = getLatestTag();
const commits = getCommitsSinceTag(latestTag);

if (commits.length === 0) {
  console.log(JSON.stringify({ message: "no new commits since last release" }));
  process.exit(0);
}

const pkgPath = "package.json";
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const currentVersion = pkg.version;
const bump = determineBump(commits);
const newVersion = bumpVersion(currentVersion, bump);
const date = new Date().toISOString().split("T")[0];

const changelogEntry = generateChangelog(commits, date);

const result = {
  currentVersion,
  newVersion,
  bump,
  commits: commits.length,
  changelog: changelogEntry,
  dryRun,
};

if (dryRun) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const changelogPath = "CHANGELOG.md";
const existingChangelog = existsSync(changelogPath)
  ? readFileSync(changelogPath, "utf-8")
  : "# Changelog\n\n";

const firstSection = existingChangelog.search(/^## /m);
const insertAt = firstSection === -1 ? existingChangelog.length : firstSection;
const updatedChangelog =
  existingChangelog.slice(0, insertAt) +
  changelogEntry +
  existingChangelog.slice(insertAt);

writeFileSync(changelogPath, updatedChangelog);

exec(`git add package.json CHANGELOG.md`);
exec(`git commit -m "release: v${newVersion}"`);
exec(`git tag v${newVersion}`);
exec(`git push && git push --tags`);

try {
  exec(
    `gh release create v${newVersion} --title "v${newVersion}" --notes ${JSON.stringify(changelogEntry)}`
  );
  result.githubRelease = true;
} catch (err) {
  result.githubRelease = false;
  result.githubReleaseError = err.message;
}

try {
  exec(`npm publish --access public`);
  result.npmPublished = true;
} catch (err) {
  result.npmPublished = false;
  result.npmPublishError = err.message;
}

console.log(JSON.stringify(result, null, 2));
