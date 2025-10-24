"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RelatoriosNewcon_usuario extends Model {
    static associate(models) {
      models.relatoriosNewcon_usuario.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      models.relatoriosNewcon_usuario.belongsTo(models.relatoriosNewcon, {
        foreignKey: "relatorio_id",
      });
    }
  }

  RelatoriosNewcon_usuario.init(
    {
      relatorio_id: DataTypes.INTEGER,
      id_usuario: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "relatoriosNewcon_usuario",
      freezeTableName: true,
    }
  );

  return RelatoriosNewcon_usuario;
};
