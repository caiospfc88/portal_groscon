'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('paginas_portal', [
      {
        descricao : "Home",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Mural de dados",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Comissões",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Wiki Groscon",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "BI",
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
     * await queryInterface.bulkDelete('People', 1, {});
     */
  }
};
