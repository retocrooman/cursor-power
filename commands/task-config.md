cursor-power の設定を対話的に変更する。

```bash
node ~/.cursor-power/scripts/update-config.mjs
```

JSON一覧を表示し変更項目を聞く。モデル変更時は `--list-models` で一覧取得。値が決まったら更新（`--set` は複数指定可）:

```bash
node ~/.cursor-power/scripts/update-config.mjs --set <key>=<value>
```

更新後の設定を表示し他に変更があるか確認。
