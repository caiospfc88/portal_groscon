const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  // Rota autenticada para o painel administrativo
  application.get("/contempladosPublicados", verifyJWT, function (req, res) {
    application.app.controllers.resultado_assembleia.listarContempladosPublicados(
      req,
      res,
    );
  });

  // Rota pública (caso queira consumir no site externo sem precisar do token do portal)
  application.get("/publico/resultadosAssembleia", function (req, res) {
    application.app.controllers.resultado_assembleia.listarContempladosPublicados(
      req,
      res,
    );
  });

  application.get(
    "/publico/resultadosAssembleiaAtendimento",
    function (req, res) {
      application.app.controllers.resultado_assembleia.listarContempladosAtendimento(
        req,
        res,
      );
    },
  );

  application.post("/publicarContemplado", verifyJWT, function (req, res) {
    application.app.controllers.resultado_assembleia.publicarContemplado(
      req,
      res,
    );
  });

  application.delete("/despublicarContemplado", verifyJWT, function (req, res) {
    application.app.controllers.resultado_assembleia.despublicarContemplado(
      req,
      res,
    );
  });
};
