"use strict";

/**
 * Migration para:
 *  - garantir createdAt e updatedAt com DEFAULT CURRENT_TIMESTAMP / ON UPDATE
 *  - adicionar UNIQUE (id_pagina, id_usuario)
 *
 * Observação: esta migration usa queryInterface.describeTable para detectar se as colunas já existem.
 * Teste em staging antes de aplicar em produção e faça backup do DB.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = "paginas_usuario";

    // 1) Verifica colunas existentes
    const tableDesc = await queryInterface.describeTable(table);

    // 2) createdAt: adiciona ou altera para DEFAULT CURRENT_TIMESTAMP
    if (!tableDesc.createdAt) {
      await queryInterface.addColumn(table, "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    } else {
      await queryInterface.changeColumn(table, "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    // 3) updatedAt: adiciona ou altera para DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    if (!tableDesc.updatedAt) {
      await queryInterface.addColumn(table, "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      });
    } else {
      await queryInterface.changeColumn(table, "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      });
    }

    // 4) adiciona índice único (prevent duplicate pairs)
    // Verifica se já existe um índice com mesmo nome
    const indexName = "uk_pagina_usuario";
    // queryInterface.showIndex pode não existir em todas versões; tentamos criar e ignorar erro se já existir
    try {
      await queryInterface.addIndex(table, ["id_pagina", "id_usuario"], {
        unique: true,
        name: indexName,
      });
    } catch (err) {
      // se o índice já existir, ignoramos
      console.log(
        `addIndex: possível índice já existe (${indexName}) — ignorando.`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = "paginas_usuario";

    // 1) remove índice único se existir
    try {
      await queryInterface.removeIndex(table, "uk_pagina_usuario");
    } catch (err) {
      console.log(
        "removeIndex: índice uk_pagina_usuario não encontrado ou erro ao remover — ignorando."
      );
    }

    // 2) reverte changed columns: torna nullable e remove default (voltar ao estado "neutro")
    // OBS: não removemos as colunas mesmo que tenham sido criadas, para evitar perda de dados; em vez disso
    // definimos allowNull: true e retiramos defaultValue.
    try {
      await queryInterface.changeColumn(table, "createdAt", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    } catch (err) {
      console.log(
        "changeColumn(createdAt) falhou - possivelmente coluna não existe. Ignorando."
      );
    }

    try {
      await queryInterface.changeColumn(table, "updatedAt", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    } catch (err) {
      console.log(
        "changeColumn(updatedAt) falhou - possivelmente coluna não existe. Ignorando."
      );
    }
  },
};
