import { HabitService } from "../services/HabitService.js";
import { FrequencyOptionService } from "../services/FrequencyOptionService.js";

export class HabitFormComponent {
  constructor(habit = null, onSave, onCancel) {
    this.habit = habit;
    this.isEdit = !!habit;
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.form = this.createForm();
    this.message = null;
    this.messageType = null;
    this.frequencyOptionService = new FrequencyOptionService();
    this.frequencyOptions = [];
    this.loadFrequencyOptions();
  }

  createForm() {
    const form = document.createElement("form");
    form.id = "habit-form";
    form.className = "habit-form-card"; // Add a class for styling
    return form;
  }

  render() {
    this.form.innerHTML = ""; // Clear previous content

    const title = document.createElement("h2");
    title.className = "habit-form-title";
    title.textContent = this.isEdit ? "習慣を編集" : "新しい習慣を作成";
    this.form.appendChild(title);

    // Message display area
    const messageContainer = document.createElement("div");
    messageContainer.id = "form-message-container";
    if (this.message) {
      const messageElement = document.createElement("p");
      messageElement.className = `form-message ${this.messageType}-message`;
      messageElement.textContent = this.message;
      messageContainer.appendChild(messageElement);
    }
    this.form.appendChild(messageContainer);

    // Habit Name
    this.form.appendChild(
      this.createInputField(
        "habitName",
        "text",
        "習慣名",
        this.habit?.name || ""
      )
    );

    // Description
    this.form.appendChild(
      this.createTextAreaField(
        "description",
        "説明",
        this.habit?.description || ""
      )
    );

    // Category
    this.form.appendChild(
      this.createInputField(
        "category",
        "text",
        "カテゴリ",
        this.habit?.category || ""
      )
    );

    // Habit Type
    this.form.appendChild(
      this.createSelectField(
        "habitType",
        "習慣タイプ",
        [
          { value: "BOOLEAN", label: "はい/いいえ" },
          { value: "NUMERIC_COUNT", label: "数値 (回数)" },
          { value: "NUMERIC_DURATION", label: "数値 (時間)" },
        ],
        this.habit?.habitType || "BOOLEAN"
      )
    );

    // Target Value & Unit (conditionally displayed)
    const targetValueContainer = document.createElement("div");
    targetValueContainer.id = "target-value-container";
    targetValueContainer.style.display = [
      "NUMERIC_COUNT",
      "NUMERIC_DURATION",
    ].includes(this.habit?.habitType)
      ? "block"
      : "none";

    targetValueContainer.appendChild(
      this.createInputField(
        "targetValue",
        "number",
        "目標値",
        this.habit?.targetValue || ""
      )
    );
    targetValueContainer.appendChild(
      this.createSelectField(
        "targetUnit",
        "単位",
        [
          { value: "times", label: "回" },
          { value: "reps", label: "レップ" },
          { value: "minutes", label: "分" },
          { value: "hours", label: "時間" },
        ],
        this.habit?.targetUnit || "times"
      )
    );
    this.form.appendChild(targetValueContainer);

    // Target Frequency (Dropdown)
    this.form.appendChild(
      this.createSelectField(
        "targetFrequencyId",
        "目標頻度",
        this.frequencyOptions.map((option) => ({
          value: option.id,
          label: option.name,
        })),
        this.habit?.targetFrequencyId || ""
      )
    );

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "form-button-container";
    buttonContainer.appendChild(
      this.createButton("save-habit-btn", "保存", "btn-gradient")
    );
    buttonContainer.appendChild(
      this.createButton("cancel-habit-btn", "キャンセル", "btn-secondary")
    );
    this.form.appendChild(buttonContainer);

    this.updateElementsReferences();
    this.toggleTargetValueFields(); // Initial toggle based on habit type
    this.setupEventListeners(); // Moved here

    return this.form;
  }

  createInputField(id, type, labelText, value) {
    const div = document.createElement("div");
    div.className = "form-group";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.name = id;
    input.value = value;
    input.className = "form-input";
    div.appendChild(label);
    div.appendChild(input);
    return div;
  }

  createTextAreaField(id, labelText, value) {
    const div = document.createElement("div");
    div.className = "form-group";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.name = id;
    textarea.value = value;
    textarea.className = "form-textarea";
    div.appendChild(label);
    div.appendChild(textarea);
    return div;
  }

