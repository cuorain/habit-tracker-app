import AuthService from "../services/AuthService";

class AuthComponent {
  constructor(onAuthSuccess) {
    this.authService = new AuthService();
    this.onAuthSuccess = onAuthSuccess;
    this.mode = "login"; // 'login' | 'register'
    this.container = document.createElement("div");
    this.container.className = "auth-container";
    this.errorElement = document.createElement("p");
    this.errorElement.className = "error-message";
    this.errorElement.style.color = "red";
    this.errorElement.style.display = "none";
  }

  render() {
    this.container.innerHTML = ""; // Clear previous content
    this.errorElement.style.display = "none";

    const formTitle = this.mode === "login" ? "Login" : "Register";
    const submitButtonText = this.mode === "login" ? "Login" : "Register";
    const toggleLinkText =
      this.mode === "login"
        ? "Need an account? Register"
        : "Already have an account? Login";

    this.container.innerHTML = `
      <h2>${formTitle}</h2>
      <form id="auth-form">
        <input type="text" id="username" placeholder="Username" required />
        <input type="password" id="password" placeholder="Password" required />
        ${
          this.mode === "register"
            ? '<input type="password" id="confirm-password" placeholder="Confirm Password" required />'
            : ""
        }
        <button type="submit">${submitButtonText}</button>
      </form>
      <p><a href="#" id="toggle-auth-mode">${toggleLinkText}</a></p>
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
      this.showError("Passwords do not match.");
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

export default AuthComponent;


