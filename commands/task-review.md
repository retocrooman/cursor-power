タスクのPRをレビューする。タスクID未指定なら pr_created のタスク一覧から選択を求める。

```bash
node ~/.cursor-power/scripts/review-pr.mjs --task-id <タスクID>
```

出力の prompt から背景・目的・ベースブランチを一文で要約。changedFiles を番号付きリストで表示（isNew=true → 「新規」、`+N / -N` で diffStat、変更内容を一言補足）:

```
タスク 765e84e0 のレビュー (PR: URL)
概要: エントリポイントにルーティングを追加（ベース: main）
変更ファイル:
  1. src/index.ts (+12 / -3) — ルーティング追加
  2. src/utils/helper.ts (+45 / -0) [新規] — ヘルパー関数
  3. package.json (+2 / -1) — 依存追加
見たいファイルを選んでください（番号またはファイル名）。
```

ファイル選択時に diff を表示:

```bash
node ~/.cursor-power/scripts/review-pr.mjs --task-id <タスクID> --action diff --file <ファイルパス>
```

修正指示は子エージェントに中継:

```bash
node ~/.cursor-power/scripts/send-answer.mjs --task-id <タスクID> --answer "<修正指示>"
```

レビュー終了時に worktree をエディタから外す:

```bash
node ~/.cursor-power/scripts/review-pr.mjs --task-id <タスクID> --action close
```
