const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.post("/logar", function (req, res) {
    application.app.controllers.usuarios.logar(req, res);
  });
  application.get("/listarUsuarios", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.listarUsuarios(application, req, res);
  });
  application.post("/cadastrarUsuario", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.cadastrarUsuario(req, res);
  });
  application.put("/alterarUsuario", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.alterarUsuario(req, res);
  });
};
