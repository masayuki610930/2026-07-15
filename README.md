# ✨ ミニMBTI診断（懇親会用）

会社の懇親会（約50人規模）でのコミュニケーション促進を目的とした、12問で簡易MBTI診断ができるWebコンテンツです。ビルド不要の単一HTMLファイルで、GitHub Pagesにそのまま公開できます。

- 設計の詳細は [`DESIGN.md`](./DESIGN.md) を参照してください。
- 診断本体は [`index.html`](./index.html)（HTML/CSS/JSすべて内包）。
- 会場の集計画面は [`dashboard.html`](./dashboard.html)（別URL。バックエンドのセットアップが必要 → 後述）。

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

## 集計バックエンドのセットアップ（Google スプレッドシート + Apps Script）

診断結果の送信と集計画面（`dashboard.html`）を使う場合のみ必要です。未設定でも診断単体はそのまま動きます（送信ボタンが表示されないだけ）。設計の詳細は `DESIGN.md` §11〜§17 を参照。

1. **スプレッドシートを作成**: Googleドライブで新規スプレッドシートを作成。シート名を `responses` に変更し、1行目に `timestamp` / `type` / `uuid` のヘッダーを入れる。**共有設定は変更しない（非公開のまま）**。
2. **Apps Script を作成**: そのシートで「拡張機能 > Apps Script」を開き、リポジトリの `gas/Code.gs` の内容を貼り付けて保存。
3. **閲覧トークンを設定**: Apps Script エディタの「プロジェクトの設定 > スクリプト プロパティ」で、キー `READ_TOKEN`・値に推測されない長いランダム文字列（例: `openssl rand -hex 16` の出力）を追加。
4. **Web App としてデプロイ**: 「デプロイ > 新しいデプロイ > 種類: ウェブアプリ」で、
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**

   でデプロイし、発行された `https://script.google.com/macros/s/…/exec` のURLを控える。
5. **エンドポイントURLを設定**: `index.html` と `dashboard.html` それぞれの `<script>` 冒頭にある `CONFIG.endpoint` に上記URLを設定して push。
6. **集計画面URLを共有**: 司会者・幹事にのみ `https://<ユーザー名>.github.io/<リポジトリ名>/dashboard.html?key=<READ_TOKEN>` を共有する。**`?key=` 付きURLは参加者向けには配らないこと**（リポジトリやQRコードにも含めない）。

> ⚠️ `Code.gs` を修正したら、保存だけでなく「デプロイ > デプロイを管理」から**新しいバージョンを発行**しないと `/exec` URLに反映されません。

### セキュリティについて

- スプレッドシートは非公開のままで、読み書きはすべて GAS 経由です。書き込みは入力検証（16タイプのみ）・UUIDによる重複排除・行数上限つき、集計の閲覧は `READ_TOKEN` 必須です。
- 一方で GitHub Pages はソースが全公開のため、送信エンドポイントのURLは隠せません。悪意ある参加者が偽の回答を複数送ることは原理的に防げない点は許容しています（懇親会用のエンタメ用途）。荒れた場合はシートの該当行を手で削除すれば、次のポーリング（10秒毎）で集計画面に反映されます。

## 当日の使い方（例）

- URLをQRコードにして会場のスクリーンや受付に掲示する。
- 「診断結果をスクショして近くの人と見せ合ってみよう」と一言添えると、結果画面の「会話のきっかけ」欄が話のネタになります。
- 集計画面（`dashboard.html?key=…`）をプロジェクタに映しておくと、回答が集まるたびに棒グラフレースが動いて盛り上がります。
- 本診断は厳密な心理学的検査ではなく、懇親会用のエンタメコンテンツです（`index.html` のスタート画面にも注記があります）。
