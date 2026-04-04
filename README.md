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
| `/task-add <説明>` | 対話で詰めた要件をタスクとして登録し、子エージェントを自動起動 |
| `/task-list` | 全タスクの一覧を表示 |
| `/task-status` | 各子エージェントの進捗・状態を確認 |
| `/task-check` | 子エージェントからの質問を確認し、回答を中継 |
| `/task-clean` | マージ済みブランチの worktree を削除 |

## 基本的な使い方

### 1. 対話でタスクを定義

```
ユーザー: ログイン画面を実装したい。メールとパスワードでOK。

Agent: 了解です。バリデーションはどうしますか？...
       （対話で要件を詰める）

ユーザー: /task-add メール・パスワードによるログイン画面の実装
```

### 2. 状態を確認

```
ユーザー: /task-status

Agent: タスク一覧:
  task-a1b2: ログイン画面 [running] — 3 commits, 2分前に更新
  task-c3d4: API認証     [blocked] — 質問あり
```

### 3. 子の質問に回答

```
ユーザー: /task-check

Agent: task-c3d4 から質問:
  「JWT のシークレットは環境変数から読みますか？それともハードコードのテスト用で OK ですか？」

ユーザー: 環境変数で。.env.example も作って。

Agent: task-c3d4 に回答を送信しました。
```

### 4. 完了後のクリーンアップ

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
  "maxConcurrency": 3
}
```

| キー | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `defaultModel` | string | `"sonnet-4"` | 子エージェントのデフォルトモデル |
| `maxConcurrency` | number | `3` | 同時実行する子エージェントの最大数 |

## ディレクトリ構成

```
~/.cursor/commands/          # Cursor グローバルコマンド
  task-add.md
  task-list.md
  task-status.md
  task-check.md
  task-clean.md

~/.cursor-power/             # 状態管理・スクリプト
  config.json                # グローバル設定
  tasks/                     # タスク状態 JSON
    <task-id>.json
  questions/                 # 子からの質問
    <task-id>.json
  scripts/                   # ヘルパースクリプト
    add-task.mjs
    list-tasks.mjs
    check-status.mjs
    check-questions.mjs
    clean-worktrees.mjs
    start-worker.mjs
```

## 関連ドキュメント

- [DESIGN.md](DESIGN.md) — アーキテクチャ・設計思想
- [TODO.md](TODO.md) — 実装ロードマップ

## ライセンス

MIT
