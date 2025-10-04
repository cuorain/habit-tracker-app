export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.json" }],
  },
  verbose: true,
};
