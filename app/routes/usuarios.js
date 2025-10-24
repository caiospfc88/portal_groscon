const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.post("/logar", function (req, res) {
    application.app.controllers.usuarios.logar(req, res);
  });
  application.get("/listarUsuarios", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.listarUsuarios(req, res);
  });
  application.get(
    "/listarUsuariosAniverPeriodo",
    verifyJWT,
    function (req, res) {
      application.app.controllers.usuarios.listarUsuariosAniverPeriodo(
        req,
        res
      );
    }
  );
  application.get("/consultarUsuario", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.consultarUsuario(req, res);
  });
  application.post("/cadastrarUsuario", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.cadastrarUsuario(req, res);
  });
  application.get("/minhasPaginas", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.listarDescricoesPaginasDoUsuario(
      req,
      res
    );
  });
  application.get("/meusRelatorios", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.listarDescricoesRelatoriosDoUsuario(
      req,
      res
    );
  });
  application.put(
    "/alterarUsuario",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.usuarios.alterarUsuario(req, res);
    }
  );
  application.put("/alterarSenha", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.alterarUsuario(req, res);
  });
  application.delete("/excluirUsuario", verifyJWT, function (req, res) {
    application.app.controllers.usuarios.excluirUsuario(req, res);
  });
};
