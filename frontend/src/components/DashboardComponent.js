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
        li.textContent = habit.name;
        
        // Add Edit Button inside the loop
        const editButton = document.createElement("button");
        editButton.className = "edit-habit-button";
        editButton.textContent = "編集";
        li.appendChild(editButton);

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
}
