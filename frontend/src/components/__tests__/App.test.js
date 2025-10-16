import { App } from '../App';
import AuthService from '../../services/AuthService';
import AuthComponent from '../AuthComponent';

// AuthServiceとAuthComponentをモック化
jest.mock('../../services/AuthService');
jest.mock('../AuthComponent');

describe('App', () => {
  let app;
  let rootElement;
  let mainElement;
  let mockAuthServiceInstance;
  let mockAuthComponentInstance;

  beforeEach(() => {
    // DOMをリセット
    document.body.innerHTML = `
      <header class="header"></header>
      <main class="main">
        <div id="app-content"></div>
      </main>
      <footer class="footer"></footer>
    `;
    rootElement = document.getElementById('app-content');
    mainElement = document.querySelector('main');

    // モックのクリア
    AuthService.mockClear();
    AuthComponent.mockClear();

    // AuthServiceのモック実装
    mockAuthServiceInstance = {
      isAuthenticated: jest.fn(),
      logout: jest.fn(),
    };
    AuthService.mockImplementation(() => mockAuthServiceInstance);

    // AuthComponentのモック実装
    mockAuthComponentInstance = {
      render: jest.fn(() => {
        const div = document.createElement('div');
        div.id = 'mock-auth-component';
        return div;
      }),
    };
    AuthComponent.mockImplementation(() => mockAuthComponentInstance);

    app = new App(); // Appインスタンスはここで一度だけ作成
  });

  it('init()がrenderを呼び出すこと', () => {
    jest.spyOn(app, 'render');
    app.init();
    expect(app.render).toHaveBeenCalledTimes(1);
  });

  describe('render', () => {
    it('未認証の場合、AuthComponentをレンダリングすること', () => {
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(false); // 未認証をモック
      app.render();

      expect(mainElement.classList.contains('auth-mode')).toBe(true);
      expect(AuthComponent).toHaveBeenCalledTimes(1); // Appコンストラクタで1回だけ呼ばれる
      expect(mockAuthComponentInstance.render).toHaveBeenCalledTimes(1);
      expect(rootElement.querySelector('#mock-auth-component')).toBeTruthy();
      expect(rootElement.textContent).not.toContain('Welcome to Dashboard');
    });

    it('認証済みの場合、ダッシュボードのプレースホルダーをレンダリングすること', () => {
      mockAuthServiceInstance.isAuthenticated.mockReturnValue(true); // 認証済みをモック
      app.render();

      expect(mainElement.classList.contains('auth-mode')).toBe(false);
      expect(AuthComponent).toHaveBeenCalledTimes(1); // Appコンストラクタで1回だけ呼ばれる
      expect(mockAuthComponentInstance.render).not.toHaveBeenCalled();
      expect(rootElement.textContent).toContain('Welcome to Dashboard (placeholder)');
    });
  });

  describe('handleAuthSuccess', () => {
    it('renderを呼び出すこと', () => {
      jest.spyOn(app, 'render');
      app.handleAuthSuccess();
      expect(app.render).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleLogout', () => {
    it('AuthService.logoutを呼び出し、renderを呼び出すこと', () => {
      jest.spyOn(app, 'render');

      app.handleLogout();

      expect(mockAuthServiceInstance.logout).toHaveBeenCalledTimes(1);
      expect(app.render).toHaveBeenCalledTimes(1);
    });
  });
});
