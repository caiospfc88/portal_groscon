const models = require("../../db/models");
const { Op } = require("sequelize");

// tenta resolver o nome do model nos dois formatos comuns
const RetornoModel =
  models.retornoCobranca || models.RetornoCobranca || models.retorocobranca;

module.exports.listarRetornos = async function (req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    const retornos = await RetornoModel.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.send(retornos);
  } catch (err) {
    console.error("listarRetornos erro:", err);
    res.status(500).json({ Msg: "Erro interno", detail: err.message });
  }
};

module.exports.consultarRetorno = async function (req, res) {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ Msg: "Parâmetro id é obrigatório" });

    const retorno = await RetornoModel.findOne({
      where: { id: id },
    });

    if (!retorno) return res.status(404).json({ Msg: "Não encontrado" });
    res.send(retorno);
  } catch (err) {
    console.error("consultarRetorno erro:", err);
    res.status(500).json({ Msg: "Erro interno", detail: err.message });
  }
};

module.exports.relatorioPorPeriodo = async function (req, res) {
  try {
    // aceitar tanto GET query quanto POST body
    const params = req.method === "GET" ? req.query : req.body;
    const { start, end } = params;

    // opcional: parâmetro para filtrar apenas autorizadas
    // aceita "true", "1" ou boolean true
    const authorizedParam =
      params.authorized ?? params.onlyAuthorized ?? params.authorizada;
    const onlyAuthorized =
      authorizedParam === true ||
      authorizedParam === "true" ||
      authorizedParam === "1" ||
      authorizedParam === 1;

    if (!start || !end) {
      return res
        .status(400)
        .json({
          ok: false,
          Msg: "Parâmetros start e end obrigatórios (YYYY-MM-DD)",
        });
    }

    // interpreta datas no timezone do servidor; ajusta fim do dia para incluir tudo até 23:59:59.999
    const startDt = new Date(`${String(start)}T00:00:00`);
    const endDt = new Date(`${String(end)}T23:59:59.999`);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
      return res.status(400).json({ ok: false, Msg: "Datas inválidas" });
    }

    const where = {
      createdAt: { [Op.between]: [startDt, endDt] },
    };

    // se pediu apenas autorizadas, adiciona filtro por Status
    if (onlyAuthorized) {
      // Ajuste o valor exato se no seu DB o texto for diferente (ex.: 'AUTORIZADA', 'Autorizada')
      where.Status = "Autorizada";
      // Se preferir usar StatusID (por exemplo StatusID === 2), use: where.StatusID = 2;
    }

    // buscar apenas os campos necessários
    const results = await RetornoModel.findAll({
      where,
      attributes: ["CodigoERP", "Valor", "Status", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    // mapear/normalizar nomes se necessário (ex.: Sequelize retorna DECIMAL como string)
    const data = results.map((r) => {
      const rec = r.get ? r.get({ plain: true }) : r;
      return {
        CodigoERP: rec.CodigoERP ?? null,
        Valor:
          rec.Valor !== undefined && rec.Valor !== null
            ? Number(rec.Valor)
            : null,
        Status: rec.Status ?? null,
        createdAt: rec.createdAt ?? null,
      };
    });

    return res.status(200).json({ ok: true, count: data.length, data });
  } catch (err) {
    console.error("relatorioPorPeriodo erro:", err);
    return res
      .status(500)
      .json({ ok: false, Msg: "Erro interno", detail: err.message });
  }
};

/**
 * POST /cadastrarRetorno
 * O front envia o objeto da API do PagConsorcio (Contrato, Valor, StatusID, Status, EnviaEmail, UrlPagamento, Hash, CodigoERP)
 * Se Hash ou CodigoERP existir, atualiza o registro existente; caso contrário cria um novo.
 */
module.exports.cadastrarRetorno = async function (req, res) {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ Msg: "Payload vazio" });
    }

    // procura por Hash ou CodigoERP para evitar duplicidade
    const where = data.Hash
      ? { Hash: data.Hash }
      : data.CodigoERP
      ? { CodigoERP: data.CodigoERP }
      : null;

    if (where) {
      const existente = await RetornoModel.findOne({ where });
      if (existente) {
        await existente.update({
          Contrato: data.Contrato ?? existente.Contrato,
          Valor: data.Valor ?? existente.Valor,
          StatusID: data.StatusID ?? existente.StatusID,
          Status: data.Status ?? existente.Status,
          EnviaEmail:
            typeof data.EnviaEmail === "boolean"
              ? data.EnviaEmail
              : existente.EnviaEmail,
          UrlPagamento: data.UrlPagamento ?? existente.UrlPagamento,
          Hash: data.Hash ?? existente.Hash,
          CodigoERP: data.CodigoERP ?? existente.CodigoERP,
          updatedAt: new Date(),
        });

        return res.json({
          Retorno: existente,
          Msg: "Registro atualizado (hash/erp encontrado)",
        });
      }
    }

    // cria novo
    const criado = await RetornoModel.create({
      Contrato: data.Contrato ?? null,
      Valor: data.Valor ?? null,
      StatusID: data.StatusID ?? null,
      Status: data.Status ?? null,
      EnviaEmail: typeof data.EnviaEmail === "boolean" ? data.EnviaEmail : null,
      UrlPagamento: data.UrlPagamento ?? null,
      Hash: data.Hash ?? null,
      CodigoERP: data.CodigoERP ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ Retorno: criado, Msg: "Cadastrado com sucesso!" });
  } catch (err) {
    console.error("cadastrarRetorno erro:", err);
    res.status(500).json({ Msg: "Erro interno", detail: err.message });
  }
};

module.exports.alterarRetorno = async function (req, res) {
  try {
    const id = req.body.id;
    if (!id) return res.status(400).json({ Msg: "body.id é obrigatório" });

    const retorno = await RetornoModel.findOne({ where: { id: id } });
    if (!retorno)
      return res.status(404).json({ Msg: "Registro não encontrado" });

    // atualiza todos os campos que vierem no body
    await retorno.update({
      Contrato: req.body.Contrato ?? retorno.Contrato,
      Valor: req.body.Valor ?? retorno.Valor,
      StatusID: req.body.StatusID ?? retorno.StatusID,
      Status: req.body.Status ?? retorno.Status,
      EnviaEmail:
        typeof req.body.EnviaEmail === "boolean"
          ? req.body.EnviaEmail
          : retorno.EnviaEmail,
      UrlPagamento: req.body.UrlPagamento ?? retorno.UrlPagamento,
      Hash: req.body.Hash ?? retorno.Hash,
      CodigoERP: req.body.CodigoERP ?? retorno.CodigoERP,
      updatedAt: new Date(),
    });

    res.json({ Retorno: retorno, Msg: "Atualizado com sucesso!" });
  } catch (err) {
    console.error("alterarRetorno erro:", err);
    res.status(500).json({ Msg: "Erro interno", detail: err.message });
  }
};

module.exports.excluirRetorno = async function (req, res) {
  try {
    const id = req.body.id;
    if (!id) return res.status(400).json({ Msg: "body.id é obrigatório" });

    const retorno = await RetornoModel.findOne({ where: { id: id } });
    if (!retorno)
      return res.status(404).json({ Msg: "Registro não encontrado" });

    await retorno.destroy();
    res.json({ Retorno: retorno, Msg: "Excluído com sucesso!" });
  } catch (err) {
    console.error("excluirRetorno erro:", err);
    res.status(500).json({ Msg: "Erro interno", detail: err.message });
  }
};
