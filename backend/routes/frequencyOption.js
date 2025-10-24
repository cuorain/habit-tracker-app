/**
 * @description 頻度オプション関連のルートを定義するファイルです。
 */

import express from "express";
import { getFrequencyOptions } from "../controllers/frequencyOptionController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const frequencyOptionRoutes = express.Router();

// 頻度オプション一覧取得
frequencyOptionRoutes.get("/", authenticateToken, getFrequencyOptions);

export { frequencyOptionRoutes };
