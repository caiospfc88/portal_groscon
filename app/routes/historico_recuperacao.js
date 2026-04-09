// src/routes/historico_recuperacao.js (ajuste o caminho conforme sua estrutura)
const { verifyJWT } = require("../utils/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Altere './uploads/audios' para o caminho da sua pasta de rede
    cb(null, "./uploads/audios");
  },
  filename: function (req, file, cb) {
    // Cria um nome único: idCota-timestamp.mp3
    cb(
      null,
      req.body.id_cota + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

module.exports = function (application) {
  application.get(
    "/listarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.listarHistorico(
        req,
        res,
      );
    },
  );

  application.post(
    "/cadastrarHistoricoRecuperacao",
    verifyJWT,
    upload.single("audio_gravacao"),
    function (req, res) {
      application.app.controllers.historicoRecuperacao.cadastrarHistorico(
        req,
        res,
      );
    },
  );

  application.get(
    "/consultarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.consultarHistorico(
        req,
        res,
      );
    },
  );

  application.post(
    "/cadastrarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.cadastrarHistorico(
        req,
        res,
      );
    },
  );

  application.put(
    "/alterarHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.alterarHistorico(
        req,
        res,
      );
    },
  );
  application.post("/statusEmLote", verifyJWT, function (req, res) {
    application.app.controllers.historicoRecuperacao.statusEmLote(req, res);
  });

  application.delete(
    "/excluirHistoricoRecuperacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.excluirHistorico(
        req,
        res,
      );
    },
  );
};
