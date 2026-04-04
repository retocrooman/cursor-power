子エージェントの未回答質問を確認し回答を中継する。

```bash
node ~/.cursor-power/scripts/check-questions.mjs
```

質問があれば表示、なければ「未回答の質問はありません」。回答を受けたら送信し「タスク <ID> に回答を送信しました」と報告:

```bash
node ~/.cursor-power/scripts/send-answer.mjs --task-id <タスクID> --answer "<ユーザーの回答>"
```
