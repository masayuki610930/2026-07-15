# ✨ ミニMBTI診断（懇親会用）

会社の懇親会（約50人規模）でのコミュニケーション促進を目的とした、12問で簡易MBTI診断ができるWebコンテンツです。ビルド不要の単一HTMLファイルで、GitHub Pagesにそのまま公開できます。

- 設計の詳細は [`DESIGN.md`](./DESIGN.md) を参照してください。
- 本体は [`index.html`](./index.html) 1ファイルのみ（HTML/CSS/JSすべて内包）。

## ローカルで確認する

ブラウザで直接 `index.html` を開くか、ローカルサーバーで配信して確認してください。

```bash
cd /Users/masayuki/git/2026-07-15
python3 -m http.server 8000
# http://localhost:8000 をブラウザで開く（iPhoneで確認する場合は同じWi-FiでPCのIPアドレス:8000にアクセス）
```

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作成する（Public推奨）。
2. このディレクトリの内容をpushする。

   ```bash
   cd /Users/masayuki/git/2026-07-15
   git init
   git add index.html DESIGN.md README.md
   git commit -m "Add MBTI quiz for company social event"
   git branch -M main
   git remote add origin <あなたのリポジトリのURL>
   git push -u origin main
   ```

3. GitHubのリポジトリページで **Settings > Pages** を開く。
4. **Source** を `Deploy from a branch` にし、ブランチを `main` / フォルダを `/ (root)` に設定して保存する。
5. 数十秒〜数分待つと `https://<ユーザー名>.github.io/<リポジトリ名>/` でアクセス可能になります。
6. 発行されたURLをiPhoneのSafari等で開いて、最初から最後まで一通り診断して動作確認してください。

## 当日の使い方（例）

- URLをQRコードにして会場のスクリーンや受付に掲示する。
- 「診断結果をスクショして近くの人と見せ合ってみよう」と一言添えると、結果画面の「会話のきっかけ」欄が話のネタになります。
- 本診断は厳密な心理学的検査ではなく、懇親会用のエンタメコンテンツです（`index.html` のスタート画面にも注記があります）。
