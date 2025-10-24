import { db } from "../models/index.js";

const getFrequencyOptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const frequencyOptions = await db.FrequencyOption.findAll({
      order: [
        ["is_default", "DESC"], // デフォルトオプションを優先
        ["name", "ASC"], // その他のオプションを名前順
      ],
    });
    res.status(200).json(frequencyOptions);
  } catch (error) {
    console.error("Error fetching frequency options:", error);
    res.status(500).json({ message: "頻度オプションの取得に失敗しました。" });
  }
};

export { getFrequencyOptions };
