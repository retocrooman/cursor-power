ユーザーのメモを issue として追加する。

ユーザーの入力をそのまま `--add` に渡して実行する:

```bash
node ~/.cursor-power/scripts/manage-issues.mjs --add "<ユーザーのメモ>"
```

出力された JSON から id を取得し、「Issue #<id> を登録しました」と報告する。
