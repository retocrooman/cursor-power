# 受け入れフロー E2E 検証ガイド

受け入れテスト（`--acceptance` 付きタスク）のステータス遷移・プロセス起動・ログ出力が期待どおり動作するかを検証するためのドキュメント。

## 期待ステータス遷移

### 正常系（合格）

```
pending → running → acceptance_running → running → pr_created
```

1. `/task-add` でタスク登録 → `pending`
2. `start-worker.mjs` が子エージェントを起動 → `running`
3. 実装子が commit & push して終了（PR は作成しない）
4. `sync-status.mjs` が PID 死亡を検知 → `acceptance_running` に遷移し `run-acceptance.mjs` を起動
5. 受け入れ子が検証完了、`result: "passed"` を書き込んで終了
6. `sync-status.mjs` が `acceptancePid` 死亡を検知 → `send-answer.mjs` で実装子に PR 作成を指示 → `running`
7. 実装子が `gh pr create` → ログから PR URL を検出 → `pr_created`

### 不合格ループ（修正→再検証）

```
pending → running → acceptance_running → fixing → running → acceptance_running → ...
```

1. ステップ 1〜4 は正常系と同じ
2. 受け入れ子が `result: "failed"` を書き込んで終了
3. `sync-status.mjs` が検知 → `fixing` に遷移
4. 次の sync サイクルで `send-answer.mjs` が実装子に修正指示を中継 → `running`
5. 実装子が修正 → commit & push → 終了
6. `sync-status.mjs` が再び `acceptance_running` に遷移し受け入れ子を起動
7. 合格するまで 2〜6 を繰り返す

### blocked による停止

```
pending → running → blocked（受け入れには進まない）
```

- 実装子が未回答の質問（`questions/<taskId>.json` に `answer: null`）を残してプロセス終了した場合、`sync-status.mjs` は `blocked` に遷移する
- **`blocked` 状態では受け入れテストは起動されない**。質問に回答して `running` に戻り、実装が完了して初めて受け入れフローに入る

## 検証項目

### 1. 実装子プロセスのライフサイクル

| # | 検証項目 | 期待される結果 | 確認方法 |
|---|---------|--------------|---------|
| 1-1 | タスク登録で `acceptance: true` がセットされる | タスク JSON に `"acceptance": true` | `cat ~/.cursor-power/tasks/<id>.json \| jq .acceptance` |
| 1-2 | 実装子が起動し `running` になる | `status: "running"`, `pid` が非 null | `node ~/.cursor-power/scripts/check-status.mjs` |
| 1-3 | 実装子のログにセッション ID が記録される | `sessionId` が非 null | タスク JSON の `sessionId`、または `logs/<id>.log` の JSON 行に `session_id` |
| 1-4 | 実装子が PR を作成せずに終了する | `prUrl` が null のまま | タスク JSON の `prUrl` |
| 1-5 | 実装子終了時に PR を作成しない指示が渡されている | プロンプトに「PR は作成しないこと」が含まれる | `prompt.mjs` の `buildInitialPrompt` で `acceptance=true` の分岐を確認 |

### 2. 受け入れテスト子の起動

| # | 検証項目 | 期待される結果 | 確認方法 |
|---|---------|--------------|---------|
| 2-1 | 実装子 PID 終了後に受け入れ子が起動する | ステータスが `acceptance_running` に遷移 | `check-status.mjs` 実行後のタスク JSON `status` |
| 2-2 | `acceptancePid` がセットされる | タスク JSON に非 null の `acceptancePid` | `cat ~/.cursor-power/tasks/<id>.json \| jq .acceptancePid` |
| 2-3 | 受け入れ子のログが出力される | `logs/<id>-acceptance.log` が存在し内容がある | `ls -la ~/.cursor-power/logs/<id>-acceptance.log` |
| 2-4 | 受け入れ子が別セッションで起動する | 実装子の `sessionId` と異なるセッション | `logs/<id>-acceptance.log` 内の `session_id` を比較 |
| 2-5 | 受け入れ JSON がない場合はエラー終了する | `run-acceptance.mjs` が exit code 1 で終了 | `acceptance/<id>.json` を削除した状態で `run-acceptance.mjs` を手動実行 |

### 3. 受け入れ結果によるステータス遷移

| # | 検証項目 | 期待される結果 | 確認方法 |
|---|---------|--------------|---------|
| 3-1 | 合格時に `running` に戻る | `result: "passed"` → `status: "running"` | `check-status.mjs` 実行後のタスク JSON |
| 3-2 | 合格時に実装子へ PR 作成指示が送られる | `send-answer.mjs` が `--resume` で実装子に中継 | `logs/<id>.log` に PR 作成指示のログ |
| 3-3 | 不合格時に `fixing` に遷移する | `result: "failed"` → `status: "fixing"` | タスク JSON の `status` |
| 3-4 | `fixing` の次の sync で修正指示が送られ `running` に戻る | `status: "running"` に遷移 | `check-status.mjs` を再度実行後のタスク JSON |
| 3-5 | 修正完了後に再び受け入れ子が起動する | 再度 `acceptance_running` に遷移 | タスク JSON の `status` と新しい `acceptancePid` |
| 3-6 | `acceptancePid` が合格/不合格後にクリアされる | `acceptancePid` が削除される | タスク JSON に `acceptancePid` が存在しない |

### 4. blocked 時の挙動

