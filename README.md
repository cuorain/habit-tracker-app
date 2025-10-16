# Habit Tracker App

## 概要
習慣トラッカーアプリケーションは、ユーザーが日常の習慣を記録・追跡し、進捗を可視化するためのWebアプリケーションです。

## 技術スタック
- **バックエンド**: Java 17 + Spring Boot 3.2.0
- **フロントエンド**: HTML5 + CSS3 + JavaScript
- **データベース**: PostgreSQL
- **認証**: JWT (JSON Web Token)
- **グラフ**: Chart.js
- **ビルドツール**: Maven (バックエンド), Vite (フロントエンド)
- **デプロイ**: Docker (本番環境はKubernetesクラスター)

## 主要機能
- ユーザー登録・ログイン 
- プロフィール管理 
- 習慣の作成・編集・削除
- 習慣の進捗記録
- 進捗の可視化（グラフ・統計）
- 週次/月次サマリー表示
- カテゴリ別習慣管理 (ユーザー定義カテゴリ、事前定義カテゴリ)
- 連続記録の追跡

## プロジェクト構造
```
/habit-tracker-app
├── docs/                 # 要件・設計・仕様書
│   ├── 01_requirements/    # 機能要件・ユーザーストーリー
│   ├── 02_architecture/    # システムアーキテクチャ
│   ├── 03_backend_api/     # API仕様・データモデル
│   └── 04_frontend_ui/     # UI設計・可視化仕様
├── backend/              # Java/Spring Boot バックエンド
│   ├── src/
│   └── pom.xml
├── frontend/             # HTML/CSS/JavaScript フロントエンド
│   ├── src/
│   └── package.json
└── README.md
```

## セットアップ

### 前提条件
- Java 17以上
- Node.js 18以上
- PostgreSQL 13以上
- Maven 3.6以上

### バックエンドセットアップ
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### フロントエンドセットアップ
```bash
cd frontend
npm install
npm run dev
```

### フロントエンドテストの実行
```bash
cd frontend
npm test
```

### データベースセットアップ
```sql
CREATE DATABASE habit_tracker;
CREATE USER habit_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE habit_tracker TO habit_user;
```

## API仕様
- ベースURL: `http://localhost:8080/api/v1`
- 認証: JWT Bearer Token
- 詳細仕様: [API仕様書](docs/03_backend_api/api_spec.md)

## 開発ガイドライン

### コーディング規約
- Java: Google Java Style Guide準拠
- JavaScript: ESLint + Prettier
- コミットメッセージ: Conventional Commits

### テスト
- バックエンド: JUnit 5 + Mockito
- フロントエンド: Jest (単体テスト)
- 統合テスト: TestContainers
- テストケース: [テストケース](docs/01_requirements/test_cases.md)

### デプロイ
- 開発環境: Docker Composeを使用したコンテナ化
- 本番環境: Kubernetesクラスター (Longhornを使用したストレージの冗長化とバックアップを検討)
- CI/CD: GitHub Actions

## 更新履歴
- v1.0.1 (2025-10-16): 
  - UIデザインの全面刷新（スポーティなテーマ、テーマカラーの変更、ヘッダーの品質向上）
  - 認証フローの安定化とユーザー名認証への変更
  - フロントエンドにJestとBabelを導入し、`AuthService`, `AuthComponent`, `App`の単体テストを追加
  - エラーメッセージの日本語化
- v1.0.0 (2024-01-01): 初回リリース
  - 基本的な習慣管理機能
  - 進捗可視化機能
  - ユーザー認証機能