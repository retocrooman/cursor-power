子エージェントに渡す仕様を対話で決める。親は仕様策定のみ行い実装しない。

**背景**・**目的**・**対象ファイル**・**ベースブランチ**をまとめて聞く。承認後に保存→タスク登録→起動:

```bash
node ~/.cursor-power/scripts/save-plan.mjs --content "<仕様markdown>"
```

```bash
node ~/.cursor-power/scripts/add-task.mjs --plan <プランID> --repo "<ワークスペースパス>" --base "<ベースブランチ>"
```

```bash
node ~/.cursor-power/scripts/start-worker.mjs --task-id <タスクID>
```

「タスク <ID> を開始しました」と報告。
