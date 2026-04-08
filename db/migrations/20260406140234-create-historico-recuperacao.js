"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("historico_recuperacao", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_cota: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      agente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios", // Nome da tabela no banco de dados
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // Impede excluir o usuário se ele tiver históricos
      },
      canal_contato: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      situacao_cota_no_contato: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status_acordo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "AGUARDANDO_RETORNO",
      },
      observacao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("historico_recuperacao", ["id_cota"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("historico_recuperacao");
  },
};
