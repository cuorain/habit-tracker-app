import AuthService from "../services/AuthService";
import AuthComponent from "./AuthComponent";
// import DashboardComponent from './DashboardComponent'; // 後で作成

class App {
  constructor() {
    this.authService = new AuthService();
    this.authComponent = new AuthComponent(this.handleAuthSuccess.bind(this));
    this.dashboardComponent = null; // 後でインスタンス化
    this.rootElement = document.getElementById("app-content"); // Target the new content div
    if (!this.rootElement) {
      // Fallback if #app-content doesn't exist (shouldn't happen with updated index.html)
      this.rootElement = document.createElement("div");
      this.rootElement.id = "app-content";
      document.querySelector('main').appendChild(this.rootElement); // Append to main if missing
    }

    this.mainElement = document.querySelector('main');
  }

  init() {
    this.render();
  }

  render() {
    // 切り替え: 認証画面のときは auth-mode を付与
    const isAuthed = this.authService.isAuthenticated();
    if (this.mainElement) {
      this.mainElement.classList.toggle('auth-mode', !isAuthed);
    }

    this.rootElement.innerHTML = ""; // Clear previous content
    if (isAuthed) {
      // 認証済みの場合はダッシュボードを表示
      if (!this.dashboardComponent) {
        // this.dashboardComponent = new DashboardComponent(this.handleLogout.bind(this)); // 後でインスタンス化
      }
      // this.rootElement.appendChild(this.dashboardComponent.render());
      this.rootElement.textContent = "Welcome to Dashboard (placeholder)"; // 仮の表示
    } else {
      // 未認証の場合は認証コンポーネントを表示
      this.rootElement.appendChild(this.authComponent.render());
    }
  }

  handleAuthSuccess() {
    // 認証成功時に呼ばれる
    this.render();
  }

  handleLogout() {
    // ログアウト処理
    this.authService.logout();
    this.render();
  }
}

export { App };
