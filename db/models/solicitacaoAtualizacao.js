"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class solicitacaoAtualizacao extends Model {}

  solicitacaoAtualizacao.init(
    {
      cpf_cnpj: DataTypes.STRING,
      grupo: DataTypes.STRING,
      cota: DataTypes.STRING,
      versao: DataTypes.STRING,
      status: DataTypes.STRING,
      dados_alterados: DataTypes.TEXT,
      comprovante_endereco: DataTypes.STRING,
      ip_origem: DataTypes.STRING,
      usuario_aprovador_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "solicitacaoAtualizacao",
      tableName: "solicitacoes_atualizacao",
    },
  );

  solicitacaoAtualizacao.associate = (models) => {
    // Uma solicitação pertence a UM usuário aprovador
    models.solicitacaoAtualizacao.belongsTo(models.usuarios, {
      foreignKey: "usuario_aprovador_id",
      as: "aprovador", // Cria o alias para você usar em consultas ex: include: 'aprovador'
    });
  };

  return solicitacaoAtualizacao;
};
