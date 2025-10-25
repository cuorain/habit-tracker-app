/**
 * @description 習慣モデルを定義するファイルです。Sequelizeを使用して習慣テーブルのスキーマを定義します。
 */

/**
 * Habitモデルを定義します。
 * @param {object} sequelize - Sequelizeインスタンス。
 * @param {object} DataTypes - Sequelizeのデータ型。
 * @returns {object} Habitモデル。
 */
const Habit = (sequelize, DataTypes) => {
  const Habit = sequelize.define(
    "Habit",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      habit_type: {
        type: DataTypes.ENUM("BOOLEAN", "NUMERIC_DURATION", "NUMERIC_COUNT"),
        allowNull: false,
        defaultValue: "BOOLEAN",
      },
      target_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      target_unit: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      target_frequency_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "frequency_options",
          key: "id",
        },
        defaultValue: 1,
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
      tableName: "habits",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Habit.associate = (models) => {
    Habit.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    Habit.belongsTo(models.FrequencyOption, {
      foreignKey: "target_frequency_id",
      onDelete: "RESTRICT",
    });
  };

  return Habit;
};

export { Habit };
