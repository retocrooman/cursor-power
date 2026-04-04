import { QUESTIONS_DIR } from "./paths.mjs";

export function buildInitialPrompt(taskId, userPrompt, { draftPR = false } = {}) {
  const ghPrCreateCmd = draftPR
    ? `gh pr create --draft --base ${"{baseBranch}"}`
    : `gh pr create --base ${"{baseBranch}"}`;

  return `${userPrompt}

---
## 作業ルール

### 質問
- 判断に迷ったり、仕様が不明確な場合は必ず質問すること。
- 仕様に「何を」「どのように」が明確でない場合は、実装前に必ず質問すること。
- 複数の解釈ができる仕様の場合は、質問して確認すること。
- 質問せずに推測で実装することは禁止。迷ったら質問。
- 質問は ${QUESTIONS_DIR}/${taskId}.json に以下の形式で書く:

\`\`\`json
{
  "taskId": "${taskId}",
  "question": "質問内容",
  "askedAt": "ISO 8601 日時"
}
\`\`\`

- 質問ファイルを書いたら作業を中断し、回答を待つ。それ以上の作業はしないこと。

### Git 操作
- 作業は必ず現在の worktree 内で行うこと。他のディレクトリに移動しない。
- 作業が完了したら以下を順番に実行:
  1. git add で変更をステージ
  2. git commit（Conventional Commits 形式）
  3. git push -u origin HEAD
  4. ${ghPrCreateCmd} でPRを作成
- PRのタイトルは Conventional Commits 形式にする。

### 禁止事項
- main ブランチへの直接 push
- force push
- worktree 外のファイルの変更
- 質問なしで曖昧な仕様を推測して実装すること`;
}

export function buildResumePrompt(answer) {
  return `ユーザーからの回答: ${answer}

この回答を踏まえて作業を続行してください。

作業が完了したら以下を順番に実行:
1. git add で変更をステージ
2. git commit（Conventional Commits 形式）
3. git push -u origin HEAD
4. gh pr create でPRを作成

さらに質問がある場合は、同じ方法で質問ファイルに書いてください。`;
}
