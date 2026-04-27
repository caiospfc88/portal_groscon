"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PagamentosRecuperacao extends Model {
    static associate(models) {
      // Define que este pagamento pertence a uma interação do histórico
      this.belongsTo(models.historico_recuperacao, {
        foreignKey: "id_historico_recuperacao",
        as: "historico",
      });
    }
  }

  PagamentosRecuperacao.init(
    {
      id_historico_recuperacao: DataTypes.INTEGER,
      parcela: DataTypes.INTEGER,
      numero_aviso: DataTypes.INTEGER,
      data_pagamento: DataTypes.STRING,
      valor_seguro: DataTypes.DECIMAL(10, 2),
      valor_fc: DataTypes.DECIMAL(10, 2),
      valor_tx: DataTypes.DECIMAL(10, 2),
      valor_multa: DataTypes.DECIMAL(10, 2),
      valor_juros: DataTypes.DECIMAL(10, 2),
      total_pago: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "pagamentos_recuperacao",
      freezeTableName: true, // Impede o Sequelize de pluralizar para "pagamentos_recuperacaos"
    },
  );

  return PagamentosRecuperacao;
};
