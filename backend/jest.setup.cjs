process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/dbname";
process.env.JWT_SECRET = "testsecret";
process.env.JWT_EXPIRATION_TIME = "1h";

// bcryptをモック
jest.mock("bcryptjs", () => ({
  genSalt: jest.fn().mockResolvedValue("mockSalt"),
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn().mockResolvedValue(true),
}));

// jsonwebtokenをモック
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mockToken"),
}));

// SequelizeとUserモデルをグローバルにモック
jest.mock("sequelize", () => {
  const mSequelize = {
    sync: jest.fn().mockResolvedValue(null),
    close: jest.fn().mockResolvedValue(null),
    authenticate: jest.fn().mockResolvedValue(null),
    define: jest.fn().mockImplementation((name, attributes, options) => ({
      name,
      attributes,
      options,
      associate: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      destroy: jest.fn(),
      comparePassword: jest.fn(),
      toJSON: jest.fn().mockImplementation(() => ({})),
    })),
    DataTypes: {
      STRING: "STRING",
      BOOLEAN: "BOOLEAN",
      DATE: "DATE",
    },
  };
  return {
    Sequelize: jest.fn(() => mSequelize),
    DataTypes: mSequelize.DataTypes,
  };
});

// userモデルのモック（必要なメソッドを追加）
jest.mock("../models/user.js", () => {
  return (sequelize, DataTypes) => {
    const MockUser = {
      name: "User",
      associate: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      destroy: jest.fn(),
      comparePassword: jest.fn(), // comparePasswordはUserモデルのインスタンスメソッドとしてモック済み
      toJSON: jest.fn().mockImplementation(() => ({})),
    };
    return MockUser;
  };
});

// backend/models/index.js をモック
jest.mock("../models/index.js", () => {
  // jest.mock("sequelize") で定義されたモックSequelizeインスタンスを取得
  // jest.requireActual("sequelize") は不要。モックされたSequelizeを直接参照
  const { Sequelize, DataTypes } = require("sequelize"); // CommonJS形式でモックされたSequelizeを取得
  const mockSequelizeInstance = new Sequelize(); // モックされたSequelizeインスタンス

  const MockUser = mockSequelizeInstance.define("User", {}, {});
  MockUser.create = jest.fn().mockImplementation((data) =>
    Promise.resolve({
      id: 1, // ダミーのID
      username: data.username,
      passwordHash: "hashedpassword",
      toJSON: () => ({ id: 1, username: data.username }),
    })
  );
  MockUser.findOne = jest.fn().mockResolvedValue(null); // findOneのデフォルトモックも設定

  return {
    sequelize: mockSequelizeInstance,
    Sequelize: Sequelize,
    User: MockUser,
  };
});
