"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Leads extends Model {
    static associate(models) {
      models.leads.belongsTo(models.usuarios, {
        foreignKey: "usuario_id",
        as: "cadastrado_por",
      });
    }
  }

  Leads.init(
    {
      nome: DataTypes.STRING,
      telefone: DataTypes.STRING,
      email: DataTypes.STRING,
      origem: DataTypes.STRING,
      interesse: DataTypes.STRING,
      observacoes: DataTypes.TEXT,
      usuario_id: DataTypes.INTEGER,
      encaminhado_para: DataTypes.STRING,
      data_primeiro_contato: DataTypes.DATE,
      data_encaminhamento: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "leads",
    },
  );

  return Leads;
};
