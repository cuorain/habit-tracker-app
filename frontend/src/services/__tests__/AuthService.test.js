import { AuthService } from "../AuthService";

// fetch APIをモック化
global.fetch = jest.fn();

describe("AuthService", () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
    // 各テスト前にfetchモックをリセット
    fetch.mockClear();
    // localStorageをモック化
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
  });

  // loginメソッドのテスト
  describe("login", () => {
    it("ログインが成功し、トークンがlocalStorageに保存されること", async () => {
      const mockToken = "test-token";
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: mockToken }),
        })
      );

      const username = "testuser";
      const password = "password123";
      const result = await authService.login(username, password);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.VITE_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith("token", mockToken);
      expect(result).toEqual({ token: mockToken });
    });

    it("ログインが失敗した場合、エラーをスローすること", async () => {
      const errorMessage = "Invalid credentials";
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage }),
        })
      );

      const username = "testuser";
      const password = "wrongpassword";

      await expect(authService.login(username, password)).rejects.toThrow(
        errorMessage
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("エラーメッセージがない場合、デフォルトのエラーをスローすること", async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      );

      const username = "testuser";
      const password = "wrongpassword";

      await expect(authService.login(username, password)).rejects.toThrow(
        "ログインに失敗しました。"
      );
    });
  });

  // registerメソッドのテスト
  describe("register", () => {
    it("登録が成功し、トークンがlocalStorageに保存されること", async () => {
      const mockToken = "new-user-token";
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: mockToken }),
        })
      );

      const username = "newuser";
      const password = "newpassword123";
      const result = await authService.register(username, password);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.VITE_API_URL}/api/v1/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith("token", mockToken);
      expect(result).toEqual({ token: mockToken });
    });

    it("登録が失敗した場合、エラーをスローすること", async () => {
      const errorMessage = "Username already exists";
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage }),
        })
      );

      const username = "existinguser";
      const password = "password123";

      await expect(authService.register(username, password)).rejects.toThrow(
        errorMessage
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("エラーメッセージがない場合、デフォルトのエラーをスローすること", async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      );

      const username = "existinguser";
      const password = "password123";

      await expect(authService.register(username, password)).rejects.toThrow(
        "登録に失敗しました。"
      );
    });
  });

  // logoutメソッドのテスト
  describe("logout", () => {
    it("localStorageからトークンが削除されること", () => {
      authService.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    });
  });

  // getTokenメソッドのテスト
  describe("getToken", () => {
    it("localStorageからトークンを取得すること", () => {
      localStorage.getItem.mockReturnValue("mock-token");
      const token = authService.getToken();
      expect(localStorage.getItem).toHaveBeenCalledWith("token");
      expect(token).toBe("mock-token");
    });
  });

  // isAuthenticatedメソッドのテスト
  describe("isAuthenticated", () => {
    it("トークンが存在する場合、trueを返すこと", () => {
      localStorage.getItem.mockReturnValue("mock-token");
      expect(authService.isAuthenticated()).toBe(true);
    });

    it("トークンが存在しない場合、falseを返すこと", () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
