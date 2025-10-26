import { DashboardComponent } from "../DashboardComponent.js";
import { HabitService } from "../../services/HabitService";
import { HabitFormComponent } from "../HabitFormComponent.js";

let mockFormElement; // Declare at a higher scope

jest.mock("../HabitFormComponent.js", () => ({
  HabitFormComponent: jest.fn().mockImplementation(() => ({
    render: jest.fn(() => mockFormElement),
    handleSubmit: jest.fn(),
    handleCancel: jest.fn(),
  })),
}));

// Mock HabitService class and its methods
jest.mock("../../services/HabitService", () => ({
  HabitService: jest.fn().mockImplementation(() => ({
    getHabits: jest.fn(),
    createHabit: jest.fn(),
    updateHabit: jest.fn(),
  })),
}));

describe("DashboardComponent", () => {
  let mockGetHabits;
  let mockCreateHabit;
  let mockUpdateHabit;
  let container; // Declare container here

  beforeEach(() => {
    // Reset mocks and re-implement getHabits for each test
    HabitService.mockClear();
    // HabitFormComponent.mockClear(); // Removed

    mockGetHabits = jest.fn();
    mockCreateHabit = jest.fn();
    mockUpdateHabit = jest.fn();

    HabitService.mockImplementation(() => ({
      getHabits: mockGetHabits,
      createHabit: mockCreateHabit,
      updateHabit: mockUpdateHabit,
    }));

    container = document.createElement("div");
    document.body.appendChild(container);

    // Initialize mockFormElement here
    mockFormElement = document.createElement("form");
    mockFormElement.innerHTML = "<p>Habit Form</p>";
  });

  afterEach(() => {
    if (container && container.parentNode === document.body) {
      document.body.removeChild(container);
    }
    jest.clearAllMocks();
  });

  test("正しく初期化されること", () => {
    const dashboard = new DashboardComponent(container);
    expect(dashboard.container).toBe(container);
    expect(dashboard.habits).toEqual([]);
    expect(dashboard.isFormVisible).toBe(false);
    expect(dashboard.currentEditedHabit).toBeNull();
  });

  test("init() が習慣をロードし、レンダリングを呼び出すこと", async () => {
    mockGetHabits.mockResolvedValue([]);
    const dashboard = new DashboardComponent(container);
    const renderSpy = jest.spyOn(dashboard, "render");
    const loadHabitsSpy = jest.spyOn(dashboard, "loadHabits");

    await dashboard.init();

    expect(loadHabitsSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledTimes(1);
    renderSpy.mockRestore();
    loadHabitsSpy.mockRestore();
  });

  test("習慣がない場合、メッセージと作成ボタンを表示すること", async () => {
    mockGetHabits.mockResolvedValue([]);
    const dashboard = new DashboardComponent(container);
    await dashboard.init();

    expect(container.querySelector(".no-habits-message")).not.toBeNull();
    expect(container.querySelector(".no-habits-message").textContent).toContain(
      "習慣がありません"
    );
    expect(container.querySelector(".create-habit-button")).not.toBeNull();
  });

  test("習慣がある場合、リストと作成ボタンを表示すること", async () => {
    const mockHabits = [
      { id: "1", name: "Exercise", type: "boolean", goal: null, unit: null },
    ];
    mockGetHabits.mockResolvedValue(mockHabits);
    const dashboard = new DashboardComponent(container);
    await dashboard.init();

    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelectorAll(".habit-item").length).toBe(1);
    expect(container.querySelector(".habit-item").textContent).toContain(
      "Exercise"
    );
    expect(container.querySelector(".create-habit-button")).not.toBeNull();
  });

  test("各習慣に編集ボタンが表示されること", async () => {
    const mockHabits = [
      { id: "1", name: "Test Habit 1" },
      { id: "2", name: "Test Habit 2" },
    ];
    mockGetHabits.mockResolvedValue(mockHabits);
    const dashboard = new DashboardComponent(container);
    await dashboard.init();

    const habitItems = container.querySelectorAll(".habit-item");
    expect(habitItems.length).toBe(2);

    habitItems.forEach(item => {
      const editButton = item.querySelector(".edit-habit-button");
      expect(editButton).not.toBeNull();
      expect(editButton.textContent).toBe("編集");
    });
  });

  test("「新しい習慣を作成」ボタンがクリックされたときにフォームが表示されること", async () => {
    mockGetHabits.mockResolvedValue([]);
    const dashboard = new DashboardComponent(container);
    await dashboard.init();

    const createButton = container.querySelector(".create-habit-button");
    createButton.click();

    expect(dashboard.isFormVisible).toBe(true);
    expect(container.querySelector("p").textContent).toBe("Habit Form");
    expect(HabitFormComponent).toHaveBeenCalledTimes(1);
    expect(HabitFormComponent).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Function)
    );
  });

  test("フォームがキャンセルされたときにダッシュボードが再表示されること", async () => {
    mockGetHabits.mockResolvedValue([]);
    const dashboard = new DashboardComponent(container);
    await dashboard.init();

    const createButton = container.querySelector(".create-habit-button");
    createButton.click(); // Open form

    expect(dashboard.isFormVisible).toBe(true);
    // Simulate calling the onCancel callback passed to HabitFormComponent
    const habitFormInstance = HabitFormComponent.mock.results[0].value;
    const onCancelCallback = HabitFormComponent.mock.calls[0][2];
    onCancelCallback();

    expect(dashboard.isFormVisible).toBe(false);
    expect(container.querySelector(".no-habits-message")).not.toBeNull(); // Dashboard content should be back
  });
});
