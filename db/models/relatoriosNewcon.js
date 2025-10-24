"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RelatoriosNewcon extends Model {
    static associate(models) {
      models.relatoriosNewcon.belongsToMany(models.usuarios, {
        through: models.relatoriosNewcon_usuario,
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
      modelName: "relatoriosNewcon",
      freezeTableName: true,
    }
  );

  return RelatoriosNewcon;
};
