const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get(
    "/listaDadosContratoVendaImovel",
    verifyJWT,
    function (req, res) {
      // Aqui está a mágica: enviando o application como 1º parâmetro
      application.app.controllers.formulariosGeracaoDocs.listaDadosContratoVendaImovel(
        application,
        req,
        res,
      );
    },
  );

  application.get(
    "/listaCotasContratoVendaImovel",
    verifyJWT,
    function (req, res) {
      // E aqui a mesma coisa para a segunda rota
      application.app.controllers.formulariosGeracaoDocs.listaCotasContratoVendaImovel(
        application,
        req,
        res,
      );
    },
  );

  application.get(
    "/formularioTransferenciaCota",
    verifyJWT,
    function (req, res) {
      // E aqui a mesma coisa para a segunda rota
      application.app.controllers.formulariosGeracaoDocs.formularioTransferenciaCota(
        application,
        req,
        res,
      );
    },
  );
};
