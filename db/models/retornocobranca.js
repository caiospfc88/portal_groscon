// db/models/RetornoCobranca.js (atualize arquivo existente)
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RetornoCobranca extends Model {
    static associate(models) {
      // associações
      // tabela usuarios no seu projeto provavelmente se chama 'usuarios'
      RetornoCobranca.belongsTo(
        models.usuarios || models.Usuarios || models.usuarios,
        {
          foreignKey: "id_usuario",
          as: "usuario",
        }
      );
    }
  }
  RetornoCobranca.init(
    {
      Contrato: DataTypes.STRING,
      Valor: DataTypes.DECIMAL,
      StatusID: DataTypes.INTEGER,
      Status: DataTypes.STRING,
      EnviaEmail: DataTypes.BOOLEAN,
      UrlPagamento: DataTypes.STRING,
      Hash: DataTypes.STRING,
      CodigoERP: DataTypes.STRING,
      // novos campos
      taxa: DataTypes.FLOAT,
      nome: DataTypes.STRING,
      id_usuario: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "RetornoCobranca",
      tableName: "retornocobrancas",
      freezeTableName: true,
    }
  );
  return RetornoCobranca;
};
