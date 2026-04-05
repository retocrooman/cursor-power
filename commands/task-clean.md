マージ済みまたはクローズ済みPRのworktreeとタスクをクリーンアップする。

```bash
node ~/.cursor-power/scripts/clean-worktrees.mjs
```

出力された JSON をユーザーに見やすく表示する。各タスクについて、削除した項目（worktree、ブランチ、質問ファイル、ログ）をリストで報告する。PRが未マージ・未クローズのタスクはスキップされた旨を伝える。クローズ済みPRのタスクはJSON自体も削除される。タスクに `closeIssueId` が設定されている場合、タスク削除と同時に該当 issue が `issues.json` から削除される。
