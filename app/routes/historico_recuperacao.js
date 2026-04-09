// src/routes/historico_recuperacao.js (ajuste o caminho conforme sua estrutura)
const { verifyJWT } = require("../utils/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pastaUploads = path.join(process.cwd(), "uploads", "audios");

// 2. Cria a pasta automaticamente se ela não existir!
if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaUploads); // Usa o caminho que garantimos que existe
  },
  filename: function (req, file, cb) {
    // Mantém o seu padrão de nome: idCota-timestamp.mp3
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
