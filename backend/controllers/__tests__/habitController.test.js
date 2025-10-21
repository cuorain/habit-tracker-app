import { createHabit } from "../habitController";
import { db } from "../../models/index.js";
import { jest } from "@jest/globals";

jest.mock("../../models/index.js", () => ({
  db: {
    Habit: {
      create: jest.fn(),
    },
  },
}));

describe("createHabit", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: {
        name: "Test Habit",
        description: "Test Description",
        category: "Health",
        habit_type: "Good",
        target_value: 1,
        target_unit: "times",
        target_frequency: "daily",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("認証済みユーザーが習慣を作成できること", async () => {
    const newHabit = { id: 1, ...req.body, user_id: req.user.id };
    db.Habit.create = jest.fn().mockResolvedValue(newHabit);

    await createHabit(req, res);

    expect(db.Habit.create).toHaveBeenCalledWith({
      name: "Test Habit",
      description: "Test Description",
      category: "Health",
      habit_type: "Good",
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
    db.Habit.create = jest.fn().mockRejectedValue(new Error("Database error"));

    await createHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "習慣の作成中にエラーが発生しました。",
    });
  });
});
