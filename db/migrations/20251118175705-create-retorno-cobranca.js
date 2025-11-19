"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RetornoCobrancas", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      Contrato: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      Valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      StatusID: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      Status: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      EnviaEmail: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },

      UrlPagamento: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      Hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      CodigoERP: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("RetornoCobrancas");
  },
};
