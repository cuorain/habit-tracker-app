import { AuthService } from "../services/AuthService";
import { AuthComponent } from "./AuthComponent";
import { DashboardComponent } from "./DashboardComponent";

export class App {
  constructor() {
    this.authService = new AuthService();
    this.authComponent = new AuthComponent(this.handleAuthSuccess.bind(this));
    this.messageDisplay = document.getElementById("message-display");
    this.rootElement = document.getElementById("app-content"); // Target the new content div
    if (!this.rootElement) {
      // Fallback if #app-content doesn't exist (shouldn't happen with updated index.html)
      this.rootElement = document.createElement("div");
      this.rootElement.id = "app-content";
      document.querySelector("main").appendChild(this.rootElement); // Append to main if missing
    }
    this.dashboardComponent = new DashboardComponent(this.rootElement); // インスタンス化

    this.mainElement = document.querySelector("main");
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", this.handleLogout.bind(this));
    }
  }

  updateHeader(isAuthed) {
    const usernameDisplay = document.getElementById("username-display");
    const logoutButton = document.getElementById("logout-button");

    if (isAuthed) {
      const username = this.authService.getUsername();
      if (usernameDisplay) {
        usernameDisplay.textContent = `${username}`;
        usernameDisplay.style.display = "inline";
      }
      if (logoutButton) {
        logoutButton.classList.remove("hidden");
      }
    } else {
      if (usernameDisplay) {
        usernameDisplay.textContent = "";
        usernameDisplay.style.display = "none";
      }
      if (logoutButton) {
        logoutButton.classList.add("hidden");
      }
    }
  }

  render() {
    // 切り替え: 認証画面のときは auth-mode を付与
    const isAuthed = this.authService.isAuthenticated();
    this.updateHeader(isAuthed); // ヘッダーの表示を更新

    if (this.mainElement) {
      this.mainElement.classList.toggle("auth-mode", !isAuthed);
    }

    this.rootElement.innerHTML = ""; // Clear previous content
    if (isAuthed) {
      // 認証済みの場合はダッシュボードを表示
      this.dashboardComponent.init();
    } else {
      // 未認証の場合は認証コンポーネントを表示
      this.rootElement.appendChild(this.authComponent.render());
    }
  }

  displayMessage(message, isError = false) {
    if (this.messageDisplay) {
      this.messageDisplay.textContent = message;
      this.messageDisplay.className = `message-display ${
        isError ? "error" : "success"
      }`;
      this.messageDisplay.classList.remove("hidden");
      // 5秒後にメッセージを非表示にする
      setTimeout(() => {
        this.messageDisplay.classList.add("hidden");
        this.messageDisplay.textContent = "";
      }, 5000);
    }
  }

  handleAuthSuccess() {
    // 認証成功時に呼ばれる
    this.render();
  }

  handleLogout() {
    // ログアウト処理
    this.authService.logout();
    this.displayMessage("ログアウトしました", false);
    this.render();
  }
}
