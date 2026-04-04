ユーザーがタスクを追加したい。以下の手順で実行せよ。

1. ユーザーの指示内容を `--prompt` に渡す。現在のワークスペースのパスを `--repo` に、ベースブランチを `--base` に指定する。

```bash
node ~/.cursor-power/scripts/add-task.mjs --prompt "<ユーザーの指示>" --repo "<ワークスペースパス>" --base "<ベースブランチ>"
```

2. 出力されたタスク JSON から `id` を取得する。

3. 子エージェントを起動する:

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <id>
```

この処理はバックグラウンドで実行し、完了を待たずにユーザーにタスク ID を報告せよ。

4. ユーザーに「タスク <id> を開始しました」と報告する。
