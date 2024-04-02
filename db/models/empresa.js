"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Empresa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Empresa.init(
    {
      nome: DataTypes.STRING,
      cnpj: DataTypes.STRING,
      cod_uni_negocio: DataTypes.STRING,
      cod_comissionado: DataTypes.STRING,
      cod_grupo_usuario: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "empresa",
      freezeTableName: true,
    }
  );

  Empresa.associate = (models) => {
    models.empresa.hasMany(models.representantes_caixa);
  };

  return Empresa;
};
