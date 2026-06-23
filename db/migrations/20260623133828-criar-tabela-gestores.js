"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("gestores", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nome: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      ddds: { type: Sequelize.STRING, allowNull: true }, // Ex: "11,16,19"
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("gestores");
  },
};
