'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('mural_dados', 'dt_alteracao', {
          type: Sequelize.DataTypes.STRING,
          after: 'vendas_franca'
        }, { transaction: t })
      ]);
    })
  },

  async down (queryInterface, Sequelize) {
    
  }
};
