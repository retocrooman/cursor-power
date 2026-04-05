issue の一覧を表示する。

```bash
node ~/.cursor-power/scripts/manage-issues.mjs --list
```

出力された JSON を番号付きリストでユーザーに見やすく表示する。各 issue の ID、内容、作成日時を含める。

issue が 0 件の場合は「登録されている issue はありません」と表示する。

## issue をタスクに昇格する場合

一覧から issue をタスク化するときは、`add-task` だけで直接タスクを作らないこと。

- **推奨**: `/task-promote` で issue ID を指定し、対話で仕様を詰めてからタスクを起動する
- `/task-plan` で issue の内容を元に仕様を策定してもよい

いずれの場合も、昇格後は `manage-issues.mjs --delete=<id>` で issue を一覧から削除する。
