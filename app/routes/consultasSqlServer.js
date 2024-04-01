const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/comissoesSemReducao", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.comissoesSemReducao(
      application,
      req,
      res
    );
  });
  application.get("/comissoesComReducao", function (req, res) {
    application.app.controllers.consultasSqlServer.comissoesComReducao(
      application,
      req,
      res
    );
  });
  application.get("/quitados", function (req, res) {
    application.app.controllers.consultasSqlServer.quitados(
      application,
      req,
      res
    );
  });
  application.get("/aniversariantesMes", function (req, res) {
    application.app.controllers.consultasSqlServer.aniversariantesMes(
      application,
      req,
      res
    );
  });
  application.get("/relatorioRenegociacoes", function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioRenegociacoes(
      application,
      req,
      res
    );
  });
  application.get("/relatorioAproveitamento", function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioAproveitamento(
      application,
      req,
      res
    );
  });
};
