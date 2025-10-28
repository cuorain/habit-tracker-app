'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('habits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      habit_type: {
        type: Sequelize.ENUM('BOOLEAN', 'NUMERIC_DURATION', 'NUMERIC_COUNT'),
        allowNull: false,
        defaultValue: 'BOOLEAN',
      },
      target_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      target_unit: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      target_frequency_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'frequency_options',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        defaultValue: 1,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('habits');
  }
};
