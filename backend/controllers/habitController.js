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

export const createHabit = async (req, res) => {
  try {
    // 認証チェック
    if (!req.user) {
      return res.status(401).json({ message: "認証されていません。" });
    }

    const { Habit } = db;
    const userId = req.user.id;
    const {
      name,
      description,
      category,
      habit_type,
      target_value,
      target_unit,
      target_frequency,
    } = req.body;

    // 必須フィールドの検証 (habit_typeに依存しないもの)
    if (
      !name ||
      !description ||
      !category ||
      !habit_type ||
      !target_frequency
    ) {
      return res
        .status(400)
        .json({ message: "必須フィールドが不足しています。" });
    }

    // habit_typeの検証
    const allowedHabitTypes = ["BOOLEAN", "NUMERIC_DURATION", "NUMERIC_COUNT"];
    if (!allowedHabitTypes.includes(habit_type)) {
      return res.status(400).json({
        message:
          "habitTypeはBOOLEAN, NUMERIC_DURATION, NUMERIC_COUNTのいずれかである必要があります。",
      });
    }

    // habit_typeに応じたバリデーション
    if (habit_type === "BOOLEAN") {
      if (target_value !== null || target_unit !== null) {
        return res.status(400).json({
          message:
            "BOOLEANタイプの習慣にはtargetValueとtargetUnitは設定できません。",
        });
      }
    } else {
      // NUMERIC_DURATION or NUMERIC_COUNT
      if (target_value === null || target_unit === null) {
        return res.status(400).json({
          message:
            "NUMERIC_DURATIONまたはNUMERIC_COUNTタイプの習慣にはtargetValueとtargetUnitが必要です。",
        });
      }
      if (typeof target_value !== "number" || target_value < 0) {
        return res
          .status(400)
          .json({ message: "targetValueは0以上の数値である必要があります。" });
      }
      const allowedTargetUnits = ["hours", "minutes", "reps", "times"];
      if (!allowedTargetUnits.includes(target_unit)) {
        return res.status(400).json({
          message:
            "targetUnitはhours, minutes, reps, timesのいずれかである必要があります。",
        });
      }
    }

    const newHabit = await Habit.create({
      name,
      description,
      category,
      habit_type,
      target_value,
      target_unit,
      target_frequency,
      user_id: userId,
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error("習慣の作成中にエラーが発生しました:", error);
    res.status(500).json({ message: "習慣の作成中にエラーが発生しました。" });
  }
};
