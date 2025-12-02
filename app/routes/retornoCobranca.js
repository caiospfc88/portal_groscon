const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  // Lista todos (query params: limit, offset)
  application.get("/listarRetornos", verifyJWT, function (req, res) {
    application.app.controllers.retornoCobranca.listarRetornos(req, res);
  });

  application.get("/relatorioRetornos", verifyJWT, function (req, res) {
    application.app.controllers.retornoCobranca.relatorioPorPeriodo(req, res);
  });

  // Consulta um por id -> /consultarRetorno?id=#
  application.get("/consultarRetorno", verifyJWT, function (req, res) {
    application.app.controllers.retornoCobranca.consultarRetorno(req, res);
  });

  // Cria ou atualiza por Hash/CodigoERP (payload no body)
  application.post("/cadastrarRetorno", verifyJWT, function (req, res) {
    application.app.controllers.retornoCobranca.cadastrarRetorno(req, res);
  });

  // Atualiza por id (body.id é obrigatório)
  application.put("/alterarRetorno", verifyJWT, function (req, res) {
    application.app.controllers.retornoCobranca.alterarRetorno(req, res);
  });

  // Deleta por id (body.id)
  application.delete("/excluirRetorno", verifyJWT, function (req, res) {
    application.app.controllers.retornoCobranca.excluirRetorno(req, res);
  });
};
