タスクを追加し子エージェントを起動する。親は実装しない。

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>"
```

プランIDがある場合は `--plan <プランID>` で `--prompt` を置き換える。

```bash
node ~/.cursor-power/scripts/add-task.mjs --plan <プランID> --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>"
```

出力JSONの `id` と `canStart` を確認:

- **`canStart` が `true`**: 子エージェントを起動し「タスク <id> を開始しました」と報告:

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <id>
```

- **`canStart` が `false`**: 起動しない。「タスク <id> を作成しましたが、並列実行の上限に達しているため開始できません。既存タスクの完了を待ってから `start-worker` を実行してください。」と報告。
