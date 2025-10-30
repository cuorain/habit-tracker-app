/**
 * @description Habit Trackerアプリケーションのバックエンドサーバーエントリポイントです。Expressを使用してAPIルート、ミドルウェア、データベース同期を管理します。
 */

// 環境変数をロード
import "dotenv/config";
// Expressフレームワークをインポート
import express from "express";
// CORSミドルウェアをインポート
import cors from "cors";
// httpsモジュールをインポート
import https from "https";
// fsモジュールをインポート
import fs from "fs";

// サーバーがリッスンするポート。環境変数から取得、なければ8080。
const PORT = process.env.PORT || 8080;

// 認証ルートをインポート
import { authRoutes } from "./routes/auth.js";
// 習慣ルートをインポート
import { habitRoutes } from "./routes/habit.js";
// 頻度オプションルートをインポート
import { frequencyOptionRoutes } from "./routes/frequencyOption.js";
// データベースモデルをインポート
import { db, sequelize } from "./models/index.js";
import { convertKeysToSnakeCase } from "./middleware/caseConverterMiddleware.js";

// Expressアプリケーションとデータベース同期を初期化する関数
const initializeApp = async () => {
  const app = express();
  // グローバルミドルウェア
  // JSONリクエストボディをパースするためのミドルウェア
  app.use(express.json());
  // キャメルケースのJSONキーをスネークケースに変換するミドルウェアを追加
  app.use(convertKeysToSnakeCase);
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
  // 頻度オプション関連のルートを '/api/v1/frequency-options' パスにマウント
  app.use("/api/v1/frequency-options", frequencyOptionRoutes);

  // initializeApp 関数はExpressアプリケーションインスタンスを返す
  return app;
};

// 本番環境のみHTTPSサーバーを起動する。テスト環境と開発環境はHTTPサーバーを起動する。
if (process.env.NODE_ENV == "production") {
  initializeApp()
    .then((app) => {
      // 証明書と秘密鍵のパスを環境変数から取得
      const tlsKeyPath = process.env.TLS_KEY_PATH;
      const tlsCertPath = process.env.TLS_CERT_PATH;
      // 証明書と秘密鍵を読み込む
      const privateKey = fs.readFileSync(tlsKeyPath, "utf8");
      const certificate = fs.readFileSync(tlsCertPath, "utf8");
      const credentials = { key: privateKey, cert: certificate };
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
    });
}
// 開発環境の場合HTTPでサーバーをリッスンする（環境変数ないためtest以外にしている）
else if (process.env.NODE_ENV !== "test") {
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

export { initializeApp };
