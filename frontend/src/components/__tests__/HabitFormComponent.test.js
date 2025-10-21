import HabitFormComponent from "../HabitFormComponent.js";

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

  test("renders correctly in create mode", () => {
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

  test("toggles target value fields based on habit type selection", async () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    const habitTypeSelect = container.querySelector("#habitType");
    const targetValueContainer = container.querySelector(
      "#target-value-container"
    );

    expect(targetValueContainer).not.toBeVisible();

    // Change to NUMERIC_COUNT
    habitTypeSelect.value = "NUMERIC_COUNT";
    habitTypeSelect.dispatchEvent(new Event("change"));
    expect(targetValueContainer).toBeVisible();

    // Change back to BOOLEAN
    habitTypeSelect.value = "BOOLEAN";
    habitTypeSelect.dispatchEvent(new Event("change"));
    expect(targetValueContainer).not.toBeVisible();
  });

  test("calls onSave with correct data when save button is clicked for new habit (BOOLEAN)", () => {
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

  test("calls onSave with correct data when save button is clicked for new habit (NUMERIC_COUNT)", () => {
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

  test("calls onCancel when cancel button is clicked", () => {
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    container.querySelector("#cancel-habit-btn").click();

    expect(onCancelMock).toHaveBeenCalled();
  });

  test("shows alert for empty habit name", () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const component = new HabitFormComponent(null, onSaveMock, onCancelMock);
    container.appendChild(component.render());

    container.querySelector("#habitName").value = ""; // Empty name
    container.querySelector("#save-habit-btn").click();

    expect(alertMock).toHaveBeenCalledWith("習慣名は必須です。");
    expect(onSaveMock).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  test("shows alert for invalid target value for numeric habit", () => {
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
});
