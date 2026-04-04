# cursor-power 実装ロードマップ

## 完了済み機能（v0.3.0）

### ✅ Phase 1-4: 基本機能
- プロジェクト初期化と NPM パッケージ化
- 基本コマンド（`/task-add`, `/task-list`, `/task-status`, `/task-check`, `/task-clean`）
- 子エージェントの worktree 実行とオーケストレーション
- 質問フローと回答中継
- マージ済み・クローズ済み PR のクリーンアップ

### ✅ 追加機能
- PR レビューフロー（`/task-review` — diffStat 付きファイル一覧、自動生成ファイル除外、タスク概要表示）
- プランニングフロー（`/task-plan`）
- 対話的な設定変更（`/task-config` — モデル一覧取得、複数キー同時変更）
- Issue 管理（`/issue-add`, `/issue-list` — 軽量なアイデア・メモ記録）
- `draftPR` 設定オプション（`/task-config` で `draftPR=true` に設定すると PR をドラフト状態で作成）
- 対話型チュートリアル（`/tutorial` — ダミータスクで一通りのフローを体験）
- ステータス確認の高速化（`check-status.mjs` を同期表示と非同期更新に分離）
- 質問優先ルールの強化（子エージェントが推測で実装することを防止）
