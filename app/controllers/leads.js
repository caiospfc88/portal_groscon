// app/controllers/leads.js
const models = require("../../db/models");
const { Sequelize, Op } = require("sequelize");

const sequelize = models.sequelize;

module.exports.listarLeads = async function (req, res) {
  try {
    const { dataInicio, dataFim } = req.query;
    let whereCondition = {};

    if (dataInicio && dataFim) {
      whereCondition.data_primeiro_contato = {
        [Op.between]: [`${dataInicio} 00:00:00`, `${dataFim} 23:59:59`],
      };
    }

    const leads = await models.leads.findAll({
      where: whereCondition,
      order: [
        ["data_primeiro_contato", "DESC"],
        [
          { model: models.historico_leads, as: "historico" },
          "createdAt",
          "DESC",
        ], // Ordena o histórico do mais novo pro mais antigo
      ],
      include: [
        {
          model: models.historico_leads,
          as: "historico",
          include: [
            {
              model: models.usuarios,
              as: "registrado_por",
              attributes: ["nome", "sobrenome"], // Traz o nome de quem fez a anotação
            },
          ],
        },
      ],
    });

    res.json(leads);
  } catch (err) {
    console.error("Erro listarLeads:", err);
    res.status(500).json({ error: "Erro ao listar leads" });
  }
};

module.exports.listarEncaminhamentos = async function (req, res) {
  try {
    const sql = `
      SELECT DISTINCT encaminhado_para 
      FROM leads 
      WHERE encaminhado_para IS NOT NULL AND encaminhado_para != ''
    `;

    const rows = await sequelize.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const descricoes = rows.map((r) => String(r.encaminhado_para));
    return res.json(descricoes);
  } catch (err) {
    console.error("Erro listarEncaminhamentos:", err);
    return res
      .status(500)
      .json({ error: "Erro ao buscar sugestões de encaminhamento" });
  }
};

module.exports.cadastrarLead = async function (req, res) {
  const transaction = await sequelize.transaction(); // Usando transaction para garantir que crie tudo ou cancele tudo
  try {
    const novoLead = await models.leads.create(
      {
        nome: req.body.nome,
        telefone: req.body.telefone,
        email: req.body.email,
        origem: req.body.origem,
        interesse: req.body.interesse,
        status: req.body.status || "Novo", // Status padrão
        encaminhado_para: req.body.encaminhado_para,
        data_primeiro_contato: req.body.data_primeiro_contato,
        data_encaminhamento: req.body.data_encaminhamento || null,
        usuario_id: req.body.usuario_id,
      },
      { transaction },
    );

    // Se o usuário preencheu a caixa de observações ao criar, já salva como 1º histórico
    if (req.body.observacoes && req.body.observacoes.trim() !== "") {
      await models.historico_leads.create(
        {
          lead_id: novoLead.id,
          usuario_id: req.body.usuario_id,
          descricao: req.body.observacoes,
        },
        { transaction },
      );
    }

    await transaction.commit();
    res.json({ Lead: novoLead, Msg: "Cadastrado com sucesso!" });
  } catch (err) {
    await transaction.rollback();
    console.error("Erro cadastrarLead:", err);
    res.status(500).json({ error: "Erro ao cadastrar lead" });
  }
};

module.exports.alterarLead = async function (req, res) {
  try {
    const lead = await models.leads.findOne({ where: { id: req.body.id } });
    if (!lead) return res.status(404).json({ error: "Lead não encontrado" });

    // Atualiza apenas os dados cadastrais (o histórico agora é independente)
    await lead.update(req.body);
    res.json({ Lead: lead, Msg: "Atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro alterarLead:", err);
    res.status(500).json({ error: "Erro ao atualizar lead" });
  }
};

module.exports.excluirLead = async function (req, res) {
  try {
    const lead = await models.leads.findOne({ where: { id: req.body.id } });
    if (!lead) return res.status(404).json({ error: "Lead não encontrado" });

    // O banco já está configurado com CASCADE, então ao deletar o lead, o histórico dele some junto
    await lead.destroy();
    res.json({ Msg: "Excluido com sucesso!" });
  } catch (err) {
    console.error("Erro excluirLead:", err);
    res.status(500).json({ error: "Erro ao excluir lead" });
  }
};

// =========================================================================
// NOVAS FUNÇÕES PARA O CRM E WEBHOOK
// =========================================================================

module.exports.adicionarHistorico = async function (req, res) {
  try {
    const historico = await models.historico_leads.create({
      lead_id: req.body.lead_id,
      usuario_id: req.body.usuario_id,
      descricao: req.body.descricao,
      // Se vier uma data customizada do front, usamos ela. Se não, pega a data atual.
      createdAt: req.body.data_interacao
        ? new Date(req.body.data_interacao)
        : new Date(),
    });
    res.json({
      Historico: historico,
      Msg: "Histórico adicionado com sucesso!",
    });
  } catch (err) {
    console.error("Erro adicionarHistorico:", err);
    res.status(500).json({ error: "Erro ao adicionar histórico" });
  }
};

// ENDPOINT DO WEBHOOK DO SITE (Não requer JWT)
module.exports.receberLeadSite = async function (req, res) {
  const transaction = await sequelize.transaction();
  try {
    // Esses são os dados que o site vai mandar no JSON
    const { nome, telefone, email, origem, interesse, mensagem } = req.body;

    // Gera a data de hoje no formato YYYY-MM-DD para o primeiro contato
    const dataHoje = new Date().toISOString().split("T")[0];

    const novoLead = await models.leads.create(
      {
        nome: nome,
        telefone: telefone,
        email: email,
        origem: origem || "Site",
        interesse: interesse || "Não especificado",
        status: "Novo",
        data_primeiro_contato: dataHoje,
        // Webhooks não possuem usuario_id, deixamos null ou colocamos o ID de um "Robô"
      },
      { transaction },
    );

    // Se o cliente escreveu uma mensagem no site, salva no histórico
    if (mensagem && mensagem.trim() !== "") {
      await models.historico_leads.create(
        {
          lead_id: novoLead.id,
          descricao: `Mensagem enviada pelo site: \n"${mensagem}"`,
        },
        { transaction },
      );
    }

    await transaction.commit();
    // Resposta rápida para o site saber que deu certo (padrão 201 Created)
    res.status(201).json({
      success: true,
      message: "Lead recebido e integrado com sucesso!",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Erro no Webhook (receberLeadSite):", err);
    res.status(500).json({
      success: false,
      error: "Erro interno no servidor ao processar o lead",
    });
  }
};
