"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("usuarios", [
      {
        nome: "Administrador",
        sobrenome: "Portal Groscon",
        login: "Admin",
        senha: "tempDev2023",
        email: "ti@consorciogroscon.com.br",
        data_nascimento: "1988-4-07",
        celular: "16991827470",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuarios", { login: "Admin" }, {});
  },
};
