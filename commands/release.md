新しいバージョンをリリースする。

1. まず dry-run でリリース内容を確認:

```bash
node dev/release.mjs --dry-run
```

出力の changelog をユーザーに表示し、バージョン番号と内容を確認してもらう。

2. ユーザーが承認したら実行:

```bash
node dev/release.mjs
```

以下が自動実行される:
- package.json の version bump
- CHANGELOG.md 生成
- commit + tag + push
- GitHub Release 作成
- npm publish

3. 結果をユーザーに報告する。GitHub Release と npm publish の成功/失敗を含める。
