import { HabitService } from "../HabitService";

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

      if (
        url === `${process.env.VITE_API_URL}/api/v1/habits` &&
        options.method === "POST"
      ) {
        if (
          options.headers.Authorization === `Bearer ${mockToken}` &&
          JSON.parse(options.body).name === "New Habit"
        ) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ id: "3", name: "New Habit", type: "BOOLEAN" }),
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
    const HabitServiceClass = HabitServiceModule.HabitService;
    const habitServiceInstance = new HabitServiceClass();
    expect(habitServiceInstance.getHabits).toBeInstanceOf(Function);
  });

  it("習慣を正常に作成できること", async () => {
    const newHabit = { name: "New Habit", type: "BOOLEAN" };
    const createdHabit = await habitService.createHabit(newHabit);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.VITE_API_URL}/api/v1/habits`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(newHabit),
      }
    );
    expect(createdHabit).toEqual({
      id: "3",
      name: "New Habit",
      type: "BOOLEAN",
    });
  });

  it("習慣の作成に失敗した場合、エラーをスローすること", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "習慣の作成に失敗しました。" }),
      })
    );

    const newHabit = { name: "Failing Habit", type: "BOOLEAN" };
    await expect(habitService.createHabit(newHabit)).rejects.toThrow(
      "習慣の作成に失敗しました。"
    );
  });

  it("createHabitでトークンが存在しない場合、エラーをスローすること", async () => {
    localStorage.removeItem("token");
    const newHabit = { name: "Habit without token", type: "BOOLEAN" };
    await expect(habitService.createHabit(newHabit)).rejects.toThrow(
      "認証トークンが見つかりません。"
    );
  });

  it("習慣を正常に更新できること", async () => {
    const updatedHabit = { id: "1", name: "Updated Read", type: "BOOLEAN" };
    global.fetch.mockImplementationOnce((url, options) => {
      if (
        url === `${process.env.VITE_API_URL}/api/v1/habits/1` &&
        options.method === "PUT"
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedHabit),
        });
      }
      return Promise.reject(new Error("Unknown API call"));
    });

    const result = await habitService.updateHabit("1", updatedHabit);

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.VITE_API_URL}/api/v1/habits/1`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(updatedHabit),
      }
    );
    expect(result).toEqual(updatedHabit);
  });

  it("習慣の更新に失敗した場合、エラーをスローすること", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "習慣の更新に失敗しました。" }),
      })
    );

    const updatedHabit = { id: "1", name: "Failing Update", type: "BOOLEAN" };
    await expect(habitService.updateHabit("1", updatedHabit)).rejects.toThrow(
      "習慣の更新に失敗しました。"
    );
  });

  it("updateHabitでトークンが存在しない場合、エラーをスローすること", async () => {
    localStorage.removeItem("token");
    const updatedHabit = { id: "1", name: "Update without token", type: "BOOLEAN" };
    await expect(habitService.updateHabit("1", updatedHabit)).rejects.toThrow(
      "認証トークンが見つかりません。"
    );
  });
});
