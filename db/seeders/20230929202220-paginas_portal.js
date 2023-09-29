'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('paginas_portal', [
      {
        descricao : "Home",
        id_usuario : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Mural de dados",
        id_usuario : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Comissões",
        id_usuario : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Wiki Groscon",
        id_usuario : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "BI",
        id_usuario : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

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
