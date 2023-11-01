'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('arquivos_bradesco', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.DATE
      },
      contabil_ini: {
        type: Sequelize.DATE
      },
      contabil_fin: {
        type: Sequelize.DATE
      },
      envio_arquivo: {
        type: Sequelize.DATE
      },
      visualiza: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('arquivos_bradesco');
  }
};