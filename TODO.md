# cursor-power 実装ロードマップ

## 完了済み機能

### ✅ Phase 1-4: 基本機能（v0.2.0）
- プロジェクト初期化と NPM パッケージ化
- 基本コマンド（`/task-add`, `/task-list`, `/task-status`, `/task-check`, `/task-clean`）
- 子エージェントの worktree 実行とオーケストレーション
- 質問フローと回答中継
- マージ済み・クローズ済み PR のクリーンアップ

### ✅ 追加機能（v0.3.0）
- PR レビューフロー（`/task-review` — diffStat 付きファイル一覧、自動生成ファイル除外、タスク概要表示）
- プランニングフロー（`/task-plan`）
- 対話的な設定変更（`/task-config` — モデル一覧取得、複数キー同時変更）
- Issue 管理（`/issue-add`, `/issue-list` — 軽量なアイデア・メモ記録）
- `draftPR` 設定オプション（`/task-config` で `draftPR=true` に設定すると PR をドラフト状態で作成）
- 対話型チュートリアル（`/tutorial` — ダミータスクで一通りのフローを体験）
- ステータス確認の高速化（`check-status.mjs` を同期表示と非同期更新に分離）
- 質問優先ルールの強化（子エージェントが推測で実装することを防止）

### ✅ 自動起動と Issue 昇格（v0.3.3–v0.4.0）
- `--close-issue` オプション（タスク作成時に issue を紐づけ、`/task-clean` で自動削除）
- `/task-promote` コマンド（issue を対話で仕様を詰めてタスクに昇格）
- `sessionId` のバックフィル強化（`blocked` / `failed` でもログから補完）
- `drain-pending.mjs`（並列枠の空きで `pending` タスクを FIFO 自動起動）
- `autoStartPending` 設定（既定 `true`）

### ✅ 受け入れテスト・ダッシュボード・リスクスコア（v0.5.0）
- 受け入れテスト（`--acceptance` フラグ、`run-acceptance.mjs`、合格→PR 作成 / 不合格→修正ループ）
- `acceptanceByDefault` 設定（既定 `false`）
- ステータス `fixing` / `acceptance_running` を追加
- リスクスコアの安全度スケール（数値が大きいほど安全）
- Web ダッシュボード（`dashboard.mjs` — ダークテーマ、カードレイアウト、ポーリング）
- `dashboardPort` 設定（既定 `3820`）
- `task-reader.mjs` で CLI とダッシュボードのデータソースを共通化

### ✅ インストール改善・レビュー修正（v0.5.1）
- `cursor-power install` で既存 `config.json` の不足キーのみ補完（シャローマージ）
- `--close-issue` を即時削除から task-clean 時の遅延削除に変更
- `DEFAULTS` を `defaults.mjs` に切り出し共用化
- レビュー diff の基準を `merge-base` に変更（GitHub PR の Files changed と一致）

### ✅ ダッシュボード拡張（v0.5.2–v0.5.3）
- ポーリング時に `sync-status.mjs` を自動起動（タスク状態が自動追従）
- ポーリング間隔を 10秒に変更
- カードクリックで詳細モーダルを表示（prompt 全文・メタ情報）

### ✅ Dashboard Issues タブ・ブランチ統一・バッジ改善（v0.6.0–v0.6.3）
- 「タスク」「Issues」タブ切り替え UI
- `GET /api/issues` エンドポイント（`issues.json` 読み取り）
- Issue カード（id・本文プレビュー・作成日時）
- ブランチ名をスラッシュなし（`<type>-<title>-<id>`）に統一
- ステータスバッジを短縮ラベル表示（`wait` / `run` / `hold` / `fix` / `pr` / `acc` / `fail` / `done`）
- `acceptance_running` 用シアン系バッジ色
- 受け入れプロンプトに JSON の必須保存・読み直しを明記
