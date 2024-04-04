const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarMuralDescricao", verifyJWT, function (req, res) {
    application.app.controllers.mural_descricao.listarMuralDescricao(req, res);
  });
  application.get("/consultarMuralDescricao", verifyJWT, function (req, res) {
    application.app.controllers.mural_descricao.consultarMuralDescricao(
      req,
      res
    );
  });
  application.post("/cadastrarMuralDescricao", verifyJWT, function (req, res) {
    application.app.controllers.mural_descricao.cadastrarMuralDescricao(
      req,
      res
    );
  });
  application.put("/alterarMuralDescricao", verifyJWT, function (req, res) {
    application.app.controllers.mural_descricao.alterarMuralDescricao(req, res);
  });
  application.delete("/excluirMuralDescricao", verifyJWT, function (req, res) {
    application.app.controllers.mural_descricao.excluirMuralDescricao(req, res);
  });
};
