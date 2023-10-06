'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('mural_dados','id_mural_descricao',{
      type: 'foreign key',
      name: 'id_mural_descricao_fk',
      references:{
        model : 'mural_descricao',
        key : 'id' 
      }
    })

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
