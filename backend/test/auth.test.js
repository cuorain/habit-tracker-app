import request from "supertest";
import initializeApp from "../server.js";

let app;

// initializeDb、sequelize、Userはjest.setup.cjsでグローバルモックされるため、ここではインポートしない
// ただし、テストケース内でUserモデルのモックメソッドを一時的に上書きするために、User変数を定義しておく
let User; // グローバルスコープのUser変数

describe("Auth API", () => {
  beforeAll(async () => {
    // グローバルモックされたinitializeAppを呼び出すことで、モックされたdbオブジェクトが返される
    app = await initializeApp();

    // JestのモックからUserモデルを取得
    // ここでUserモデルを明示的に取得することで、テストケース内でモックを操作できるようにする
    // initializeAppが返したapp.locals.Userを使用することも可能だが、テストの独立性を高めるため、モックされたSequelizeからUserを"再取得"する
    const { Sequelize, DataTypes } = await import("sequelize"); // SequelizeとDataTypesをモックから取得
    const mockSequelize = new Sequelize("dummy", "dummy", "dummy");
    User = mockSequelize.define("User", { username: DataTypes.STRING, passwordHash: DataTypes.STRING });

    // app.locals.User にモックされたUserを設定
    app.locals.User = User;

    // グローバルモックされたsyncが呼ばれることを期待
    await mockSequelize.sync({ force: true });
  });

  afterAll(async () => {
    // グローバルモックされたcloseが呼ばれることを期待
    // jest.restoreAllMocks(); はグローバルモックのため不要
    const { Sequelize } = await import("sequelize");
    const mockSequelize = new Sequelize("dummy", "dummy", "dummy");
    await mockSequelize.close();
  });

  afterEach(async () => {
    // グローバルモックされたdestroyが呼ばれることを期待
    // jest.clearAllMocks(); はグローバルモックのため不要
    if (User && User.destroy) {
      await User.destroy({ truncate: true });
    }
    // 各テストケースの後にモックをクリアし、独立性を保つ
    jest.clearAllMocks();
  });

  describe("/POST api/v1/auth/register", () => {
    it("TC-001: ユーザー登録成功 - it should register a new user", async () => {
      const user = {
        username: "testuser",
        password: "testpassword",
      };

      // ユーザーが存在しないことをモック（登録成功のため）
      User.findOne.mockResolvedValueOnce(null);

      // User.createのモックを一時的にオーバーライドして、テストケース固有の振る舞いを定義
      // toJSONメソッドを追加し、ExpressがJSONとしてシリアライズできるようにする
      User.create.mockImplementationOnce((data) =>
        Promise.resolve({
          id: 1,
          username: data.username, // usernameも直接設定
          passwordHash: "hashedpassword",
          toJSON: () => ({
            id: 1,
            username: data.username,
            passwordHash: undefined,
          }),
        })
      );

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(user);

      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("username", "testuser");
      expect(response.body).toHaveProperty("token");
      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        username: "testuser",
      }));
    });

    it("TC-002: ユーザー登録失敗（ユーザー名重複） - it should NOT register a user with existing username", async () => {
      const user = {
        username: "testuser",
        password: "testpassword",
      };

      // ユーザーが既に存在することをモック
      User.findOne.mockResolvedValueOnce({
        id: 1,
        username: "testuser",
        passwordHash: "hashedpassword",
        toJSON: () => ({ id: 1, username: "testuser" }),
      });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(user);

      expect(response.status).toBe(409);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty(
        "message",
        "ユーザー名は既に使用されています。"
      );
      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
      // ユーザーが既に存在するため、createは呼び出されないことを期待
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe("/POST api/v1/auth/login", () => {
    it("TC-003: ログイン成功 - it should login the user", async () => {
      const user = {
        username: "loginuser",
        password: "loginpassword",
      };

      // ユーザーが存在することをモックし、パスワード比較を成功させる
      User.findOne.mockResolvedValueOnce({
        id: 1,
        username: "loginuser",
        passwordHash: "hashedpassword",
        // comparePassword メソッドをモック
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: 1, username: "loginuser" }),
      });

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(user);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("username", "loginuser");
      expect(response.body).toHaveProperty("token");
      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: "loginuser" },
      });
      // createはログイン時には呼び出されない
      expect(User.create).not.toHaveBeenCalled();
    });

    it("TC-004: ログイン失敗（パスワード不一致） - it should NOT login with incorrect password", async () => {
      const user = {
        username: "wrongpassuser",
        password: "correctpassword", // これはデータベースに保存されているパスワードを指す
      };

      // bcrypt.compare を一時的にモックして、false を返すように設定
      const bcrypt = await import('bcryptjs'); // bcryptjsをインポート
      const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      // ユーザーが存在することをモック
      User.findOne.mockResolvedValueOnce({
        id: 1,
        username: "wrongpassuser",
        passwordHash: "hashedpassword", // ハッシュ化されたパスワード
        toJSON: () => ({ id: 1, username: "wrongpassuser" }),
      });

      const loginAttemptUser = {
        username: "wrongpassuser",
        password: "wrongpassword", // ログイン試行時の誤ったパスワード
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginAttemptUser);

      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty(
        "message",
        "無効なユーザー名またはパスワードです。"
      );
      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: "wrongpassuser" },
      });
      // bcrypt.compare が正しい引数で呼び出されたことを確認
      expect(compareSpy).toHaveBeenCalledWith(
        loginAttemptUser.password,
        "hashedpassword"
      );
      expect(User.create).not.toHaveBeenCalled();
    });
  });
});
