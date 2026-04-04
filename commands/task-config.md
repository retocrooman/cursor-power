cursor-power の設定を対話的に変更する。

1. 現在の設定を表示:

```bash
node ~/.cursor-power/scripts/update-config.mjs
```

出力された JSON をユーザーに見やすく表示する（各キーと値を一覧形式で）。

2. 「変更したい項目はありますか？」とユーザーに聞く。

3. ユーザーが **モデル** を変更したい場合、利用可能なモデル一覧を取得して表示する:

```bash
node ~/.cursor-power/scripts/update-config.mjs --list-models
```

表示されたモデル一覧からユーザーに選んでもらう。

4. ユーザーが値を指定したら、設定を更新する:

```bash
node ~/.cursor-power/scripts/update-config.mjs --set <key>=<value>
```

複数の設定を同時に変更する場合は `--set` を複数指定できる:

```bash
node ~/.cursor-power/scripts/update-config.mjs --set defaultModel=opus-4 --set maxConcurrency=5
```

5. 更新後の設定を表示し、「設定を更新しました」と報告する。

6. ユーザーが他にも変更したい項目があるか確認し、なければ終了する。
