"use strict";

const relatorios = [
  "quitados",
  "fechamentoRecuperação",
  "relatorioAproveitamento",
  "relatorioAniversariantes",
  "relatorioPerfilVendas",
  "situacaoCotasEstado",
  "cotasClientesAtivos",
  "cotasNaoContempParQuitacao",
  "cotasPagasAtrasoSemMultaJuros",
  "relatorioValoresDevolver",
  "relatorioVendasTabelaComissao",
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const rows = relatorios.map((value) => ({
      descricao: value,
      createdAt: now,
      updatedAt: now,
    }));

    // Ajuste o nome da tabela se for diferente
    return queryInterface.bulkInsert("relatoriosNewcon", rows, {
      ignoreDuplicates: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "relatoriosNewcon",
      { descricao: relatorios },
      {}
    );
  },
};
