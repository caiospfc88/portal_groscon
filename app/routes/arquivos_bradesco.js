const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarArquivosBradesco", verifyJWT, function (req, res) {
    application.app.controllers.arquivos_bradesco.listarArquivosBradesco(
      req,
      res
    );
  });
  application.get("/consultarArquivoBradesco", verifyJWT, function (req, res) {
    application.app.controllers.arquivos_bradesco.consultarArquivoBradesco(
      req,
      res
    );
  });
  application.post("/cadastrarArquivoBradesco", verifyJWT, function (req, res) {
    application.app.controllers.arquivos_bradesco.cadastrarArquivoBradesco(
      req,
      res
    );
  });
  application.put("/alterarArquivoBradesco", verifyJWT, function (req, res) {
    application.app.controllers.arquivos_bradesco.alterarArquivoBradesco(
      req,
      res
    );
  });
};
