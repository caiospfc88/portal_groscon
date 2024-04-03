"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Arquivos_bradesco extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Arquivos_bradesco.init(
    {
      nome: DataTypes.STRING,
      data: DataTypes.DATE,
      contabil_ini: DataTypes.DATE,
      contabil_fin: DataTypes.DATE,
      envio_arquivo: DataTypes.DATE,
      visualiza: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "arquivos_bradesco",
      freezeTableName: true,
    }
  );
  return Arquivos_bradesco;
};
