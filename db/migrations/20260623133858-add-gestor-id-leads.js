"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("leads", "gestor_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "gestores", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Se o gestor for excluído, o lead fica "sem gestor"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("leads", "gestor_id");
  },
};
