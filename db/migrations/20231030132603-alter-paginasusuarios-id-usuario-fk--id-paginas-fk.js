'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('paginas_usuario',{
      fields:['id_usuario'],
      type: 'foreign key',
      name: 'id_usuario_fk2',
      references:{
        table : 'usuarios',
        field : 'id' 
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    await queryInterface.addConstraint('paginas_usuario',{
      fields:['id_pagina'],
      type: 'foreign key',
      name: 'id_pagina_fk',
      references:{
        table : 'paginas_portal',
        field : 'id' 
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })

  },

  async down (queryInterface, Sequelize) {
    
     await queryInterface.removeConstraint('id_usuario_fk2');
     await queryInterface.removeConstraint('id_pagina_fk'); 
  }
};
