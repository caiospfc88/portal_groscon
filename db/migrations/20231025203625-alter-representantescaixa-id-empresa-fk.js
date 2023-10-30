'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('representantes_caixa',{
      fields:['id_empresa'],
      type: 'foreign key',
      name: 'id_empresa_fk',
      references:{
        table : 'empresa',
        field : 'id' 
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })

  },

  async down (queryInterface, Sequelize) {
    
     await queryInterface.removeConstraint('id_empresa_fk');
    
  }
};
