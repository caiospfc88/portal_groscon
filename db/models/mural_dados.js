"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mural_dados extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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

  Mural_dados.associate = (models) => {
    models.mural_dados.belongsTo(models.mural_descricao);
  };

  return Mural_dados;
};
