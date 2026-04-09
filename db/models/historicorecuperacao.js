"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HistoricoRecuperacao extends Model {
    static associate(models) {
      // Define que este registro pertence a um usuário
      this.belongsTo(models.usuarios, {
        foreignKey: "agente_id",
        as: "agente",
      });
    }
  }

  HistoricoRecuperacao.init(
    {
      id_cota: DataTypes.INTEGER,
      agente_id: DataTypes.INTEGER,
      canal_contato: DataTypes.STRING,
      situacao_cota_no_contato: DataTypes.STRING,
      status_acordo: DataTypes.STRING,
      observacao: DataTypes.TEXT,
      id_envio_email: DataTypes.STRING,
      caminho_audio: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "historico_recuperacao",
      freezeTableName: true,
    },
  );

  return HistoricoRecuperacao;
};
