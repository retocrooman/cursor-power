タスク状態と issue 一覧を監視する Web ダッシュボードを起動する。

```bash
node ~/.cursor-power/scripts/dashboard.mjs
```

- ブラウザで `http://127.0.0.1:3820` を開くとダッシュボードが表示される。
- **タブ切り替え**: 「タスク」タブと「Issues」タブでタスク一覧と issue 一覧を切り替え可能。
- タスクデータは `/task-status`（`check-status.mjs`）と同じデータソースを使用する。
- Issue データは `~/.cursor-power/issues.json`（`manage-issues.mjs` と同じ）を使用する。
- ポートを変更したい場合は `--port <番号>` を付ける。
- `~/.cursor-power/config.json` の `dashboardPort` でデフォルトポートを設定できる。
