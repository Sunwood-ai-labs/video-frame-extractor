<div align="center">

<img src="https://raw.githubusercontent.com/Sunwood-ai-labs/video-frame-extractor/refs/heads/main/Whisk_46bd303fa6af7baa2df4499c9cb00879eg.png" width="100%">

# 動画フレーム抽出ツール (Video Frame Extractor)

動画の最後の瞬間を美しい画像としてキャプチャするWebアプリケーションです。

![Video Frame Extractor](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38bdf8?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff?logo=vite)

</div>

## 🎯 特徴

- **シンプルな操作**: ドラッグ＆ドロップまたはファイル選択で動画をアップロード
- **高品質抽出**: 動画の最後のフレームを6枚抽出（0.25秒間隔）
- **柔軟な保存形式**: JPEG または PNG 形式で保存可能
- **レスポンシブデザイン**: スマートフォンからデスクトップまで対応
- **ダークテーマ**: 目に優しいダークモードUI

## 🚀 デモ

[デモサイトはこちら](https://sunwood-ai-labs.github.io/video-frame-extractor/)

## 📦 インストール

```bash
# リポジトリをクローン
git clone https://github.com/Sunwood-ai-labs/video-frame-extractor.git

# ディレクトリに移動
cd video-frame-extractor

# 依存関係をインストール
npm install
```

## 🛠️ 開発

```bash
# 開発サーバーを起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 📋 使い方

1. **動画をアップロード**
   - ドラッグ＆ドロップエリアに動画ファイルをドロップ
   - またはクリックしてファイルを選択

2. **保存形式を選択**
   - JPEG または PNG から選択

3. **フレームを抽出**
   - 「最後のフレームを抽出」ボタンをクリック
   - 動画の最後から6フレームが抽出されます

4. **画像を保存**
   - 抽出されたフレームにカーソルを合わせる
   - 「保存」ボタンをクリックしてダウンロード

## 🏗️ 技術スタック

- **フレームワーク**: React 18.2
- **言語**: TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **デプロイ**: GitHub Pages

## 📂 プロジェクト構造

```
video-frame-extractor/
├── .github/
│   └── workflows/
│       └── static-site.yml    # GitHub Actions ワークフロー
├── src/
│   ├── App.tsx                # メインアプリケーションコンポーネント
│   ├── index.tsx              # エントリーポイント
│   ├── index.css              # グローバルスタイル
│   └── types.ts               # TypeScript 型定義
├── index.html                 # HTMLテンプレート
├── package.json               # プロジェクト設定
├── tsconfig.json              # TypeScript設定
├── vite.config.ts             # Vite設定
├── tailwind.config.js         # Tailwind CSS設定
└── postcss.config.js          # PostCSS設定
```

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

[MIT](https://choosealicense.com/licenses/mit/)

## 👨‍💻 作者

Created with by [Your Name]

---

**Built with React + TypeScript + Vite + Tailwind CSS**
