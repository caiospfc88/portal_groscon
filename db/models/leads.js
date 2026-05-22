"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Leads extends Model {
    static associate(models) {
      models.leads.belongsTo(models.usuarios, {
        foreignKey: "usuario_id",
        as: "cadastrado_por",
      });
      // Um Lead tem Vários históricos
      models.leads.hasMany(models.historico_leads, {
        foreignKey: "lead_id",
        as: "historico",
      });
    }
  }

  Leads.init(
    {
      nome: DataTypes.STRING,
      telefone: DataTypes.STRING,
      email: DataTypes.STRING,
      cidade: DataTypes.STRING,
      estado: DataTypes.STRING,
      origem: DataTypes.STRING,
      interesse: DataTypes.STRING,
      status: DataTypes.STRING,
      encaminhado_para: DataTypes.STRING,
      data_primeiro_contato: DataTypes.DATE,
      data_encaminhamento: DataTypes.DATE,
      usuario_id: DataTypes.INTEGER,
    },
    { sequelize, modelName: "leads" },
  );

  return Leads;
};
