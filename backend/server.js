/**
 * @description Habit Trackerアプリケーションのバックエンドサーバーエントリポイントです。Expressを使用してAPIルート、ミドルウェア、データベース同期を管理します。
 */

// 環境変数をロード
import "dotenv/config";
// Expressフレームワークをインポート
import express from "express";
// CORSミドルウェアをインポート
import cors from "cors";

// サーバーがリッスンするポート。環境変数から取得、なければ8080。
const PORT = process.env.PORT || 8080;

// 認証ルートをインポート
import authRoutes from "./routes/auth.js";
// 習慣ルートをインポート
import habitRoutes from "./routes/habit.js";
// データベースモデルをインポート
import { db, sequelize } from "./models/index.js";
// Expressアプリケーションとデータベース同期を初期化する関数
const initializeApp = async () => {
  const app = express();
  // グローバルミドルウェア
  // JSONリクエストボディをパースするためのミドルウェア
  app.use(express.json());
  // CORSを有効にするミドルウェア。特定のオリジンからのリクエストのみを許可。
  app.use(cors({ origin: "http://localhost:5173" }));

  // ルート定義
  // ヘルスチェックまたはルートパスへのGETリクエスト
  app.get("/", (req, res) => {
    res.send("Habit Tracker Backend API is running!");
  });
  // 認証関連のルートを '/api/v1/auth' パスにマウント
  app.use("/api/v1/auth", authRoutes);
  // 習慣関連のルートを '/api/v1/habits' パスにマウント
  app.use("/api/v1/habits", habitRoutes);

  // データベース同期
  try {
    await sequelize.sync({ force: false });
    console.log("Database synced successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    // エラー発生時はアプリの初期化を中断するか、適切に処理
    throw err; // テストでエラーを捕捉できるように再スロー
  }

  // initializeApp 関数はExpressアプリケーションインスタンスを返す
  return app;
};

// テスト環境でない場合のみサーバーをリッスンする
if (process.env.NODE_ENV !== "test") {
  initializeApp()
    .then((app) => {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
    });
}

// テストのためにinitializeApp関数をエクスポート
export default initializeApp;
