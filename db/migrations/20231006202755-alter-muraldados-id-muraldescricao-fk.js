'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('mural_dados',{
      fields: ['id_mural_descricao'],  
      type: 'foreign key',
      name: 'id_mural_descricao_fk',
      references:{
        table : 'mural_descricao',
        field : 'id' 
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })

  },

  async down (queryInterface, Sequelize) {
    
     await queryInterface.removeConstraint('id_mural_descricao_fk');
    
  }
};
