"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("leads", "cidade", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("leads", "estado", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("leads", "cidade");
    await queryInterface.removeColumn("leads", "estado");
  },
};
