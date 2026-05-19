// app/controllers/leads.js
const models = require("../../db/models");
const { Sequelize, Op } = require("sequelize");

// instância do sequelize
const sequelize = models.sequelize;

module.exports.listarLeads = async function (req, res) {
  try {
    const { dataInicio, dataFim } = req.query;
    let whereCondition = {};

    // Se as datas forem enviadas pelo Front, cria o filtro
    if (dataInicio && dataFim) {
      whereCondition.data_primeiro_contato = {
        // Concatena as horas para garantir que pegue o dia todo (do 00:00:00 ao 23:59:59)
        [Op.between]: [`${dataInicio} 00:00:00`, `${dataFim} 23:59:59`],
      };
    }

    const leads = await models.leads.findAll({
      where: whereCondition,
      order: [["data_primeiro_contato", "DESC"]], // Melhor ordenar pela data do contato do que pela criação do registro
    });

    res.json(leads);
  } catch (err) {
    console.error("Erro listarLeads:", err);
    res.status(500).json({ error: "Erro ao listar leads" });
  }
};

module.exports.listarEncaminhamentos = async function (req, res) {
  try {
    // Busca os nomes distintos já usados para o autocompletar no frontend
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
  try {
    const novoLead = await models.leads.create({
      nome: req.body.nome,
      telefone: req.body.telefone,
      email: req.body.email,
      origem: req.body.origem,
      interesse: req.body.interesse,
      observacoes: req.body.observacoes,
      encaminhado_para: req.body.encaminhado_para,
      data_primeiro_contato: req.body.data_primeiro_contato, // Removemos o "|| null"
      data_encaminhamento: req.body.data_encaminhamento || null,
      usuario_id: req.body.usuario_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json({ Lead: novoLead, Msg: "Cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro cadastrarLead:", err);
    res.status(500).json({ error: "Erro ao cadastrar lead" });
  }
};
module.exports.alterarLead = async function (req, res) {
  try {
    // Mantendo o padrão de receber o id pelo body como no seu usuarios.js
    const lead = await models.leads.findOne({ where: { id: req.body.id } });
    if (!lead) return res.status(404).json({ error: "Lead não encontrado" });

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

    await lead.destroy();
    res.json({ Msg: "Excluido com sucesso!" });
  } catch (err) {
    console.error("Erro excluirLead:", err);
    res.status(500).json({ error: "Erro ao excluir lead" });
  }
};
