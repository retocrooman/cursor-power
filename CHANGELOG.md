# Changelog

## 0.3.3 (2026-04-05)

### Bug Fixes

- **resume:** `send-answer.mjs` の `--worktree-base` フォールバック (`|| "main"`) を削除し、`start-worker.mjs` と統一。再開時に `baseBranch` がそのまま使われるようになった
- **validation:** `send-answer.mjs` / `start-worker.mjs` の両方に `repoPath` / `branch` / `baseBranch` の必須フィールドチェックを追加。欠落時は明示的なエラーメッセージで終了する

### Documentation

- DESIGN.md: `/task-check` フロー図の `--resume` 呼び出しに worktree 引数を明記
- DESIGN.md: リカバリセクションに `send-answer.mjs` が worktree コンテキストを維持する旨を追記

## 0.3.2 (2026-04-05)

### Bug Fixes

- **worktree:** Git ブランチ名は `<type>/<title>-<id>` のままにし、`agent --worktree` に渡す名前だけ `agentWorktreeLabel` で `/` を `-` に置換（`start-worker` / `send-answer` / `review-pr` / `clean-worktrees` を整合）

### Documentation

- README / DESIGN / task-add で「ブランチ名」と「worktree ラベル」の違いを追記

## 0.3.1 (2026-04-05)

### Bug Fixes

- **branch:** `agent --worktree` が `/` を含む名前を拒否するため、`--type` / `--title` 時のブランチを `type/title-id` から `type-title-id` に変更

### Documentation

- README / DESIGN にブランチ命名の制約を追記

> ブランチ名そのものは 0.3.2 で `<type>/<title>-<id>` に戻し、`--worktree` 用ラベルだけを差し替える方式に変更した。

## 0.3.0 (2026-04-04)

### Features

- **review:** show task summary from prompt on review start (#22)
- **tutorial:** add interactive walkthrough command for new users (#17)
- **config:** add draftPR option to create PRs in draft state (#16)
- **review:** add diffStat to file listing and filter auto-generated files (#14)
- **clean:** delete closed PR tasks during worktree cleanup (#13)
- **issues:** add issue management commands for lightweight idea tracking (#12)
- **config:** add /task-config command for interactive config editing (#9)
- add /task-plan command for interactive spec planning

### Bug Fixes

- **prompt:** strengthen question-first rules to prevent speculative implementation (#21)
- prevent parent agent from implementing tasks directly

### Refactoring

- simplify /task-plan template and auto-execute after approval

### Documentation

- sync all markdown files with current implementation (#19)
- sync all markdown files with current implementation (#15)
- **TODO:** remove future considerations section (#10)
- update README with /task-plan and /task-review commands
- update TODO.md to reflect current implementation status

### Performance

- **status:** split check-status into sync and async phases (#18)

## 0.2.0 (2026-04-04)

### Features

- add interactive walkthrough command `/tutorial` for new users (#17)
- add `draftPR` option to create PRs in draft state (#16)
- add /task-plan command for interactive spec planning (#7)
- add /task-config command for interactive config editing (#9)
- add issue management commands /issue-add and /issue-list (#12)
- add diffStat to file listing and filter auto-generated files in /task-review (#14)
- delete closed PR tasks during worktree cleanup (#13)
- add /release command for automated versioning and publishing
- implement PR review flow with /task-review
- implement Phase 3 — task cleanup with /task-clean
- background worker execution with detached spawn
- implement Phase 1 — task add, list, status with worker orchestration

### Performance

- split check-status into sync and async phases for faster response (#18)

### Bug Fixes

- prevent parent agent from implementing tasks directly
- move /release command to project-local .cursor/commands

### Refactoring

- simplify /task-plan template and auto-execute after approval
- move release tooling into .cursor/ (gitignored)
- centralize child agent prompts in prompt.mjs

### Documentation

- sync all markdown files with current implementation (#15)
- update README with /task-plan and /task-review commands (#8)
- update TODO.md to reflect current implementation status (#10)
- add contribution section to README
- add initial project documentation

### Other

- finalize Phase 4 — npm package ready for global install
- add gitignore for node_modules and .cursor

