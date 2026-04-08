// src/routes/historico_recuperacao.js (ajuste o caminho conforme sua estrutura)
const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get(
    "/listarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.listarHistorico(
        req,
        res,
      );
    },
  );

  application.get(
    "/consultarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.consultarHistorico(
        req,
        res,
      );
    },
  );

  application.post(
    "/cadastrarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.cadastrarHistorico(
        req,
        res,
      );
    },
  );

  application.put(
    "/alterarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.alterarHistorico(
        req,
        res,
      );
    },
  );
  application.post("/statusEmLote", verifyJWT, function (req, res) {
    application.app.controllers.historicoRecuperacao.statusEmLote(req, res);
  });

  application.delete(
    "/excluirHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.excluirHistorico(
        req,
        res,
      );
    },
  );
};
