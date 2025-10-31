import { defineConfig } from "vite";
import path from "path";

// Determine if HTTPS should be enabled based on NODE_ENV
const isProduction = process.env.NODE_ENV === "production";

// 現在のファイルのディレクトリ名を取得
const __dirname = path.resolve();
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    https: isProduction,
  },
  define: {
    // process.envをブラウザ環境で使えるようにする
    "process.env": {
      VITE_API_URL: isProduction ? "/" : "http://localhost:8080",
    },
  },
  resolve: {
    // エイリアスの設定: @ を src ディレクトリにマッピング
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // ファイル拡張子を省略したい場合に追加
    // extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
});
