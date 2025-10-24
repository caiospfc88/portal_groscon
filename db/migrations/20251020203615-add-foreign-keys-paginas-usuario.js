"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verifica e adiciona apenas se não existir
    const [results] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'paginas_usuario' 
        AND CONSTRAINT_NAME = 'id_usuario_fk2'
    `);

    if (results.length === 0) {
      await queryInterface.addConstraint("paginas_usuario", {
        fields: ["id_usuario"],
        type: "foreign key",
        name: "id_usuario_fk2",
        references: {
          table: "usuarios",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
    }

    const [results2] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'paginas_usuario' 
        AND CONSTRAINT_NAME = 'id_pagina_fk'
    `);

    if (results2.length === 0) {
      await queryInterface.addConstraint("paginas_usuario", {
        fields: ["id_pagina"],
        type: "foreign key",
        name: "id_pagina_fk",
        references: {
          table: "paginas_portal",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("paginas_usuario", "id_usuario_fk2");
    await queryInterface.removeConstraint("paginas_usuario", "id_pagina_fk");
  },
};
