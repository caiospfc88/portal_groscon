"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Contemplados_publicados extends Model {
    static associate(models) {
      // define association here
    }
  }
  Contemplados_publicados.init(
    {
      data_assembleia: DataTypes.STRING,
      assembleia_formatada: DataTypes.STRING,
      grupo: DataTypes.INTEGER,
      cota: DataTypes.INTEGER,
      versao: DataTypes.INTEGER,
      nome: DataTypes.STRING,
      contemplacao: DataTypes.STRING,
      percentual_lance: DataTypes.STRING,
      valor_credito: DataTypes.STRING,
      vendedor: DataTypes.STRING,
      data_adesao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "contemplados_publicados",
      freezeTableName: true,
    },
  );
  return Contemplados_publicados;
};
