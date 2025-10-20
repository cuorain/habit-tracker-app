/**
 * @description Sequelize ORMを使用してデータベース接続を確立し、すべてのデータベースモデルをロードおよび関連付けを行うファイルです。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize";
import process from "process";

// ESM (ECMAScript Modules) 環境での __filename と __dirname のエミュレート
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 現在のファイル名を取得
const basename = path.basename(__filename);
// 環境変数を取得 (デフォルトは'development')
const env = process.env.NODE_ENV || "development";

// データベース設定ファイルをインポート
import config from "../config/config.json" with { type: "json" };
const envConfig = config[env];
const db = {};

let sequelize;
// 環境変数でデータベース接続情報が指定されている、かつusernameまたはpasswordがconfig.jsonに明示的に定義されていない場合
if (envConfig.use_env_variable && (!envConfig.username || !envConfig.password)) {
  sequelize = new Sequelize(process.env[envConfig.use_env_variable], envConfig);
} else {
  // それ以外の場合（例: 'test'環境でusername/passwordがconfigにまだ残っている場合、またはuse_env_variableが設定されていない場合）
  sequelize = new Sequelize(
    envConfig.database,
    envConfig.username,
    envConfig.password,
    envConfig
  );
}

/**
 * モデルファイルを非同期で読み込み、Sequelizeインスタンスにアタッチする。
 * - 現在のディレクトリ内の .js ファイルを読み込む。
 * - `index.js` 自身とテストファイルは除外する。
 */
await Promise.all(
  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 && // ドットファイルを除外
        file !== basename && // index.js 自身を除外
        file.slice(-3) === ".js" && // .js ファイルのみを対象
        file.indexOf(".test.js") === -1 // テストファイルを除外
      );
    })
    .map(async (file) => {
      // モデルファイルを動的にインポート
      const importedModule = await import(path.resolve(__dirname, file));
      const modelName = Object.keys(importedModule)[0];
      const model = importedModule[modelName](
        sequelize,
        Sequelize.DataTypes
      );
      // dbオブジェクトにモデルを追加
      db[model.name] = model;
    })
);

/**
 * モデル間の関連付け (association) を設定する。
 * 各モデルに `associate` メソッドが定義されていれば呼び出す。
 */
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sequelize インスタンスとクラスを db オブジェクトに追加してエクスポート
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { db, sequelize, Sequelize };