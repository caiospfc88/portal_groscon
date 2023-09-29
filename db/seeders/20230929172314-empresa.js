'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('empresa', [{
      nome: 'GROSCON ADMINISTRADORA DE CONSÓRCIOS LTDA',
      cnpj: '26.228.270/0001-48',
      cod_uni_negocio: '100036',
      cod_comissionado: 'GC0001',
      cod_grupo_usuario: 'GC0001',
      createdAt: new Date(),
      updatedAt: new Date()
    }])

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
