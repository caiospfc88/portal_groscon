const { Model } = require("sequelize");
const db = require("../../db/models/index.js");
const bcrypt = require("bcrypt");

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
