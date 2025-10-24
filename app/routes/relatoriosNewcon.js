// app/routes/relatoriosNewcon.js
const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  // lista todos os relatórios
  application.get("/relatoriosNewcon", verifyJWT, function (req, res) {
    application.app.controllers.relatoriosNewcon.listarRelatorios(req, res);
  });

  // lista relatórios de um usuário (ou do usuário logado se sem query param)
  application.get("/relatoriosUsuario", verifyJWT, function (req, res) {
    application.app.controllers.relatoriosNewcon.getRelatoriosUsuario(req, res);
  });

  // atualiza permissões do usuário
  application.post("/setRelatoriosUsuario", verifyJWT, function (req, res) {
    application.app.controllers.relatoriosNewcon.setRelatoriosUsuario(req, res);
  });

  // opcional: rota para criar relatório (admin)
  application.post("/criarRelatorio", verifyJWT, function (req, res) {
    application.app.controllers.relatoriosNewcon.criarRelatorio(req, res);
  });
};
