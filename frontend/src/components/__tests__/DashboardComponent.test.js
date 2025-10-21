import { HabitService } from "../../services/HabitService";

// Mock HabitService class and its methods
jest.mock("../../services/HabitService", () => ({
  HabitService: jest.fn().mockImplementation(() => ({
    getHabits: jest.fn(),
  })),
}));

describe("DashboardComponent", () => {
  let mockGetHabits;

  beforeEach(() => {
    // Reset mocks and re-implement getHabits for each test
    HabitService.mockClear();
    mockGetHabits = jest.fn();
    HabitService.mockImplementation(() => ({
      getHabits: mockGetHabits,
    }));
  });

  test("習慣を取得して表示できること", async () => {
    const mockHabits = [
      { id: "1", name: "Exercise", type: "boolean", goal: null, unit: null },
      {
        id: "2",
        name: "Drink Water",
        type: "numeric",
        goal: 8,
        unit: "glasses",
      },
    ];
    mockGetHabits.mockResolvedValue(mockHabits);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const { initDashboard } = await import("../DashboardComponent.js");
    await initDashboard(container);

    expect(mockGetHabits).toHaveBeenCalledTimes(1);

    const habitElements = container.querySelectorAll(".habit-item");
    expect(habitElements.length).toBe(mockHabits.length);

    expect(habitElements[0].textContent).toContain("Exercise");
    expect(habitElements[1].textContent).toContain("Drink Water");

    document.body.removeChild(container);
  });

  test("習慣が0件の場合、メッセージを表示すること", async () => {
    mockGetHabits.mockResolvedValue([]); // No habits

    const container = document.createElement("div");
    document.body.appendChild(container);

    const { initDashboard } = await import("../DashboardComponent.js");
    await initDashboard(container);

    expect(mockGetHabits).toHaveBeenCalledTimes(1);

    const messageElement = container.querySelector(".no-habits-message");
    expect(messageElement).not.toBeNull();
    expect(messageElement.textContent).toContain("習慣がありません");

    document.body.removeChild(container);
  });

  test("習慣がない場合、習慣を作成するボタンがあること", async () => {
    mockGetHabits.mockResolvedValue([]); // No habits, to ensure button is visible

    const container = document.createElement("div");
    document.body.appendChild(container);

    const { initDashboard } = await import("../DashboardComponent.js");
    await initDashboard(container);

    const createButton = container.querySelector(".create-habit-button");
    expect(createButton).not.toBeNull();
    expect(createButton.textContent).toContain("新しい習慣を作成");

    document.body.removeChild(container);
  });

  test("習慣がある場合、習慣を作成するボタンがあること", async () => {
    const mockHabits = [
      { id: "1", name: "Exercise", type: "boolean", goal: null, unit: null },
    ];
    mockGetHabits.mockResolvedValue(mockHabits);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const { initDashboard } = await import("../DashboardComponent.js");
    await initDashboard(container);

    const createButton = container.querySelector(".create-habit-button");
    expect(createButton).not.toBeNull();
    expect(createButton.textContent).toContain("新しい習慣を作成");

    document.body.removeChild(container);
  });
});
