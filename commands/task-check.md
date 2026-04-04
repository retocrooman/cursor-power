子エージェントからの質問を確認し、ユーザーの回答を中継する。

1. 未回答の質問を取得:

```bash
node ~/.cursor-power/scripts/check-questions.mjs
```

2. 未回答の質問があればユーザーに表示し、回答を求める。質問がなければ「未回答の質問はありません」と伝える。

3. ユーザーが回答したら、質問ファイルに書き込み:

```bash
node ~/.cursor-power/scripts/check-questions.mjs --task-id <タスクID> --answer "<ユーザーの回答>"
```

4. 子エージェントに回答を中継:

```bash
node ~/.cursor-power/scripts/send-answer.mjs --task-id <タスクID> --answer "<ユーザーの回答>"
```

5. 「タスク <ID> に回答を送信しました」と報告する。
