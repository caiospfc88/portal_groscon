'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('paginas_usuario', [
      {
        id_pagina: 1,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina: 2,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina: 3,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina: 4,
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_pagina: 5,
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
