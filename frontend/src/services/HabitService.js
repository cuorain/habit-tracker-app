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
}
