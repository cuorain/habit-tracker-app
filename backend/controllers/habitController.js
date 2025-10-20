/**
 * @description 習慣に関するコントローラー関数を定義します。
 */

import { db } from "../models/index.js";

/**
 * 全ての習慣を取得します。
 * @param {object} req - Expressのリクエストオブジェクト。
 * @param {object} res - Expressのレスポンスオブジェクト。
 */
export const getHabits = async (req, res) => {
  try {
    const { Habit } = db;
    const userId = req.user.id; // 認証されたユーザーのID

    const habits = await Habit.findAll({
      where: { user_id: userId },
      attributes: [
        "id",
        "name",
        "description",
        "category",
        "habit_type",
        "target_value",
        "target_unit",
        "target_frequency",
        "created_at",
        "updated_at",
      ],
    });

    res.status(200).json(habits);
  } catch (error) {
    console.error("習慣の取得中にエラーが発生しました:", error);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
};
