issue をタスクに昇格する。`/task-plan` と同じ対話フローで仕様を詰めてからタスクを起動する。

重要: あなた（親エージェント）は仕様の対話と保存のみを行う。コードの実装やファイルの変更は絶対に行わない。実装は子エージェントが行う。

## 手順

### 1. issue を表示

ユーザーが指定した issue ID で内容を取得する:

```bash
node ~/.cursor-power/scripts/manage-issues.mjs --get <id>
```

取得した issue の内容をユーザーに表示する。

### 2. 対話で仕様を詰める

issue の内容をベースに、以下の全項目をまとめてユーザーに聞く:

- **背景**: なぜこの変更が必要か（issue の内容を初期値として提示）
- **目的**: 何を実現したいか
- **対象ファイル/ディレクトリ**: 変更が必要な場所
- **ベースブランチ**: どのブランチから分岐するか

ユーザーの回答を仕様としてまとめ、確認を求める。

### 3. 承認後にタスク登録・起動

**ユーザーの承認なしで `add-task` を実行してはいけない。**

ユーザーが承認したら、まとめた仕様からブランチの `--type` と `--title` を自動判定する:
- **type**: 仕様内容から適切なConventional Commits typeを判定する（feat, fix, refactor, docs, chore, test, ci, perf, style 等）
- **title**: 仕様内容の要約をケバブケースで生成する（例: fix-concurrency-check, add-dark-mode）

仕様を保存し、そのままタスク登録・子エージェント起動まで実行する:

```bash
node ~/.cursor-power/scripts/save-plan.mjs --content "<まとめた仕様のmarkdown>"
```

```bash
node ~/.cursor-power/scripts/add-task.mjs --plan <プランID> --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>"
```

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <タスクID>
```

### 4. 昇格元の issue を削除

タスク起動後、昇格元の issue を一覧から削除する:

```bash
node ~/.cursor-power/scripts/manage-issues.mjs --delete=<id>
```

「Issue #<id> をタスク <タスクID> に昇格しました。issue は一覧から削除しました。」と報告する。
