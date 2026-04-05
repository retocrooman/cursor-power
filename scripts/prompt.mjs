import { QUESTIONS_DIR, ACCEPTANCE_DIR } from "./paths.mjs";

function questionRules(taskId) {
  return `### 質問
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

- 質問ファイルを書いたら作業を中断し、回答を待つ。それ以上の作業はしないこと。`;
}

function riskScoreRules(taskId) {
  return `### リスクスコア評価（安全度スケール — 数値が大きいほど安全）
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
- 書き込みにはJSONファイルを読み取り、riskScore フィールドを追加して上書きすること。`;
}

function prohibitionRules() {
  return `### 禁止事項
- main ブランチへの直接 push
- force push
- worktree 外のファイルの変更
- 質問なしで曖昧な仕様を推測して実装すること`;
}

export function buildInitialPrompt(taskId, userPrompt, { draftPR = false, acceptance = false } = {}) {
  const ghPrCreateCmd = draftPR
    ? `gh pr create --draft --base ${"{baseBranch}"}`
    : `gh pr create --base ${"{baseBranch}"}`;

  if (acceptance) {
    return `${userPrompt}

---
## 作業ルール

${questionRules(taskId)}

${riskScoreRules(taskId)}

### Git 操作
- 作業は必ず現在の worktree 内で行うこと。他のディレクトリに移動しない。
- 作業が完了したら以下を順番に実行:
  1. git add で変更をステージ
  2. git commit（Conventional Commits 形式）
  3. リスクスコア評価を実施し、タスクJSONに書き込む
  4. git push -u origin HEAD
- **PR は作成しないこと**。commit & push まで完了したら作業を終了する。
- 受け入れテストが別セッションで自動実行され、合格後に PR が作成される。

${prohibitionRules()}`;
  }

  return `${userPrompt}

---
## 作業ルール

${questionRules(taskId)}

${riskScoreRules(taskId)}

### Git 操作
- 作業は必ず現在の worktree 内で行うこと。他のディレクトリに移動しない。
- 作業が完了したら以下を順番に実行:
  1. git add で変更をステージ
  2. git commit（Conventional Commits 形式）
  3. リスクスコア評価を実施し、タスクJSONに書き込む
  4. git push -u origin HEAD
  5. ${ghPrCreateCmd} でPRを作成
- PRのタイトルは Conventional Commits 形式にする。

${prohibitionRules()}`;
}

export function buildAcceptancePrompt(taskId) {
  const acceptancePath = `${ACCEPTANCE_DIR}/${taskId}.json`;

  return `あなたは受け入れテスト担当です。実装の検証のみを行います。

## 受け入れチェックリスト

${acceptancePath} に受け入れ項目が定義されています。このファイルを読み取り、各項目を検証してください。

### 検証手順
1. ${acceptancePath} を読み取る
2. 各項目（items 配列）について:
   - 項目が指す成果物（リポジトリ内のコード・ドキュメント・設定ファイルなど）を開き、満たされているか検証する
   - テストがある場合は実行して結果を確認する
   - 項目の \`checked\` を \`true\` または \`false\` に更新する
   - \`notes\` に検証結果の要約を記入する
3. 全項目の検証が完了したら:
   - 全項目が \`checked: true\` なら \`result\` を \`"passed"\` に設定
   - 1つでも \`checked: false\` があれば \`result\` を \`"failed"\` に設定
4. \`updatedAt\` を現在の ISO 8601 日時で更新する
5. **必ず** ${acceptancePath} を上書き保存する（次項を参照）

### JSON の保存（必須）
- **チャット上の完了報告だけでは終わらないこと。** \`sync-status.mjs\` はこのファイルを読み、トップレベルの \`result\` が \`"passed"\` のときだけ合格として実装セッションを再開する。
- 上書き保存は **ファイルツールで ${acceptancePath} に対して実際に書き込む**こと（リポジトリ外のパスでも同じ）。
- 保存したら **同じパスを読み直し**、\`result\`・各 \`checked\`・\`updatedAt\` が意図どおりか確認してから終了する。

### 制約
- **実装コードの変更は最小限に留めること**（テストの修正・追加のみ許可）
- **新機能の追加や設計変更は禁止**
- 受け入れ項目の追加・削除は禁止（既存項目のチェックと備考のみ更新）
- 検証が完了したら作業を終了すること`;
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

export function buildFixingPrompt(taskId) {
  const acceptancePath = `${ACCEPTANCE_DIR}/${taskId}.json`;

  return `受け入れテストで不合格の項目があります。

${acceptancePath} を読み取り、\`checked: false\` の項目と \`notes\` を確認して修正してください。

修正が完了したら以下を順番に実行:
1. git add で変更をステージ
2. git commit（Conventional Commits 形式）
3. git push -u origin HEAD

PR は作成しないこと。修正後に再び受け入れテストが自動実行されます。

さらに質問がある場合は、同じ方法で質問ファイルに書いてください。`;
}
