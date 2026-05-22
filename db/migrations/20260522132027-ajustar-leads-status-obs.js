"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona o Status de volta
    await queryInterface.addColumn("leads", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Novo",
    });

    // Remove a coluna velha de observações
    await queryInterface.removeColumn("leads", "observacoes");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("leads", "status");
    await queryInterface.addColumn("leads", "observacoes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
