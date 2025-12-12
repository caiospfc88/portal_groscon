// app/controllers/retornoCobranca.js
const models = require("../../db/models");
const { Op, QueryTypes } = require("sequelize");

// tenta resolver o nome do model nos dois formatos comuns
const RetornoModel =
  models.retornoCobranca || models.RetornoCobranca || models.retorocobranca;

const UsuarioModel = models.usuarios || models.Usuarios || null;

module.exports.listarRetornos = async function (req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    // campos que queremos expor
    const attributes = [
      "id",
      "Contrato",
      "Valor",
      "taxa",
      "nome",
      "StatusID",
      "Status",
      "EnviaEmail",
      "UrlPagamento",
      "Hash",
      "CodigoERP",
      "id_usuario",
      "createdAt",
      "updatedAt",
    ];

    // se o model tiver associação definida com usuarios, usar include
    if (
      UsuarioModel &&
      typeof RetornoModel.associations !== "undefined" &&
      RetornoModel.associations.usuario
    ) {
      const retornos = await RetornoModel.findAll({
        attributes,
        include: [
          {
            model: UsuarioModel,
            as: "usuario", // exige que o alias na associação seja 'usuario'
            attributes: ["id", "nome"],
            required: false,
          },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      // normaliza para plain objects e adiciona usuarioNome para facilitar frontend
      const plain = retornos.map((r) => {
        const rec = r.get ? r.get({ plain: true }) : r;
        return {
          ...rec,
          usuarioNome: rec.usuario ? rec.usuario.nome : null,
        };
      });

      return res.json(plain);
    }

    // Fallback: se associação não existir, fazer JOIN manual via raw query (mais robusto)
    // Observação: ajusta os nomes de tabela se seus nomes forem diferentes.
    const tableRet =
      typeof RetornoModel.getTableName === "function"
        ? RetornoModel.getTableName()
        : "retornocobrancas";
    const tableUsr =
      UsuarioModel && typeof UsuarioModel.getTableName === "function"
        ? UsuarioModel.getTableName()
        : "usuarios";

    if (UsuarioModel) {
      const sql = `
        SELECT rc.*, u.nome AS usuarioNome
        FROM \`${tableRet}\` rc
        LEFT JOIN \`${tableUsr}\` u ON rc.id_usuario = u.id
        ORDER BY rc.createdAt DESC
        LIMIT :limit OFFSET :offset
      `;
      const rows = await models.sequelize.query(sql, {
        replacements: { limit, offset },
        type: QueryTypes.SELECT,
      });
      return res.json(rows);
    }

    // último fallback: sem usuario
    const retornos = await RetornoModel.findAll({
      attributes,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const plain = retornos.map((r) => (r.get ? r.get({ plain: true }) : r));
    return res.json(plain);
  } catch (err) {
    console.error("listarRetornos erro:", err);
    res.status(500).json({ Msg: "Erro interno", detail: err.message });
  }
};

module.exports.consultarRetorno = async function (req, res) {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ Msg: "Parâmetro id é obrigatório" });

    // busca com include se possível
    if (
      UsuarioModel &&
      RetornoModel.associations &&
      RetornoModel.associations.usuario
    ) {
      const retorno = await RetornoModel.findOne({
        where: { id: id },
        include: [
          {
            model: UsuarioModel,
            as: "usuario",
            attributes: ["id", "nome"],
            required: false,
          },
        ],
      });

      if (!retorno) return res.status(404).json({ Msg: "Não encontrado" });
      const rec = retorno.get ? retorno.get({ plain: true }) : retorno;
      rec.usuarioNome = rec.usuario ? rec.usuario.nome : null;
      return res.json(rec);
    }

    // fallback raw join
    if (UsuarioModel) {
      const tableRet =
        typeof RetornoModel.getTableName === "function"
          ? RetornoModel.getTableName()
          : "retornocobrancas";
      const tableUsr =
        typeof UsuarioModel.getTableName === "function"
          ? UsuarioModel.getTableName()
          : "usuarios";
      const sql = `
        SELECT rc.*, u.nome AS usuarioNome
        FROM \`${tableRet}\` rc
        LEFT JOIN \`${tableUsr}\` u ON rc.id_usuario = u.id
        WHERE rc.id = :id
        LIMIT 1
      `;
      const rows = await models.sequelize.query(sql, {
        replacements: { id },
        type: QueryTypes.SELECT,
      });
      if (!rows || rows.length === 0)
        return res.status(404).json({ Msg: "Não encontrado" });
      return res.json(rows[0]);
    }

    // simples findOne sem usuario
    const retorno = await RetornoModel.findOne({ where: { id: id } });
    if (!retorno) return res.status(404).json({ Msg: "Não encontrado" });
    return res.json(retorno.get ? retorno.get({ plain: true }) : retorno);
  } catch (err) {
    console.error("consultarRetorno erro:", err);
    res.status(500).json({ Msg: "Erro interno", detail: err.message });
  }
};

module.exports.relatorioPorPeriodo = async function (req, res) {
  try {
    const params = req.method === "GET" ? req.query : req.body;
    const { start, end } = params;

    const authorizedParam =
      params.authorized ?? params.onlyAuthorized ?? params.authorizada;
    const onlyAuthorized =
      authorizedParam === true ||
      authorizedParam === "true" ||
      authorizedParam === "1" ||
      authorizedParam === 1;

    if (!start || !end) {
      return res.status(400).json({
        ok: false,
        Msg: "Parâmetros start e end obrigatórios (YYYY-MM-DD)",
      });
    }

    const startDt = new Date(`${String(start)}T00:00:00`);
    const endDt = new Date(`${String(end)}T23:59:59.999`);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
      return res.status(400).json({ ok: false, Msg: "Datas inválidas" });
    }

    const where = {
      createdAt: { [Op.between]: [startDt, endDt] },
    };

    if (onlyAuthorized) {
      where.Status = "Autorizada";
    }

    // incluir campos importantes: CodigoERP, nome, Valor, taxa, Status, createdAt
    // e incluir usuarioNome via include quando possível
    if (
      UsuarioModel &&
      RetornoModel.associations &&
      RetornoModel.associations.usuario
    ) {
      const results = await RetornoModel.findAll({
        where,
        attributes: [
          "CodigoERP",
          "nome",
          "Valor",
          "taxa",
          "Status",
          "createdAt",
        ],
        include: [
          {
            model: UsuarioModel,
            as: "usuario",
            attributes: ["id", "nome"],
            required: false,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const data = results.map((r) => {
        const rec = r.get ? r.get({ plain: true }) : r;
        return {
          CodigoERP: rec.CodigoERP ?? null,
          Nome: rec.nome ?? null,
          Valor:
            rec.Valor !== undefined && rec.Valor !== null
              ? Number(rec.Valor)
              : null,
          taxa:
            rec.taxa !== undefined && rec.taxa !== null
              ? Number(rec.taxa)
              : null,
          Status: rec.Status ?? null,
          createdAt: rec.createdAt ?? null,
          usuarioNome: rec.usuario ? rec.usuario.nome : null,
        };
      });

      return res.status(200).json({ ok: true, count: data.length, data });
    }

    // fallback raw SQL that returns usuarioNome via join (se usuarios existir)
    if (UsuarioModel) {
      const tableRet =
        typeof RetornoModel.getTableName === "function"
          ? RetornoModel.getTableName()
          : "retornocobrancas";
      const tableUsr =
        typeof UsuarioModel.getTableName === "function"
          ? UsuarioModel.getTableName()
          : "usuarios";
      const sql = `
        SELECT rc.CodigoERP, rc.nome AS Nome, rc.Valor, rc.taxa, rc.Status, rc.createdAt, u.nome AS usuarioNome
        FROM \`${tableRet}\` rc
        LEFT JOIN \`${tableUsr}\` u ON rc.id_usuario = u.id
        WHERE rc.createdAt BETWEEN :start AND :end
        ${onlyAuthorized ? "AND rc.Status = 'Autorizada'" : ""}
        ORDER BY rc.createdAt DESC
      `;
      const rows = await models.sequelize.query(sql, {
        replacements: { start: startDt, end: endDt },
        type: QueryTypes.SELECT,
      });

      const data = rows.map((rec) => ({
        CodigoERP: rec.CodigoERP ?? null,
        Nome: rec.Nome ?? null,
        Valor:
          rec.Valor !== undefined && rec.Valor !== null
            ? Number(rec.Valor)
            : null,
        taxa:
          rec.taxa !== undefined && rec.taxa !== null ? Number(rec.taxa) : null,
        Status: rec.Status ?? null,
        createdAt: rec.createdAt ?? null,
        usuarioNome: rec.usuarioNome ?? null,
      }));

      return res.status(200).json({ ok: true, count: data.length, data });
    }

    // último fallback: sem usuário
    const results = await RetornoModel.findAll({
      where,
      attributes: ["CodigoERP", "nome", "Valor", "taxa", "Status", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const data = results.map((r) => {
      const rec = r.get ? r.get({ plain: true }) : r;
      return {
        CodigoERP: rec.CodigoERP ?? null,
        Nome: rec.nome ?? null,
        Valor:
          rec.Valor !== undefined && rec.Valor !== null
            ? Number(rec.Valor)
            : null,
        taxa:
          rec.taxa !== undefined && rec.taxa !== null ? Number(rec.taxa) : null,
        Status: rec.Status ?? null,
        createdAt: rec.createdAt ?? null,
        usuarioNome: null,
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
