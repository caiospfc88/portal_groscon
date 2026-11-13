"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("contemplados_publicados", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      data_assembleia: {
        type: Sequelize.STRING(8), // Formato YYYYMMDD (ex: '20261110')
        allowNull: false,
      },
      assembleia_formatada: {
        type: Sequelize.STRING(10), // Formato dd/MM/yyyy
        allowNull: true,
      },
      grupo: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cota: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      versao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contemplacao: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      percentual_lance: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      valor_credito: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      vendedor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      data_adesao: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Índice único para evitar duplicidade da mesma cota na mesma assembleia
    await queryInterface.addIndex(
      "contemplados_publicados",
      ["data_assembleia", "grupo", "cota", "versao"],
      {
        unique: true,
        name: "idx_contemplado_unico_assembleia",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("contemplados_publicados");
  },
};
