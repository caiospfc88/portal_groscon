const db = require("../../db/models/index.js");
const bcrypt = require("bcrypt");

module.exports.inserirMuralDados = async function (application, req, res) {
  const db = require("../../db/models/index.js");
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
module.exports.autenticacao = async function (application, req, res) {};
