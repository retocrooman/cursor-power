# Changelog

セクション見出しは日付（UTC）のみです。パッケージの版は `package.json` と git tag（`v*`）を参照してください。

## 2026-04-05

### Chores

- **regression:** add `npm run regression` static regression check script (#2)

### Features

- **dashboard:** add acceptance_running badge color and short status labels
- **dashboard:** trigger sync-status on poll and change interval to 10s
- **dashboard:** add issues tab with tab-switching UI
- **dashboard:** add card detail modal on click
- **close-issue:** defer issue removal from add-task to task-clean
- **install:** merge missing default keys into existing config.json
- **dashboard:** refine UI per confirmed spec
- **dashboard:** add local web dashboard for real-time task monitoring
- **acceptance:** add pre-PR acceptance testing with fixing status
- **riskScore:** invert scale so higher values mean safer changes (#12)
- **task-promote:** add /task-promote command to promote issues to tasks
- **drain-pending:** auto-start pending tasks when concurrency slots free up
- **task-add:** add --close-issue option to remove issue on task creation
- **review:** add risk score assessment for PR review
- **task:** support {type}/{title}-{id} branch name format

### Bug Fixes

- **dashboard:** let clicks pass through closed modal overlay
- **prompt:** require acceptance JSON to be written and re-read
- **paths:** remove duplicate ISSUES_PATH export
- **review:** use merge-base for diff baseline instead of baseBranch tip
- **resume:** align worktree args and add field validation for --resume flow
- **sync-status:** backfill sessionId from log regardless of task status
- **worktree:** pass sanitized label to agent while keeping git branch names
- **branch:** use hyphen-separated names for agent --worktree
- **worker:** use task.baseBranch for git pull instead of hardcoded main
- **clean:** delete task JSON for merged and done tasks (#25)
- **worker:** fetch and pull main before spawning agent (#24)
- **task:** enforce maxConcurrency check before starting worker (#23)
- **clean:** delete task JSON for merged and done tasks

### Refactoring

- **branch:** unify task JSON branch to slash-free format

### Documentation

- **changelog:** use date-only section headings and version release script
- sync markdown files with current implementation (v0.4–v0.6)
- **design:** clarify acceptance JSON must be written for sync-status
- sync all markdown files with current v0.3.0 implementation
- **readme:** remove duplicate contribution section after merge
- add contribution section to README

### Other

- Merge pull request #29 from retocrooman/add-contribution-section
- Merge pull request #49 from retocrooman/task-f63cf7fa
- Merge pull request #48 from retocrooman/task-8d744729
- merge main into task-8d744729 (resolve CHANGELOG)
- Merge pull request #46 from retocrooman/refactor-branch-name-no-slash-26c09f0c
- merge main into refactor-branch-name (resolve CHANGELOG)
- Merge pull request #44 from retocrooman/feat-dashboard-issues-tab-a6f4b3f0
- merge main into feat-dashboard-issues-tab (resolve conflicts)
- Merge pull request #43 from retocrooman/feat-dashboard-card-detail-modal-ebec00f4
- merge main into feat-dashboard-card-detail-modal (resolve conflicts)
- Merge pull request #45 from retocrooman/feat-dashboard-poll-sync-status-5d23b6b0
- Merge pull request #42 from retocrooman/feat-defer-close-issue-to-task-clean-542f0aff
- Merge origin/main into feat-defer-close-issue-to-task-clean-542f0aff
- Merge pull request #41 from retocrooman/feat-config-merge-on-install-fd42b126
- Merge origin/main into feat-config-merge-on-install-fd42b126
- Merge pull request #40 from retocrooman/fix-review-pr-merge-base-diff-af813e8d
- Merge pull request #39 from retocrooman/feat-task-dashboard-local-147734a4
- Merge origin/main into feat-task-dashboard-local-147734a4
- Merge pull request #38 from retocrooman/feat-acceptance-uat-before-pr-bbbd95e7
- **merge:** resolve main into acceptance PR (#38)
- Merge pull request #37 from retocrooman/feat-risk-score-safety-scale-506dc486
- Merge pull request #34 from retocrooman/feat-close-issue-on-task-add-9a4e86b6
- Merge remote-tracking branch 'origin/main' into feat-close-issue-on-task-add-9a4e86b6
- Merge pull request #36 from retocrooman/feat-task-promote-and-issue-list-docs-b0911f79
- Merge pull request #35 from retocrooman/cursor-power/feat-auto-start-pending-drain-d37466b1
- Merge remote-tracking branch 'origin/main' into feat-close-issue-on-task-add-9a4e86b6
- Merge pull request #33 from retocrooman/fix-resume-worktree-context-05f089f3
- merge main: resolve CHANGELOG for #32 and #33
- Merge pull request #32 from retocrooman/fix-sessionid-when-blocked-65a5b33d
- Merge pull request #26 from retocrooman/task-cfe3349e
- merge: resolve conflicts with main (canStart + branch format)
- Merge pull request #30 from retocrooman/task-4b74bc16
- Merge pull request #27 from retocrooman/task-72baf500
- Merge pull request #28 from retocrooman/task-4341ccee
- Merge remote-tracking branch 'origin/main' into add-contribution-section
- Merge pull request #25 from retocrooman/task-6376d376

## 2026-04-05

### Bug Fixes

- **dashboard:** 閉じた状態の詳細モーダル用オーバーレイが全面でクリックを奪い、カードから詳細を開けなかった問題を修正（`pointer-events`）

## 2026-04-05

### Features

- **dashboard:** `acceptance_running` 用のシアン系バッジ色を追加し、ステータスバッジを短縮ラベル表示に変更（`wait` / `run` / `hold` / `fix` / `pr` / `acc` / `fail` / `done`）

## 2026-04-05

### Refactoring

- **branch:** タスク JSON の `branch` をスラッシュなし（`<type>-<title>-<id>`）に統一。`add-task.mjs` で `agentWorktreeLabel()` を使い、Git ブランチ名・`agent --worktree` ラベル・タスク JSON が同一文字列になるよう修正

### Documentation

- DESIGN.md: `branch` フィールドの説明をスラッシュなし形式に更新
- README.md: ブランチ名の説明をスラッシュなし統一に更新
- commands/task-add.md: ブランチ名生成の説明を更新
- scripts/paths.mjs: `agentWorktreeLabel` のコメントを更新

## 2026-04-05

### Bug Fixes

- **prompt:** 受け入れテスト用プロンプトに、受け入れ JSON の必須保存・`sync-status` が参照する `result` フィールド・保存後の読み直しを明記

### Documentation

- DESIGN.md: 受け入れ JSON 節に、`buildAcceptancePrompt` とディスク保存の説明を追記

## 2026-04-05

### Features

- **dashboard:** タブ切り替え UI を追加。「タスク」と「Issues」タブでタスク一覧と issue 一覧を同一画面で切り替え表示
- **dashboard:** `GET /api/issues` エンドポイントを追加。`issues.json` を読み取り JSON 配列を返却
- **dashboard:** Issue カードに id（`#N`）・本文プレビュー（先頭3行）・作成日時（相対時間）を表示
- **dashboard:** タブに件数バッジを表示。ポーリング時に `/api/status` と `/api/issues` を並行取得
- **paths:** `ISSUES_PATH` を `paths.mjs` に共通定数として追加。`manage-issues.mjs` と `dashboard.mjs` で共用

### Refactoring

- **manage-issues:** `ISSUES_PATH` のローカル定義を削除し、`paths.mjs` からインポートする方式に統一

### Documentation

- DESIGN.md: `/dashboard` フロー図に `/api/issues` を追加、仕様テーブルにタブ切り替え・Issue カードの仕様を追記
- README.md: Web ダッシュボードセクションにタブ切り替えと issue 一覧の説明を追記
- commands/dashboard.md: issue 一覧タブの説明を追記

## 2026-04-05

### Features

- **dashboard:** カードクリックで詳細モーダルを表示。prompt 全文・PR URL（リンク）・sessionId・branch・repoPath・作成日時・更新日時・受け入れテスト状態・blocked 時の質問全文を確認可能
- **dashboard:** モーダルは×ボタン・Esc キー・オーバーレイクリックで閉じられる
- **dashboard:** カード内の PR リンクなどクリック時はイベント伝播を停止し、モーダルが誤って開かない

### Documentation

- DESIGN.md: ダッシュボード仕様テーブルにカード詳細モーダルの仕様を追記
- README.md: Web ダッシュボードセクションにカード詳細モーダルの説明を追記
- commands/dashboard.md: モーダル機能の説明を追記

## 2026-04-05

### Features

- **dashboard:** ポーリング時に `sync-status.mjs` を detached で起動し、PID・ログ・PR 状態を自動更新するようにした。`/task-status` を実行しなくてもダッシュボード表示中はタスク状態が追従する
- **dashboard:** ポーリング間隔を 5秒 → 10秒に変更

### Documentation

- DESIGN.md: ダッシュボード節のシーケンス図・仕様テーブルを更新（10秒ポーリング、sync-status 起動）
- README.md: Web ダッシュボードの説明を更新（10秒間隔、自動同期）
- commands/dashboard.md: ポーリング時の自動同期について追記

## 2026-04-05

### BREAKING CHANGES

- **close-issue:** `--close-issue` はタスク作成時に `issues.json` から即時削除しなくなった。代わりにタスク JSON に `closeIssueId` として紐づけ、`/task-clean` 実行時（PR マージ/クローズ後）に削除される

### Features

- **install:** `cursor-power install` で既存 `config.json` の不足キーをデフォルト値で補完するシャローマージを実装 (#7)
  - 既存のユーザー設定値は保持し、パッケージ側で追加された新キーのみ補完
  - 新規インストール時の挙動は従来と同等
- **task-clean:** タスク削除時に `closeIssueId` が設定されていれば `issues.json` から該当 issue を自動削除
- **paths:** `ISSUES_PATH` 定数を `paths.mjs` に追加して共用化

### Refactoring

- **config:** `DEFAULTS` を `scripts/defaults.mjs` に切り出し、`update-config.mjs` と `bin/cursor-power.mjs` で共用

### Bug Fixes

- **review:** 差分の基準を `baseBranch` 先端から `merge-base(baseBranch, HEAD)` に変更し、GitHub PR の Files changed と同じファイル集合・差分を表示するようにした (#14)
  - `getChangedFiles` / `getDiffStat` で `mergeBase..HEAD` を使用
  - `--action diff` の左ペインを `mergeBase` 時点のファイル内容に変更
  - `isNew` 判定を `mergeBase` 時点にファイルが存在するかで判定

### Documentation

- commands/task-add.md: `--close-issue` の説明を「task-clean 時に削除」に更新
- commands/task-clean.md: issue 削除が走る旨を追記
- README.md: install 説明にマージ動作の記述を追加、スクリプト一覧に `defaults.mjs` を追加
- DESIGN.md: タスク JSON スキーマに `closeIssueId` フィールドを追記、シーケンス図を更新
- DESIGN.md: ディレクトリ構成に `defaults.mjs` を追加
- DESIGN.md: `/task-review` フロー図の説明に merge-base ベースの差分取得を追記

## 2026-04-05

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

## 2026-04-05

### Features

- **drain-pending:** 並列枠に空きが出たとき `pending` タスクを `createdAt` 順（FIFO）で自動起動する `drain-pending.mjs` を追加 (#13)
- **config:** `autoStartPending`（boolean、既定 `true`）を設定に追加。`false` で自動起動を無効化

### Documentation

- DESIGN.md: 「pending の自動起動」セクションを追加し、状態遷移図・シーケンス図を更新
- README.md: 設定テーブルに `autoStartPending` を追記、スクリプト一覧に `drain-pending.mjs` を追加

## 2026-04-05

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

## 2026-04-05

### Bug Fixes

- **worktree:** Git ブランチ名は `<type>/<title>-<id>` のままにし、`agent --worktree` に渡す名前だけ `agentWorktreeLabel` で `/` を `-` に置換（`start-worker` / `send-answer` / `review-pr` / `clean-worktrees` を整合）

### Documentation

- README / DESIGN / task-add で「ブランチ名」と「worktree ラベル」の違いを追記

## 2026-04-05

### Bug Fixes

- **branch:** `agent --worktree` が `/` を含む名前を拒否するため、`--type` / `--title` 時のブランチを `type/title-id` から `type-title-id` に変更

### Documentation

- README / DESIGN にブランチ命名の制約を追記

> ブランチ名そのものは 0.3.2 で `<type>/<title>-<id>` に戻し、`--worktree` 用ラベルだけを差し替える方式に変更した。

## 2026-04-04

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

## 2026-04-04

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

