// app/controllers/usuarios.js
const models = require("../../db/models");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Sequelize, Op } = require("sequelize");

// instância do sequelize (exportada por db/models/index.js)
const sequelize = models.sequelize;

/**
 * NOTE: usamos module.exports.<fn> para NÃO sobrescrever o objeto exports
 * (evita perder outras funções exportadas).
 */

module.exports.logar = async function (req, res) {
  try {
    const user = await models.usuarios.findOne({
      where: { login: req.body.login },
    });
    if (!user) return res.status(401).json({ message: "Login inválido!" });

    const valid = await user.validarSenha(req.body.senha);
    if (!valid) return res.status(401).json({ message: "Login inválido!" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    return res.json({ ...user.dataValues, auth: true, token });
  } catch (err) {
    console.error("Erro logar:", err);
    return res.status(500).json({ message: "Erro no login" });
  }
};

module.exports.listarUsuarios = async function (req, res) {
  try {
    const users = await models.usuarios.findAll();
    res.json(users);
  } catch (err) {
    console.error("Erro listarUsuarios:", err);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

module.exports.listarUsuariosAniverPeriodo = async function (req, res) {
  // seu código existente (mantive como estava)
  try {
    const [mesInicial, diaInicial] = req.query.data_inicial
      .split("-")
      .map(Number);
    const [mesFinal, diaFinal] = req.query.data_final.split("-").map(Number);

    let whereCondition;
    if (mesInicial === mesFinal && diaInicial === diaFinal) {
      whereCondition = {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("MONTH", Sequelize.col("data_nascimento")),
            mesInicial
          ),
          Sequelize.where(
            Sequelize.fn("DAY", Sequelize.col("data_nascimento")),
            diaInicial
          ),
        ],
      };
    } else if (mesInicial > mesFinal) {
      whereCondition = {
        [Op.or]: [
          {
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn("MONTH", Sequelize.col("data_nascimento")),
                { [Op.gte]: mesInicial }
              ),
              Sequelize.where(
                Sequelize.fn("DAY", Sequelize.col("data_nascimento")),
                { [Op.gte]: diaInicial }
              ),
            ],
          },
          {
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn("MONTH", Sequelize.col("data_nascimento")),
                { [Op.lte]: mesFinal }
              ),
              Sequelize.where(
                Sequelize.fn("DAY", Sequelize.col("data_nascimento")),
                { [Op.lte]: diaFinal }
              ),
            ],
          },
          Sequelize.where(
            Sequelize.fn("MONTH", Sequelize.col("data_nascimento")),
            {
              [Op.or]: [{ [Op.gt]: mesInicial }, { [Op.lt]: mesFinal }],
            }
          ),
        ],
      };
    } else {
      whereCondition = {
        [Op.or]: [
          {
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn("MONTH", Sequelize.col("data_nascimento")),
                mesInicial
              ),
              Sequelize.where(
                Sequelize.fn("DAY", Sequelize.col("data_nascimento")),
                { [Op.gte]: diaInicial }
              ),
            ],
          },
          {
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn("MONTH", Sequelize.col("data_nascimento")),
                mesFinal
              ),
              Sequelize.where(
                Sequelize.fn("DAY", Sequelize.col("data_nascimento")),
                { [Op.lte]: diaFinal }
              ),
            ],
          },
          Sequelize.where(
            Sequelize.fn("MONTH", Sequelize.col("data_nascimento")),
            { [Op.gt]: mesInicial, [Op.lt]: mesFinal }
          ),
        ],
      };
    }

    const aniversariantes = await models.usuarios.findAll({
      attributes: [
        ["nome", "NOME"],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("data_nascimento"),
            "%d/%m/%Y"
          ),
          "DATA_NASCIMENTO",
        ],
        ["email", "E_MAIL"],
      ],
      where: whereCondition,
    });

    res.json(aniversariantes);
  } catch (error) {
    console.error("Erro ao listar aniversariantes:", error);
    res.status(500).json({ error: "Erro ao listar aniversariantes" });
  }
};

