"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "frequency_options",
      [
        { name: "毎日", created_at: new Date(), updated_at: new Date() },
        { name: "週に1回", created_at: new Date(), updated_at: new Date() },
        { name: "週に2回", created_at: new Date(), updated_at: new Date() },
        { name: "週に3回", created_at: new Date(), updated_at: new Date() },
        { name: "週に4回", created_at: new Date(), updated_at: new Date() },
        { name: "週に5回", created_at: new Date(), updated_at: new Date() },
        { name: "週に6回", created_at: new Date(), updated_at: new Date() },
        { name: "毎週", created_at: new Date(), updated_at: new Date() },
        { name: "隔週", created_at: new Date(), updated_at: new Date() },
        { name: "毎月", created_at: new Date(), updated_at: new Date() },
        { name: "毎年", created_at: new Date(), updated_at: new Date() },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("frequency_options", null, {});
  },
};
