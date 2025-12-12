// migrations/20251212-add-colunas-retornocobrancas.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("retornocobrancas", "taxa", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn("retornocobrancas", "nome", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    });

    await queryInterface.addColumn("retornocobrancas", "id_usuario", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addIndex("retornocobrancas", ["id_usuario"], {
      name: "idx_retornocobrancas_id_usuario",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      "retornocobrancas",
      "idx_retornocobrancas_id_usuario"
    );
    await queryInterface.removeColumn("retornocobrancas", "id_usuario");
    await queryInterface.removeColumn("retornocobrancas", "nome");
    await queryInterface.removeColumn("retornocobrancas", "taxa");
  },
};
