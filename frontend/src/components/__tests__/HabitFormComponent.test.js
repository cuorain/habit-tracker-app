import { HabitFormComponent } from "../HabitFormComponent.js";
import { FrequencyOptionService } from "../../services/FrequencyOptionService.js";

jest.mock("../../services/FrequencyOptionService.js");

describe("HabitFormComponent", () => {
  let container;
  let onSaveMock;
  let onCancelMock;

  beforeEach(() => {
    // Reset the mock before each test
    FrequencyOptionService.mockClear();
    FrequencyOptionService.mockImplementation(() => {
      return {
        fetchFrequencyOptions: jest.fn().mockResolvedValue([
          { id: "1", name: "Daily" },
          { id: "2", name: "Weekly" },
        ]),
      };
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    onSaveMock = jest.fn();
    onCancelMock = jest.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test("edit modeでタイトルが正しくレンダリングされること", async () => {
    const mockHabit = {
      id: "1",
      name: "既存の習慣",
      description: "既存の説明",
      category: "既存のカテゴリ",
      habitType: "BOOLEAN",
      targetFrequencyId: "1",
    };
    const component = new HabitFormComponent(
      mockHabit,
      onSaveMock,
      onCancelMock
    );
    container.appendChild(component.render());
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

    expect(container.querySelector("h2").textContent).toBe("習慣を編集");
  });

  test("edit modeで既存の習慣データが入力フィールドに設定されること", async () => {
    const mockHabit = {
      id: "1",
      name: "既存の習慣",
      description: "既存の説明",
      category: "既存のカテゴリ",
      habitType: "NUMERIC_COUNT",
      targetValue: 10,
      targetUnit: "reps",
      targetFrequencyId: "2",
    };
    const component = new HabitFormComponent(
      mockHabit,
      onSaveMock,
      onCancelMock
    );
    container.appendChild(component.render());
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

    expect(container.querySelector("#habitName").value).toBe(mockHabit.name);
    expect(container.querySelector("#description").value).toBe(
      mockHabit.description
    );
    expect(container.querySelector("#category").value).toBe(mockHabit.category);
    expect(container.querySelector("#habitType").value).toBe(
      mockHabit.habitType
    );
    expect(container.querySelector("#targetValue").value).toBe(
      String(mockHabit.targetValue)
    );
    expect(container.querySelector("#targetUnit").value).toBe(
      mockHabit.targetUnit
    );
    expect(container.querySelector("#targetFrequencyId").value).toBe(
      mockHabit.targetFrequencyId
    );
  });

  test("edit modeで保存ボタンのテキストが「更新」になっていること", async () => {
    const mockHabit = {
      id: "1",
      name: "既存の習慣",
      description: "既存の説明",
      category: "既存のカテゴリ",
      habitType: "BOOLEAN",
      targetFrequencyId: "1",
    };
    const component = new HabitFormComponent(
      mockHabit,
      onSaveMock,
      onCancelMock
    );
    container.appendChild(component.render());
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

    expect(container.querySelector("#save-habit-btn").textContent).toBe("更新"); // 現状は「保存」のまま
  });

  test("create modeで正しくレンダリングされること", () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    expect(container.querySelector("h2").textContent).toBe("新しい習慣を作成");
    expect(container.querySelector("#habitName")).not.toBeNull();
    expect(container.querySelector("#description")).not.toBeNull();
    expect(container.querySelector("#category")).not.toBeNull();
    expect(container.querySelector("#habitType")).not.toBeNull();
    expect(
      container.querySelector("#target-value-container")
    ).not.toBeVisible();
    expect(container.querySelector("#save-habit-btn")).not.toBeNull();
    expect(container.querySelector("#cancel-habit-btn")).not.toBeNull();
  });

  test("頻度オプションがロードされ、表示されること", async () => {
    const mockFrequencyOptions = [
      { id: "1", name: "Daily" },
      { id: "2", name: "Weekly" },
    ];
    // No need to spyOn here, as the service is already mocked
    // jest.spyOn(FrequencyOptionService, "fetchFrequencyOptions").mockResolvedValue(mockFrequencyOptions);

    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

    const selectElement = container.querySelector("#targetFrequencyId");
    expect(selectElement).not.toBeNull();
    expect(selectElement.children.length).toBe(mockFrequencyOptions.length);
    expect(selectElement.children[0].textContent).toBe("Daily");
    expect(selectElement.children[0].value).toBe("1");
    expect(selectElement.children[1].textContent).toBe("Weekly");
    expect(selectElement.children[1].value).toBe("2");

    // Verify that fetchFrequencyOptions was called
    expect(FrequencyOptionService).toHaveBeenCalledTimes(1);
    expect(
      FrequencyOptionService.mock.results[0].value.fetchFrequencyOptions
    ).toHaveBeenCalledTimes(1);
  });

  test("保存ボタンがクリックされたときに正しいデータでonSaveが呼び出されること (BOOLEAN)", async () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

    container.querySelector("#habitName").value = "Read Book";
    container.querySelector("#description").value = "Read 30 minutes daily";
    container.querySelector("#category").value = "Learning";
    container.querySelector("#habitType").value = "BOOLEAN";
    container.querySelector("#targetFrequencyId").value = "1";
    container
      .querySelector("#targetFrequencyId")
      .dispatchEvent(new Event("change")); // Manually dispatch change event

    container.querySelector("#save-habit-btn").click();

    expect(onSaveMock).toHaveBeenCalledWith({
      name: "Read Book",
      description: "Read 30 minutes daily",
      category: "Learning",
      habitType: "BOOLEAN",
      targetFrequencyId: "1",
    });
  });

  test("保存ボタンがクリックされたときに正しいデータでonSaveが呼び出されること (NUMERIC_COUNT)", async () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

    container.querySelector("#habitName").value = "Pushups";
    container.querySelector("#description").value = "100 pushups";
    container.querySelector("#category").value = "Fitness";
    container.querySelector("#habitType").value = "NUMERIC_COUNT";
    container.querySelector("#targetValue").value = "100";
    container.querySelector("#targetUnit").value = "reps";
    container.querySelector("#targetFrequencyId").value = "1";
    container
      .querySelector("#targetFrequencyId")
      .dispatchEvent(new Event("change")); // Manually dispatch change event

    container.querySelector("#save-habit-btn").click();

    expect(onSaveMock).toHaveBeenCalledWith({
      name: "Pushups",
      description: "100 pushups",
      category: "Fitness",
      habitType: "NUMERIC_COUNT",
      targetValue: 100,
      targetUnit: "reps",
      targetFrequencyId: "1",
    });
  });

  test("キャンセルボタンがクリックされたときにonCancelが呼び出されること", () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    container.querySelector("#cancel-habit-btn").click();

    expect(onCancelMock).toHaveBeenCalled();
  });

  test("習慣名が空の場合にアラートが表示されること", () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    container.querySelector("#habitName").value = ""; // Empty name
    container.querySelector("#save-habit-btn").click();

    expect(alertMock).toHaveBeenCalledWith("習慣名は必須です。");
    expect(onSaveMock).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  test("数値習慣の目標値が無効な場合にアラートが表示されること", () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    container.querySelector("#habitName").value = "Run";
    container.querySelector("#habitType").value = "NUMERIC_DURATION";
    container.querySelector("#habitType").dispatchEvent(new Event("change")); // Trigger display of target value fields
    container.querySelector("#targetValue").value = "abc"; // Invalid numeric value

    container.querySelector("#save-habit-btn").click();

    expect(alertMock).toHaveBeenCalledWith("目標値は数値で入力してください。");
    expect(onSaveMock).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  test("習慣が正常に作成された際に成功メッセージが表示されること", async () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    const successMessage = "習慣が正常に作成されました。";
    onSaveMock.mockResolvedValue({ message: successMessage });

    container.querySelector("#habitName").value = "新しい習慣";
    container.querySelector("#save-habit-btn").click();

    // Wait for the async operation to complete and message to be displayed
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(container.querySelector(".success-message")).not.toBeNull();
    expect(container.querySelector(".success-message").textContent).toBe(
      successMessage
    );
  });

  test("習慣作成に失敗した際にエラーメッセージが表示されること", async () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    const errorMessage = "習慣の作成に失敗しました。";
    onSaveMock.mockRejectedValue(new Error(errorMessage));

    container.querySelector("#habitName").value = "失敗する習慣";
    container.querySelector("#save-habit-btn").click();

    // Wait for the async operation to complete and message to be displayed
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(container.querySelector(".error-message")).not.toBeNull();
    expect(container.querySelector(".error-message").textContent).toBe(
      errorMessage
    );
  });
});
