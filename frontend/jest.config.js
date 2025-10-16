module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'], // Jestのセットアップファイルを追加
};
