/**
 * @description Sequelize ORMを使用してデータベース接続を確立し、すべてのデータベースモデルをロードおよび関連付けを行うファイルです。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize";
import process from "process";

const db = {};

const initializeSequelize = async () => {
  const currentFilename = fileURLToPath(import.meta.url);
  const currentDirname = path.dirname(currentFilename);
  const basename = path.basename(currentFilename);
  const env = process.env.NODE_ENV || "development";

  const configModule = await import("../config/config.json", { assert: { type: "json" } });
  const config = configModule.default;
  const envConfig = config[env];

  let sequelizeInstance;
  if (envConfig.use_env_variable && (!envConfig.username || !envConfig.password)) {
    sequelizeInstance = new Sequelize(process.env[envConfig.use_env_variable], envConfig);
  } else {
    sequelizeInstance = new Sequelize(
      envConfig.database,
      envConfig.username,
      envConfig.password,
      envConfig
    );
  }

  await Promise.all(
    fs
      .readdirSync(currentDirname)
      .filter((file) => {
        return (
          file.indexOf(".") !== 0 && 
          file !== basename && 
          file.slice(-3) === ".js" && 
          file.indexOf(".test.js") === -1 
        );
      })
      .map(async (file) => {
        const model = (await import(path.resolve(currentDirname, file))).default(
          sequelizeInstance,
          Sequelize.DataTypes
        );
        db[model.name] = model;
      })
  );

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.User.hasMany(db.Habit, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  db.sequelize = sequelizeInstance;
  db.Sequelize = Sequelize;

  return db;
};

export default initializeSequelize;
