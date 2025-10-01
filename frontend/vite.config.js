import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // <-- この行を追加
  server: {
    port: 5173,
    host: "true",
  },
});
