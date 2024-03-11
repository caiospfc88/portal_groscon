"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Representantes_caixa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Representantes_caixa.init(
    {
      nome: DataTypes.STRING,
      nome_empresa: DataTypes.STRING,
      usuario_caixa: DataTypes.STRING,
      email: DataTypes.STRING,
      cpf: DataTypes.STRING,
      data_nascimento: DataTypes.DATE,
      tipo: DataTypes.INTEGER,
      estado: DataTypes.STRING,
      cidade: DataTypes.STRING,
      ddd: DataTypes.INTEGER,
      telefone: DataTypes.INTEGER,
      ativo: DataTypes.BOOLEAN,
      data_desligamento: DataTypes.DATE,
      data_cadastro: DataTypes.DATE,
      status_caixa: DataTypes.BOOLEAN,
      id_empresa: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "representantes_caixa",
    }
  );

  Representantes_caixa.associate = (models) => {
    models.representantes_caixa.belongsTo(models.empresa);
  };

  return Representantes_caixa;
};
