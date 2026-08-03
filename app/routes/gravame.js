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
    verifyJWT, // Se estiver usando autenticação
    application.app.controllers.gravame.consultarB3,
  );

  application.delete(
    "/excluirGravame/:id",
    verifyJWT, // Mantenha isso se estiver usando a autenticação JWT nas rotas
    application.app.controllers.gravame.excluirGravameLocal,
  );
};
