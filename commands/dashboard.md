タスク状態を監視する Web ダッシュボードを起動する。

```bash
node ~/.cursor-power/scripts/dashboard.mjs
```

- ブラウザで `http://127.0.0.1:3820` を開くとタスク一覧がリアルタイム表示される。
- ポートを変更したい場合は `--port <番号>` を付ける。
- `~/.cursor-power/config.json` の `dashboardPort` でデフォルトポートを設定できる。
- ダッシュボードは `/task-status`（`check-status.mjs`）と同じデータソースを使用する。
- カードをクリックすると詳細モーダルが開き、prompt 全文・PR URL・sessionId・branch・日時などのメタ情報を確認できる。モーダルは×ボタン・Esc・オーバーレイクリックで閉じる。
