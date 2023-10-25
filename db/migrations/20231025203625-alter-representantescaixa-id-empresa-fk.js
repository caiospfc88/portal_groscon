'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('representantes_caixa','id_empresa',{
      type: 'foreign key',
      name: 'id_empresa_fk',
      references:{
        model : 'empresa',
        key : 'id' 
      }
    })

  },

  async down (queryInterface, Sequelize) {
    
     await queryInterface.removeConstraint('id_empresa_fk');
    
  }
};
