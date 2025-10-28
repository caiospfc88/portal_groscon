"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mural_descricao extends Model {
    static associate(models) {
      // garante que a associação use a mesma FK (evita que o Sequelize crie muralDescricaoId)
      models.mural_descricao.hasMany(models.mural_dados, {
        foreignKey: "id_mural_descricao",
        as: "dados", // alias legível para usar em include
      });

      models.mural_descricao.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
        as: "usuario", // alias legível
      });
    }
  }
  Mural_descricao.init(
    {
      descricao: DataTypes.STRING,
      id_usuario: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "mural_descricao",
      freezeTableName: true,
    }
  );

  return Mural_descricao;
};
