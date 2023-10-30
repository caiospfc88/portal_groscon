'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('paginas_usuario','id_usuario',{
      type: 'foreign key',
      name: 'id_usuario_fk2',
      references:{
        model : 'usuarios',
        key : 'id' 
      }
    }),
    await queryInterface.addConstraint('paginas_usuario','id_pagina',{
      type: 'foreign key',
      name: 'id_pagina_fk',
      references:{
        model : 'paginas_portal',
        key : 'id' 
      }
    })

  },

  async down (queryInterface, Sequelize) {
    
     await queryInterface.removeConstraint('id_usuario_fk2');
     await queryInterface.removeConstraint('id_pagina_fk'); 
  }
};
