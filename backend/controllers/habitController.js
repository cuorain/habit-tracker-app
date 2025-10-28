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
    // 認証チェック
    if (!req.user) {
      return res.status(401).json({ message: "認証されていません。" });
    }

    const { Habit, FrequencyOption } = db; // FrequencyOptionモデルを追加
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
        "target_frequency_id", // target_frequency_idに変更
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: FrequencyOption,
          attributes: ["name"], // FrequencyOptionの名前のみを取得
        },
      ],
    });

    // レスポンスデータを整形
    const formattedHabits = habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      habit_type: habit.habit_type,
      target_value: habit.target_value,
      target_unit: habit.target_unit,
      target_frequency_id: habit.target_frequency_id,
      target_frequency_name: habit.FrequencyOption.name, // FrequencyOptionの名前を追加
      created_at: habit.created_at,
      updated_at: habit.updated_at,
    }));

    res.status(200).json(formattedHabits);
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
      target_frequency_id, // target_frequencyをtarget_frequency_idに変更
    } = req.body;

    // target_frequency_idを数値に変換
    const parsed_target_frequency_id = parseInt(target_frequency_id, 10);

    // 必須フィールドの検証 (habit_typeに依存しないもの)
    if (
      !name ||
      !description ||
      !category ||
      !habit_type ||
      isNaN(parsed_target_frequency_id) || // 数値であることを確認
      (typeof target_frequency_id === "string" &&
        target_frequency_id.trim() === "") // target_frequency_idに変更
    ) {
      return res
        .status(400)
        .json({ message: "必須フィールドが不足しています。" });
    }

    // target_frequency_idが数値であることを確認
    if (isNaN(parsed_target_frequency_id) || parsed_target_frequency_id <= 0) {
      return res.status(400).json({
        message: "targetFrequencyIdは1以上の数値である必要があります。",
      });
    }

    // target_frequency_idがfrequency_optionsテーブルに存在するか確認
    const { FrequencyOption } = db;
    const frequencyOption = await FrequencyOption.findByPk(
      parsed_target_frequency_id
    );
    if (!frequencyOption) {
      return res.status(400).json({
        message: "指定されたtargetFrequencyIdは存在しません。",
      });
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
      if (
        (target_value != null &&
          !(typeof target_value === "string" && target_value.trim() === "")) ||
        (target_unit != null &&
          !(typeof target_unit === "string" && target_unit.trim() === ""))
      ) {
        return res.status(400).json({
          message:
            "BOOLEANタイプの習慣にはtargetValueとtargetUnitは設定できません。",
        });
      }
    } else {
      // NUMERIC_DURATION or NUMERIC_COUNT
      if (
        target_value == null ||
        (typeof target_value === "string" && target_value.trim() === "") ||
        target_unit == null ||
        (typeof target_unit === "string" && target_unit.trim() === "")
      ) {
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
      target_frequency_id: parsed_target_frequency_id, // target_frequencyをtarget_frequency_idに変更
      user_id: userId,
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error("習慣の作成中にエラーが発生しました:", error);
    res.status(500).json({ message: "習慣の作成中にエラーが発生しました。" });
  }
};

export const updateHabit = async (req, res) => {
  try {
    // 認証チェック
    if (!req.user) {
      return res.status(401).json({ message: "認証されていません。" });
    }

    const { Habit } = db;
    const userId = req.user.id;
    const habitId = req.params.id;

    const habit = await Habit.findByPk(habitId);

    if (!habit) {
      return res.status(404).json({ message: "習慣が見つかりません。" });
    }

    if (habit.user_id !== userId) {
      return res.status(403).json({ message: "許可されていません。" });
    }

    const {
      name,
      description,
      category,
      habit_type,
      target_value,
      target_unit,
      target_frequency_id,
    } = req.body;

    // target_frequency_idを数値に変換
    const parsed_target_frequency_id = parseInt(target_frequency_id, 10);

    // 必須フィールドの検証 (habit_typeに依存しないもの)
    if (
      !name ||
      !description ||
      !category ||
      !habit_type ||
      isNaN(parsed_target_frequency_id) ||
      (typeof target_frequency_id === "string" &&
        target_frequency_id.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "必須フィールドが不足しています。" });
    }

    // target_frequency_idが数値であることを確認
    if (isNaN(parsed_target_frequency_id) || parsed_target_frequency_id <= 0) {
      return res.status(400).json({
        message: "targetFrequencyIdは1以上の数値である必要があります。",
      });
    }

    // target_frequency_idがfrequency_optionsテーブルに存在するか確認
    const { FrequencyOption } = db;
    const frequencyOption = await FrequencyOption.findByPk(
      parsed_target_frequency_id
    );
    if (!frequencyOption) {
      return res.status(400).json({
        message: "指定されたtargetFrequencyIdは存在しません。",
      });
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
      if (
        (target_value != null &&
          !(typeof target_value === "string" && target_value.trim() === "")) ||
        (target_unit != null &&
          !(typeof target_unit === "string" && target_unit.trim() === ""))
      ) {
        return res.status(400).json({
          message:
            "BOOLEANタイプの習慣にはtargetValueとtargetUnitは設定できません。",
        });
      }
    } else {
      // NUMERIC_DURATION or NUMERIC_COUNT
      if (
        target_value == null ||
        (typeof target_value === "string" && target_value.trim() === "") ||
        target_unit == null ||
        (typeof target_unit === "string" && target_unit.trim() === "")
      ) {
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

    const updatedAt = new Date();
    const updatedHabit = await habit.update({
      name: name,
      description: description,
      category: category,
      habit_type: habit_type,
      target_value: target_value,
      target_unit: target_unit,
      target_frequency_id: parsed_target_frequency_id,
      updated_at: updatedAt,
    });

    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error("習慣の更新中にエラーが発生しました:", error);
    res.status(500).json({ message: "習慣の更新中にエラーが発生しました。" });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    // 認証チェック
    if (!req.user) {
      return res.status(401).json({ message: "認証されていません。" });
    }

    const { Habit } = db;
    const userId = req.user.id;
    const habitId = req.params.id;

    const habit = await Habit.findByPk(habitId);

    if (!habit) {
      return res.status(404).json({ message: "習慣が見つかりません。" });
    }

    if (habit.user_id !== userId) {
      return res.status(403).json({ message: "許可されていません。" });
    }

    await habit.destroy();

    res.status(200).json({ message: "習慣が正常に削除されました。" });
  } catch (error) {
    console.error("習慣の削除中にエラーが発生しました:", error);
    res.status(500).json({ message: "習慣の削除中にエラーが発生しました。" });
  }
};
