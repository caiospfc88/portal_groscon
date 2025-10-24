"use strict";

const paginas = [
  "seguros",
  "muralDeDados",
  "comissoes",
  "bi",
  "relatoriosNewcon",
  "portalEmails",
  "funcoesIA",
  "relatoriosPld",
  "cliente",
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const rows = paginas.map((descricao) => ({
      descricao,
      createdAt: now,
      updatedAt: now,
    }));

    // Ajuste o nome da tabela caso sua tabela seja diferente.
    // Pelo seu model, parece ser 'paginas_portal' (freezeTableName: true).
    return queryInterface.bulkInsert("paginas_portal", rows, {
      ignoreDuplicates: true, // funciona em MySQL (ignora duplicatas)
    });
  },

  down: async (queryInterface, Sequelize) => {
    // remove apenas as linhas inseridas por este seeder
    return queryInterface.bulkDelete(
      "paginas_portal",
      { descricao: { [Sequelize.Op.in]: paginas } },
      {}
    );
  },
};
