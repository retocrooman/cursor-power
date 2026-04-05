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

### リスクスコア評価（安全度スケール — 数値が大きいほど安全）
- PR作成前に、この変更の「影響の小ささ」と「発生しにくさ」をそれぞれ1〜5で評価すること。
- 判断基準:
  - impact（影響の小ささ）:
    - 1 = 変更の影響範囲が広く、障害が重い可能性が高い
    - 2 = 複数モジュールに波及し、中程度の障害リスクがある
    - 3 = 影響範囲は限定的だが、一部注意が必要
    - 4 = 局所的な変更で、影響はほぼ軽微
    - 5 = 影響範囲が極めて小さく、問題になりにくい
  - likelihood（発生しにくさ）:
    - 1 = 欠陥が入りやすく、不確実な変更
    - 2 = バグが入る余地がかなりある
    - 3 = 一般的なリスク水準
    - 4 = ロジックが単純で、バグが入りにくい
    - 5 = 極めて安全で、バグが入る余地がほぼない
- 安全な変更なら impact=5, likelihood=5 を付けること。リスクが高いほど小さい値にする。
- 評価結果をタスクJSONファイル（~/.cursor-power/tasks/${taskId}.json）の riskScore フィールドに書き込むこと。
- 形式: {"impact": 1-5, "likelihood": 1-5}
- 書き込みにはJSONファイルを読み取り、riskScore フィールドを追加して上書きすること。

### Git 操作
- 作業は必ず現在の worktree 内で行うこと。他のディレクトリに移動しない。
- 作業が完了したら以下を順番に実行:
  1. git add で変更をステージ
  2. git commit（Conventional Commits 形式）
  3. リスクスコア評価を実施し、タスクJSONに書き込む
  4. git push -u origin HEAD
  5. ${ghPrCreateCmd} でPRを作成
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
