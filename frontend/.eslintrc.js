module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true, // Jest環境を追加
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["import"],
  rules: {
    // 'import/prefer-default-export': 'off', // デフォルトエクスポートを強制しない
    "import/no-default-export": "warn", // デフォルトエクスポートを警告
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js"],
      },
    },
  },
};
