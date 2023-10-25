'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('mural_descricao','id_usuario',{
      type: 'foreign key',
      name: 'id_usuario_fk',
      references:{
        model : 'usuarios',
        key : 'id' 
      }
    })

  },

  async down (queryInterface, Sequelize) {
    
     await queryInterface.removeConstraint('id_usuario_fk');
    
  }
};