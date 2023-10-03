'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paginas_usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_pagina: {
        type: Sequelize.INTEGER,
        allowNull : false,
        references: { 
            model : 'paginas_portal',
            key : 'id'
        }
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull : false,
        references: { 
            model : 'usuarios',
            key : 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('paginas_usuarios');
  }
};