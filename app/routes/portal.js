module.exports = function (application) {
  application.get("/muralDados", function (req, res) {
    application.app.controllers.portal.muralDados(application, req, res);
  });
  application.post("/inserirDadosMural", function (req, res) {
    application.app.controllers.portal.inserirMuralDados(application, req, res);
  });
  application.post("/logar", function (req, res) {
    application.app.controllers.portal.logar(req, res);
  });
  application.get("/home", function (req, res) {
    application.app.controllers.portal.home(application, req, res);
  });
  application.get("/criarRootUser", function (req, res) {
    application.app.controllers.portal.criarRootUser(application, req, res);
  });
};