  createSelectField(id, labelText, options, selectedValue) {
    const div = document.createElement("div");
    div.className = "form-group";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const select = document.createElement("select");
    select.id = id;
    select.name = id;
    select.className = "form-select";

    options.forEach((optionData) => {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.label;
      if (optionData.value === selectedValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    div.appendChild(label);
    div.appendChild(select);
    return div;
  }

  createButton(id, text, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = id;
    button.textContent = text;
    button.className = `btn ${className}`;
    return button;
  }

  updateElementsReferences() {
    this.elements = {
      habitName: this.form.querySelector("#habitName"),
      description: this.form.querySelector("#description"),
      category: this.form.querySelector("#category"),
      habitType: this.form.querySelector("#habitType"),
      targetValue: this.form.querySelector("#targetValue"),
      targetUnit: this.form.querySelector("#targetUnit"),
      targetValueContainer: this.form.querySelector("#target-value-container"),
      targetFrequencyId: this.form.querySelector("#targetFrequencyId"),
      saveButton: this.form.querySelector("#save-habit-btn"),
      cancelButton: this.form.querySelector("#cancel-habit-btn"),
    };
  }

  setupEventListeners() {
    this.form.addEventListener("change", (event) => {
      if (event.target.id === "habitType") {
        this.toggleTargetValueFields();
      }
    });
    // handleSubmitがクリックイベントで実行される場合、form全体ではなく、saveButtonに直接イベントリスナーを設定する方が望ましい
    // また、submitイベントを使うことでEnterキーでの送信も扱える
    // this.form.addEventListener("click", this.handleSubmit.bind(this)); // この行は削除または変更

    // saveButtonに直接イベントリスナーを設定
    if (this.elements.saveButton) {
      this.elements.saveButton.addEventListener(
        "click",
        this.handleSubmit.bind(this)
      );
    }

    if (this.elements.cancelButton) {
      // オプショナルチェイニングを削除したのでnullチェックを追加
      this.elements.cancelButton.addEventListener(
        "click",
        this.handleCancel.bind(this)
      );
    }
  }

  toggleTargetValueFields() {
    const habitType = this.elements.habitType.value;
    if (["NUMERIC_COUNT", "NUMERIC_DURATION"].includes(habitType)) {
      this.elements.targetValueContainer.style.display = "block";
    } else {
      this.elements.targetValueContainer.style.display = "none";
    }
  }

  async handleSubmit(event) {
    if (event.target.id === "save-habit-btn") {
      event.preventDefault();
      this.clearMessages(); // Clear any existing messages
      if (this.validateForm()) {
        const formData = {
          name: this.elements.habitName.value,
          description: this.elements.description.value,
          category: this.elements.category.value,
          habitType: this.elements.habitType.value,
          targetFrequencyId: this.elements.targetFrequencyId.value,
        };

        if (
          ["NUMERIC_COUNT", "NUMERIC_DURATION"].includes(formData.habitType)
        ) {
          formData.targetValue = parseFloat(this.elements.targetValue.value);
          formData.targetUnit = this.elements.targetUnit.value;
        }

        try {
          const response = await this.onSave(formData);
          this.showMessage(
            response.message || "習慣が正常に保存されました。",
            "success"
          );
        } catch (error) {
          this.showMessage(
            error.message || "習慣の保存に失敗しました。",
            "error"
          );
        } finally {
          // Re-render to display the message
          this.render();
        }
      }
    }
  }

  showMessage(message, type) {
    this.message = message;
    this.messageType = type;
  }

  clearMessages() {
    this.message = null;
    this.messageType = null;
  }

  handleCancel() {
    this.onCancel();
  }

  validateForm() {
    // Basic validation
    if (!this.elements.habitName.value.trim()) {
      alert("習慣名は必須です。");
      return false;
    }
    if (
      ["NUMERIC_COUNT", "NUMERIC_DURATION"].includes(
        this.elements.habitType.value
      )
    ) {
      if (
        !this.elements.targetValue.value ||
        isNaN(parseFloat(this.elements.targetValue.value))
      ) {
        alert("目標値は数値で入力してください。");
        return false;
      }
    }
    return true;
  }

  resetForm() {
    this.form.reset();
    this.habit = null;
    this.isEdit = false;
    this.toggleTargetValueFields();
  }

  async loadFrequencyOptions() {
    try {
      this.frequencyOptions =
        await this.frequencyOptionService.fetchFrequencyOptions();
      this.render(); // Re-render the form to display the loaded options
    } catch (error) {
      console.error("Failed to load frequency options:", error);
      this.showMessage("頻度オプションの読み込みに失敗しました。", "error");
      this.render(); // Re-render to display error message
    }
  }
}
