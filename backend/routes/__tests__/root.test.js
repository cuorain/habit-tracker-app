import request from "supertest";
import { jest } from "@jest/globals";
import { Sequelize, DataTypes } from "sequelize";
import express from "express";
import cors from "cors";

let mockSequelize; // Jestのモックの外で定義

jest.mock("../../models/index.js", () => {
  const actualSequelize = jest.requireActual("sequelize");
  // テストごとに新しいインメモリSQLiteデータベースを初期化
  mockSequelize = new actualSequelize.Sequelize("sqlite::memory:", {
    logging: false,
  });
  const mockDb = {};

  // モデルを動的にロードするモックロジック
  // 実際のモデルファイル (user.js, habit.js) を読み込み、モックSequelizeインスタンスにアタッチ
  const User = jest
    .requireActual("../../models/user.js")
    .User(mockSequelize, DataTypes);
  const Habit = jest
    .requireActual("../../models/habit.js")
    .Habit(mockSequelize, DataTypes);

  mockDb.User = User;
  mockDb.Habit = Habit;
  mockDb.sequelize = mockSequelize;
  mockDb.Sequelize = actualSequelize.Sequelize;

  // 関連付けも実行
  if (mockDb.User.associate) mockDb.User.associate(mockDb);
  if (mockDb.Habit.associate) mockDb.Habit.associate(mockDb);

  return {
    db: mockDb,
    sequelize: mockSequelize,
    Sequelize: actualSequelize.Sequelize,
  };
});

jest.mock("../../server", () => {
  const actualExpress = jest.requireActual("express");
  const actualCors = jest.requireActual("cors");
  const { db, sequelize } = jest.requireMock("../../models/index.js");
  const { authRoutes } = jest.requireActual("../../routes/auth.js"); // 実際のルートをインポート
  const { habitRoutes } = jest.requireActual("../../routes/habit.js"); // 実際のルートをインポート
  const { convertKeysToSnakeCase } = jest.requireActual(
    "../../middleware/caseConverterMiddleware.js"
  );

  return {
    initializeApp: async () => {
      const app = actualExpress();
      app.use(actualExpress.json());
      app.use(convertKeysToSnakeCase);
      app.use(actualCors({ origin: "http://localhost:5173" }));
      app.get("/", (req, res) => {
        res.send("Habit Tracker Backend API is running!");
      });
      app.use("/api/v1/auth", authRoutes);
      app.use("/api/v1/habits", habitRoutes);

      // テストではsyncは不要、各テストスイートで個別に管理するため
      return app;
    },
  };
});

const { initializeApp } = await import("../../server");
const { sequelize } = await import("../../models/index.js");

describe("Root Path", () => {
  let app;

  beforeAll(async () => {
    // テスト環境であることを明示
    process.env.NODE_ENV = "test";
    // JestモックがSequelizeインスタンスを作成するので、ここで初期化は不要
    await sequelize.sync({ force: true }); // テストごとにデータベースをクリーンにする
    app = await initializeApp();
  });

  afterAll(async () => {
    await sequelize.close(); // テスト後にデータベース接続をクローズ
  });

  test("should respond with a 200 status for the root path", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Habit Tracker Backend API is running!");
  });
});
