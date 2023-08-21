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
      ano: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      mes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tipo: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'mural_descricao',
            schema: 'portal_groscon'
          },
          key: 'id'
        },
      },
      valor: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then((queryInterface, Sequelize) => {
      queryInterface.addIndex(
        'AnoMes',
        ['ano', 'mes'],
        {
          type: 'UNIQUE'
        }
      );
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mural_dados');
  }
};