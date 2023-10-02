'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('paginas_usuario', [
      {
        id_pagina_portal: 1,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina_portal: 2,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina_portal: 3,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina_portal: 4,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina_portal: 5,
        id_usuario : 1,
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
