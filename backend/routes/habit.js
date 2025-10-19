/**
 * @description 習慣関連のルートを定義するファイルです。
 */

import express from "express";
import { getHabits } from "../controllers/habitController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const habitRoutes = express.Router();

// 習慣一覧取得
habitRoutes.get("/", authenticateToken, getHabits);

export { habitRoutes };
