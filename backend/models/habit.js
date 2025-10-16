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
      userId: {
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
      habitType: {
        type: DataTypes.ENUM("BOOLEAN", "NUMERIC_DURATION", "NUMERIC_COUNT"),
        allowNull: false,
        defaultValue: "BOOLEAN",
      },
      targetValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      targetUnit: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      targetFrequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "habits",
      timestamps: true,
    }
  );

  Habit.associate = (models) => {
    Habit.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return Habit;
};

export default Habit;
