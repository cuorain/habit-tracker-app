# データモデル設計

## 概要
習慣トラッカーアプリケーションのデータベース設計を定義します。

## エンティティ設計

### 1. User (ユーザー)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**フィールド説明:**
- `id`: ユーザーID (主キー)
- `username`: ユーザー名 (一意)
- `email`: メールアドレス (一意)
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
- `target_frequency`: 目標頻度 (1日1回など)
- `created_at`: 作成日時
- `updated_at`: 更新日時

### 3. HabitProgress (習慣進捗)
```sql
CREATE TABLE habit_progress (
    id BIGSERIAL PRIMARY KEY,
    habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 習慣検索用
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_category ON habits(category);

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

-- 日付は未来日を許可しない（必要に応じて）
ALTER TABLE habit_progress ADD CONSTRAINT chk_date_not_future 
CHECK (date <= CURRENT_DATE);
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
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@example.com', '$2a$10$...'),
('demo', 'demo@example.com', '$2a$10$...');
```

### 習慣データ
```sql
INSERT INTO habits (user_id, name, description, category, target_frequency) VALUES
(1, '朝の散歩', '毎朝30分の散歩', '運動', 1),
(1, '読書', '1日30分の読書', '学習', 1),
(1, '瞑想', '10分間の瞑想', 'メンタルヘルス', 1);
```

### 進捗データ
```sql
INSERT INTO habit_progress (habit_id, date, completed, notes) VALUES
(1, '2024-01-01', true, '気持ちよく歩けた'),
(1, '2024-01-02', true, '雨だったが傘をさして歩いた'),
(1, '2024-01-03', false, '体調不良のため休んだ');
```

## マイグレーション戦略
- FlywayまたはLiquibaseを使用したデータベースマイグレーション
- バージョン管理されたSQLスクリプト
- 本番環境での安全なスキーマ変更
