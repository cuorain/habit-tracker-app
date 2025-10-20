import { logout } from "../authController.js";
import { jest } from "@jest/globals";

describe("Logout Function", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(), // .status().json() のチェーンをモック
      json: jest.fn(),
    };
  });

  it("should clear the JWT cookie and return a success message", () => {
    logout(mockReq, mockRes);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      "token",
      "",
      expect.objectContaining({
        httpOnly: true,
        expires: expect.any(Date),
        path: "/",
      })
    );
    // 期限が過去であることの追加検証
    const cookieOptions = mockRes.cookie.mock.calls[0][2];
    expect(cookieOptions.expires.getTime()).toBeLessThan(new Date().getTime());

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });
});
