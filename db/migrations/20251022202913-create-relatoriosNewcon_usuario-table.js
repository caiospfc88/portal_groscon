"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("relatoriosNewcon_usuario", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      relatorio_id: {
        // FK para relatoriosNewcon
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        // FK para usuarios (mesmo nome que você usa no pivot anterior)
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // adiciona constraints FK
    await queryInterface.addConstraint("relatoriosNewcon_usuario", {
      fields: ["id_usuario"],
      type: "foreign key",
      name: "rn_usuario_fk",
      references: {
        table: "usuarios",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("relatoriosNewcon_usuario", {
      fields: ["relatorio_id"],
      type: "foreign key",
      name: "rn_relatorio_fk",
      references: {
        table: "relatoriosNewcon",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // índice único para evitar duplicatas
    await queryInterface.addIndex(
      "relatoriosNewcon_usuario",
      ["relatorio_id", "id_usuario"],
      {
        name: "uk_relatorio_usuario",
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // remove índice e FKs antes de dropar a tabela
    try {
      await queryInterface.removeIndex(
        "relatoriosNewcon_usuario",
        "uk_relatorio_usuario"
      );
    } catch (e) {}
    try {
      await queryInterface.removeConstraint(
        "relatoriosNewcon_usuario",
        "rn_usuario_fk"
      );
    } catch (e) {}
    try {
      await queryInterface.removeConstraint(
        "relatoriosNewcon_usuario",
        "rn_relatorio_fk"
      );
    } catch (e) {}

    await queryInterface.dropTable("relatoriosNewcon_usuario");
  },
};
