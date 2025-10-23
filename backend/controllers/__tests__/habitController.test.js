import { createHabit } from "../habitController";
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
  const Habit = jest
    .requireActual("../../models/habit.js")
    .Habit(mockSequelizeInstance, DataTypes);

  mockDb.User = User;
  mockDb.Habit = Habit;
  mockDb.sequelize = mockSequelizeInstance;
  mockDb.Sequelize = actualSequelize.Sequelize;

  // 関連付けも実行
  if (mockDb.User.associate) mockDb.User.associate(mockDb);
  if (mockDb.Habit.associate) mockDb.Habit.associate(mockDb);

  return {
    db: mockDb,
    sequelize: mockSequelizeInstance,
    Sequelize: actualSequelize.Sequelize,
  };
});

const { db, sequelize } = await import("../../models/index.js");

describe("createHabit", () => {
  let req, res;

  beforeAll(async () => {
    // テスト環境であることを明示
    process.env.NODE_ENV = "test";
    await sequelize.sync({ force: true }); // テストごとにデータベースをクリーンにする

    // Jestモックのdb.Habit.createを直接参照してモックをセットアップ
    db.Habit.create = jest.fn();
  });

  afterAll(async () => {
    await sequelize.close(); // テスト後にデータベース接続をクローズ
  });

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: {
        name: "Test Habit",
        description: "Test Description",
        category: "Health",
        habit_type: "NUMERIC_COUNT",
        target_value: 1,
        target_unit: "times",
        target_frequency: "daily",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks(); // 各テストの前にモックをクリア
  });

  it("認証済みユーザーが習慣を作成できること", async () => {
    const newHabit = { id: 1, ...req.body, user_id: req.user.id };
    db.Habit.create.mockResolvedValue(newHabit);

    await createHabit(req, res);

    expect(db.Habit.create).toHaveBeenCalledWith({
      name: "Test Habit",
      description: "Test Description",
      category: "Health",
      habit_type: "NUMERIC_COUNT",
      target_value: 1,
      target_unit: "times",
      target_frequency: "daily",
      user_id: req.user.id,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newHabit);
  });

  it("必須フィールドが不足している場合、400エラーを返すこと", async () => {
    delete req.body.name;

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "必須フィールドが不足しています。",
    });
  });

  it("データベースエラーが発生した場合、500エラーを返すこと", async () => {
    db.Habit.create.mockRejectedValue(new Error("Database error"));

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "習慣の作成中にエラーが発生しました。",
    });
  });

  it("habitTypeがBOOLEANの場合、targetValueとtargetUnitがNULLでない場合は400エラーを返すこと", async () => {
    req.body.habit_type = "BOOLEAN";
    req.body.target_value = 1;
    req.body.target_unit = "times";

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "BOOLEANタイプの習慣にはtargetValueとtargetUnitは設定できません。",
    });
  });

  it("habitTypeがBOOLEANの場合、targetValueとtargetUnitがNULLの場合は習慣を作成できること", async () => {
    req.body.habit_type = "BOOLEAN";
    req.body.target_value = null;
    req.body.target_unit = null;

    const newHabit = { id: 1, ...req.body, user_id: req.user.id };
    db.Habit.create.mockResolvedValue(newHabit);

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newHabit);
  });

  it("habitTypeがNUMERIC_DURATIONまたはNUMERIC_COUNTの場合、targetValueまたはtargetUnitがNULLの場合は400エラーを返すこと", async () => {
    req.body.habit_type = "NUMERIC_DURATION";
    req.body.target_value = null;
    req.body.target_unit = "hours";

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "NUMERIC_DURATIONまたはNUMERIC_COUNTタイプの習慣にはtargetValueとtargetUnitが必要です。",
    });
  });

  it("habitTypeがNUMERIC_DURATIONまたはNUMERIC_COUNTの場合、targetValueが0未満の場合は400エラーを返すこと", async () => {
    req.body.habit_type = "NUMERIC_COUNT";
    req.body.target_value = -1;
    req.body.target_unit = "reps";

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "targetValueは0以上の数値である必要があります。",
    });
  });

  it("habitTypeがNUMERIC_DURATIONまたはNUMERIC_COUNTの場合、targetUnitが無効な場合は400エラーを返すこと", async () => {
    req.body.habit_type = "NUMERIC_DURATION";
    req.body.target_value = 1;
    req.body.target_unit = "invalid_unit";

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "targetUnitはhours, minutes, reps, timesのいずれかである必要があります。",
    });
  });

  it("不正なhabitTypeの場合、400エラーを返すこと", async () => {
    req.body.habit_type = "INVALID_TYPE";
    req.body.target_value = null;
    req.body.target_unit = null;

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "habitTypeはBOOLEAN, NUMERIC_DURATION, NUMERIC_COUNTのいずれかである必要があります。",
    });
  });

  it("認証情報（req.user）がない場合、401エラーを返すこと", async () => {
    delete req.user; // req.userを削除して、認証情報がない状態をシミュレート

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "認証されていません。",
    });
  });
});
