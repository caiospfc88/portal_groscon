// app/controllers/leads.js
const models = require("../../db/models");
const { Sequelize, Op } = require("sequelize");

const sequelize = models.sequelize;

module.exports.listarLeads = async function (req, res) {
  try {
    const { dataInicio, dataFim } = req.query;
    let whereCondition = {};

    if (dataInicio && dataFim) {
      // 🌟 SOLUÇÃO BLINDADA CONTRA FUSO HORÁRIO (UTC):
      // Extraímos apenas a data (YYYY-MM-DD) da coluna no banco e comparamos direto com as strings.
      // Isso impede o Sequelize de adicionar horas e ignorar leads do primeiro dia do mês!
      whereCondition[Op.and] = [
        sequelize.where(
          sequelize.fn("DATE", sequelize.col("leads.data_primeiro_contato")),
          ">=",
          dataInicio,
        ),
        sequelize.where(
          sequelize.fn("DATE", sequelize.col("leads.data_primeiro_contato")),
          "<=",
          dataFim,
        ),
      ];
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
        {
          model: models.gestores,
          as: "gestor",
          attributes: ["id", "nome", "email"],
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
        cidade: req.body.cidade, // NOVO
        estado: req.body.estado, // NOVO
        origem: req.body.origem,
        interesse: req.body.interesse,
        status: req.body.status || "Novo",
        encaminhado_para: req.body.encaminhado_para,
        data_primeiro_contato: req.body.data_primeiro_contato,
        data_encaminhamento: req.body.data_encaminhamento || null,
        usuario_id: req.body.usuario_id,
        gestor_id: req.body.gestor_id || null,
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

    // Criamos um objeto de dados limpo
    const updateData = { ...req.body };

    // Sanitização: Se a data for vazia ou a string "Invalid date", força para null
    const camposData = ["data_primeiro_contato", "data_encaminhamento"];

    camposData.forEach((campo) => {
      if (
        !updateData[campo] ||
        updateData[campo] === "" ||
        updateData[campo] === "Invalid date"
      ) {
        updateData[campo] = null;
      }
    });

    // Atualiza apenas os dados cadastrais (o histórico agora é independente)
    await lead.update(updateData);
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
    const {
      nome,
      telefone,
      email,
      origem,
      interesse,
      mensagem,
      cidade,
      estado,
    } = req.body;
    const dataHoje = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    // 1. Extrair o DDD numérico do telefone (Pega apenas os dois primeiros dígitos numéricos)
    const numerosTelefone = telefone.replace(/\D/g, ""); // Remove tudo que não for número
    const dddCliente =
      numerosTelefone.length >= 10 ? numerosTelefone.substring(0, 2) : null;

    // 🚨 LOG 1: Vamos ver o que ele extraiu de verdade
    console.log(
      `[DEBUG ROTEAMENTO] Telefone limpo: ${numerosTelefone} | DDD Extraído: ${dddCliente}`,
    );

    let gestorEncontrado = null;

    // 2. Busca todos os gestores e procura qual tem o DDD na sua string "ddds"
    if (dddCliente) {
      const todosGestores = await models.gestores.findAll();
      console.log("[DEBUG ROTEAMENTO] Gestores encontrados no BD:");
      todosGestores.forEach((g) =>
        console.log(` - ${g.nome} atende os DDDs: [${g.ddds}]`),
      );
      gestorEncontrado = todosGestores.find((gestor) => {
        if (!gestor.ddds) return false;
        // Divide a string "11, 16, 19" em array ["11", "16", "19"] e verifica
        const listaDdds = gestor.ddds.split(",").map((d) => d.trim());
        return listaDdds.includes(dddCliente);
      });
    }

    console.log(
      `[DEBUG ROTEAMENTO] Gestor Vencedor: ${gestorEncontrado ? gestorEncontrado.nome : "NENHUM"}`,
    );

    // 3. Cria o Lead, vinculando ao gestor automaticamente (se encontrou)
    const novoLead = await models.leads.create(
      {
        nome: nome,
        telefone: telefone,
        email: email,
        cidade: cidade,
        estado: estado,
        origem: origem || "Site",
        interesse: interesse || "Não especificado",
        status: "Novo",
        data_primeiro_contato: dataHoje,
        usuario_id: 1, // Fixado como robô/admin
        gestor_id: gestorEncontrado ? gestorEncontrado.id : null,
        // Se encontrou gestor, a data de encaminhamento é hoje. Se não, nulo.
        data_encaminhamento: gestorEncontrado ? dataHoje : null,
      },
      { transaction },
    );

    let textoMensagem = `Mensagem enviada pelo site: \n"${mensagem || "Sem mensagem"}"\n\n`;

    // 4. Adiciona o status do roteamento no histórico de forma visual
    if (gestorEncontrado) {
      textoMensagem += `🤖 Roteamento Automático: Este lead (DDD ${dddCliente}) foi encaminhado automaticamente para o coordenador ${gestorEncontrado.nome}.`;
    } else {
      textoMensagem += `⚠️ Alerta de Roteamento: O DDD ${dddCliente || "não identificado"} não possui nenhum coordenador vinculado no sistema. O lead entrou sem encaminhamento.`;
    }

    await models.historico_leads.create(
      {
        lead_id: novoLead.id,
        descricao: textoMensagem,
      },
      { transaction },
    );

    await transaction.commit();

    // Devolve para o Worker os dados completos, incluindo se teve gestor
    res.status(201).json({
      success: true,
      message: "Lead recebido e integrado com sucesso!",
      gestorAlocado: gestorEncontrado ? gestorEncontrado.nome : null,
      gestorEmail: gestorEncontrado ? gestorEncontrado.email : null,
      ddd: dddCliente,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Erro no Webhook (receberLeadSite):", err);
    res.status(500).json({ success: false, error: "Erro interno no servidor" });
  }
};
