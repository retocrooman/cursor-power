タスク状態と issue 一覧を監視する Web ダッシュボードを起動する。

```bash
node ~/.cursor-power/scripts/dashboard.mjs
```

- ブラウザで `http://127.0.0.1:3820` を開くとダッシュボードが表示される（10秒間隔でポーリング）。
- **タブ切り替え**: 「タスク」タブと「Issues」タブでタスク一覧と issue 一覧を切り替え可能。
- ポーリングのたびに `sync-status.mjs` がバックグラウンドで起動され、PID・ログ・PR 状態が自動更新される。`/task-status` を別途実行しなくてもタスク状態が追従する。
- タスクデータは `/task-status`（`check-status.mjs`）と同じデータソースを使用する。
- Issue データは `~/.cursor-power/issues.json`（`manage-issues.mjs` と同じ）を使用する。
- タスクカードをクリックすると詳細モーダルが開き、prompt 全文・PR URL・sessionId・branch・日時などのメタ情報を確認できる。モーダルは×ボタン・Esc・オーバーレイクリックで閉じる。
- ポートを変更したい場合は `--port <番号>` を付ける。
- `~/.cursor-power/config.json` の `dashboardPort` でデフォルトポートを設定できる。
