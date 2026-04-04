マージ済みPRのworktreeとタスクをクリーンアップする。

```bash
node ~/.cursor-power/scripts/clean-worktrees.mjs
```

出力された JSON をユーザーに見やすく表示する。各タスクについて、削除した項目（worktree、ブランチ、質問ファイル、ログ）をリストで報告する。PRが未マージのタスクはスキップされた旨を伝える。
