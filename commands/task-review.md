タスクのPRをレビューする。

1. タスクを特定する。タスクIDが指定されていなければ、pr_created ステータスのタスクを一覧表示して選択を求める。

2. レビュー情報と変更ファイル一覧を取得:

```bash
node ~/.cursor-power/scripts/review-pr.mjs --task-id <タスクID>
```

出力にはタスクの prompt フィールドが含まれる。まず prompt の内容から「背景」「目的」「ベースブランチ」を読み取り、一文で要約して表示する（例: 「レビュー時にタスクの目的を表示するため、review-pr.mjs と task-review.md を更新（ベース: main）」）。

次に changedFiles を番号付きリストで表示する。各ファイルには diffStat（additions, deletions, isNew）が付与されているので、それを元にファイルごとの変更内容を一言で説明する。

- isNew が true なら「新規ファイル」と明記
- additions / deletions の数値を「+N / -N」形式で表示
- diffStat を参考に、そのファイルで何が変わったかを推測して一言で補足する（例: 「依存追加」「新しいユーティリティ関数」「テスト追加」など）

例:

```
タスク 765e84e0 のレビュー (PR: URL)

概要: エントリポイントにルーティングを追加し、ヘルパー関数を新設（ベース: main）

変更ファイル:
  1. src/index.ts (+12 / -3) — エントリポイントにルーティング追加
  2. src/utils/helper.ts (+45 / -0) [新規] — ヘルパー関数を追加
  3. package.json (+2 / -1) — 依存パッケージ追加

見たいファイルを選んでください（番号またはファイル名）。
```

3. ユーザーがファイルを選んだら、そのファイルの diff をエディタで開く:

```bash
node ~/.cursor-power/scripts/review-pr.mjs --task-id <タスクID> --action diff --file <ファイルパス>
```

ユーザーが他のファイルも見たい場合は繰り返す。

4. ユーザーが修正指示を出したら、子エージェントに中継:

```bash
node ~/.cursor-power/scripts/send-answer.mjs --task-id <タスクID> --answer "<修正指示>"
```

5. レビュー完了後、ユーザーが終了を伝えたら worktree をエディタから外す:

```bash
node ~/.cursor-power/scripts/review-pr.mjs --task-id <タスクID> --action close
```
