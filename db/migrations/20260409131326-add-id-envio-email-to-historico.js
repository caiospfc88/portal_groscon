"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("historico_recuperacao", "id_envio_email", {
      type: Sequelize.STRING,
      allowNull: true, // Tem que ser true, pois Wpp e Telefone não terão esse ID
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "historico_recuperacao",
      "id_envio_email",
    );
  },
};
