import { getHabits } from "../../services/HabitService";

// Mock HabitService
jest.mock("../../services/HabitService", () => ({
  getHabits: jest.fn(),
}));

describe("DashboardComponent", () => {
  beforeEach(() => {
    // Reset mocks before each test
    getHabits.mockClear();
  });

  test("習慣を取得して表示できること", async () => {
    // Mock habit data
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
    getHabits.mockResolvedValue(mockHabits);

    // Create a container element for the DashboardComponent
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Dynamically import and initialize the DashboardComponent
    // Assuming DashboardComponent has an init function that takes a container element
    const { initDashboard } = await import("../DashboardComponent.js");
    await initDashboard(container);

    // Assert that getHabits was called
    expect(getHabits).toHaveBeenCalledTimes(1);

    // Assert that habits are displayed in the DOM
    const habitElements = container.querySelectorAll(".habit-item");
    expect(habitElements.length).toBe(mockHabits.length);

    expect(habitElements[0].textContent).toContain("Exercise");
    expect(habitElements[1].textContent).toContain("Drink Water");

    // Clean up
    document.body.removeChild(container);
  });
});
