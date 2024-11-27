const models = require("../../db/models");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sequelize = require('../../db/models/index');
const { Sequelize, Op } = require('sequelize');

module.exports.logar = async function (req, res) {
  var user = await models.usuarios.findOne({
    where: { login: req.body.login },
  });
  if (
    req.body.login == user.login &&
    (await user.validarSenha(req.body.senha))
  ) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    return res.json({ ...user.dataValues, auth: true, token: token });
  } else {
    res.status(500).json({ message: "Login inválido!" });
  }
};

module.exports.listarUsuarios = async function (req, res) {
  var users = await models.usuarios.findAll();
  res.send(users);
};

module.exports.listarUsuariosAniverPeriodo = async function (req, res) {
  console.log("users niver params: ", req.query.data_inicial, req.query.data_final);

  // Extração e conversão de datas
  const [mesInicial, diaInicial] = req.query.data_inicial.split('-').map(Number);
  const [mesFinal, diaFinal] = req.query.data_final.split('-').map(Number);
  console.log("Mes Inicial:", mesInicial, "Dia Inicial:", diaInicial);
  console.log("Mes Final:", mesFinal, "Dia Final:", diaFinal);

  let whereCondition;

  if (mesInicial === mesFinal && diaInicial === diaFinal) {
    // Caso 1: Intervalo de um único dia
    whereCondition = {
      [Op.and]: [
        Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), mesInicial),
        Sequelize.where(Sequelize.fn('DAY', Sequelize.col('data_nascimento')), diaInicial),
      ],
    };
  } else if (mesInicial > mesFinal) {
    // Caso 2: Intervalo cruzando o ano
    whereCondition = {
      [Op.or]: [
        // Parte 1: Meses no final do ano
        {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), { [Op.gte]: mesInicial }),
            Sequelize.where(Sequelize.fn('DAY', Sequelize.col('data_nascimento')), { [Op.gte]: diaInicial }),
          ],
        },
        // Parte 2: Meses no início do ano
        {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), { [Op.lte]: mesFinal }),
            Sequelize.where(Sequelize.fn('DAY', Sequelize.col('data_nascimento')), { [Op.lte]: diaFinal }),
          ],
        },
        // Parte 3: Meses intermediários
        Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), {
          [Op.or]: [
            { [Op.gt]: mesInicial },
            { [Op.lt]: mesFinal },
          ],
        }),
      ],
    };
  } else {
    // Caso 3: Intervalo normal dentro do mesmo ano
    whereCondition = {
      [Op.or]: [
        // Mês inicial
        {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), mesInicial),
            Sequelize.where(Sequelize.fn('DAY', Sequelize.col('data_nascimento')), { [Op.gte]: diaInicial }),
          ],
        },
        // Mês final
        {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), mesFinal),
            Sequelize.where(Sequelize.fn('DAY', Sequelize.col('data_nascimento')), { [Op.lte]: diaFinal }),
          ],
        },
        // Meses intermediários
        Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), { [Op.gt]: mesInicial, [Op.lt]: mesFinal }),
      ],
    };
  }

  try {
    // Execução da query com condições calculadas
    const aniversariantes = await models.usuarios.findAll({
      attributes: [
        ['nome', 'NOME'],
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('data_nascimento'), '%d/%m/%Y'), 'DATA_NASCIMENTO'],
        ['email', 'E_MAIL'],
      ],
      where: whereCondition,
    });

    console.log("Aniversariantes: ", aniversariantes);
    res.send(aniversariantes);
  } catch (error) {
    console.error("Erro ao listar aniversariantes:", error);
    res.status(500).send({ error: "Erro ao listar aniversariantes" });
  }
};

module.exports.consultarUsuario = async function (req, res) {
  var user = await models.usuarios.findOne({
    where: { id: req.query.id },
  });
  res.send(user);
};

module.exports.cadastrarUsuario = async function (req, res) {
  var user = await models.usuarios.create({
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
};
module.exports.alterarUsuario = async function (req, res) {
  var user = await models.usuarios.findOne({ where: req.body.id });
  if (req.body.senha !== undefined){
    const hash = await bcrypt.hash(req.body.senha, 10);
    req.body.senha = hash
    user.update(req.body);
    res.json({ Usuario: user, Msg: "Atualizado com sucesso!" });
  } else {
    user.update(req.body);
    res.json({ Usuario: user, Msg: "Atualizado com sucesso!" });
  }
  
};
module.exports.excluirUsuario = async function (req, res) {
  var user = await models.usuarios.findOne({ where: req.body.id });
  user.destroy();
  res.json({ Usuario: user.login, Msg: "Excluido com sucesso!" });
};
