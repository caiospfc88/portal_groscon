"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RelatoriosNewcon extends Model {
    static associate(models) {
      // usar a string do nome da tabela pivot garante que o Sequelize monte a query com o nome exato
      models.relatoriosNewcon.belongsToMany(models.usuarios, {
        through: "relatoriosnewcon_usuario", // <-- nome exato da pivot no DB
        foreignKey: "relatorio_id",
        otherKey: "id_usuario",
      });
    }
  }

  RelatoriosNewcon.init(
    {
      descricao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "relatoriosNewcon", // mantém compatibilidade com o que já usa no código
      tableName: "relatoriosnewcon", // <-- nome exato da tabela no MySQL (lowercase)
      freezeTableName: true,
      timestamps: true, // ajuste se necessário
    }
  );

  return RelatoriosNewcon;
};
