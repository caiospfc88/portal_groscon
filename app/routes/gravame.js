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

  application.post("/baixarGravame/:id", verifyJWT, function (req, res) {
    application.app.controllers.gravame.baixarGravameLocal(req, res);
  });

  application.post("/cancelarGravame/:id", verifyJWT, function (req, res) {
    application.app.controllers.gravame.cancelarGravameLocal(req, res);
  });

  // Rota de alteração de dados de contrato existente (PUT)
  application.put(
    "/alterarContratoGravame/:numContrato",
    verifyJWT,
    function (req, res) {
      application.app.controllers.gravame.alterarContratoGravameLocal(req, res);
    },
  );

  // Rota para consulta de histórico do chassi (GET)
  application.get("/historicoB3", verifyJWT, function (req, res) {
    application.app.controllers.gravame.consultarHistoricoB3(req, res);
  });
};
