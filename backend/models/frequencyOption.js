/**
 * @description 頻度オプションモデルを定義するファイルです。Sequelizeを使用して頻度オプションテーブルのスキーマを定義します。
 */

/**
 * FrequencyOptionモデルを定義します。
 * @param {object} sequelize - Sequelizeインスタンス。
 * @param {object} DataTypes - Sequelizeのデータ型。
 * @returns {object} FrequencyOptionモデル。
 */
const FrequencyOption = (sequelize, DataTypes) => {
  const FrequencyOption = sequelize.define(
    "FrequencyOption",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true, // デフォルトオプションはnull、ユーザー定義の場合はuser_idが入る
        references: {
          model: "users",
          key: "id",
        },
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "frequency_options",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  FrequencyOption.associate = (models) => {
    FrequencyOption.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    FrequencyOption.hasMany(models.Habit, {
      foreignKey: "target_frequency_id",
      onDelete: "RESTRICT",
    });
  };

  return FrequencyOption;
};

export { FrequencyOption };

