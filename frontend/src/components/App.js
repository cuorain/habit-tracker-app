import AuthService from "../services/AuthService";
import AuthComponent from "./AuthComponent";
// import DashboardComponent from './DashboardComponent'; // 後で作成

class App {
  constructor() {
    this.authService = new AuthService();
    this.authComponent = new AuthComponent(this.handleAuthSuccess.bind(this));
    this.dashboardComponent = null; // 後でインスタンス化
    this.rootElement = document.getElementById("app");
    if (!this.rootElement) {
      this.rootElement = document.createElement("div");
      this.rootElement.id = "app";
      document.body.appendChild(this.rootElement);
    }
  }

  init() {
    this.render();
  }

  render() {
    this.rootElement.innerHTML = ""; // Clear previous content
    if (this.authService.isAuthenticated()) {
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


