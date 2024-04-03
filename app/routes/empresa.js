const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarEmpresa", verifyJWT, function (req, res) {
    application.app.controllers.empresa.listarEmpresa(req, res);
  });
  application.get("/consultarEmpresa", verifyJWT, function (req, res) {
    application.app.controllers.empresa.consultarEmpresa(req, res);
  });
  application.post("/cadastrarEmpresa", verifyJWT, function (req, res) {
    application.app.controllers.empresa.cadastrarEmpresa(req, res);
  });
  application.put("/alterarEmpresa", verifyJWT, function (req, res) {
    application.app.controllers.empresa.alterarEmpresa(req, res);
  });
  application.delete("/excluirEmpresa", verifyJWT, function (req, res) {
    application.app.controllers.empresa.excluirEmpresa(req, res);
  });
};
