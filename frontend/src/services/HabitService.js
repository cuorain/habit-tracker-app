export class HabitService {
  constructor() {
    this.apiUrl = process.env.VITE_API_URL || "http://localhost:8080";
  }

  async getHabits() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証トークンが見つかりません。");
    }

    const response = await fetch(`${this.apiUrl}/api/v1/habits`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "習慣の取得に失敗しました。");
    }
  }

  async createHabit(habitData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証トークンが見つかりません。");
    }

    const response = await fetch(`${this.apiUrl}/api/v1/habits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(habitData),
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "習慣の作成に失敗しました。");
    }
  }

  async updateHabit(habitId, habitData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証トークンが見つかりません。");
    }

    const response = await fetch(`${this.apiUrl}/api/v1/habits/${habitId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(habitData),
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "習慣の更新に失敗しました。");
    }
  }

  async deleteHabit(habitId) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証トークンが見つかりません。");
    }

    const response = await fetch(`${this.apiUrl}/api/v1/habits/${habitId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return;
    } else {
      const data = await response.json();
      throw new Error(data.message || "習慣の削除に失敗しました。");
    }
  }
}
