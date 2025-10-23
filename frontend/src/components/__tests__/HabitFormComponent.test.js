import { HabitFormComponent } from "../HabitFormComponent.js";

describe("HabitFormComponent", () => {
  let container;
  let onSaveMock;
  let onCancelMock;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    onSaveMock = jest.fn();
    onCancelMock = jest.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
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

  test("保存ボタンがクリックされたときに正しいデータでonSaveが呼び出されること (BOOLEAN)", () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    container.querySelector("#habitName").value = "Read Book";
    container.querySelector("#description").value = "Read 30 minutes daily";
    container.querySelector("#category").value = "Learning";
    container.querySelector("#habitType").value = "BOOLEAN";
    container.querySelector("#targetFrequency").value = "毎日";

    container.querySelector("#save-habit-btn").click();

    expect(onSaveMock).toHaveBeenCalledWith({
      name: "Read Book",
      description: "Read 30 minutes daily",
      category: "Learning",
      habitType: "BOOLEAN",
      targetFrequency: "毎日",
    });
  });

  test("保存ボタンがクリックされたときに正しいデータでonSaveが呼び出されること (NUMERIC_COUNT)", () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    container.querySelector("#habitName").value = "Pushups";
    container.querySelector("#description").value = "100 pushups";
    container.querySelector("#category").value = "Fitness";
    container.querySelector("#habitType").value = "NUMERIC_COUNT";
    container.querySelector("#targetValue").value = "100";
    container.querySelector("#targetUnit").value = "reps";
    container.querySelector("#targetFrequency").value = "毎日";

    container.querySelector("#save-habit-btn").click();

    expect(onSaveMock).toHaveBeenCalledWith({
      name: "Pushups",
      description: "100 pushups",
      category: "Fitness",
      habitType: "NUMERIC_COUNT",
      targetValue: 100,
      targetUnit: "reps",
      targetFrequency: "毎日",
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
