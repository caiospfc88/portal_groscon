"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("historico_leads", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "leads", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Se deletar o lead, deleta o histórico dele
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Pode ser null se a interação veio direto do Webhook do site
        references: { model: "usuarios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("historico_leads");
  },
};
