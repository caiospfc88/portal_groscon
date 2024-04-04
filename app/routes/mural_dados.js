const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.listarDadosMural(req, res);
  });
  application.get("/listarDadosMuralAnual", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.listarDadosMuralAnual(req, res);
  });
  application.get("/consultarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.consultarDadosMural(req, res);
  });
  application.post("/cadastrarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.cadastrarDadosMural(req, res);
  });
  application.put("/alterarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.alterarDadosMural(req, res);
  });
  application.delete("/excluirDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.excluirDadosMural(req, res);
  });
};
