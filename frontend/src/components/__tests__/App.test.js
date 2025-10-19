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
      <header class="header"></header>
      <main class="main">
        <div id="app-content"></div>
      </main>
      <footer class="footer"></footer>
    `;
    rootElement = document.getElementById("app-content");
    mainElement = document.querySelector("main");

    // モックのクリア
    AuthService.mockClear();
    AuthComponent.mockClear();
    DashboardComponent.initDashboard.mockClear(); // initDashboardのモックをクリア
    HabitService.mockClear(); // HabitServiceのモックをクリア

    // AuthServiceのモック実装
    mockAuthServiceInstance = {
      isAuthenticated: jest.fn(),
      logout: jest.fn(),
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

  it("init()がrenderを呼び出すこと", () => {
    jest.spyOn(app, "render");
    app.init();
    expect(app.render).toHaveBeenCalledTimes(1);
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
