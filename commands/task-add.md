ユーザーがタスクを追加したい。以下の手順で実行せよ。

重要: あなた（親エージェント）はタスクの実装を絶対に行わない。あなたの役割はスクリプトの実行とユーザーへの報告のみ。実装は子エージェントが行う。

1. ユーザーの指示内容を `--prompt` に渡す。プランIDがある場合は `--plan` を使う。現在のワークスペースのパスを `--repo` に、ベースブランチを `--base` に指定する。

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>"
```

プランIDがある場合:

```bash
node ~/.cursor-power/scripts/add-task.mjs --plan <プランID> --repo "<ワークスペースパス>" --base "<ベースブランチ>"
```

2. 出力されたタスク JSON から `id` と `canStart` を取得する。

3. `canStart` の値を確認する:

- **`canStart` が `true` の場合**: 子エージェントを起動する:

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <id>
```

ユーザーに「タスク <id> を開始しました」と報告する。

- **`canStart` が `false` の場合**: 子エージェントを起動しない。ユーザーに以下を伝える:
  「タスク <id> を作成しましたが、並列実行の上限に達しているため開始できません。既存タスクの完了を待ってから `start-worker` を実行してください。」
