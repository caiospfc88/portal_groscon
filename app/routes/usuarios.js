module.exports = function (application) {
  application.post("/logar", function (req, res) {
    application.app.controllers.usuarios.logar(req, res);
  });
  application.get("/home", function (req, res) {
    application.app.controllers.usuarios.home(application, req, res);
  });
  application.get("/criarRootUser", function (req, res) {
    application.app.controllers.usuarios.criarRootUser(application, req, res);
  });
};
