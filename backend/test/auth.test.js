import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js"; // Assuming server.js exports the app
import db from "../models/index.js";
const { sequelize, User } = db;
chai.should();

chai.use(chaiHttp);

describe("Auth API", () => {
  before(async () => {
    // Sync models and clear the User table before tests
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    // Clear users after each test to ensure a clean state
    await User.destroy({ truncate: true });
  });

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
              res.text.should.be.eql("Username already exists");
              done();
            });
        });
    });
  });

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
              res.text.should.be.eql("Invalid username or password");
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
          res.text.should.be.eql("Invalid username or password");
          done();
        });
    });
  });
});
