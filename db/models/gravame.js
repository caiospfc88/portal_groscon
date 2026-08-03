"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class gravame extends Model {
    static associate(models) {
      // Futuramente você pode associar ao model 'usuarios'
      // para saber qual operador do portal registrou o gravame
    }
  }

  gravame.init(
    {
      chassi: DataTypes.STRING,
      contrato: DataTypes.STRING,
      documento_financiado: DataTypes.STRING,
      status_b3: DataTypes.STRING,
      numero_apontamento: DataTypes.STRING,
      codigo_retorno: DataTypes.INTEGER,
      mensagem_retorno: DataTypes.STRING,
      payload_enviado: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "gravame",
    },
  );

  return gravame;
};
