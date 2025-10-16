module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.json" }],
  },
  verbose: true,
  setupFiles: ["./jest.setup.cjs"],
  moduleNameMapper: {
    "^../models/(.*)$": "<rootDir>/models/$1",
  },
};
