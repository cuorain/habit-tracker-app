class AuthService {
  constructor() {
    // Jest環境変数 (process.env) を使用
    this.apiUrl = process.env.VITE_API_URL || "http://localhost:8080";
  }

  async login(username, password) {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      return data;
    } else {
      throw new Error(data.message || "ログインに失敗しました。");
    }
  }

  async register(username, password) {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      return data;
    } else {
      throw new Error(data.message || "登録に失敗しました。");
    }
  }

  logout() {
    localStorage.removeItem("token");
  }

  getToken() {
    return localStorage.getItem("token");
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default AuthService;
