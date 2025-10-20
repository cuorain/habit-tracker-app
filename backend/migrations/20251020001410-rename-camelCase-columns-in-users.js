import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "passwordHash", "password_hash");
    await queryInterface.renameColumn("users", "createdAt", "created_at");
    await queryInterface.renameColumn("users", "updatedAt", "updated_at");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "password_hash", "passwordHash");
    await queryInterface.renameColumn("users", "created_at", "createdAt");
    await queryInterface.renameColumn("users", "updated_at", "updatedAt");
  },
};
