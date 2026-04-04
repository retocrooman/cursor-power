# cursor-power 実装ロードマップ

## Phase 1: 最小動作（タスク登録・起動・確認）

目標: `/task-add` でタスクを登録し、子エージェントが worktree で作業を開始でき、`/task-list` と `/task-status` で確認できる。

- [ ] プロジェクト初期化
  - [ ] `package.json` 作成（name: cursor-power、bin 定義）
  - [ ] ディレクトリ構造の雛形作成
- [ ] `cursor-power install` コマンド
  - [ ] `~/.cursor/commands/` にコマンド `.md` ファイルを配置
  - [ ] `~/.cursor-power/` ディレクトリ構造を作成
  - [ ] `~/.cursor-power/scripts/` にスクリプトをコピー
  - [ ] `~/.cursor-power/config.json` のデフォルト生成
- [ ] スクリプト: `add-task.mjs`
  - [ ] タスク ID 生成（8文字短縮 UUID）
  - [ ] タスク JSON の書き出し（status: pending）
  - [ ] 並列数チェック（maxConcurrency 超過なら pending のまま）
- [ ] スクリプト: `start-worker.mjs`
  - [ ] `agent --print --yolo --worktree --output-format json` でバックグラウンド起動
  - [ ] タスク JSON の更新（status: running、sessionId 記録）
  - [ ] プロンプト組み立て（ユーザープロンプト + 質問ファイル指示）
- [ ] スクリプト: `list-tasks.mjs`
  - [ ] `~/.cursor-power/tasks/*.json` の読み取り
  - [ ] ステータス別の集計
  - [ ] JSON 出力
- [ ] スクリプト: `check-status.mjs`
  - [ ] 各タスクの worktree 内 git log 確認
  - [ ] PR 状態の確認（`gh pr view`）
  - [ ] 子エージェントプロセスの生存確認
  - [ ] タスク JSON のステータス自動更新（プロセス死亡 → failed、PR 検知 → pr_created）
- [ ] コマンド: `task-add.md`
- [ ] コマンド: `task-list.md`
- [ ] コマンド: `task-status.md`

## Phase 2: 質問フロー

目標: 子エージェントがファイルに質問を書き、`/task-check` で親経由でユーザーが回答し、`--resume` で子に中継できる。

- [ ] スクリプト: `check-questions.mjs`
  - [ ] `~/.cursor-power/questions/*.json` の読み取り
  - [ ] 未回答（`answer === null`）のフィルタリング
  - [ ] 回答の書き込み
- [ ] 回答の中継処理
  - [ ] `agent --print --resume <sessionId>` で回答を子に送信
  - [ ] タスクステータスの更新（blocked → running）
- [ ] 子プロンプトの質問指示テンプレート確定
  - [ ] 質問ファイルのフォーマット指示
  - [ ] 質問後の待機指示
- [ ] コマンド: `task-check.md`

## Phase 3: クリーンアップ

目標: マージ済みの PR に対応する worktree を `/task-clean` で削除できる。

- [ ] スクリプト: `clean-worktrees.mjs`
  - [ ] `pr_created` ステータスのタスク取得
  - [ ] `gh pr view --json state` でマージ判定
  - [ ] `git worktree remove` 実行
  - [ ] タスク JSON の更新（status: done）
  - [ ] 質問ファイルのクリーンアップ
- [ ] コマンド: `task-clean.md`

## Phase 4: NPM パッケージ化

目標: `npm install -g cursor-power && cursor-power install` で誰でもセットアップできる。

- [ ] `bin/cursor-power.mjs` エントリーポイント
  - [ ] `install` サブコマンドの実装
  - [ ] ファイルのコピー・配置ロジック
  - [ ] 既存ファイルの上書き確認
- [ ] `package.json` の完成
  - [ ] bin フィールド
  - [ ] files フィールド（配布対象の指定）
  - [ ] バージョン、description、repository 等
- [ ] npm publish のテスト
- [ ] README のインストール手順の検証

## 将来の検討事項（スコープ外）

- タスク間の依存関係
- コンフリクト検知・自動解決
- 複数レポ横断タスク
- GitHub Actions 連携（CI から子エージェント起動）
- Cursor Rule との統合（プロジェクトごとのカスタマイズ）
- Web UI でのタスク管理
