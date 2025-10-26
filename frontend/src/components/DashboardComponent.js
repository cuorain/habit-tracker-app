import { HabitService } from "../services/HabitService";
import { HabitFormComponent } from "./HabitFormComponent.js";

export class DashboardComponent {
  constructor(container) {
    this.container = container;
    this.habitService = new HabitService();
    this.habits = [];
    this.isFormVisible = false;
    this.currentEditedHabit = null;
  }

  async init() {
    await this.loadHabits();
    this.render();
  }

  async loadHabits() {
    this.habits = await this.habitService.getHabits();
  }

  render() {
    this.container.innerHTML = ""; // Clear previous content

    if (this.isFormVisible) {
      this.renderHabitForm();
    } else {
      this.renderDashboardContent();
    }
  }

  renderDashboardContent() {
    if (this.habits.length === 0) {
      const message = document.createElement("p");
      message.className = "no-habits-message";
      message.textContent = "習慣がありません";
      this.container.appendChild(message);
    } else {
      const ul = document.createElement("ul");
      this.habits.forEach((habit) => {
        const li = document.createElement("li");
        li.className = "habit-item";

        const habitTextContainer = document.createElement("div");
        habitTextContainer.className = "habit-text-container";
        const habitNameSpan = document.createElement("span");
        habitNameSpan.textContent = habit.name;
        habitTextContainer.appendChild(habitNameSpan);
        li.appendChild(habitTextContainer);

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "habit-actions";

        // Add Edit Button
        const editButton = document.createElement("button");
        editButton.className = "edit-habit-button";
        editButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
        `;
        editButton.addEventListener("click", () =>
          this.handleEditHabitClick(habit)
        );
        actionsContainer.appendChild(editButton);

        li.appendChild(actionsContainer);
        ul.appendChild(li);
      });
      this.container.appendChild(ul);
    }

    const createButton = document.createElement("button");
    createButton.className = "create-habit-button";
    createButton.textContent = "新しい習慣を作成";
    createButton.addEventListener("click", this.handleAddHabitClick.bind(this));
    this.container.appendChild(createButton);
  }

  renderHabitForm() {
    const habitForm = new HabitFormComponent(
      this.currentEditedHabit,
      this.handleSaveHabit.bind(this),
      this.handleCancelForm.bind(this)
    );
    this.container.appendChild(habitForm.render());
  }

  handleAddHabitClick() {
    this.isFormVisible = true;
    this.currentEditedHabit = null; // Ensure we are creating a new habit
    this.render();
  }

  async handleSaveHabit(habitData) {
    console.log("Saving habit:", habitData);
    if (this.currentEditedHabit) {
      await this.habitService.updateHabit(
        this.currentEditedHabit.id,
        habitData
      );
    } else {
      await this.habitService.createHabit(habitData);
    }
    this.isFormVisible = false;
    this.currentEditedHabit = null;
    await this.loadHabits();
    this.render();
  }

  handleCancelForm() {
    this.isFormVisible = false;
    this.currentEditedHabit = null;
    this.render();
  }

  handleEditHabitClick(habit) {
    this.isFormVisible = true;
    this.currentEditedHabit = habit;
    this.render();
  }
}
