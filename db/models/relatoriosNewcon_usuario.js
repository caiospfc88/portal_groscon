"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RelatoriosNewcon_usuario extends Model {
    static associate(models) {
      models.relatoriosNewcon_usuario.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      models.relatoriosNewcon_usuario.belongsTo(models.relatoriosNewcon, {
        foreignKey: "relatorio_id",
      });
    }
  }

  RelatoriosNewcon_usuario.init(
    {
      relatorio_id: DataTypes.INTEGER,
      id_usuario: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "relatoriosNewcon_usuario", // mantém referência usada no código
      tableName: "relatoriosnewcon_usuario", // <-- nome exato da tabela no MySQL (lowercase)
      freezeTableName: true,
      timestamps: true, // ajuste se sua tabela NÃO tiver createdAt/updatedAt
    }
  );

  return RelatoriosNewcon_usuario;
};
