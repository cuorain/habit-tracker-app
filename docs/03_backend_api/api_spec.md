# API 仕様書

## 概要

習慣トラッカーアプリケーションの REST API 仕様を定義します。

## ベース URL

```
http://localhost:8080/api/v1
```

## 認証

JWT (JSON Web Token) を使用した認証方式を採用します。

### 認証ヘッダー

```
Authorization: Bearer <token>
```

## API エンドポイント

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
- **エラーレスポンスの例:**
  - ユーザー名が既に存在する場合 (409 Conflict): `{"message": "ユーザー名は既に使用されています。"}`
  - サーバーエラー (500 Internal Server Error): `{"message": "サーバーエラーが発生しました。"}`

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
- **エラーレスポンスの例:**
  - 無効なユーザー名またはパスワードの場合 (401 Unauthorized): `{"message": "無効なユーザー名またはパスワードです。"}`
  - サーバーエラー (500 Internal Server Error): `{"message": "サーバーエラーが発生しました。"}`

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
      "targetFrequencyId": "number",
      "targetFrequencyName": "string",
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
    "targetFrequencyId": "number"
  }
  ```
- **バリデーション**:
  - `targetFrequencyId`: 必須。有効な頻度オプションの ID であること。
  - `habitType`: 必須 (`BOOLEAN`, `NUMERIC_DURATION`, `NUMERIC_COUNT` のいずれか)。
  - `habitType` が `BOOLEAN` の場合、`targetValue` と `targetUnit` は `NULL` であること。
  - `habitType` が `NUMERIC_DURATION` または `NUMERIC_COUNT` の場合、`targetValue` と `targetUnit` は必須であり、`targetValue` は 0 以上の数値であること。
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
    "targetFrequencyId": "number",
    "targetFrequencyName": "string",
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
    "targetFrequencyId": "number"
  }
  ```
- **バリデーション**:
  - `habitType`: 必須 (`BOOLEAN`, `NUMERIC_DURATION`, `NUMERIC_COUNT` のいずれか)。
  - `habitType` が `BOOLEAN` の場合、`targetValue` と `targetUnit` は `NULL` であること。
  - `habitType` が `NUMERIC_DURATION` または `NUMERIC_COUNT` の場合、`targetValue` と `targetUnit` は必須であり、`targetValue` は 0 以上の数値であること。
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
    - 関連する習慣の `habitType` が `NUMERIC_DURATION` または `NUMERIC_COUNT` の場合、`numericValue` は必須であり、0 以上の数値であること。
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

### 4. 頻度オプション管理

#### 頻度オプション一覧取得

- **GET** `/frequency-options`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "isDefault": "boolean"
    }
  ]
  ```

#### 頻度オプション作成

- **POST** `/frequency-options`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **バリデーション**:
  - `name`: 必須。一意であること。
- **Response:**
  ```json
  {
    "id": "number",
    "name": "string",
    "description": "string",
    "isDefault": "boolean"
  }
  ```

#### 頻度オプション更新

- **PUT** `/frequency-options/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **バリデーション**:
  - `name`: 必須。一意であること。

#### 頻度オプション削除

- **DELETE** `/frequency-options/{id}`
- **Headers:** `Authorization: Bearer <token>`

### 5. 統計・レポート

#### 習慣統計取得
