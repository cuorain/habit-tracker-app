# 可視化仕様

## 概要
習慣トラッカーアプリケーションのデータ可視化仕様を定義します。

## グラフの種類

### 1. 進捗率グラフ (Progress Rate Chart)
- **目的**: 習慣の完了率を時系列で表示
- **データ**: 日付と完了率のペア
- **表示形式**: 折れ線グラフ
- **期間**: 週・月・年で切り替え可能

```typescript
interface ProgressRateData {
    date: string;
    completionRate: number; // 0-100%
}
```

### 2. 連続記録グラフ (Streak Chart)
- **目的**: 連続達成日数を表示
- **データ**: 日付と連続日数のペア
- **表示形式**: 棒グラフ
- **色分け**: 達成日は緑、未達成日は赤

```typescript
interface StreakData {
    date: string;
    streak: number;
    completed: boolean;
}
```

### 3. カテゴリ別統計 (Category Statistics)
- **目的**: 習慣カテゴリ別の統計情報
- **データ**: カテゴリ名と達成率のペア
- **表示形式**: 円グラフまたはドーナツグラフ

```typescript
interface CategoryStats {
    category: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
}
```

### 4. 週間・月間カレンダー (Calendar View)
- **目的**: カレンダー形式での進捗表示
- **データ**: 日付と完了状態のペア
- **表示形式**: カレンダーグリッド
- **色分け**: 完了日は緑、未完了日はグレー

```typescript
interface CalendarData {
    date: string;
    completed: boolean;
    notes?: string;
}
```

## データの扱い

### 1. データ取得
```typescript
class ChartService {
    async getProgressRateData(habitId: number, period: 'week' | 'month' | 'year'): Promise<ProgressRateData[]>;
    async getStreakData(habitId: number, period: 'week' | 'month' | 'year'): Promise<StreakData[]>;
    async getCategoryStats(userId: number): Promise<CategoryStats[]>;
    async getCalendarData(habitId: number, year: number, month: number): Promise<CalendarData[]>;
}
```

### 2. データ変換
```typescript
class DataTransformer {
    static transformProgressData(rawData: HabitProgress[]): ProgressRateData[];
    static calculateStreak(progressData: HabitProgress[]): StreakData[];
    static groupByCategory(habits: Habit[]): CategoryStats[];
    static formatCalendarData(progressData: HabitProgress[]): CalendarData[];
}
```

### 3. データキャッシュ
```typescript
class DataCache {
    private cache: Map<string, any> = new Map();
    private ttl: number = 5 * 60 * 1000; // 5分
    
    set(key: string, data: any): void;
    get(key: string): any | null;
    clear(): void;
    isExpired(key: string): boolean;
}
```

## グラフライブラリ

### Chart.js の使用
```typescript
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

class ChartManager {
    private charts: Map<string, Chart> = new Map();
    
    createProgressChart(canvas: HTMLCanvasElement, data: ProgressRateData[]): Chart;
    createStreakChart(canvas: HTMLCanvasElement, data: StreakData[]): Chart;
    createCategoryChart(canvas: HTMLCanvasElement, data: CategoryStats[]): Chart;
    updateChart(chartId: string, data: any): void;
    destroyChart(chartId: string): void;
}
```

### グラフ設定
```typescript
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
        },
    },
    scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: 'day' as const,
            },
        },
        y: {
            beginAtZero: true,
            max: 100,
        },
    },
};
```

## インタラクション

### 1. 期間選択
```typescript
class PeriodSelector {
    private currentPeriod: 'week' | 'month' | 'year' = 'week';
    
    render(): HTMLElement;
    handlePeriodChange(period: 'week' | 'month' | 'year'): void;
    updateCharts(): void;
}
```

### 2. ズーム・パン
- マウスホイールでのズーム
- ドラッグでのパン
- ダブルクリックでのリセット

### 3. ツールチップ
```typescript
interface TooltipData {
    date: string;
    value: number;
    label: string;
    additionalInfo?: string;
}
```

## パフォーマンス最適化

### 1. データの遅延読み込み
```typescript
class LazyDataLoader {
    async loadDataOnDemand(habitId: number, period: string): Promise<any>;
    preloadNextPeriod(habitId: number, currentPeriod: string): void;
    clearUnusedData(): void;
}
```

### 2. チャートの仮想化
- 大量データの場合は表示範囲のみ描画
- スクロール時の動的読み込み

### 3. メモリ管理
```typescript
class MemoryManager {
    private maxCharts: number = 10;
    
    cleanupOldCharts(): void;
    optimizeMemoryUsage(): void;
}
```

## エラーハンドリング

### 1. データ取得エラー
```typescript
class ChartErrorHandler {
    handleDataLoadError(error: Error): void;
    showErrorMessage(message: string): void;
    retryDataLoad(): void;
}
```

### 2. レンダリングエラー
- グラフの描画失敗時のフォールバック
- エラーメッセージの表示
- 再試行機能

## アクセシビリティ

### 1. スクリーンリーダー対応
- グラフの代替テキスト
- データテーブルの提供
- キーボードナビゲーション

### 2. カラーブラインド対応
- 色以外の視覚的手がかり
- パターンや形状の使用
- 高コントラストモード

### 3. モバイル対応
- タッチ操作の最適化
- レスポンシブデザイン
- 軽量なグラフオプション
