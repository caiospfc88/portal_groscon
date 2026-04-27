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

      // === ADICIONE ESTA RELAÇÃO AQUI ===
      // Dizemos que um histórico pode ter vários pagamentos vinculados
      this.hasMany(models.pagamentos_recuperacao, {
        foreignKey: "id_historico_recuperacao",
        as: "pagamentos", // O apelido "as" deve ser igual ao que você usou no Controller
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
      // NOVO CAMPO FINANCEIRO (10 dígitos no total, 2 após a vírgula)
      valor_taxa_pendente: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "historico_recuperacao",
      freezeTableName: true,
    },
  );

  return HistoricoRecuperacao;
};
