タスク状態を監視する Web ダッシュボードを起動する。

```bash
node ~/.cursor-power/scripts/dashboard.mjs
```

- ブラウザで `http://127.0.0.1:3820` を開くとタスク一覧がリアルタイム表示される（10秒間隔でポーリング）。
- ポーリングのたびに `sync-status.mjs` がバックグラウンドで起動され、PID・ログ・PR 状態が自動更新される。`/task-status` を別途実行しなくてもタスク状態が追従する。
- ポートを変更したい場合は `--port <番号>` を付ける。
- `~/.cursor-power/config.json` の `dashboardPort` でデフォルトポートを設定できる。
- ダッシュボードは `/task-status`（`check-status.mjs`）と同じデータソースを使用する。
- カードをクリックすると詳細モーダルが開き、prompt 全文・PR URL・sessionId・branch・日時などのメタ情報を確認できる。モーダルは×ボタン・Esc・オーバーレイクリックで閉じる。
