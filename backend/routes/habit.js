/**
 * @description 習慣関連のルートを定義するファイルです。
 */

import express from "express";
import { getHabits } from "../controllers/habitController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 習慣一覧取得
router.get("/", authenticateToken, getHabits);

export default router;
