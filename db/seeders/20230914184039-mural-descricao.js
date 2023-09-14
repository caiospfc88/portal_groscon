'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.bulkInsert('usuarios', [
      {
        descricao : "Bens Entregues",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "% Inadimplência",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Bens Pendentes de Entrega",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Recuperações",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Boletos Dev./N Entregues",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Impressões Nº Cópias",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Água",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Luz",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Telefone",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Vendas",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        descricao : "Vendas Franca",
        responsavel: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

  },

  async down (queryInterface, Sequelize) {
    
  }
};
