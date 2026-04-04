指定された番号の issue をタスクに昇格する。

1. まず issue の内容を取得する:

```bash
node ~/.cursor-power/scripts/manage-issues.mjs --get <番号>
```

2. 取得した issue の `text` を背景情報として、/task-plan の対話フローを開始する。
   ユーザーに「Issue #<番号> の内容をもとに仕様を策定します」と伝えてから、/task-plan と同じ手順で以下を聞く:

   - **背景**: issue の内容を初期値として提示し、補足があるか聞く
   - **目的**: 何を実現したいか
   - **対象ファイル/ディレクトリ**: 変更が必要な場所
   - **ベースブランチ**: どのブランチから分岐するか

3. ユーザーが仕様を承認したら、/task-plan と同様に保存・タスク登録・子エージェント起動まで実行する。

4. タスク開始後、昇格元の issue を削除する:

```bash
node ~/.cursor-power/scripts/manage-issues.mjs --delete <番号>
```
