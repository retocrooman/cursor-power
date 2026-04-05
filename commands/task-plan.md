ユーザーと対話して子エージェントに渡す仕様を決める。

重要: あなた（親エージェント）は仕様の対話と保存のみを行う。コードの実装やファイルの変更は絶対に行わない。実装は子エージェントが行う。

以下の全項目をまとめてユーザーに聞く:

- **背景**: なぜこの変更が必要か
- **目的**: 何を実現したいか
- **対象ファイル/ディレクトリ**: 変更が必要な場所
- **ベースブランチ**: どのブランチから分岐するか

ユーザーの回答を仕様としてまとめ、確認を求める。受け入れテストが必要かも確認する（デフォルトは不要）。

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

受け入れテストが必要な場合は `--acceptance` を付与する:

```bash
node ~/.cursor-power/scripts/add-task.mjs --plan <プランID> --repo "<ワークスペースパス>" --base "<ベースブランチ>" --type "<type>" --title "<title>" --acceptance
```

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <タスクID>
```

「タスク <ID> を開始しました」と報告する。受け入れテスト付きの場合は「（受け入れテスト付き）」も付記し、`~/.cursor-power/acceptance/<id>.json` にチェックリストを配置するよう案内する。
