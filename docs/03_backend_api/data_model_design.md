# データモデル設計

## 概要
習慣トラッカーアプリケーションのデータベース設計を定義します。

## エンティティ設計

### 新規 ENUM 型
```sql
CREATE TYPE HABIT_TYPE AS ENUM ('BOOLEAN', 'NUMERIC_DURATION', 'NUMERIC_COUNT');
```

### 1. User (ユーザー)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**フィールド説明:**
- `id`: ユーザーID (主キー)
- `username`: ユーザー名 (一意)
- `password_hash`: パスワードハッシュ
- `created_at`: 作成日時
- `updated_at`: 更新日時

### 2. Habit (習慣)
```sql
CREATE TABLE habits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    habit_type HABIT_TYPE NOT NULL DEFAULT 'BOOLEAN', -- 新規：習慣のタイプ (例: BOOLEAN, NUMERIC_DURATION, NUMERIC_COUNT)
    target_value DECIMAL(10, 2),                   -- 新規：数値型の習慣の目標値 (例: 8時間なら8, 3回なら3)
    target_unit VARCHAR(20),                        -- 新規：target_valueの単位 (例: 'hours', 'minutes', 'reps', 'times')
    target_frequency INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**フィールド説明:**
- `id`: 習慣ID (主キー)
- `user_id`: ユーザーID (外部キー)
- `name`: 習慣名
- `description`: 説明
- `category`: カテゴリ
- `habit_type`: 習慣のタイプ (`BOOLEAN`, `NUMERIC_DURATION`, `NUMERIC_COUNT`)
- `target_value`: 数値型習慣の目標値
- `target_unit`: `target_value` の単位
- `target_frequency`: 目標頻度 (1日1回など)
- `created_at`: 作成日時
- `updated_at`: 更新日時

### 3. HabitProgress (習慣進捗)
```sql
CREATE TABLE habit_progress (
    id BIGSERIAL PRIMARY KEY,
    habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,                -- 既存：習慣が「完了」したと見なされたか (数値型でも目標達成などの指標に利用可能)
    numeric_value DECIMAL(10, 2),                   -- 新規：実際に記録された数値 (例: 7.5時間, 3回)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, date)
);
```

**フィールド説明:**
- `id`: 進捗ID (主キー)
- `habit_id`: 習慣ID (外部キー)
- `date`: 日付
- `completed`: 完了フラグ
- `numeric_value`: 実際に記録された数値 (例: 7.5時間, 3回)
- `notes`: メモ
- `created_at`: 作成日時
- `updated_at`: 更新日時

## リレーションシップ

### 1. User → Habit (1:N)
- 1人のユーザーは複数の習慣を持つ
- ユーザーが削除されると、関連する習慣も削除される

### 2. Habit → HabitProgress (1:N)
- 1つの習慣は複数の進捗記録を持つ
- 習慣が削除されると、関連する進捗記録も削除される

## インデックス設計

### パフォーマンス向上のためのインデックス
```sql
-- ユーザー検索用
CREATE INDEX idx_users_username ON users(username);

-- 習慣検索用
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_category ON habits(category);
CREATE INDEX idx_habits_habit_type ON habits(habit_type); -- 新規：習慣タイプ検索用

-- 進捗検索用
CREATE INDEX idx_habit_progress_habit_id ON habit_progress(habit_id);
CREATE INDEX idx_habit_progress_date ON habit_progress(date);
CREATE INDEX idx_habit_progress_habit_date ON habit_progress(habit_id, date);
```

## データ制約

### 1. チェック制約
```sql
-- 目標頻度は1以上
ALTER TABLE habits ADD CONSTRAINT chk_target_frequency 
CHECK (target_frequency > 0);

-- 数値型習慣の場合、target_valueも0以上（必要に応じて）
ALTER TABLE habits ADD CONSTRAINT chk_target_value_positive
CHECK (habit_type = 'BOOLEAN' OR target_value > 0);

-- 日付は未来日を許可しない（必要に応じて）
ALTER TABLE habit_progress ADD CONSTRAINT chk_date_not_future 
CHECK (date <= CURRENT_DATE);

-- numeric_valueは数値型習慣の場合のみ値を持つ (必要に応じて)
ALTER TABLE habit_progress ADD CONSTRAINT chk_numeric_value_for_numeric_habit
CHECK (
    (SELECT habit_type FROM habits WHERE id = habit_progress.habit_id) = 'BOOLEAN' AND numeric_value IS NULL OR
    (SELECT habit_type FROM habits WHERE id = habit_progress.habit_id) IN ('NUMERIC_DURATION', 'NUMERIC_COUNT') AND numeric_value IS NOT NULL
);

```

### 2. ユニーク制約
```sql
-- 同じ習慣の同じ日付の進捗は1つまで
ALTER TABLE habit_progress ADD CONSTRAINT uk_habit_date 
UNIQUE (habit_id, date);
```

## サンプルデータ

### ユーザーデータ
```sql
INSERT INTO users (username, password_hash) VALUES
('testuser', '$2a$10$.......................'), -- 実際のハッシュ値に置き換える
('demo', '$2a$10$...........................'); -- 実際のハッシュ値に置き換える
```

### 習慣データ
```sql
INSERT INTO habits (user_id, name, description, category, habit_type, target_value, target_unit, target_frequency) VALUES
(1, '朝の散歩', '毎朝30分の散歩', '運動', 'BOOLEAN', NULL, NULL, 1),
(1, '読書', '1日30分の読書', '学習', 'BOOLEAN', NULL, NULL, 1),
(1, '瞑想', '10分間の瞑想', 'メンタルヘルス', 'BOOLEAN', NULL, NULL, 1),
(1, '睡眠時間', '毎日8時間の睡眠', '健康', 'NUMERIC_DURATION', 8.0, 'hours', 1),
(1, '学習時間', '毎日60分の学習', '学習', 'NUMERIC_DURATION', 60.0, 'minutes', 1),
(1, '腕立て伏せ', '毎日30回の腕立て伏せ', '運動', 'NUMERIC_COUNT', 30.0, 'reps', 1);
```

### 進捗データ
```sql
INSERT INTO habit_progress (habit_id, date, completed, numeric_value, notes) VALUES
-- 朝の散歩 (BOOLEAN)
(1, '2024-01-01', true, NULL, '気持ちよく歩けた'),
(1, '2024-01-02', true, NULL, '雨だったが傘をさして歩いた'),
(1, '2024-01-03', false, NULL, '体調不良のため休んだ'),
-- 睡眠時間 (NUMERIC_DURATION)
(4, '2024-01-01', true, 7.5, '少し短かった'),
(4, '2024-01-02', true, 8.2, 'ぐっすり眠れた'),
(4, '2024-01-03', false, 6.0, '寝不足'),
-- 腕立て伏せ (NUMERIC_COUNT)
(6, '2024-01-01', true, 30.0, '目標達成！'),
(6, '2024-01-02', false, 20.0, '疲れてた'),
(6, '2024-01-03', true, 35.0, '調子が良い');
```

## マイグレーション戦略
- FlywayまたはLiquibaseを使用したデータベースマイグレーション
- バージョン管理されたSQLスクリプト
- 本番環境での安全なスキーマ変更
