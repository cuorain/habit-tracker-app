import request from "supertest";
import { initializeApp } from "../../server.js";

describe("Root Path", () => {
  let app;

  beforeAll(async () => {
    app = await initializeApp();
  });

  it("should respond with a 200 status for the root path", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});
