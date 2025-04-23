const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.listarDadosMural(req, res);
  });
  application.get(
    "/listarDadosMuralAnualSemestre1",
    verifyJWT,
    function (req, res) {
      application.app.controllers.mural_dados.listarDadosMuralAnualSemestre1(
        req,
        res
      );
    }
  );
  application.get(
    "/listarDadosMuralAnualSemestre2",
    verifyJWT,
    function (req, res) {
      application.app.controllers.mural_dados.listarDadosMuralAnualSemestre2(
        req,
        res
      );
    }
  );
  application.get("/consultarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.consultarDadosMural(req, res);
  });
  application.post("/cadastrarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.cadastrarDadosMural(req, res);
  });
  application.put("/alterarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.alterarDadosMural(req, res);
  });
  application.delete("/excluirDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.excluirDadosMural(req, res);
  });
  application.post("/filtrarDadosMural", verifyJWT, function (req, res) {
    application.app.controllers.mural_dados.filtrarDadosMural(req, res);
  });
};
