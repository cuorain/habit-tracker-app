import { HabitService } from "../services/HabitService";

export async function initDashboard(container) {
  const habitServiceInstance = new HabitService(); // インスタンスを作成
  const habits = await habitServiceInstance.getHabits();

  if (habits.length === 0) {
    const message = document.createElement("p");
    message.className = "no-habits-message";
    message.textContent = "習慣がありません";
    container.appendChild(message);
    return;
  }

  const ul = document.createElement("ul");
  habits.forEach((habit) => {
    const li = document.createElement("li");
    li.className = "habit-item";
    li.textContent = habit.name;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}
