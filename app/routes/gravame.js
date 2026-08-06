// app/routes/gravame.js
const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarGravames", verifyJWT, function (req, res) {
    application.app.controllers.gravame.listarGravames(req, res);
  });

  application.post("/cadastrarGravame", verifyJWT, function (req, res) {
    application.app.controllers.gravame.cadastrarGravame(req, res);
  });

  application.get(
    "/buscarDadosERP/:grupo/:cota",
    verifyJWT,
    function (req, res) {
      console.log("chegou aqui");
      application.app.controllers.gravame.buscarDadosERP(application, req, res);
    },
  );

  application.get(
    "/consultarGravameB3/:apontamento",
    verifyJWT,
    application.app.controllers.gravame.consultarB3,
  );

  application.delete(
    "/excluirGravame/:id",
    verifyJWT,
    application.app.controllers.gravame.excluirGravameLocal,
  );

  // ROTAS NOVAS COM A AUTENTICAÇÃO JWT INCLUÍDA
  application.post("/baixarGravame/:id", verifyJWT, function (req, res) {
    application.app.controllers.gravame.baixarGravameLocal(req, res);
  });

  application.post("/cancelarGravame/:id", verifyJWT, function (req, res) {
    application.app.controllers.gravame.cancelarGravameLocal(req, res);
  });
};
