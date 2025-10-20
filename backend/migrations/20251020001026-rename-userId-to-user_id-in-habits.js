import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("habits", "userId", "user_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("habits", "user_id", "userId");
  },
};
