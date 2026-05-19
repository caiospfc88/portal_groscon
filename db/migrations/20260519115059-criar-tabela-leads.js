"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("leads", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      origem: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      interesse: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Status removido!
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true, // Já garante que não é obrigatório no banco
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "usuarios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      encaminhado_para: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      data_primeiro_contato: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      data_encaminhamento: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("leads");
  },
};
