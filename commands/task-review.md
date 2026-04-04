タスクのPRをレビューする。

1. タスクを特定する。タスクIDが指定されていなければ、pr_created ステータスのタスクを一覧表示して選択を求める。

2. レビュー情報と変更ファイル一覧を取得:

```bash
node ~/.cursor-power/scripts/review-pr.mjs --task-id <タスクID>
```

出力の changedFiles を番号付きリストで表示する。例:

```
タスク 765e84e0 のレビュー (PR: URL)

変更ファイル:
  1. src/index.ts
  2. README.md
  3. package.json

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
