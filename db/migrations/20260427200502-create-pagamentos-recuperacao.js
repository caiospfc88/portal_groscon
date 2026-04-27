"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pagamentos_recuperacao", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_historico_recuperacao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "historico_recuperacao", // Amarra com a tabela pai!
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Se deletar a interação, deleta os pagamentos vinculados a ela
      },
      parcela: { type: Sequelize.INTEGER },
      numero_aviso: { type: Sequelize.INTEGER },
      data_pagamento: { type: Sequelize.STRING },
      valor_seguro: { type: Sequelize.DECIMAL(10, 2) },
      valor_fc: { type: Sequelize.DECIMAL(10, 2) },
      valor_tx: { type: Sequelize.DECIMAL(10, 2) },
      valor_multa: { type: Sequelize.DECIMAL(10, 2) },
      valor_juros: { type: Sequelize.DECIMAL(10, 2) },
      total_pago: { type: Sequelize.DECIMAL(10, 2) },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pagamentos_recuperacao");
  },
};
