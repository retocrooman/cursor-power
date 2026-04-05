ユーザーがタスクを追加したい。以下の手順で実行せよ。

重要: あなた（親エージェント）はタスクの実装を絶対に行わない。あなたの役割はスクリプトの実行とユーザーへの報告のみ。実装は子エージェントが行う。

1. ユーザーの指示内容からブランチの `--type` と `--title` を自動判定する:
   - **type**: 指示内容から適切なConventional Commits typeを判定する（feat, fix, refactor, docs, chore, test, ci, perf, style 等）
   - **title**: 指示内容の要約をケバブケースで生成する（例: fix-concurrency-check, add-dark-mode）
   - 生成される **Git ブランチ名** は `<type>-<title>-<id>`（スラッシュなし）。`agent --worktree` ラベルと同一になるため名前の不一致が起きない

2. ユーザーの指示内容を `--prompt` に渡す。プランIDがある場合は `--plan` を使う。現在のワークスペースのパスを `--repo` に、ベースブランチを `--base` に指定する。`--type` と `--title` を必ず付与する。ユーザーの指示に issue 番号（例: `#12`、`Issue #12`）が含まれている場合は `--close-issue=<番号>` を付けて、タスク作成と同時に該当 issue を閉じる。

ユーザーが受け入れテストを要求した場合、または指示内容に「受け入れテスト」「acceptance」と含まれる場合は `--acceptance` を付与する。

> **Note:** `--close-issue` は即座に issue を削除せず、タスク JSON に `closeIssueId` として紐づけるだけです。実際の削除は `/task-clean` 実行時（PR マージ/クローズ後）に行われます。

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>"
```

issue を閉じる場合:

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>" --close-issue=<issue番号>
```

受け入れテスト付きの場合:

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>" --acceptance
```

プランIDがある場合:

```bash
node ~/.cursor-power/scripts/add-task.mjs --plan <プランID> --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>"
```

3. 出力されたタスク JSON から `id` と `canStart` を取得する。

4. `canStart` の値を確認する:

- **`canStart` が `true` の場合**: 子エージェントを起動する:

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <id>
```

ユーザーに「タスク <id> を開始しました」と報告する。`--close-issue` を使った場合は「Issue #N はタスク完了時（task-clean）に閉じられます」も併せて報告する。タスクに `acceptance: true` が設定されている場合は「（受け入れテスト付き）」も付記し、`~/.cursor-power/acceptance/<id>.json` にチェックリストを配置するよう案内する。

- **`canStart` が `false` の場合**: 子エージェントを起動しない。ユーザーに以下を伝える:
  「タスク <id> を作成しましたが、並列実行の上限に達しているため開始できません。既存タスクの完了を待ってから `start-worker` を実行してください。」`--close-issue` を使った場合は「Issue #N はタスク完了時（task-clean）に閉じられます」も併せて報告する。
