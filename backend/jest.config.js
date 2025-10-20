export default {
  // ESMモジュールをJestで扱うための設定
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  verbose: true,
};
