import { AuthService } from "../services/AuthService";

export class AuthComponent {
  constructor(onAuthSuccess) {
    this.authService = new AuthService();
    this.onAuthSuccess = onAuthSuccess;
    this.mode = "login"; // 'login' | 'register'
    this.container = document.createElement("div");
    this.container.className = "auth-container";
    this.errorElement = document.createElement("p");
    this.errorElement.className = "error-message";
    this.errorElement.style.display = "none";
  }

  render() {
    this.container.innerHTML = ""; // Clear previous content
    this.errorElement.style.display = "none";

    const title =
      this.mode === "login"
        ? "登録してコンテンツを楽しもう"
        : "アカウントを作成";
    const subtitle =
      this.mode === "login"
        ? "ユーザー名とパスワードを入力してください"
        : "必要事項を入力してください";
    const submitButtonText = this.mode === "login" ? "次へ" : "登録";
    const toggleLinkText =
      this.mode === "login"
        ? "アカウントをお持ちでない方はこちら"
        : "すでにアカウントをお持ちの方はこちら";

    this.container.innerHTML = `
      <div class="auth-card">
        <h1 class="auth-title">${title}</h1>
        <p class="auth-subtitle">${subtitle}</p>
        <form id="auth-form" class="auth-form">
          <div class="form-group">
            <label for="username">ユーザー名</label>
            <input type="text" id="username" placeholder="ユーザー名" required />
          </div>
          <div class="form-group">
            <label for="password">パスワード</label>
            <input type="password" id="password" placeholder="••••••••" required />
          </div>
          ${
            this.mode === "register"
              ? `<div class="form-group">
                   <label for="confirm-password">パスワード確認</label>
                   <input type="password" id="confirm-password" placeholder="••••••••" required />
                 </div>`
              : ""
          }
          <button type="submit" class="btn btn-pill btn-block btn-gradient">${submitButtonText}</button>
        </form>
        <div class="auth-toggle">
          <a href="#" id="toggle-auth-mode">${toggleLinkText}</a>
        </div>
      </div>
    `;

    this.container.prepend(this.errorElement);

    const authForm = this.container.querySelector("#auth-form");
    authForm.addEventListener("submit", this.handleSubmit.bind(this));

    const toggleAuthModeLink =
      this.container.querySelector("#toggle-auth-mode");
    toggleAuthModeLink.addEventListener("click", this.switchMode.bind(this));

    return this.container;
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.errorElement.style.display = "none";

    const username = this.container.querySelector("#username").value;
    const password = this.container.querySelector("#password").value;
    const confirmPassword =
      this.mode === "register"
        ? this.container.querySelector("#confirm-password").value
        : null;

    if (!this.validateForm(username, password, confirmPassword)) {
      return;
    }

    try {
      if (this.mode === "login") {
        await this.authService.login(username, password);
        this.onAuthSuccess();
      } else {
        await this.authService.register(username, password);
        this.onAuthSuccess();
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  validateForm(username, password, confirmPassword) {
    if (this.mode === "register" && password !== confirmPassword) {
      this.showError("パスワードが一致しません。");
      return false;
    }
    return true;
  }

  switchMode(event) {
    event.preventDefault();
    this.mode = this.mode === "login" ? "register" : "login";
    this.render();
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.style.display = "block";
  }
}
