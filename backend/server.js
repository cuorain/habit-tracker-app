/**
 * @description Habit Trackerアプリケーションのバックエンドサーバーエントリポイントです。Expressを使用してAPIルート、ミドルウェア、データベース同期を管理します。
 */

// 環境変数をロード
import "dotenv/config";
// Expressフレームワークをインポート
import express from "express";
// CORSミドルウェアをインポート
import cors from "cors";

const app = express();
// サーバーがリッスンするポート。環境変数から取得、なければ8080。
const PORT = process.env.PORT || 8080;

// 認証ルートをインポート
import authRoutes from "./routes/auth.js";
// 習慣ルートをインポート
import habitRoutes from "./routes/habit.js";
// データベースモデルをインポート
import initializeDb from "./models/index.js";

let sequelize;
let User;
let Habit;

const initializeApp = async () => {
  const initializedDb = await initializeDb();

  sequelize = initializedDb.sequelize;
  User = initializedDb.User;
  Habit = initializedDb.Habit; // Habitモデルを初期化されたDBから取得

  app.locals.User = User; // UserモデルをExpressアプリのローカル変数として利用可能にする
  app.locals.Habit = Habit; // HabitモデルをExpressアプリのローカル変数として利用可能にする

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
  // 習慣関連のルートを '/api/v1' パスにマウント
  app.use("/api/v1", habitRoutes);

  /**
   * Sequelizeモデルをデータベースと同期し、サーバーを起動する。
   * `force: false` は、テーブルが既に存在する場合は再作成しないことを意味する。
   */
  sequelize
    .sync({ force: false })
    .then(() => {
      // テスト環境でない場合のみサーバーをリッスンする
      if (process.env.NODE_ENV !== "test") {
        app.listen(PORT, "0.0.0.0", () => {
          console.log(`Server running on port ${PORT}`);
        });
      }
    })
    .catch((err) => {
      console.error("Unable to connect to the database:", err);
    });

  return app;
};

export default initializeApp;
