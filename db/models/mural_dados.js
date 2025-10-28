"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mural_dados extends Model {
    static associate(models) {
      // pertence a mural_descricao usando a FK existente no banco
      models.mural_dados.belongsTo(models.mural_descricao, {
        foreignKey: "id_mural_descricao",
        as: "muralDescricao", // alias legível para usar em include
      });
    }
  }
  Mural_dados.init(
    {
      ano: DataTypes.INTEGER,
      mes: DataTypes.INTEGER,
      valor: DataTypes.FLOAT,
      id_mural_descricao: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "mural_dados",
      freezeTableName: true,
    }
  );

  return Mural_dados;
};
