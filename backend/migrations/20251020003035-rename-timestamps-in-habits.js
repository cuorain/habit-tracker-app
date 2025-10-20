import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('habits', 'createdAt', 'created_at');
    await queryInterface.renameColumn('habits', 'updatedAt', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('habits', 'created_at', 'createdAt');
    await queryInterface.renameColumn('habits', 'updated_at', 'updatedAt');
  }
};
