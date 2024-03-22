const { Model } = require("sequelize");
const db = require("../../db/models/index.js");
const bcrypt = require("bcrypt");
const usuario = require("../../db/models/usuarios.js");
module.exports.inserirMuralDados = async function (application, req, res) {
  var dados = req.body;
  console.log("controller", dados);
  await db.mural_dados
    .create(dados)
    .then((dadosMural) => {
      return res.json({
        mensagem: "Dados inseridos com sucesso",
        dadosMural,
      });
    })
    .catch((error) => {
      return res.json({
        mensagem: "Erro na inserção dos dados",
        error,
      });
    });
};
module.exports.logar = async function (req, res) {
  var login = "Admin";
  var senha = "tempDev2023";
  console.log(req.body.login);
  if (req.body.login == login && req.body.senha == senha) {
    res.send("Tá logado porra");
  } else {
    console.log("Falha na autenticação");
    res.send("Login inválido");
  }
};
module.exports.home = async function (application, req, res) {
  res.send("Faça o login!!!");
};
module.exports.criarRootUser = async function (application, req, res) {
  console.log("Usuario:", usuario);
  const rootUser = usuario.init({
    nome: "Administrador",
    sobrenome: "Portal Groscon",
    login: "Admin",
    senha: "tempDev2023",
    email: "ti@consorciogroscon.com.br",
    data_nascimento: "1988-4-07",
    celular: "16991827470",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(rootUser);
};
