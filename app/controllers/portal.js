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
module.exports.login = async function (application, req, res) {
  if (req.body.login == login && req.body.senha == senha) {
    console.log("logado");
  } else {
    console.log("Falha na autenticação");
  }
};
