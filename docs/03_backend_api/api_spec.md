# API仕様書

## 概要
習慣トラッカーアプリケーションのREST API仕様を定義します。

## ベースURL
```
http://localhost:8080/api/v1
```

## 認証
JWT (JSON Web Token) を使用した認証方式を採用します。

### 認証ヘッダー
```
Authorization: Bearer <token>
```

## APIエンドポイント

### 1. ユーザー管理

#### ユーザー登録
- **POST** `/auth/register`
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "username": "string",
    "token": "string"
  }
  ```

#### ユーザーログイン
- **POST** `/auth/login`
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "username": "string",
    "token": "string"
  }
  ```

### 2. 習慣管理

#### 習慣一覧取得
- **GET** `/habits`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "category": "string",
      "habitType": "string",
      "targetValue": "number",
      "targetUnit": "string",
      "targetFrequency": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

#### 習慣作成
- **POST** `/habits`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "category": "string",
    "habitType": "string",
    "targetValue": "number",
    "targetUnit": "string",
    "targetFrequency": "number"
  }
  ```
- **バリデーション**: 
  - `habitType`: 必須 (`BOOLEAN`, `NUMERIC_DURATION`, `NUMERIC_COUNT` のいずれか)。
  - `habitType` が `BOOLEAN` の場合、`targetValue` と `targetUnit` は `NULL` であること。
  - `habitType` が `NUMERIC_DURATION` または `NUMERIC_COUNT` の場合、`targetValue` と `targetUnit` は必須であり、`targetValue` は0以上の数値であること。
  - `targetUnit`: `hours`, `minutes`, `reps`, `times` のいずれかであること（`habitType`が数値型の場合）。
- **Response:**
  ```json
  {
    "id": "number",
    "name": "string",
    "description": "string",
    "category": "string",
    "habitType": "string",
    "targetValue": "number",
    "targetUnit": "string",
    "targetFrequency": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### 習慣更新
- **PUT** `/habits/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "category": "string",
    "habitType": "string",
    "targetValue": "number",
    "targetUnit": "string",
    "targetFrequency": "number"
  }
  ```
- **バリデーション**: 
  - `habitType`: 必須 (`BOOLEAN`, `NUMERIC_DURATION`, `NUMERIC_COUNT` のいずれか)。
  - `habitType` が `BOOLEAN` の場合、`targetValue` と `targetUnit` は `NULL` であること。
  - `habitType` が `NUMERIC_DURATION` または `NUMERIC_COUNT` の場合、`targetValue` と `targetUnit` は必須であり、`targetValue` は0以上の数値であること。
  - `targetUnit`: `hours`, `minutes`, `reps`, `times` のいずれかであること（`habitType`が数値型の場合）。

#### 習慣削除
- **DELETE** `/habits/{id}`
- **Headers:** `Authorization: Bearer <token>`

### 3. 進捗記録

#### 進捗記録
- **POST** `/habits/{id}/progress`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "date": "string",
    "completed": "boolean",
    "numericValue": "number",
    "notes": "string"
  }
  ```
- **バリデーション**: 
  - `numericValue`: 
    - 関連する習慣の `habitType` が `BOOLEAN` の場合、`numericValue` は `NULL` であること。
    - 関連する習慣の `habitType` が `NUMERIC_DURATION` または `NUMERIC_COUNT` の場合、`numericValue` は必須であり、0以上の数値であること。
- **Response:**
  ```json
  [
    {
      "id": "number",
      "habitId": "number",
      "date": "string",
      "completed": "boolean",
      "numericValue": "number",
      "notes": "string",
      "createdAt": "string"
    }
  ]
  ```

### 4. 統計・レポート

#### 習慣統計取得
- **GET** `/habits/{id}/stats`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `period`: 期間 (week, month, year)
- **Response:**
  ```json
  {
    "totalDays": "number",
    "completedDays": "number",
    "completionRate": "number",
    "streak": "number",
    "longestStreak": "number"
  }
  ```

## エラーレスポンス
```json
{
  "error": "string",
  "message": "string",
  "timestamp": "string"
}
```

## HTTPステータスコード
- `200`: 成功
- `201`: 作成成功
- `400`: バリデーションエラー
- `401`: 認証エラー
- `403`: 認可エラー
- `404`: リソースが見つからない
- `500`: サーバーエラー
