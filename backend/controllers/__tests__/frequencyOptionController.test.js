import { getFrequencyOptions } from "../frequencyOptionController.js";
import { jest } from "@jest/globals";
import { Sequelize, DataTypes } from "sequelize";

// モックされたdbとsequelizeインスタンスをJestのモックの外で定義
let mockSequelizeInstance;
let mockDb;

jest.mock("../../models/index.js", () => {
  const actualSequelize = jest.requireActual("sequelize");
  mockSequelizeInstance = new actualSequelize.Sequelize("sqlite::memory:", {
    logging: false,
  });
  mockDb = {};

  // 実際のモデルファイルを読み込み、モックSequelizeインスタンスにアタッチ
  const User = jest
    .requireActual("../../models/user.js")
    .User(mockSequelizeInstance, DataTypes);
  const FrequencyOption = jest
    .requireActual("../../models/frequencyOption.js")
    .FrequencyOption(mockSequelizeInstance, DataTypes);

  mockDb.User = User;
  mockDb.FrequencyOption = FrequencyOption;
  mockDb.sequelize = mockSequelizeInstance;
  mockDb.Sequelize = actualSequelize.Sequelize;

  // 関連付けも実行
  if (mockDb.User.associate) mockDb.User.associate(mockDb);
  if (mockDb.FrequencyOption.associate)
    mockDb.FrequencyOption.associate(mockDb);

  return {
    db: mockDb,
    sequelize: mockSequelizeInstance,
    Sequelize: actualSequelize.Sequelize,
  };
});

const { db, sequelize } = await import("../../models/index.js");

describe("Frequency Option Controller", () => {
  let req, res;

  beforeAll(async () => {
    // テスト環境であることを明示
    process.env.NODE_ENV = "test";

    // Jestモックのdb.FrequencyOption.findAllを直接参照してモックをセットアップ
    db.FrequencyOption.findAll = jest.fn();
  });

  beforeEach(() => {
    // モックのreqとresオブジェクトを設定
    req = { user: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks(); // 各テストの前にモックをクリア
  });

  afterAll(async () => {
    await sequelize.close(); // テスト後にデータベース接続をクローズ
  });

  test("頻度オプションが正常に取得できること", async () => {
    const mockFrequencyOptions = [
      {
        id: 1,
        name: "毎日",
        description: "毎日行います",
        is_default: true,
        user_id: null,
      },
      {
        id: 2,
        name: "週に1回",
        description: "週に1回行います",
        is_default: true,
        user_id: null,
      },
    ];

    // findAllのモックを設定
    db.FrequencyOption.findAll.mockResolvedValue(mockFrequencyOptions);

    await getFrequencyOptions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockFrequencyOptions);
    expect(db.FrequencyOption.findAll).toHaveBeenCalledWith({
      order: [
        ["is_default", "DESC"],
        ["name", "ASC"],
      ],
    });
  });

  test("頻度オプションの取得に失敗した場合のエラーハンドリング", async () => {
    const errorMessage = "Database error";

    // findAllのモックをエラーを返すように設定
    db.FrequencyOption.findAll.mockRejectedValue(new Error(errorMessage));

    await getFrequencyOptions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "頻度オプションの取得に失敗しました。",
    });
  });
});
