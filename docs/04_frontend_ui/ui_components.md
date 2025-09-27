# UIコンポーネント設計

## 概要
習慣トラッカーアプリケーションのフロントエンドUIコンポーネント設計を定義します。

## 画面構成

### 1. 認証画面
- **ログイン画面**
  - メールアドレス入力フィールド
  - パスワード入力フィールド
  - ログインボタン
  - 新規登録リンク

- **新規登録画面**
  - ユーザー名入力フィールド
  - メールアドレス入力フィールド
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
  - 目標頻度設定

- **ボタン**
  - 保存ボタン
  - キャンセルボタン

## 主要コンポーネント

### 1. App (メインアプリケーション)
```typescript
class App {
    private authService: AuthService;
    private habitService: HabitService;
    private currentUser: User | null = null;
    
    init(): void;
    render(): void;
    handleAuth(): void;
    handleLogout(): void;
}
```

### 2. AuthComponent (認証コンポーネント)
```typescript
class AuthComponent {
    private mode: 'login' | 'register' = 'login';
    
    render(): HTMLElement;
    handleLogin(): void;
    handleRegister(): void;
    switchMode(): void;
    validateForm(): boolean;
}
```

### 3. DashboardComponent (ダッシュボード)
```typescript
class DashboardComponent {
    private habits: Habit[] = [];
    
    render(): HTMLElement;
    loadHabits(): void;
    renderHabitCards(): HTMLElement[];
    handleAddHabit(): void;
    handleHabitClick(habitId: number): void;
}
```

### 4. HabitCardComponent (習慣カード)
```typescript
class HabitCardComponent {
    private habit: Habit;
    private progress: HabitProgress[];
    
    render(): HTMLElement;
    renderProgress(): HTMLElement;
    handleEdit(): void;
    handleDelete(): void;
    handleProgressUpdate(): void;
}
```

### 5. HabitDetailComponent (習慣詳細)
```typescript
class HabitDetailComponent {
    private habit: Habit;
    private progress: HabitProgress[];
    private selectedPeriod: 'week' | 'month' | 'year' = 'week';
    
    render(): HTMLElement;
    renderChart(): HTMLElement;
    renderProgressHistory(): HTMLElement;
    handlePeriodChange(): void;
    handleProgressEdit(): void;
}
```

### 6. HabitFormComponent (習慣フォーム)
```typescript
class HabitFormComponent {
    private habit: Habit | null = null;
    private isEdit: boolean = false;
    
    render(): HTMLElement;
    handleSubmit(): void;
    handleCancel(): void;
    validateForm(): boolean;
    resetForm(): void;
}
```

### 7. ChartComponent (グラフコンポーネント)
```typescript
class ChartComponent {
    private canvas: HTMLCanvasElement;
    private chart: Chart;
    
    render(data: ChartData): HTMLElement;
    updateData(data: ChartData): void;
    destroy(): void;
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