| # | 検証項目 | 期待される結果 | 確認方法 |
|---|---------|--------------|---------|
| 4-1 | 未回答の質問がある場合は `blocked` になる | `status: "blocked"`（受け入れではなく） | タスク JSON の `status` |
| 4-2 | `blocked` 状態で受け入れテストが起動しない | `acceptancePid` が null のまま | タスク JSON の `acceptancePid` |
| 4-3 | 回答後に `running` に戻り、再度終了で受け入れに進む | 質問回答 → `running` → 実装終了 → `acceptance_running` | `check-status.mjs` による遷移確認 |

### 5. 並列枠とドレイン

| # | 検証項目 | 期待される結果 | 確認方法 |
|---|---------|--------------|---------|
| 5-1 | `acceptance_running` がアクティブ枠としてカウントされる | `drain-pending.mjs` の `activeCount` に含まれる | `config.maxConcurrency` を 1 に設定し、受け入れ中に pending が起動しないことを確認 |
| 5-2 | 受け入れ完了後に pending が自動起動する | 枠が空いたら `drain-pending.mjs` が次のタスクを起動 | 受け入れ → `pr_created` 後に別の pending タスクが `running` に遷移 |

## タスク JSON フィールド早見表（受け入れ関連）

| フィールド | 型 | 受け入れ無効時 | 受け入れ有効時 |
|-----------|-----|-------------|-------------|
| `acceptance` | boolean | `false` または未設定 | `true` |
| `acceptancePid` | number \| null | 常に null | 受け入れ子の PID（実行中のみ） |
| `acceptanceLogPath` | string \| null | 常に null | `~/.cursor-power/logs/<id>-acceptance.log` |
| `status` | enum | `running` → `pr_created` | `running` → `acceptance_running` → `running`/`fixing` → ... |

## スモーク手順（手元での最小検証）

以下の手順で、受け入れフローの一連の動作を手元で確認できる。

### 前提条件

- `cursor-power` がインストール済み（`~/.cursor-power/scripts/` にスクリプト群がある）
- `agent` CLI が PATH に通っている
- 対象リポジトリに push 可能なリモートがある

### 手順

#### Step 1: テスト用の受け入れチェックリストを作成

```bash
mkdir -p ~/.cursor-power/acceptance

cat > ~/.cursor-power/acceptance/<taskId>.json << 'EOF'
{
  "items": [
    {
      "id": "1",
      "text": "README.md が存在する",
      "checked": false,
      "notes": ""
    }
  ],
  "result": null,
  "updatedAt": null
}
EOF
```

簡単に合格する項目を1つだけ入れておく。

#### Step 2: `--acceptance` 付きでタスクを登録

```bash
node ~/.cursor-power/scripts/add-task.mjs \
  --prompt "README.md に一行追記する" \
  --repo /path/to/your/repo \
  --base main \
  --acceptance
```

出力されたタスク ID を控える。

#### Step 3: タスク JSON を確認

```bash
cat ~/.cursor-power/tasks/<taskId>.json | jq '{status, acceptance, pid, acceptancePid}'
```

- `status: "pending"` または `"running"`
- `acceptance: true`
- 起動済みなら `pid` が非 null

#### Step 4: ステータスの変化を監視

```bash
watch -n 5 'node ~/.cursor-power/scripts/check-status.mjs 2>/dev/null | jq ".[] | {id, status, pid, acceptancePid, prUrl}"'
```

以下の遷移を観察する:
1. `running` — 実装子が作業中
2. `acceptance_running` — 実装子終了後、受け入れ子が起動
3. `running` — 受け入れ合格、PR 作成中
4. `pr_created` — PR 作成完了

#### Step 5: ログの確認

```bash
# 実装子のログ
tail -20 ~/.cursor-power/logs/<taskId>.log

# 受け入れ子のログ
tail -20 ~/.cursor-power/logs/<taskId>-acceptance.log
```

#### Step 6: 受け入れ結果の確認

```bash
cat ~/.cursor-power/acceptance/<taskId>.json | jq '{result, items: [.items[] | {id, checked, notes}]}'
```

### 不合格シナリオのテスト

不合格→修正ループを確認する場合は、意図的に満たせない受け入れ項目を含める:

```json
{
  "items": [
    {
      "id": "1",
      "text": "README.md が存在する",
      "checked": false,
      "notes": ""
    },
    {
      "id": "2",
      "text": "存在しないファイル NONEXISTENT.md がある",
      "checked": false,
      "notes": ""
    }
  ],
  "result": null,
  "updatedAt": null
}
```

この場合、項目 2 が不合格になり `fixing` → `running` → `acceptance_running` のループが観察できる。

## トラブルシューティング

| 症状 | 考えられる原因 | 対処法 |
|------|-------------|--------|
| `acceptance_running` に遷移しない | `acceptance/<id>.json` が存在しない | チェックリストファイルを作成する |
| `acceptance_running` に遷移しない | 実装子がまだ実行中 | `check-status.mjs` で PID 状態を確認する |
| `acceptance_running` に遷移せず `blocked` になる | 未回答の質問がある | `/task-check` で質問に回答する |
| `acceptance_running` に遷移せず `failed` になる | `acceptance: true` がタスクに未設定 | タスク JSON の `acceptance` フィールドを確認する |
| 受け入れ子がすぐ終了する | チェックリストに `items` がない | `acceptance/<id>.json` の `items` 配列を確認する |
| 修正ループが止まらない | 受け入れ項目が満たせない内容になっている | `acceptance/<id>.json` を修正して再実行する |
| `sessionId` が null で中継できない | ログにセッション情報が出力されていない | `logs/<id>.log` を確認し、agent CLI が正常起動しているか調べる |