module.exports.consultarUsuario = async function (req, res) {
  try {
    const user = await models.usuarios.findOne({ where: { id: req.query.id } });
    res.json(user);
  } catch (err) {
    console.error("Erro consultarUsuario:", err);
    res.status(500).json({ error: "Erro ao consultar usuário" });
  }
};

/**
 * Nova função: retorna array de descrições (strings) das páginas que o usuário tem
 * (usa raw query para evitar problemas se associações sequelize não estiverem corretas)
 */
module.exports.listarDescricoesPaginasDoUsuario = async function (req, res) {
  try {
    const id = req.query.id || req.body.id || (req.user && req.user.id);
    if (!id)
      return res.status(400).json({ error: "id do usuário é obrigatório" });

    const sql = `
      SELECT p.descricao
      FROM paginas_usuario pu
      JOIN paginas_portal p ON p.id = pu.id_pagina
      WHERE pu.id_usuario = :userId
    `;

    // USAR a instância correta do sequelize + Sequelize.QueryTypes
    const rows = await sequelize.query(sql, {
      replacements: { userId: id },
      type: Sequelize.QueryTypes.SELECT,
    });

    const descricoes = (rows || [])
      .map((r) => String(r.descricao))
      .filter(Boolean);
    const unique = Array.from(new Set(descricoes));
    console.log("res minhas paginas: ", unique);
    return res.json(unique);
  } catch (err) {
    console.error("Erro listarDescricoesPaginasDoUsuario_raw:", err);
    return res.status(500).json({ error: "Erro ao listar descrições (raw)" });
  }
};

module.exports.listarDescricoesRelatoriosDoUsuario = async function (req, res) {
  try {
    const id = req.query.id || req.body.id || (req.user && req.user.id);
    if (!id)
      return res.status(400).json({ error: "id do usuário é obrigatório" });

    const sql = `
      SELECT r.descricao AS descricao
      FROM relatoriosNewcon_usuario ru
      JOIN relatoriosNewcon r ON r.id = ru.relatorio_id
      WHERE ru.id_usuario = :userId
    `;

    const rows = await sequelize.query(sql, {
      replacements: { userId: id },
      type: Sequelize.QueryTypes.SELECT,
    });

    const descricoes = (rows || [])
      .map((r) => String(r.descricao ?? "").trim())
      .filter(Boolean);
    const unique = Array.from(new Set(descricoes));
    console.log("res meus relatorios: ", unique);
    return res.json(unique);
  } catch (err) {
    console.error("Erro listarDescricoesRelatoriosDoUsuario_raw:", err);
    return res
      .status(500)
      .json({ error: "Erro ao listar descrições de relatórios (raw)" });
  }
};

module.exports.cadastrarUsuario = async function (req, res) {
  try {
    const user = await models.usuarios.create({
      nome: req.body.nome,
      sobrenome: req.body.sobrenome,
      login: req.body.login,
      senha: req.body.senha,
      email: req.body.email,
      data_nascimento: req.body.data_nascimento,
      celular: req.body.celular,
      acesso: req.body.acesso,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json({ Usuario: user.login, Msg: "Cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro cadastrarUsuario:", err);
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
};

module.exports.alterarUsuario = async function (req, res) {
  try {
    const user = await models.usuarios.findOne({ where: { id: req.body.id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    if (req.body.senha !== undefined) {
      const hash = await bcrypt.hash(req.body.senha, 10);
      req.body.senha = hash;
    }

    await user.update(req.body);
    res.json({ Usuario: user, Msg: "Atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro alterarUsuario:", err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

module.exports.excluirUsuario = async function (req, res) {
  try {
    const user = await models.usuarios.findOne({ where: { id: req.body.id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    await user.destroy();
    res.json({ Usuario: user.login, Msg: "Excluido com sucesso!" });
  } catch (err) {
    console.error("Erro excluirUsuario:", err);
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
};
