/**
 * @description ユーザーモデルを定義するファイルです。Sequelizeを使用してユーザーテーブルのスキーマを定義します。
 */

/**
 * Userモデルを定義します。
 * @param {object} sequelize - Sequelizeインスタンス。
 * @param {object} DataTypes - Sequelizeのデータ型。
 * @returns {object} Userモデル。
 */
const User = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // ユーザーID: 主キー, 自動増分
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // ユーザー名: 最大50文字, NULL不可, ユニーク
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      // パスワードハッシュ: TEXT型, NULL不可
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // 作成日時: DATE型, NULL不可, デフォルトは現在時刻
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      // 更新日時: DATE型, NULL不可, デフォルトは現在時刻
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      // テーブル名を指定
      tableName: "users",
      // タイムスタンプ (createdAt, updatedAt) を自動的に管理
      timestamps: true,
    }
  );

  return User;
};

export default User;
