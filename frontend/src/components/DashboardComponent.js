import { getHabits } from "../services/HabitService";

export async function initDashboard(container) {
  const habits = await getHabits();

  const ul = document.createElement("ul");
  habits.forEach((habit) => {
    const li = document.createElement("li");
    li.className = "habit-item";
    li.textContent = habit.name;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}
