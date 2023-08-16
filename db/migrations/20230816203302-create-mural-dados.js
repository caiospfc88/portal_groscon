'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mural_dados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ano_mes: {
        type: Sequelize.INTEGER,
        unique:true,
        allowNull:false
      },
      bens_entregues: {
        type: Sequelize.INTEGER
      },
      percent_inadimplencia: {
        type: Sequelize.FLOAT
      },
      bens_pendentes_entrega: {
        type: Sequelize.INTEGER
      },
      recuperacao_cotas: {
        type: Sequelize.INTEGER
      },
      boletos_dev_nao_entregues: {
        type: Sequelize.INTEGER
      },
      impressoes_n_copias: {
        type: Sequelize.INTEGER
      },
      agua: {
        type: Sequelize.FLOAT
      },
      luz: {
        type: Sequelize.FLOAT
      },
      telefone: {
        type: Sequelize.FLOAT
      },
      vendas: {
        type: Sequelize.INTEGER
      },
      vendas_franca: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('mural_dados');
  }
};