'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.bulkInsert('mural_descricao', [
      {
        descricao : "Bens Entregues",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "% Inadimplência",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Bens Pendentes de Entrega",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Recuperações",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Boletos Dev./N Entregues",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Impressões Nº Cópias",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Água",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Luz",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Telefone",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Vendas",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Vendas Franca",
        id_usuario : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

  },

  async down (queryInterface, Sequelize) {
    
  }
};
