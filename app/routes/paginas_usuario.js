const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarPaginasUsuario", verifyJWT, function (req, res) {
    application.app.controllers.paginas_usuario.listarPaginasUsuario(req, res);
  });
  application.get("/consultarPaginasUsuario", verifyJWT, function (req, res) {
    application.app.controllers.paginas_usuario.consultarPaginasUsuario(
      req,
      res
    );
  });
  application.post("/cadastrarPaginasUsuario", verifyJWT, function (req, res) {
    application.app.controllers.paginas_usuario.cadastrarPaginasUsuario(
      req,
      res
    );
  });
  application.put("/alterarPaginasUsuario", verifyJWT, function (req, res) {
    application.app.controllers.paginas_usuario.alterarPaginasUsuario(req, res);
  });
  application.delete("/excluirPaginasUsuario", verifyJWT, function (req, res) {
    application.app.controllers.paginas_usuario.excluirPaginasUsuario(req, res);
  });
};
