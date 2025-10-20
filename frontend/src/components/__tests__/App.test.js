import { App } from "../App";
import { AuthService } from "../../services/AuthService";
import { AuthComponent } from "../AuthComponent";
import * as DashboardComponent from "../DashboardComponent"; // DashboardComponentモジュール全体をインポート
import { HabitService } from "../../services/HabitService"; // HabitServiceをインポート

// AuthServiceとAuthComponentをモック化
jest.mock("../../services/AuthService");
jest.mock("../AuthComponent");

// DashboardComponentのinitDashboard関数をモック化
jest.mock("../DashboardComponent", () => ({
  initDashboard: jest.fn(),
}));

// HabitServiceクラスをモック化
jest.mock("../../services/HabitService", () => ({
  HabitService: jest.fn().mockImplementation(() => ({
    getHabits: jest.fn(),
  })),
}));

describe("App", () => {
  let app;
  let rootElement;
  let mainElement;
  let mockAuthServiceInstance;
  let mockAuthComponentInstance;
  let mockHabitServiceInstance;
  let mockGetHabits;

  beforeEach(() => {
    // DOMをリセット
    document.body.innerHTML = `
      <header class="header">
        <h1>Habit Tracker</h1>
        <nav class="nav">
          <span id="username-display" class="username-display"></span>
          <button id="logout-button" class="btn btn-secondary hidden">Logout</button>
        </nav>
      </header>
      <main class="main">
        <div id="app-content"></div>
      </main>
      <footer class="footer"></footer>
    `;
    rootElement = document.getElementById("app-content");
    mainElement = document.querySelector("main");
    const usernameDisplay = document.getElementById("username-display");
    const logoutButton = document.getElementById("logout-button");

    // モックのクリア
    AuthService.mockClear();
    AuthComponent.mockClear();
    DashboardComponent.initDashboard.mockClear(); // initDashboardのモックをクリア
    HabitService.mockClear(); // HabitServiceのモックをクリア

    // AuthServiceのモック実装
    mockAuthServiceInstance = {
      isAuthenticated: jest.fn(),
      logout: jest.fn(),
      getUsername: jest.fn(), // getUsernameをモックに追加
    };
    AuthService.mockImplementation(() => mockAuthServiceInstance);

    // AuthComponentのモック実装
    mockAuthComponentInstance = {
      render: jest.fn(() => {
        const div = document.createElement("div");
        div.id = "mock-auth-component";
        return div;
      }),
    };
    AuthComponent.mockImplementation(() => mockAuthComponentInstance);

    // HabitServiceのモック実装
    mockGetHabits = jest.fn();
    mockHabitServiceInstance = {
      getHabits: mockGetHabits,
    };
    HabitService.mockImplementation(() => mockHabitServiceInstance);

    app = new App(); // Appインスタンスはここで一度だけ作成
  });

  it("init()がrenderとsetupEventListenersを呼び出すこと", () => {
    jest.spyOn(app, "render");
    jest.spyOn(app, "setupEventListeners");
    app.init();
    expect(app.render).toHaveBeenCalledTimes(1);
    expect(app.setupEventListeners).toHaveBeenCalledTimes(1);
  });

  describe("header elements", () => {
    beforeEach(() => {
      // 各テストでDOM要素を再取得
      document.body.innerHTML = `
        <header class="header">
          <h1>Habit Tracker</h1>
          <nav class="nav">
            <span id="username-display" class="username-display"></span>
            <button id="logout-button" class="btn btn-secondary hidden">Logout</button>
          </nav>
        </header>
        <main class="main">
          <div id="app-content"></div>
        </main>
        <footer class="footer"></footer>
      `;
      app = new App(); // 新しいAppインスタンスを作成
      app.init(); // イベントリスナーをセットアップ
    });

    it("未認証の場合、ユーザー名表示とログアウトボタンが表示されないこと", async () => {
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(false);
      await app.render();
      const usernameDisplay = document.getElementById("username-display");
      const logoutButton = document.getElementById("logout-button");

      expect(usernameDisplay.style.display).toBe("none");
      expect(logoutButton.classList.contains("hidden")).toBe(true);
    });

    it("認証済みの場合、ユーザー名が表示され、ログアウトボタンが表示されること", async () => {
      const testUsername = "testuser";
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(true);
      mockAuthServiceInstance.getUsername.mockReturnValue(testUsername);
      mockGetHabits.mockResolvedValue([]); // renderがHabitService.getHabitsを呼び出すため
      await app.render();
      const usernameDisplay = document.getElementById("username-display");
      const logoutButton = document.getElementById("logout-button");

      expect(usernameDisplay.textContent).toBe(`${testUsername}`);
      expect(usernameDisplay.style.display).toBe("inline");
      expect(logoutButton.classList.contains("hidden")).toBe(false);
    });

    it("ログアウトボタンをクリックするとlogoutが呼ばれ、renderが呼び出されること", async () => {
      const testUsername = "testuser";
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(true);
      mockAuthServiceInstance.getUsername.mockReturnValue(testUsername);
      mockGetHabits.mockResolvedValue([]); // renderがHabitService.getHabitsを呼び出すため
      await app.render(); // 初期レンダリングでボタンを表示

      const logoutButton = document.getElementById("logout-button");
      expect(logoutButton).not.toBeNull();

      jest.spyOn(app, "render");
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(false); // ログアウト後の状態
      logoutButton.click(); // ボタンクリックをシミュレート

      expect(mockAuthServiceInstance.logout).toHaveBeenCalledTimes(1);
      expect(app.render).toHaveBeenCalledTimes(1);
    });
  });

  describe("render", () => {
    it("未認証の場合、AuthComponentをレンダリングすること", () => {
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(false); // 未認証をモック
      app.render();

      expect(mainElement.classList.contains("auth-mode")).toBe(true);
      expect(AuthComponent).toHaveBeenCalledTimes(1); // Appコンストラクタで1回だけ呼ばれる
      expect(mockAuthComponentInstance.render).toHaveBeenCalledTimes(1);
      expect(rootElement.querySelector("#mock-auth-component")).toBeTruthy();
      expect(rootElement.textContent).not.toContain("Welcome to Dashboard");
      expect(DashboardComponent.initDashboard).not.toHaveBeenCalled(); // initDashboardは呼ばれないことを確認
    });

    it("認証済みの場合、ダッシュボードをレンダリングすること", async () => {
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(true); // 認証済みをモック
      mockGetHabits.mockResolvedValue([]); // HabitService.getHabitsが空の配列を返すようにモック
      await app.render(); // awaitを追加して非同期処理の完了を待つ

      expect(mainElement.classList.contains("auth-mode")).toBe(false);
      expect(AuthComponent).toHaveBeenCalledTimes(1); // Appコンストラクタで1回だけ呼ばれる
      expect(mockAuthComponentInstance.render).not.toHaveBeenCalled();
      expect(DashboardComponent.initDashboard).toHaveBeenCalledTimes(1); // initDashboardが呼ばれることを確認
      expect(DashboardComponent.initDashboard).toHaveBeenCalledWith(
        rootElement
      ); // rootElementが渡されることを確認
    });
  });

  describe("handleAuthSuccess", () => {
    it("renderを呼び出すこと", async () => {
      jest.spyOn(app, "render");
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(true); // renderが認証済み状態を想定するため
      mockGetHabits.mockResolvedValue([]); // renderがHabitService.getHabitsを呼び出すため
      await app.handleAuthSuccess(); // awaitを追加
      expect(app.render).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleLogout", () => {
    it("AuthService.logoutを呼び出し、renderを呼び出すこと", () => {
      jest.spyOn(app, "render");
      // ログアウト後のrenderは未認証状態を想定するため、AuthServiceはisAuthenticatedをfalseに返すようにしておく
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(false);
      app.handleLogout();

      expect(mockAuthServiceInstance.logout).toHaveBeenCalledTimes(1);
      expect(app.render).toHaveBeenCalledTimes(1);
    });
  });
});
