# UIコンポーネント設計

## 概要
習慣トラッカーアプリケーションのフロントエンドUIコンポーネント設計を定義します。

## 画面構成

### 1. 認証画面
- **ログイン画面**
  - パスワード入力フィールド
  - ログインボタン
  - 新規登録リンク

- **新規登録画面**
  - ユーザー名入力フィールド
  - パスワード入力フィールド
  - 確認用パスワード入力フィールド
  - 登録ボタン
  - ログインリンク

### 2. ダッシュボード画面
- **ヘッダー**
  - アプリケーションロゴ
  - ユーザー名表示
  - ログアウトボタン

- **習慣一覧**
  - 習慣カード一覧
  - 新規習慣追加ボタン
  - 習慣検索・フィルター機能

- **今日の進捗**
  - 今日の習慣チェックリスト
  - 進捗率表示
  - 完了ボタン

### 3. 習慣詳細画面
- **習慣情報**
  - 習慣名・説明
  - カテゴリ表示
  - 習慣タイプ表示
  - 目標値・単位表示
  - 目標頻度表示

- **進捗グラフ**
  - 期間選択（週・月・年）
  - 進捗率グラフ
  - 連続記録表示

- **進捗履歴**
  - 日付別進捗一覧
  - メモ表示
  - 編集・削除機能

### 4. 習慣作成・編集画面
- **フォーム**
  - 習慣名入力
  - 説明入力
  - カテゴリ選択
  - 習慣タイプ選択（ドロップダウン）
  - 目標値入力（習慣タイプが数値型の場合のみ表示）
  - 単位選択（習慣タイプが数値型の場合のみ表示）
  - 目標頻度設定

- **ボタン**
  - 保存ボタン
  - キャンセルボタン

## 主要コンポーネント

### 1. App (メインアプリケーション)
```javascript
class App {
    constructor() {
        this.authService = new AuthService();
        this.habitService = new HabitService();
        this.currentUser = null;
    }
    
    init() {
        // アプリケーション初期化
    }
    
    render() {
        // レンダリング処理
    }
    
    handleAuth() {
        // 認証処理
    }
    
    handleLogout() {
        // ログアウト処理
    }
}
```

### 2. AuthComponent (認証コンポーネント)
```javascript
class AuthComponent {
    constructor() {
        this.mode = 'login'; // 'login' | 'register'
    }
    
    render() {
        // 認証画面のレンダリング
    }
    
    handleLogin() {
        // ログイン処理
    }
    
    handleRegister() {
        // 登録処理
    }
    
    switchMode() {
        // ログイン/登録モード切り替え
    }
    
    validateForm() {
        // フォームバリデーション
    }
}
```

### 3. DashboardComponent (ダッシュボード)
```javascript
class DashboardComponent {
    constructor() {
        this.habits = [];
    }
    
    render() {
        // ダッシュボードのレンダリング
    }
    
    loadHabits() {
        // 習慣データの読み込み
    }
    
    renderHabitCards() {
        // 習慣カードのレンダリング
    }
    
    handleAddHabit() {
        // 新規習慣追加
    }
    
    handleHabitClick(habitId) {
        // 習慣クリック処理
    }
}
```

### 4. HabitCardComponent (習慣カード)
```javascript
class HabitCardComponent {
    constructor(habit, progress = []) {
        this.habit = habit;
        this.progress = progress;
    }
    
    render() {
        // 習慣カードのレンダリング
        // habit.habitType, habit.targetValue, habit.targetUnit を表示
        // progress.numericValue を表示
    }
    
    renderProgress() {
        // 進捗表示のレンダリング
    }
    
    handleEdit() {
        // 編集処理
    }
    
    handleDelete() {
        // 削除処理
    }
    
    handleProgressUpdate() {
        // 進捗更新処理
    }
}
```

### 5. HabitDetailComponent (習慣詳細)
```javascript
class HabitDetailComponent {
    constructor(habit, progress = []) {
        this.habit = habit;
        this.progress = progress;
        this.selectedPeriod = 'week'; // 'week' | 'month' | 'year'
    }
    
    render() {
        // 習慣詳細画面のレンダリング
        // habit.habitType, habit.targetValue, habit.targetUnit を表示
    }
    
    renderChart() {
        // グラフのレンダリング (習慣タイプと numeric_value に応じて調整)
    }
    
    renderProgressHistory() {
        // 進捗履歴のレンダリング (progress.numericValue を表示)
    }
    
    handlePeriodChange() {
        // 期間変更処理
    }
    
    handleProgressEdit() {
        // 進捗編集処理
    }
}
```

### 6. HabitFormComponent (習慣フォーム)
```javascript
class HabitFormComponent {
    constructor(habit = null) {
        this.habit = habit;
        this.isEdit = !!habit;
    }
    
    render() {
        // 習慣フォームのレンダリング
        // habitType, targetValue, targetUnit の入力フィールドを追加
        // 習慣タイプに応じて目標値と単位の表示/非表示を切り替えるロジック
    }
    
    handleSubmit() {
        // フォーム送信処理 (habitType, targetValue, targetUnit を含める)
    }
    
    handleCancel() {
        // キャンセル処理
    }
    
    validateForm() {
        // フォームバリデーション (habitTypeに応じたバリデーションルール)
    }
    
    resetForm() {
        // フォームリセット
    }
}
```

### 7. ChartComponent (グラフコンポーネント)
```javascript
class ChartComponent {
    constructor(canvas) {
        this.canvas = canvas;
        this.chart = null;
    }
    
    render(data) {
        // グラフのレンダリング
    }
    
    updateData(data) {
        // データ更新
    }
    
    destroy() {
        // グラフの破棄
    }
}
```

## スタイル設計

### 1. カラーパレット
```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
    --light-color: #ecf0f1;
    --dark-color: #34495e;
    --white: #ffffff;
    --gray: #95a5a6;
}
```

### 2. タイポグラフィ
```css
:root {
    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
}
```

### 3. スペーシング
```css
:root {
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
}
```

## レスポンシブデザイン

### ブレークポイント
```css
/* モバイル */
@media (max-width: 768px) {
    .container { padding: 1rem; }
    .grid { grid-template-columns: 1fr; }
}

/* タブレット */
@media (min-width: 769px) and (max-width: 1024px) {
    .container { padding: 1.5rem; }
    .grid { grid-template-columns: repeat(2, 1fr); }
}

/* デスクトップ */
@media (min-width: 1025px) {
    .container { padding: 2rem; }
    .grid { grid-template-columns: repeat(3, 1fr); }
}
```

## アクセシビリティ

### 1. キーボードナビゲーション
- Tabキーでのフォーカス移動
- Enterキーでのアクション実行
- Escapeキーでのモーダル閉じる

### 2. スクリーンリーダー対応
- 適切なARIAラベル
- セマンティックHTML要素の使用
- フォーカス管理

### 3. カラーコントラスト
- WCAG 2.1 AA準拠
- 最低4.5:1のコントラスト比
- カラーのみに依存しない情報伝達
