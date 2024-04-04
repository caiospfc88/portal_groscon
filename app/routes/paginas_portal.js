const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarPaginasPortal", verifyJWT, function (req, res) {
    application.app.controllers.paginas_portal.listarPaginasPortal(req, res);
  });
  application.get("/consultarPaginasPortal", verifyJWT, function (req, res) {
    application.app.controllers.paginas_portal.consultarPaginasPortal(req, res);
  });
  application.post("/cadastrarPaginasPortal", verifyJWT, function (req, res) {
    application.app.controllers.paginas_portal.cadastrarPaginasPortal(req, res);
  });
  application.put("/alterarPaginasPortal", verifyJWT, function (req, res) {
    application.app.controllers.paginas_portal.alterarPaginasPortal(req, res);
  });
  application.delete("/excluirPaginasPortal", verifyJWT, function (req, res) {
    application.app.controllers.paginas_portal.excluirPaginasPortal(req, res);
  });
};
