タスクを追加し子エージェントを起動する。親は実装しない。

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>"
```

プランIDがある場合は `--plan <プランID>` で `--prompt` を置き換える。

出力JSONの `id` で子エージェントを起動し「タスク <id> を開始しました」と報告:

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <id>
```
