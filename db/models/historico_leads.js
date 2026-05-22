"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HistoricoLeads extends Model {
    static associate(models) {
      // Pertence a um Lead
      models.historico_leads.belongsTo(models.leads, {
        foreignKey: "lead_id",
        as: "lead",
      });
      // Foi registrado por um Usuário (Atendente/Vendedor)
      models.historico_leads.belongsTo(models.usuarios, {
        foreignKey: "usuario_id",
        as: "registrado_por",
      });
    }
  }

  HistoricoLeads.init(
    {
      lead_id: DataTypes.INTEGER,
      usuario_id: DataTypes.INTEGER,
      descricao: DataTypes.TEXT,
    },
    { sequelize, modelName: "historico_leads" },
  );

  return HistoricoLeads;
};
