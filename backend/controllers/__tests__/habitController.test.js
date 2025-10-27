import { createHabit, getHabits, updateHabit } from "../habitController";
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
  const FrequencyOption = jest
    .requireActual("../../models/frequencyOption.js")
    .FrequencyOption(mockSequelizeInstance, DataTypes);

  mockDb.User = User;
  mockDb.Habit = Habit;
  mockDb.FrequencyOption = FrequencyOption;
  mockDb.sequelize = mockSequelizeInstance;
  mockDb.Sequelize = actualSequelize.Sequelize;

  // 関連付けも実行
  if (mockDb.User.associate) mockDb.User.associate(mockDb);
  if (mockDb.Habit.associate) mockDb.Habit.associate(mockDb);
  if (mockDb.FrequencyOption.associate)
    mockDb.FrequencyOption.associate(mockDb);

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
    db.FrequencyOption.findByPk = jest.fn(); // FrequencyOptionのモックを追加
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
        target_frequency_id: 1,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks(); // 各テストの前にモックをクリア

    // ここにFrequencyOptionのモックを追加
    db.FrequencyOption.findByPk.mockResolvedValue({ id: 1, name: "毎日" });
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
      target_frequency_id: 1,
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

  it("target_frequencyがundefinedの場合、400エラーを返すこと", async () => {
    delete req.body.target_frequency_id;
    await createHabit(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "必須フィールドが不足しています。",
    });
  });

  it("target_frequencyが空文字列の場合、400エラーを返すこと", async () => {
    req.body.target_frequency_id = "";
    await createHabit(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "必須フィールドが不足しています。",
    });
  });

  it("target_frequency_idが1未満の場合、400エラーを返すこと", async () => {
    req.body.target_frequency_id = 0;
    await createHabit(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "targetFrequencyIdは1以上の数値である必要があります。",
    });
  });

  it("存在しないtarget_frequency_idの場合、400エラーを返すこと", async () => {
    db.Habit.create.mockImplementation(() => {
      throw new Error("Foreign key constraint failed"); // 外部キー制約違反をシミュレート
    });
    db.FrequencyOption = {
      findByPk: jest.fn().mockResolvedValue(null), // 頻度オプションが見つからないことをシミュレート
    };
    req.body.target_frequency_id = 999; // 存在しないID

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "指定されたtargetFrequencyIdは存在しません。",
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

  it("habitTypeがBOOLEANの場合、target_valueがundefinedとtarget_unitがundefinedの場合は習慣を作成できること", async () => {
    req.body.habit_type = "BOOLEAN";
    delete req.body.target_value;
    delete req.body.target_unit;

    const newHabit = {
      id: 1,
      ...req.body,
      user_id: req.user.id,
      target_value: null,
      target_unit: null,
    };
    db.Habit.create.mockResolvedValue(newHabit);

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newHabit);
  });

  it("habitTypeがBOOLEANの場合、target_valueが空文字列とtarget_unitが空文字列の場合は習慣を作成できること", async () => {
    req.body.habit_type = "BOOLEAN";
    req.body.target_value = "";
    req.body.target_unit = "";

    const newHabit = {
      id: 1,
      ...req.body,
      user_id: req.user.id,
      target_value: null,
      target_unit: null,
    };
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

  it("habitTypeがNUMERIC_COUNTまたはNUMERIC_DURATIONで、target_valueがundefinedの場合、400エラーを返すこと", async () => {
    req.body.habit_type = "NUMERIC_DURATION";
    delete req.body.target_value;
    req.body.target_unit = "hours";

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "NUMERIC_DURATIONまたはNUMERIC_COUNTタイプの習慣にはtargetValueとtargetUnitが必要です。",
    });
  });

  it("habitTypeがNUMERIC_COUNTまたはNUMERIC_DURATIONで、target_valueが空文字列の場合、400エラーを返すこと", async () => {
    req.body.habit_type = "NUMERIC_DURATION";
    req.body.target_value = "";
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

describe("getHabits", () => {
  let req, res;

  beforeAll(async () => {
    // テスト環境であることを明示
    process.env.NODE_ENV = "test";

    // Mock db.Habit.findAllとdb.FrequencyOption.findByPk
    db.Habit.findAll = jest.fn();
    db.FrequencyOption.findByPk = jest.fn();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(() => {
    req = { user: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("認証済みユーザーが習慣一覧と頻度オプション名を正常に取得できること", async () => {
    const mockHabits = [
      {
        id: 1,
        name: "Test Habit 1",
        description: "Description 1",
        category: "Health",
        habit_type: "BOOLEAN",
        target_value: null,
        target_unit: null,
        target_frequency_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        FrequencyOption: { name: "毎日" },
      },
      {
        id: 2,
        name: "Test Habit 2",
        description: "Description 2",
        category: "Work",
        habit_type: "NUMERIC_COUNT",
        target_value: 5,
        target_unit: "times",
        target_frequency_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
        FrequencyOption: { name: "週に3回" },
      },
    ];

    db.Habit.findAll.mockResolvedValue(mockHabits);

    await getHabits(req, res);

    expect(db.Habit.findAll).toHaveBeenCalledWith({
      where: { user_id: req.user.id },
      attributes: [
        "id",
        "name",
        "description",
        "category",
        "habit_type",
        "target_value",
        "target_unit",
        "target_frequency_id",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: db.FrequencyOption,
          attributes: ["name"],
        },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        name: "Test Habit 1",
        description: "Description 1",
        category: "Health",
        habit_type: "BOOLEAN",
        target_value: null,
        target_unit: null,
        target_frequency_id: 1,
        created_at: mockHabits[0].created_at,
        updated_at: mockHabits[0].updated_at,
        target_frequency_name: "毎日",
      },
      {
        id: 2,
        name: "Test Habit 2",
        description: "Description 2",
        category: "Work",
        habit_type: "NUMERIC_COUNT",
        target_value: 5,
        target_unit: "times",
        target_frequency_id: 2,
        created_at: mockHabits[1].created_at,
        updated_at: mockHabits[1].updated_at,
        target_frequency_name: "週に3回",
      },
    ]);
  });

  it("認証情報（req.user）がない場合、401エラーを返すこと", async () => {
    delete req.user;

    await getHabits(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "認証されていません。" });
  });

  it("習慣が一つも登録されていない場合、空の配列を返すこと", async () => {
    db.Habit.findAll.mockResolvedValue([]);

    await getHabits(req, res);

    expect(db.Habit.findAll).toHaveBeenCalledWith({
      where: { user_id: req.user.id },
      attributes: [
        "id",
        "name",
        "description",
        "category",
        "habit_type",
        "target_value",
        "target_unit",
        "target_frequency_id",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: db.FrequencyOption,
          attributes: ["name"],
        },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("データベースエラーが発生した場合、500エラーを返すこと", async () => {
    db.Habit.findAll.mockRejectedValue(new Error("Database error"));

    await getHabits(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "サーバーエラーが発生しました。",
    });
  });
});

describe("updateHabit", () => {
  let req, res;
  beforeAll(async () => {
    // テスト環境であることを明示
    process.env.NODE_ENV = "test";

    db.Habit.findByPk = jest.fn();
    db.Habit.update = jest.fn();
    db.FrequencyOption.findByPk = jest.fn(); // FrequencyOptionのモックを追加
  });

  afterAll(async () => {
    await sequelize.close(); // テスト後にデータベース接続をクローズ
  });

  beforeEach(() => {
    req = {
      params: { id: 1 },
      user: { id: 1 },
      body: {
        name: "Updated Habit",
        description: "Updated Description",
        category: "Health",
        habit_type: "NUMERIC_COUNT",
        target_value: 2,
        target_unit: "times",
        target_frequency_id: 1,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("習慣が正常に更新された場合、200ステータスと更新された習慣を返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn().mockResolvedValue(true),
    });
    db.FrequencyOption.findByPk = jest.fn().mockResolvedValue({ id: 1 });

    await updateHabit(req, res);

    expect(db.Habit.update).toHaveBeenCalledWith({
      name: "Updated Habit",
      description: "Updated Description",
      category: "Health",
      habit_type: "NUMERIC_COUNT",
      target_value: 2,
      target_unit: "times",
      target_frequency_id: 1,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("認証情報（req.user）がない場合、401エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    delete req.user;

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "認証されていません。" });
  });

  it("習慣が見つからない場合、404エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue(null);

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "習慣が見つかりません。",
    });
  });

  it("他のユーザーの習慣を更新しようとした場合、403エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 2, // 異なるユーザーID
      update: jest.fn(),
    });

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "許可されていません。" });
  });

  it("必須フィールドが不足している場合、400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    delete req.body.name;

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "必須フィールドが不足しています。",
    });
  });

  it("target_frequency_idが数値でない場合、400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    req.body.target_frequency_id = "invalid";

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "必須フィールドが不足しています。",
    });
  });

  it("target_frequency_idが1未満の場合、400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    req.body.target_frequency_id = 0;

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "targetFrequencyIdは1以上の数値である必要があります。",
    });
  });

  it("存在しないtarget_frequency_idの場合、400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    db.FrequencyOption.findByPk.mockResolvedValue(null);
    req.body.target_frequency_id = 999; // 存在しないID

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "指定されたtargetFrequencyIdは存在しません。",
    });
  });

  it("不正なhabitTypeの場合、400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    db.FrequencyOption.findByPk.mockResolvedValue({ id: 1 });
    req.body.habit_type = "INVALID_TYPE";

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "habitTypeはBOOLEAN, NUMERIC_DURATION, NUMERIC_COUNTのいずれかである必要があります。",
    });
  });

  it("habitTypeがBOOLEANの場合、targetValueとtargetUnitが設定されていると400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    db.FrequencyOption.findByPk.mockResolvedValue({ id: 1 });
    req.body.habit_type = "BOOLEAN";
    req.body.target_value = 1;
    req.body.target_unit = "times";

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "BOOLEANタイプの習慣にはtargetValueとtargetUnitは設定できません。",
    });
  });

  it("habitTypeがNUMERIC_DURATIONまたはNUMERIC_COUNTの場合、targetValueまたはtargetUnitがNULLだと400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    db.FrequencyOption.findByPk.mockResolvedValue({ id: 1 });
    req.body.habit_type = "NUMERIC_DURATION";
    req.body.target_value = null;
    req.body.target_unit = "hours";

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "NUMERIC_DURATIONまたはNUMERIC_COUNTタイプの習慣にはtargetValueとtargetUnitが必要です。",
    });
  });

  it("habitTypeがNUMERIC_DURATIONまたはNUMERIC_COUNTの場合、targetValueが0未満だと400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    db.FrequencyOption.findByPk.mockResolvedValue({ id: 1 });
    req.body.habit_type = "NUMERIC_COUNT";
    req.body.target_value = -1;
    req.body.target_unit = "reps";

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "targetValueは0以上の数値である必要があります。",
    });
  });

  it("habitTypeがNUMERIC_DURATIONまたはNUMERIC_COUNTの場合、targetUnitが無効だと400エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.findByPk.mockResolvedValue({
      id: 1,
      user_id: 1,
      update: jest.fn(),
    });
    db.FrequencyOption.findByPk.mockResolvedValue({ id: 1 });
    req.body.habit_type = "NUMERIC_DURATION";
    req.body.target_value = 1;
    req.body.target_unit = "invalid_unit";

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "targetUnitはhours, minutes, reps, timesのいずれかである必要があります。",
    });
  });

  it("データベースエラーが発生した場合、500エラーを返すこと", async () => {
    const { updateHabit } = await import("../habitController");
    db.Habit.update.mockRejectedValue(new Error("Database error"));
    db.FrequencyOption.findByPk.mockResolvedValue({ id: 1 });

    await updateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "習慣の更新中にエラーが発生しました。",
    });
  });
});
