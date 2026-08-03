const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listaDadosQuitados", verifyJWT, function (req, res) {
    // E aqui a mesma coisa para a segunda rota
    application.app.controllers.dadosComunicacao.listaDadosQuitados(
      application,
      req,
      res,
    );
  });

  application.get("/listaDadosPeriodoSituacao", verifyJWT, function (req, res) {
    // E aqui a mesma coisa para a segunda rota
    application.app.controllers.dadosComunicacao.listaDadosPeriodoSituacao(
      application,
      req,
      res,
    );
  });
};
