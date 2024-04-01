const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.post("/logar", function (req, res) {
    application.app.controllers.usuarios.logar(req, res);
  });
  application.get("/listaUsuarios", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.listaUsuarios(application, req, res);
  });
  application.post("/cadastrarUsuario", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.cadastrarUsuario(req, res);
  });
};
