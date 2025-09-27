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
```javascript
class ChartService {
    async getProgressRateData(habitId, period) {
        // 進捗率データの取得
    }
    
    async getStreakData(habitId, period) {
        // 連続記録データの取得
    }
    
    async getCategoryStats(userId) {
        // カテゴリ統計データの取得
    }
    
    async getCalendarData(habitId, year, month) {
        // カレンダーデータの取得
    }
}
```

### 2. データ変換
```javascript
class DataTransformer {
    static transformProgressData(rawData) {
        // 進捗データの変換
    }
    
    static calculateStreak(progressData) {
        // 連続記録の計算
    }
    
    static groupByCategory(habits) {
        // カテゴリ別グループ化
    }
    
    static formatCalendarData(progressData) {
        // カレンダーデータのフォーマット
    }
}
```

### 3. データキャッシュ
```javascript
class DataCache {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000; // 5分
    }
    
    set(key, data) {
        // キャッシュにデータを保存
    }
    
    get(key) {
        // キャッシュからデータを取得
    }
    
    clear() {
        // キャッシュをクリア
    }
    
    isExpired(key) {
        // キャッシュの有効期限チェック
    }
}
```

## グラフライブラリ

### Chart.js の使用
```javascript
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

class ChartManager {
    constructor() {
        this.charts = new Map();
    }
    
    createProgressChart(canvas, data) {
        // 進捗グラフの作成
    }
    
    createStreakChart(canvas, data) {
        // 連続記録グラフの作成
    }
    
    createCategoryChart(canvas, data) {
        // カテゴリグラフの作成
    }
    
    updateChart(chartId, data) {
        // グラフの更新
    }
    
    destroyChart(chartId) {
        // グラフの破棄
    }
}
```

### グラフ設定
```javascript
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'day',
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
```javascript
class PeriodSelector {
    constructor() {
        this.currentPeriod = 'week'; // 'week' | 'month' | 'year'
    }
    
    render() {
        // 期間選択UIのレンダリング
    }
    
    handlePeriodChange(period) {
        // 期間変更処理
    }
    
    updateCharts() {
        // グラフの更新
    }
}
```

### 2. ズーム・パン
- マウスホイールでのズーム
- ドラッグでのパン
- ダブルクリックでのリセット

### 3. ツールチップ
```javascript
// ツールチップデータの例
const tooltipData = {
    date: '2024-01-01',
    value: 85,
    label: '進捗率',
    additionalInfo: '連続記録: 5日'
};
```

## パフォーマンス最適化

### 1. データの遅延読み込み
```javascript
class LazyDataLoader {
    async loadDataOnDemand(habitId, period) {
        // 必要に応じてデータを読み込み
    }
    
    preloadNextPeriod(habitId, currentPeriod) {
        // 次の期間のデータを事前読み込み
    }
    
    clearUnusedData() {
        // 使用されていないデータをクリア
    }
}
```

### 2. チャートの仮想化
- 大量データの場合は表示範囲のみ描画
- スクロール時の動的読み込み

### 3. メモリ管理
```javascript
class MemoryManager {
    constructor() {
        this.maxCharts = 10;
    }
    
    cleanupOldCharts() {
        // 古いグラフのクリーンアップ
    }
    
    optimizeMemoryUsage() {
        // メモリ使用量の最適化
    }
}
```

## エラーハンドリング

### 1. データ取得エラー
```javascript
class ChartErrorHandler {
    handleDataLoadError(error) {
        // データ読み込みエラーの処理
    }
    
    showErrorMessage(message) {
        // エラーメッセージの表示
    }
    
    retryDataLoad() {
        // データ読み込みの再試行
    }
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
