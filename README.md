# 📐 MathLens

数学の問題の写真を撮ると、AIが考え方から答えまで丁寧に解説してくれるWebアプリ。

- **Next.js 16 (App Router)** + TypeScript + Tailwind CSS v4
- **Gemini 2.5 Flash** (画像認識 + 解説生成)
- **KaTeX** (数式の綺麗な表示)
- **PWA対応** (スマホのホーム画面に追加可能)

## 主な機能

- 📷 カメラで撮影 or ファイルアップロードで問題を入力
- 🧠 AIが画像から問題を読み取り、対象学年に合わせた解説を生成
- ✍️ 「考え方 → 解き方ステップ → 答え」の4セクションで表示
- 🔍 初回のみ「読み取り結果はこれで合ってる？」確認モーダル（次回からスキップ可）
- ⚙️ 学年・解説の詳しさをプロフィールで設定（端末保存、登録不要）
- 📤 解説結果を画像化してSNSや友達に共有

## ローカルで起動

```bash
npm install
cp .env.example .env.local
# .env.local を開いて GEMINI_API_KEY=... を実際のキーに書き換え

npm run dev
# http://localhost:3000 で起動
```

Gemini API キーは [Google AI Studio](https://aistudio.google.com/apikey) で無料取得できます。

## Vercelにデプロイ

1. このリポジトリをGitHubにpush
2. [Vercel](https://vercel.com) で「New Project」→ GitHubリポジトリをimport
3. **Environment Variables** に `GEMINI_API_KEY` を追加（値は本物のAPIキー）
4. Deploy

ビルドコマンドや出力先はNext.js用に自動検出されます。

## ディレクトリ構成

```
app/
├── api/solve/route.ts     # Gemini呼び出しのサーバー側ルート
├── apple-icon.tsx         # iOSホーム画面アイコン (動的PNG生成)
├── icon.svg               # ブラウザ/Android アイコン
├── layout.tsx             # ルートレイアウト
├── manifest.ts            # PWA manifest
└── page.tsx               # メインページ
components/                # UIコンポーネント
lib/                       # 型定義・プロンプト・localStorage
```
