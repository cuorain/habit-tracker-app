/**
 * @description 習慣関連のルートを定義するファイルです。
 */

import express from "express";
import {
  getHabits,
  createHabit,
  updateHabit,
} from "../controllers/habitController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const habitRoutes = express.Router();

// 習慣一覧取得
habitRoutes.get("/", authenticateToken, getHabits);
// 習慣作成
habitRoutes.post("/", authenticateToken, createHabit);
// 習慣更新
habitRoutes.put("/:id", authenticateToken, updateHabit);

export { habitRoutes };
