# cursor-power 実装ロードマップ

## 完了済み機能（v0.2.0）

### ✅ Phase 1-4: 基本機能
- プロジェクト初期化とNPMパッケージ化
- 基本コマンド（`/task-add`, `/task-list`, `/task-status`, `/task-check`, `/task-clean`）
- 子エージェントのworktree実行とオーケストレーション
- 質問フローと回答中継
- マージ済みPRのクリーンアップ

### ✅ 追加機能
- PRレビューフロー（`/task-review`）
- プランニングフロー（`/task-plan`）
- リリース自動化（`/release`）

## 将来の検討事項（スコープ外）

- タスク間の依存関係
- コンフリクト検知・自動解決
- 複数レポ横断タスク
- GitHub Actions 連携（CI から子エージェント起動）
- Cursor Rule との統合（プロジェクトごとのカスタマイズ）
- Web UI でのタスク管理
