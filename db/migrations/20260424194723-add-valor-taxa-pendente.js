"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona a coluna na tabela existente
    await queryInterface.addColumn(
      "historico_recuperacao",
      "valor_taxa_pendente",
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true, // Permite nulo para os registros antigos não quebrarem
        defaultValue: 0.0, // Define 0 como padrão
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Se precisar desfazer a migration, ele remove a coluna
    await queryInterface.removeColumn(
      "historico_recuperacao",
      "valor_taxa_pendente",
    );
  },
};
