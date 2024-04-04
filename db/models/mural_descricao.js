"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mural_descricao extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.mural_descricao.belongsTo(models.usuarios);
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
    }
  );

  /*Mural_descricao.associate = models => {
    models.mural_descricao.belongsTo(models.usuarios);
  }*/

  return Mural_descricao;
};
