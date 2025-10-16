import AuthComponent from '../AuthComponent';
import AuthService from '../../services/AuthService';

// AuthServiceをモック化
jest.mock('../../services/AuthService');

describe('AuthComponent', () => {
  let authComponent;
  let mockOnAuthSuccess;
  let containerElement;
  let mockAuthServiceInstance;

  beforeEach(() => {
    // DOMをリセット
    document.body.innerHTML = '<div id="app-content"></div>';
    containerElement = document.getElementById('app-content');

    mockOnAuthSuccess = jest.fn();

    // AuthServiceのモックインスタンスを設定
    mockAuthServiceInstance = {
      login: jest.fn(),
      register: jest.fn(),
      isAuthenticated: jest.fn(() => false), // デフォルトは未認証
    };
    AuthService.mockImplementation(() => mockAuthServiceInstance);

    authComponent = new AuthComponent(mockOnAuthSuccess);

    // 各テスト前にモックメソッドをクリア
    mockAuthServiceInstance.login.mockClear();
    mockAuthServiceInstance.register.mockClear();
    mockAuthServiceInstance.isAuthenticated.mockClear();
  });

  it('render時にログインフォームが正しく表示されること', () => {
    const renderedElement = authComponent.render();
    expect(renderedElement).toBeInstanceOf(HTMLElement);
    expect(renderedElement.querySelector('h1').textContent).toBe(
      '登録してコンテンツを楽しもう'
    );
    expect(renderedElement.querySelector('#username')).toBeTruthy();
    expect(renderedElement.querySelector('#password')).toBeTruthy();
    expect(renderedElement.querySelector('#confirm-password')).toBeFalsy();
    expect(renderedElement.querySelector('button').textContent).toBe('次へ');
  });

  it('切り替えリンクをクリックすると登録モードに切り替わること', () => {
    authComponent.render();
    const toggleLink = authComponent.container.querySelector('#toggle-auth-mode');
    toggleLink.click();

    expect(authComponent.mode).toBe('register');
    // 再レンダリングされるので、新しい内容が反映されているか確認
    expect(authComponent.container.querySelector('h1').textContent).toBe(
      'アカウントを作成'
    );
    expect(authComponent.container.querySelector('#confirm-password')).toBeTruthy();
    expect(authComponent.container.querySelector('button').textContent).toBe('登録');
  });

  it('ログインフォームが正常に送信されたときにonAuthSuccessが呼ばれること', async () => {
    authComponent.render();
    const usernameInput = authComponent.container.querySelector('#username');
    const passwordInput = authComponent.container.querySelector('#password');

    usernameInput.value = 'testuser';
    passwordInput.value = 'password123';

    mockAuthServiceInstance.login.mockResolvedValueOnce(); // ログイン成功をモック

    await authComponent.handleSubmit({
      preventDefault: jest.fn(),
    });

    expect(mockAuthServiceInstance.login).toHaveBeenCalledWith(
      'testuser',
      'password123'
    );
    expect(mockOnAuthSuccess).toHaveBeenCalledTimes(1);
  });

  it('登録フォームが正常に送信されたときにonAuthSuccessが呼ばれること', async () => {
    authComponent.mode = 'register';
    authComponent.render();

    const usernameInput = authComponent.container.querySelector('#username');
    const passwordInput = authComponent.container.querySelector('#password');
    const confirmPasswordInput = authComponent.container.querySelector(
      '#confirm-password'
    );

    usernameInput.value = 'newuser';
    passwordInput.value = 'newpassword123';
    confirmPasswordInput.value = 'newpassword123';

    mockAuthServiceInstance.register.mockResolvedValueOnce(); // 登録成功をモック

    await authComponent.handleSubmit({
      preventDefault: jest.fn(),
    });

    expect(mockAuthServiceInstance.register).toHaveBeenCalledWith(
      'newuser',
      'newpassword123'
    );
    expect(mockOnAuthSuccess).toHaveBeenCalledTimes(1);
  });

  it('登録時にパスワードが一致しない場合、エラーが表示されること', async () => {
    authComponent.mode = 'register';
    authComponent.render();

    const usernameInput = authComponent.container.querySelector('#username');
    const passwordInput = authComponent.container.querySelector('#password');
    const confirmPasswordInput = authComponent.container.querySelector(
      '#confirm-password'
    );

    usernameInput.value = 'newuser';
    passwordInput.value = 'password123';
    confirmPasswordInput.value = 'differentpassword';

    await authComponent.handleSubmit({
      preventDefault: jest.fn(),
    });

    expect(authComponent.container.querySelector('.error-message').textContent).toBe(
      'パスワードが一致しません。'
    );
    expect(authComponent.container.querySelector('.error-message').style.display).toBe(
      'block'
    );
    expect(mockOnAuthSuccess).not.toHaveBeenCalled();
  });

  it('ログイン失敗時にエラーメッセージが表示されること', async () => {
    authComponent.render();

    const usernameInput = authComponent.container.querySelector('#username');
    const passwordInput = authComponent.container.querySelector('#password');

    usernameInput.value = 'testuser';
    passwordInput.value = 'wrongpassword';

    mockAuthServiceInstance.login.mockRejectedValueOnce(new Error('ログインに失敗しました。')); // ログイン失敗をモック

    await authComponent.handleSubmit({
      preventDefault: jest.fn(),
    });

    expect(authComponent.container.querySelector('.error-message').textContent).toBe(
      'ログインに失敗しました。'
    );
    expect(authComponent.container.querySelector('.error-message').style.display).toBe(
      'block'
    );
    expect(mockOnAuthSuccess).not.toHaveBeenCalled();
  });

  it('登録失敗時にエラーメッセージが表示されること', async () => {
    authComponent.mode = 'register';
    authComponent.render();

    const usernameInput = authComponent.container.querySelector('#username');
    const passwordInput = authComponent.container.querySelector('#password');
    const confirmPasswordInput = authComponent.container.querySelector(
      '#confirm-password'
    );

    usernameInput.value = 'existinguser';
    passwordInput.value = 'password123';
    confirmPasswordInput.value = 'password123';

    mockAuthServiceInstance.register.mockRejectedValueOnce(new Error('登録に失敗しました。')); // 登録失敗をモック

    await authComponent.handleSubmit({
      preventDefault: jest.fn(),
    });

    expect(authComponent.container.querySelector('.error-message').textContent).toBe(
      '登録に失敗しました。'
    );
    expect(authComponent.container.querySelector('.error-message').style.display).toBe(
      'block'
    );
    expect(mockOnAuthSuccess).not.toHaveBeenCalled();
  });
});
