/**
 * @description 認証APIのエンドポイント（登録とログイン）の統合テストを定義するファイルです。
 */

import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js"; // server.js からExpressアプリをインポート
import db from "../models/index.js"; // データベースモデルをインポート
const { sequelize, User } = db;
chai.should(); // Chaiのshouldアサーションスタイルを有効化

chai.use(chaiHttp); // Chaiをchai-httpプラグインで使用

describe("Auth API", () => {
  /**
   * 全てのテストが実行される前に一度だけ実行されるフック。
   * - データベースモデルを同期し、Userテーブルを強制的に再作成してクリーンな状態を保証する。
   */
  before(async () => {
    await sequelize.sync({ force: true });
  });

  /**
   * 全てのテストが完了した後に一度だけ実行されるフック。
   * - Sequelizeデータベース接続を閉じる。
   */
  after(async () => {
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
    it("it should register a new user", (done) => {
      const user = {
        username: "testuser",
        password: "testpassword",
      };
      chai
        .request(app)
        .post("/api/v1/auth/register")
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("id");
          res.body.should.have.property("username").eql("testuser");
          res.body.should.have.property("token");
          done();
        });
    });

    it("it should NOT register a user with existing username", (done) => {
      const user = {
        username: "testuser",
        password: "testpassword",
      };
      chai
        .request(app)
        .post("/api/v1/auth/register")
        .send(user)
        .end((err, res) => {
          chai
            .request(app)
            .post("/api/v1/auth/register")
            .send(user)
            .end((err, res) => {
              res.should.have.status(409);
              res.body.should.be.a("object");
              res.body.should.have
                .property("message")
                .eql("Username already exists");
              done();
            });
        });
    });
  });

  /**
   * ユーザーログインAPIエンドポイントのテストスイート
   */
  describe("/POST api/v1/auth/login", () => {
    it("it should login the user", (done) => {
      const user = {
        username: "loginuser",
        password: "loginpassword",
      };
      chai
        .request(app)
        .post("/api/v1/auth/register")
        .send(user)
        .end((err, res) => {
          chai
            .request(app)
            .post("/api/v1/auth/login")
            .send(user)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("id");
              res.body.should.have.property("username").eql("loginuser");
              res.body.should.have.property("token");
              done();
            });
        });
    });

    it("it should NOT login with incorrect password", (done) => {
      const user = {
        username: "wrongpassuser",
        password: "correctpassword",
      };
      chai
        .request(app)
        .post("/api/v1/auth/register")
        .send(user)
        .end((err, res) => {
          const loginUser = {
            username: "wrongpassuser",
            password: "wrongpassword",
          };
          chai
            .request(app)
            .post("/api/v1/auth/login")
            .send(loginUser)
            .end((err, res) => {
              res.should.have.status(401);
              res.body.should.be.a("object");
              res.body.should.have
                .property("message")
                .eql("Invalid username or password");
              done();
            });
        });
    });

    it("it should NOT login with non-existent username", (done) => {
      const user = {
        username: "nonexistentuser",
        password: "somepassword",
      };
      chai
        .request(app)
        .post("/api/v1/auth/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Invalid username or password");
          done();
        });
    });
  });
});
