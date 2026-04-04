# cursor-power

Cursor Agent tab を並列実装ワーカーの実行基盤として使う最小オーケストレーション層。

親（Agent tab）がユーザーと対話しながらタスクを管理し、複数の子エージェント（`agent` CLI）が独立 worktree で実装 → ブランチ → PR まで自動実行する。

## 特徴

- **グローバルコマンド** — `~/.cursor/commands/` に配置。どのレポの Agent tab でも `/task-*` コマンドが使える
- **並列実装** — 2〜3 の子エージェントが同時に独立した worktree で作業
- **ファイルベースの状態管理** — `~/.cursor-power/` にタスク状態・質問・設定を保存。DB 不要
- **質問フロー** — 子エージェントが判断に迷ったらファイルに質問を書き、親経由でユーザーに確認
- **PR 自動生成** — 子エージェントが commit → push → `gh pr create` まで完了

## 前提条件

| ツール | 用途 |
|--------|------|
| [Cursor](https://cursor.com/) | Agent tab（親エージェント） |
| [Cursor Agent CLI](https://cursor.com/cli) (`agent` コマンド) | 子エージェントの実行 |
| [GitHub CLI](https://cli.github.com/) (`gh` コマンド) | PR 作成・マージ確認 |
| [Node.js](https://nodejs.org/) >= 18 | スクリプト実行 |
| [Git](https://git-scm.com/) | worktree 管理 |

## インストール

```bash
npm install -g cursor-power
cursor-power install
```

`cursor-power install` は以下を行う:

1. `~/.cursor/commands/` にコマンドファイル（`.md`）を配置
2. `~/.cursor-power/` に状態管理ディレクトリとスクリプトを作成
3. `~/.cursor-power/config.json` にデフォルト設定を生成

## コマンド一覧

Cursor の Agent tab で `/` に続けて入力する。

| コマンド | 説明 |
|----------|------|
| `/task-plan` | 対話で仕様を詰めてからタスクを登録・起動（推奨） |
| `/task-add <説明>` | 簡易的なタスク登録・子エージェント自動起動 |
| `/task-list` | 全タスクの一覧を表示 |
| `/task-status` | 各子エージェントの進捗・状態を確認 |
| `/task-check` | 子エージェントからの質問を確認し、回答を中継 |
| `/task-review [タスクID]` | タスクのPRをレビュー（タスク概要表示、diffStat 付きファイル一覧、diff 表示、修正指示送信） |
| `/task-clean` | マージ済み・クローズ済みPRの worktree を削除 |
| `/task-config` | 設定を対話的に変更（モデル、同時実行数など） |
| `/issue-add <メモ>` | アイデアや改善点を issue として記録 |
| `/issue-list` | 登録済み issue の一覧を表示 |
| `/tutorial` | cursor-power の使い方をステップバイステップで体験するウォークスルー |

## 基本的な使い方

### 1. 仕様を詰めてタスクを計画

```
ユーザー: /task-plan

Agent: 以下の項目をお聞かせください:
  - 背景: なぜこの変更が必要か
  - 目的: 何を実現したいか
  - 対象ファイル/ディレクトリ: 変更が必要な場所
  - ベースブランチ: どのブランチから分岐するか

ユーザー: 背景: ユーザー認証機能がない
        目的: メール・パスワードによるログイン画面を実装
        対象: src/components/auth/ に新規作成
        ベース: main

Agent: 仕様をまとめました:
       ## 背景
       ユーザー認証機能がない
       
       ## 目的  
       メール・パスワードによるログイン画面を実装
       
       ## 対象ファイル/ディレクトリ
       src/components/auth/ に新規作成
       
       ## ベースブランチ
       main
       
       この内容で進めてよろしいですか？

ユーザー: はい

Agent: タスク task-a1b2 を開始しました
```

### 2. 進捗を確認

```
ユーザー: /task-status

Agent: タスク一覧:
  task-a1b2: ログイン画面 [running] — 3 commits, 2分前に更新
  task-c3d4: API認証     [blocked] — 質問あり
```

### 3. 子エージェントの質問に回答

```
ユーザー: /task-check

Agent: task-c3d4 から質問:
  「JWT のシークレットは環境変数から読みますか？それともハードコードのテスト用で OK ですか？」

ユーザー: 環境変数で。.env.example も作って。

Agent: task-c3d4 に回答を送信しました。
```

### 4. PRをレビュー

```
ユーザー: /task-review task-a1b2

Agent: タスク task-a1b2 のレビュー (PR: https://github.com/user/repo/pull/42)
       
       概要: メール・パスワードによるログイン画面を実装（ベース: main）
       
       変更ファイル:
         1. src/components/auth/LoginForm.tsx (+85 / -0) [新規] — ログインフォーム
         2. src/components/auth/index.ts (+3 / -0) [新規] — barrel export
         3. src/styles/auth.css (+42 / -0) [新規] — 認証画面スタイル
       
       見たいファイルを選んでください（番号またはファイル名）。

ユーザー: 1

Agent: （LoginForm.tsx の diff をエディタで表示）

ユーザー: バリデーションエラーの表示が不十分です。各フィールドの下にエラーメッセージを表示してください。

Agent: 修正指示を task-a1b2 に送信しました。
```

### 5. 完了後のクリーンアップ

```
ユーザー: /task-clean

Agent: マージ済み worktree を削除:
  - task-a1b2 (PR #42 merged) — worktree 削除完了
```

## 設定

`~/.cursor-power/config.json`:

```json
{
  "defaultModel": "sonnet-4",
  "maxConcurrency": 3,
  "draftPR": false
}
```

| キー | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `defaultModel` | string | `"sonnet-4"` | 子エージェントのデフォルトモデル |
| `maxConcurrency` | number | `3` | 同時実行する子エージェントの最大数 |
| `draftPR` | boolean | `false` | `true` にすると PR をドラフト状態で作成する |

## ディレクトリ構成

```
~/.cursor/commands/          # Cursor グローバルコマンド
  task-plan.md
  task-add.md
  task-list.md
  task-status.md
  task-check.md
  task-review.md
  task-clean.md
  task-config.md
  issue-add.md
  issue-list.md
  tutorial.md

~/.cursor-power/             # 状態管理・スクリプト
  config.json                # グローバル設定
  issues.json                # issue メモ
  tasks/                     # タスク状態 JSON
    <task-id>.json
  questions/                 # 子からの質問
    <task-id>.json
  logs/                      # 子エージェントのログ
    <task-id>.log
  plans/                     # /task-plan で保存した仕様
    <plan-id>.md
  scripts/                   # ヘルパースクリプト
    paths.mjs                # 共通パス定義
    prompt.mjs               # 子エージェントへのプロンプト生成
    add-task.mjs             # タスク登録
    start-worker.mjs         # 子エージェント起動
    list-tasks.mjs           # タスク一覧
    check-status.mjs         # ステータス確認（同期表示 + 非同期更新起動）
    sync-status.mjs          # バックグラウンドでタスク状態を同期（PID・ログ・PR 状態）
    check-questions.mjs      # 質問確認・回答書き込み
    send-answer.mjs          # 子エージェントに回答を中継（resume）
    clean-worktrees.mjs      # worktree クリーンアップ
    review-pr.mjs            # PR レビュー（ファイル一覧・diff）
    save-plan.mjs            # 仕様保存
    update-config.mjs        # 設定変更
    manage-issues.mjs        # issue 管理
```

## 関連ドキュメント

- [DESIGN.md](DESIGN.md) — アーキテクチャ・設計思想
- [TODO.md](TODO.md) — 実装ロードマップ
- [CHANGELOG.md](CHANGELOG.md) — 変更履歴

## コントリビューション

Issue やプルリクエストを歓迎します。

## ライセンス

MIT
