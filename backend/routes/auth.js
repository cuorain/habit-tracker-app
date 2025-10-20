/**
 * @description ユーザー認証 (登録とログイン) に関連するAPIルートを定義するファイルです。
 */

import express from "express";
const authRoutes = express.Router();
import bcrypt from "bcryptjs"; // パスワードハッシュ化のため
import jwt from "jsonwebtoken"; // JSON Web Token発行のため
import { db } from "../models/index.js"; // データベースモデルのインポート
import { logout } from "../controllers/authController.js";
const { User } = db;

/**
 * @route POST /api/v1/auth/register
 * @description 新しいユーザーを登録するAPIエンドポイントです。
 * @param {string} req.body.username - 登録するユーザー名。
 * @param {string} req.body.password - ユーザーのパスワード。
 * @returns {object} 201 - 登録成功時: ユーザーID, ユーザー名, JWTトークン。
 * @returns {object} 409 - ユーザー名が既に存在する場合: エラーメッセージ。
 * @returns {object} 500 - サーバーエラー発生時: エラーメッセージ。
 */
authRoutes.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // ユーザー名が既に存在するか確認
    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // パスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 新しいユーザーを作成しデータベースに保存
    user = await User.create({
      username,
      password_hash,
    });

    // JWTトークンを生成
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    // 成功レスポンスを返す
    res.status(201).json({ id: user.id, username: user.username, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" }); // JSON形式でエラーを返す
  }
});

/**
 * @route POST /api/v1/auth/login
 * @description ユーザーをログインさせ、JWTトークンを返すAPIエンドポイントです。
 * @param {string} req.body.username - ログインするユーザー名。
 * @param {string} req.body.password - ユーザーのパスワード。
 * @returns {object} 200 - ログイン成功時: ユーザーID, ユーザー名, JWTトークン。
 * @returns {object} 401 - 無効なユーザー名またはパスワードの場合: エラーメッセージ。
 * @returns {object} 500 - サーバーエラー発生時: エラーメッセージ。
 */
authRoutes.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // ユーザー名を検索
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "無効なユーザー名またはパスワードです。" });
    }

    // 提供されたパスワードと保存されているハッシュを比較
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "無効なユーザー名またはパスワードです。" });
    }

    // JWTトークンを生成
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    // 成功レスポンスを返す
    res.status(200).json({ id: user.id, username: user.username, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" }); // JSON形式でエラーを返す
  }
});

authRoutes.post("/logout", logout);

export { authRoutes };
