import HabitService from "../HabitService";

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("HabitService", () => {
  let habitService;
  const mockToken = "fake-jwt-token";
  const mockHabits = [
    { id: "1", name: "Read", type: "BOOLEAN" },
    { id: "2", name: "Exercise", type: "NUMERIC_COUNT" },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", mockToken);
    process.env.VITE_API_URL = "http://localhost:8080"; // Ensure API URL is set for tests
    habitService = new HabitService();

    // Mock fetch API
    global.fetch = jest.fn((url, options) => {
      if (
        url === `${process.env.VITE_API_URL}/api/v1/habits` &&
        options.method === "GET"
      ) {
        if (options.headers.Authorization === `Bearer ${mockToken}`) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockHabits),
          });
        }
      }
      return Promise.reject(new Error("Unknown API call"));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("全ての習慣を取得できること", async () => {
    const habits = await habitService.getHabits();
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.VITE_API_URL}/api/v1/habits`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockToken}`,
        },
      }
    );
    expect(habits).toEqual(mockHabits);
  });

  it("習慣が0件の場合、空の配列を返すこと", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
    const habits = await habitService.getHabits();
    expect(habits).toEqual([]);
  });

  it("習慣の取得に失敗した場合、エラーをスローすること", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "習慣の取得に失敗しました。" }),
      })
    );

    await expect(habitService.getHabits()).rejects.toThrow(
      "習慣の取得に失敗しました。"
    );
  });

  it("トークンが存在しない場合、エラーをスローすること", async () => {
    localStorage.removeItem("token");
    await expect(habitService.getHabits()).rejects.toThrow(
      "認証トークンが見つかりません。"
    );
  });

  test("Debug: HabitServiceモジュールがgetHabitsを名前付きエクスポートしていること", async () => {
    const HabitServiceModule = await import("../HabitService");
    expect(HabitServiceModule.getHabits).toBeInstanceOf(Function);
  });
});
