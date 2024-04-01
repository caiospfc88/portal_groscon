const models = require("../../db/models");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.logar = async function (req, res) {
  var user = await models.usuarios.findOne({
    where: { login: req.body.login },
  });
  if (
    req.body.login == user.login &&
    (await user.validarSenha(req.body.senha))
  ) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 14400,
    });
    return res.json({ auth: true, token: token });
  } else {
    res.status(500).json({ message: "Login inválido!" });
  }
};

module.exports.listaUsuarios = async function (application, req, res) {
  var users = await models.usuarios.findAll();
  res.send(users);
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
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ Usuario: user.login, Msg: "Cadastrado com sucesso!" });
};
