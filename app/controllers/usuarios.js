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
  console.log(req.query.data_inicial,req.query.data_final)
  const [mesInicial, diaInicial] = req.query.data_inicial.split('-').map(Number);
  const [mesFinal, diaFinal] = req.query.data_final.split('-').map(Number);
  const aniversariantes = await models.usuarios.findAll({
    attributes: [   
      ['nome', 'NOME'],     
      [Sequelize.fn('DATE_FORMAT', Sequelize.col('data_nascimento'), '%d/%m/%Y'), 'DATA NASCIMENTO'],
      ['email','E-MAIL'],
    ],
    where: {
      [Op.or]: [
        // Aniversariantes no mesmo ano
        {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), {
              [Op.eq]: mesInicial,
            }),
            Sequelize.where(Sequelize.fn('DAY', Sequelize.col('data_nascimento')), {
              [Op.gte]: diaInicial,
            }),
          ],
        },
        {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), {
              [Op.eq]: mesFinal,
            }),
            Sequelize.where(Sequelize.fn('DAY', Sequelize.col('data_nascimento')), {
              [Op.lte]: diaFinal,
            }),
          ],
        },
        // Aniversariantes entre os meses
        {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), {
              [Op.gt]: mesInicial,
            }),
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data_nascimento')), {
              [Op.lt]: mesFinal,
            }),
          ],
        },
      ],
    },
  });
  res.send(aniversariantes);
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
