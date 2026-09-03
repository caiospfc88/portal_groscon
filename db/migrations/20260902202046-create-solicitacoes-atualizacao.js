"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("solicitacoes_atualizacao", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cpf_cnpj: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grupo: {
        type: Sequelize.STRING,
      },
      cota: {
        type: Sequelize.STRING,
      },
      versao: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING, // 'PENDENTE', 'APROVADO', 'REJEITADO'
        defaultValue: "PENDENTE",
        allowNull: false,
      },
      dados_alterados: {
        type: Sequelize.TEXT, // Salvamos o JSON das alterações aqui
      },
      comprovante_endereco: {
        type: Sequelize.STRING, // Caminho físico salvo no servidor interno
      },
      ip_origem: {
        type: Sequelize.STRING,
      },
      usuario_aprovador_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios", // Nome exato da tabela no banco de dados
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // Se o usuário for deletado, não exclui o histórico da atualização, apenas anula o ID
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("solicitacoes_atualizacao");
  },
};
