# Changelog

## 0.5.1 (2026-04-05)

### Documentation

- **acceptance:** 受け入れフロー E2E 検証ガイド (`docs/acceptance-e2e.md`) を追加。検証項目表・期待ステータス遷移・スモーク手順・トラブルシューティングを文書化
- DESIGN.md から `docs/acceptance-e2e.md` へのリンクを追記

## 0.5.0 (2026-04-05)

### BREAKING CHANGES

- **riskScore:** スケールの意味を反転 — **数値が大きいほど安全**（5=問題なし・リスク低、1=リスク高）に変更 (#12)
  - `impact`: 旧「障害影響度（5=致命的）」→ 新「影響の小ささ（5=影響軽微で安全）」
  - `likelihood`: 旧「障害発生率（5=非常に高い）」→ 新「発生しにくさ（5=バグが入りにくく安全）」
  - JSON キー名 (`impact` / `likelihood`) は互換のため変更なし
  - **注意:** v0.4.0 以前に付与された `riskScore` は旧スケール（5=リスク高）で記録されている可能性があります

### Features

- **acceptance:** PR 前の受け入れテスト機能を追加（`--acceptance` フラグでオプトイン）(#11)
  - `add-task.mjs` に `--acceptance` フラグを追加。タスク単位で受け入れテストを有効化
  - `run-acceptance.mjs` を新規追加。受け入れ子を別セッションで起動し、チェックリストを自動検証
  - 受け入れ合格で実装子に PR 作成を指示、不合格で `fixing` ステータスに遷移して修正ループ
  - `~/.cursor-power/acceptance/<taskId>.json` に受け入れ項目（`items[]: { id, text, checked, notes }`, `result`, `updatedAt`）を定義
- **status:** 新ステータス `fixing`（受け入れ不合格→修正中）と `acceptance_running`（受け入れテスト実行中）を追加
- **config:** `acceptanceByDefault`（boolean、既定 `false`）を設定に追加。`true` で全タスクにデフォルト受け入れテストを有効化
- **prompt:** リスクスコア定義に 1〜5 の各段階を明示する詳細な判断基準表を追加
- **dashboard:** ローカル Web ダッシュボードを追加。Node 組み込み `http` モジュールのみで `127.0.0.1` にバインドし、タスク状態をブラウザでリアルタイム監視できる (#9)
- **dashboard:** `config.json` の `dashboardPort`（既定 `3820`）+ `--port` CLI オプションでポート設定可能
- **dashboard:** ダークテーマのカードレイアウト。各カードに id・status・PR URL（なければ「なし」）・プロンプト先頭1〜2行・sessionId の有無・updatedAt を表示
- **dashboard:** タスク一覧を `updatedAt` 降順でソート（API 側）。ポーリング間隔 5秒
- **task-reader:** `check-status.mjs` のタスク読み取りロジックを `task-reader.mjs` に共通化し、ダッシュボードと CLI で同じデータソースを使用

### Documentation

- **task-review:** リスク表示を「安全度: 影響の小ささ N/5, 発生しにくさ N/5」に更新
- DESIGN.md: タスク JSON スキーマに `riskScore` フィールドを追加、リスクスコアの定義表を追記
- DESIGN.md: 状態遷移図に `fixing` / `acceptance_running` を追加、受け入れフローのシーケンス図・acceptance JSON スキーマを追記
- DESIGN.md: `/dashboard` フロー図・仕様テーブルを追加、UI 仕様（カード構成・ソート・ポーリング間隔）を明記
- README.md: 受け入れテストの使い方セクション、設定テーブルに `acceptanceByDefault` を追記
- README.md: Web ダッシュボードセクション・コマンド表・設定テーブル・ディレクトリ構成を更新
- commands/task-add.md, task-plan.md, task-promote.md: `--acceptance` オプションの説明を追記

## 0.4.0 (2026-04-05)

### Features

- **drain-pending:** 並列枠に空きが出たとき `pending` タスクを `createdAt` 順（FIFO）で自動起動する `drain-pending.mjs` を追加 (#13)
- **config:** `autoStartPending`（boolean、既定 `true`）を設定に追加。`false` で自動起動を無効化

### Documentation

- DESIGN.md: 「pending の自動起動」セクションを追加し、状態遷移図・シーケンス図を更新
- README.md: 設定テーブルに `autoStartPending` を追記、スクリプト一覧に `drain-pending.mjs` を追加

## 0.3.3 (2026-04-05)

### Features

- **task-add:** `--close-issue=<id>` オプションを追加。タスク作成と同時に対応する issue を `issues.json` から削除できる (#12)
- **task-promote:** issue を対話で仕様を詰めてタスクに昇格する `/task-promote` コマンドを追加

### Bug Fixes

- **sync-status:** `blocked` / `failed` 状態のタスクでもログから `sessionId` を補完するようにし、`send-answer` の回答中継が止まる問題を修正 (#8)
- **check-status:** 同期フェーズでも `sessionId` をログから即座に補完
- **resume:** `send-answer.mjs` の `--worktree-base` フォールバック (`|| "main"`) を削除し、`start-worker.mjs` と統一。再開時に `baseBranch` がそのまま使われるようになった
- **validation:** `send-answer.mjs` / `start-worker.mjs` の両方に `repoPath` / `branch` / `baseBranch` の必須フィールドチェックを追加。欠落時は明示的なエラーメッセージで終了する

### Documentation

- **issue-list:** 一覧から issue をタスク化する際は `/task-promote` または `/task-plan` で対話してから昇格する旨を追記
- **task-promote:** `/task-promote` の手順・フローを README / DESIGN に追記
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

