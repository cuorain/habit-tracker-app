import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("habits", "habitType", "habit_type");
    await queryInterface.renameColumn("habits", "targetValue", "target_value");
    await queryInterface.renameColumn("habits", "targetUnit", "target_unit");
    await queryInterface.renameColumn(
      "habits",
      "targetFrequency",
      "target_frequency"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("habits", "habit_type", "habitType");
    await queryInterface.renameColumn("habits", "target_value", "targetValue");
    await queryInterface.renameColumn("habits", "target_unit", "targetUnit");
    await queryInterface.renameColumn(
      "habits",
      "target_frequency",
      "targetFrequency"
    );
  },
};
