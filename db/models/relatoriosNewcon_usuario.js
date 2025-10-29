"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RelatoriosNewcon_usuario extends Model {
    static associate(models) {
      models.relatoriosnewcon_usuario.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      models.relatoriosnewcon_usuario.belongsTo(models.relatoriosnewcon, {
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
      modelName: "relatoriosnewcon_usuario",
      freezeTableName: true,
    }
  );

  return RelatoriosNewcon_usuario;
};
