"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RelatoriosNewcon extends Model {
    static associate(models) {
      models.relatoriosnewcon.belongsToMany(models.usuarios, {
        through: models.relatoriosnewcon_usuario,
        foreignKey: "relatorio_id",
        otherKey: "id_usuario",
      });
    }
  }
  RelatoriosNewcon.init(
    {
      descricao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "relatoriosnewcon",
      freezeTableName: true,
    }
  );

  return RelatoriosNewcon;
};
