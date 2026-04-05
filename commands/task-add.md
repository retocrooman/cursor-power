ユーザーがタスクを追加したい。以下の手順で実行せよ。

重要: あなた（親エージェント）はタスクの実装を絶対に行わない。あなたの役割はスクリプトの実行とユーザーへの報告のみ。実装は子エージェントが行う。

1. ユーザーの指示内容からブランチの `--type` と `--title` を自動判定する:
   - **type**: 指示内容から適切なConventional Commits typeを判定する（feat, fix, refactor, docs, chore, test, ci, perf, style 等）
   - **title**: 指示内容の要約をケバブケースで生成する（例: fix-concurrency-check, add-dark-mode）
   - 生成される **ブランチ名** は `<type>-<title>-<id>`（ハイフンのみ）。`agent --worktree` の制約で `/` は使わない

2. ユーザーの指示内容を `--prompt` に渡す。プランIDがある場合は `--plan` を使う。現在のワークスペースのパスを `--repo` に、ベースブランチを `--base` に指定する。`--type` と `--title` を必ず付与する。

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>"
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

ユーザーに「タスク <id> を開始しました」と報告する。

- **`canStart` が `false` の場合**: 子エージェントを起動しない。ユーザーに以下を伝える:
  「タスク <id> を作成しましたが、並列実行の上限に達しているため開始できません。既存タスクの完了を待ってから `start-worker` を実行してください。」
