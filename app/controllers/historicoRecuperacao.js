// src/controllers/historicoRecuperacao.js
const models = require("../../db/models");
const { Op } = require("sequelize");
const dbConnection = require("../../config/dbConnection");
const ConsultasDAO = require("../models/ConsultasDAO")();

module.exports.listarHistorico = async function (req, res) {
  try {
    const { dataInicial, dataFinal } = req.query;
    let whereClause = {};

    // Filtro de datas com segurança de fuso horário
    if (dataInicial && dataFinal) {
      whereClause.createdAt = {
        [Op.gte]: new Date(`${dataInicial.substring(0, 10)}T00:00:00.000Z`),
        [Op.lte]: new Date(`${dataFinal.substring(0, 10)}T23:59:59.999Z`),
      };
    }

    var historico = await models.historico_recuperacao.findAll({
      where: whereClause,
      include: [
        {
          model: models.usuarios,
          as: "agente",
          attributes: ["id", "nome"],
        },
        // === ADICIONE ESTE BLOCO AQUI ===
        {
          model: models.pagamentos_recuperacao,
          as: "pagamentos", // O mesmo alias que você colocou no associate do model pai
        },
      ],
    });

    res.send(historico);
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao listar histórico", error: error.message });
  }
};

module.exports.statusEmLote = async function (req, res) {
  try {
    const { ids_cotas } = req.body;
    if (!ids_cotas || !ids_cotas.length) return res.send([]);

    const historicos = await models.historico_recuperacao.findAll({
      where: { id_cota: ids_cotas },
      order: [["createdAt", "DESC"]],
    });

    const statusRecentes = [];
    const map = new Set();
    for (let h of historicos) {
      if (!map.has(h.id_cota)) {
        statusRecentes.push({
          id_cota: h.id_cota,
          status_acordo: h.status_acordo,
        });
        map.add(h.id_cota);
      }
    }

    res.send(statusRecentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.atualizarHistorico = async function (req, res) {
  try {
    const id = req.params.id;
    const { status_acordo, observacao } = req.body;

    await models.historico_recuperacao.update(
      { status_acordo, observacao },
      { where: { id: id } },
    );

    res.status(200).json({ Msg: "Atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ Msg: "Erro ao atualizar", error: error.message });
  }
};

module.exports.consultarHistorico = async function (req, res) {
  try {
    var historico = await models.historico_recuperacao.findOne({
      where: { id: req.query.id },
    });
    res.send(historico);
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao consultar histórico", error: error.message });
  }
};

module.exports.cadastrarHistorico = async function (req, res) {
  try {
    const caminhoAudio = req.file ? req.file.filename : null;

    // Monta o pacote de dados básico
    const dadosParaSalvar = {
      id_cota: req.body.id_cota,
      agente_id: req.body.agente_id,
      canal_contato: req.body.canal_contato,
      situacao_cota_no_contato: req.body.situacao_cota_no_contato,
      status_acordo: req.body.status_acordo,
      observacao: req.body.observacao,
      id_envio_email: req.body.id_envio_email,
      caminho_audio: caminhoAudio,
      valor_taxa_pendente: req.body.valor_taxa_pendente
        ? parseFloat(req.body.valor_taxa_pendente)
        : 0,
    };

    if (req.body.data_retroativa) {
      dadosParaSalvar.createdAt = new Date(req.body.data_retroativa);
    }

    var historico = await models.historico_recuperacao.create(dadosParaSalvar);

    // ==========================================
    // NOVO: SALVAR PAGAMENTOS VINCULADOS
    // ==========================================
    if (req.body.pagamentos_vinculados) {
      const pagamentosFront = JSON.parse(req.body.pagamentos_vinculados);

      const pagamentosParaSalvar = pagamentosFront.map((p) => ({
        id_historico_recuperacao: historico.id,
        parcela: p.Parcela,
        numero_aviso: p["Numero Aviso"],
        data_pagamento: p["Data Pagamento"],
        valor_seguro: p["Valor Seguro"],
        valor_fc: p["Valor FC"],
        valor_tx: p["Valor TX"],
        valor_multa: p["Valor Multa"],
        valor_juros: p["Valor Juros"],
        total_pago: p["Total Pago"],
      }));

      await models.pagamentos_recuperacao.bulkCreate(pagamentosParaSalvar);
    }

    res.json({ Historico: historico.id, Msg: "Registrado com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao cadastrar histórico", error: error.message });
  }
};

module.exports.alterarHistorico = async function (req, res) {
  try {
    var historico = await models.historico_recuperacao.findOne({
      where: { id: req.body.id },
    });
    if (historico) {
      await historico.update(req.body);
      res.json({ Historico: historico, Msg: "Atualizado com sucesso!" });
    } else {
      res.status(404).json({ Msg: "Registro não encontrado." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao alterar histórico", error: error.message });
  }
};

module.exports.excluirHistorico = async function (req, res) {
  try {
    var historico = await models.historico_recuperacao.findOne({
      where: { id: req.body.id },
    });
    if (historico) {
      await historico.destroy();
      res.json({ Msg: "Excluído com sucesso!" });
    } else {
      res.status(404).json({ Msg: "Registro não encontrado." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao excluir histórico", error: error.message });
  }
};

module.exports.sincronizarTaxasAntigas = async function (req, res) {
  try {
    // 1. Busca todos os históricos locais que estão com a taxa zerada
    const historicosZerados = await models.historico_recuperacao.findAll({
      where: {
        [Op.or]: [{ valor_taxa_pendente: null }, { valor_taxa_pendente: 0 }],
      },
      attributes: ["id", "id_cota"],
    });

    if (historicosZerados.length === 0) {
      return res.status(200).json({
        Msg: "Nenhum histórico precisando de atualização! Tudo em dia.",
      });
    }

    // 2. Pega apenas os IDs únicos das cotas para não sobrecarregar o ERP
    const idsCotasUnicos = [
      ...new Set(historicosZerados.map((h) => h.id_cota)),
    ];

    // 3. Chama o ERP para descobrir os valores financeiros
    const conexao = dbConnection();
    const dao = new ConsultasDAO(conexao);

    const taxasErp = await dao.buscarTaxasPorIds(idsCotasUnicos);

    // Cria um mapa para achar os valores super rápido (ID_COTA -> Valor)
    const mapaTaxas = new Map();
    taxasErp.forEach((item) => {
      mapaTaxas.set(item.ID_COTA, parseFloat(item.valor_taxa) || 0);
    });

    // 4. Salva no MySQL os valores encontrados
    let atualizados = 0;
    for (let historico of historicosZerados) {
      const valorNovo = mapaTaxas.get(historico.id_cota);

      if (valorNovo && valorNovo > 0) {
        await models.historico_recuperacao.update(
          { valor_taxa_pendente: valorNovo },
          { where: { id: historico.id } },
        );
        atualizados++;
      }
    }

    res.status(200).json({
      Msg: "Sincronização Finalizada com Sucesso!",
      total_encontrados: historicosZerados.length,
      atualizados: atualizados,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ Msg: "Erro ao sincronizar taxas", error: error.message });
  }
};

// --- NOVO: BUSCAR PAGAMENTOS PARA O MODAL FRONT-END ---
module.exports.buscarPagamentosCota = async function (req, res) {
  try {
    const idCota = req.query.id_cota;

    if (!idCota) {
      return res.status(400).json({ Msg: "ID da cota é obrigatório." });
    }

    const conexao = dbConnection();
    const dao = new ConsultasDAO(conexao);

    const pagamentos = await dao.buscarPagamentosCota(idCota);
    res.status(200).json(pagamentos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ Msg: "Erro ao buscar pagamentos", error: error.message });
  }
};
