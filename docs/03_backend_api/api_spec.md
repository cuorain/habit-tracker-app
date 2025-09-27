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
    "targetFrequency": "number"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "name": "string",
    "description": "string",
    "category": "string",
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
    "targetFrequency": "number"
  }
  ```

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
    "notes": "string"
  }
  ```

#### 進捗履歴取得
- **GET** `/habits/{id}/progress`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `startDate`: 開始日 (YYYY-MM-DD)
  - `endDate`: 終了日 (YYYY-MM-DD)
- **Response:**
  ```json
  [
    {
      "id": "number",
      "habitId": "number",
      "date": "string",
      "completed": "boolean",
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
