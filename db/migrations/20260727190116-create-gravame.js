'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gravames', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      chassi: {
        type: Sequelize.STRING
      },
      contrato: {
        type: Sequelize.STRING
      },
      documento_financiado: {
        type: Sequelize.STRING
      },
      status_b3: {
        type: Sequelize.STRING
      },
      numero_apontamento: {
        type: Sequelize.STRING
      },
      codigo_retorno: {
        type: Sequelize.INTEGER
      },
      mensagem_retorno: {
        type: Sequelize.STRING
      },
      payload_enviado: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('gravames');
  }
};