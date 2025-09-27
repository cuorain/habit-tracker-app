// メインアプリケーションエントリーポイント
import { App } from './components/App.js';
import './styles.css';

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// 未処理のPromise拒否のハンドリング
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
