import { defineConfig } from "vite";
import path from "path";

// 現在のファイルのディレクトリ名を取得
const __dirname = path.resolve();
export default defineConfig({
  server: {
    port: 5173,
    host: true,
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
