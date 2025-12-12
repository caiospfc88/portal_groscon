// migrations/20251212-add-fk-retornocobrancas-id_usuario.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("retornocobrancas", {
      fields: ["id_usuario"],
      type: "foreign key",
      name: "fk_retornocobrancas_id_usuario",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      "retornocobrancas",
      "fk_retornocobrancas_id_usuario"
    );
  },
};
