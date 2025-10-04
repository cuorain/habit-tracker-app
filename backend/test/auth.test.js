/**
 * @description 認証APIのエンドポイント（登録とログイン）の統合テストを定義するファイルです。
 */

import request from "supertest";
import app from "../../backend/server.js";
import db from "../../backend/models/index.js";

const { sequelize, User } = db;

describe("Auth API", () => {
  /**
   * 全てのテストが実行される前に一度だけ実行されるフック。
   * - データベースモデルを同期し、Userテーブルを強制的に再作成してクリーンな状態を保証する。
   */
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  /**
   * 全てのテストが完了した後に一度だけ実行されるフック。
   * - Sequelizeデータベース接続を閉じる。
   */
  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * 各テストケースが実行された後に実行されるフック。
   * - Userテーブルの全データを削除して、各テストが独立して実行されるようにクリーンな状態を保つ。
   */
  afterEach(async () => {
    await User.destroy({ truncate: true });
  });

  /**
   * ユーザー登録APIエンドポイントのテストスイート
   */
  describe("/POST api/v1/auth/register", () => {
    it("it should register a new user", async () => {
      const user = {
        username: "testuser",
        password: "testpassword",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(user);

      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username", "testuser");
      expect(response.body).toHaveProperty("token");
    });

    it("it should NOT register a user with existing username", async () => {
      const user = {
        username: "testuser",
        password: "testpassword",
      };

      // 最初のユーザー登録
      await request(app).post("/api/v1/auth/register").send(user);

      // 同じユーザー名で再度登録を試みる
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(user);

      expect(response.status).toBe(409);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty(
        "message",
        "Username already exists"
      );
    });
  });

  /**
   * ユーザーログインAPIエンドポイントのテストスイート
   */
  describe("/POST api/v1/auth/login", () => {
    it("it should login the user", async () => {
      const user = {
        username: "loginuser",
        password: "loginpassword",
      };

      // ユーザー登録
      await request(app).post("/api/v1/auth/register").send(user);

      // ログイン
      const response = await request(app).post("/api/v1/auth/login").send(user);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username", "loginuser");
      expect(response.body).toHaveProperty("token");
    });

    it("it should NOT login with incorrect password", async () => {
      const user = {
        username: "wrongpassuser",
        password: "correctpassword",
      };

      // ユーザー登録
      await request(app).post("/api/v1/auth/register").send(user);

      const loginUser = {
        username: "wrongpassuser",
        password: "wrongpassword",
      };

      // 間違ったパスワードでログイン
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginUser);

      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid username or password"
      );
    });

    it("it should NOT login with non-existent username", async () => {
      const user = {
        username: "nonexistentuser",
        password: "somepassword",
      };

      // 存在しないユーザーでログイン
      const response = await request(app).post("/api/v1/auth/login").send(user);

      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid username or password"
      );
    });
  });
});
