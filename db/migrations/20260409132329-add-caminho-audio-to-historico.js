"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("historico_recuperacao", "caminho_audio", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("historico_recuperacao", "caminho_audio");
  },
};
