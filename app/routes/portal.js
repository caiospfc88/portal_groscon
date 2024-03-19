module.exports = function (application) {
  application.get("/muralDados", function (req, res) {
    application.app.controllers.portal.muralDados(application, req, res);
  });
};
module.exports = function (application) {
  application.post("/inserirDadosMural", function (req, res) {
    application.app.controllers.portal.inserirMuralDados(application, req, res);
  });
};

module.exports = function (application) {
  application.post("/logar", function (req, res) {
    application.app.controllers.portal.logar(req, res);
  });
};

module.exports = function (application) {
  application.get("/home", function (req, res) {
    application.app.controllers.portal.home(application, req, res);
  });
};
