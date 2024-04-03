const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.listarDadosMural(
      application,
      req,
      res
    );
  });
  application.get("/listarDadosMuralAnual", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.listarDadosMuralAnual(
      application,
      req,
      res
    );
  });
  application.get("/consultarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.consultarDadosMural(
      application,
      req,
      res
    );
  });
  application.post("/inserirDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.inserirDadosMural(
      application,
      req,
      res
    );
  });
  application.put("/alterarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.alterarDadosMural(
      application,
      req,
      res
    );
  });
  application.delete("/excluirDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.excluirDadosMural(
      application,
      req,
      res
    );
  });
};
