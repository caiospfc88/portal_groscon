// src/routes/historico_recuperacao.js
const { verifyJWT } = require("../utils/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pastaUploads = path.join(process.cwd(), "uploads", "audios");

// Cria a pasta automaticamente se ela não existir!
if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaUploads);
  },
  filename: function (req, file, cb) {
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

  // ROTA MANTIDA (A que faz upload de áudio)
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

  application.put(
    "/atualizarHistoricoRecuperacao/:id",
    verifyJWT,
    function (req, res) {
      application.app.controllers.historicoRecuperacao.atualizarHistorico(
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

  // =======================================================
  // ROTA TEMPORÁRIA PARA O BACKFILL (SCRIPT DE SINCRONIZAÇÃO)
  // =======================================================
  application.get(
    "/sincronizarTaxas",
    // verifyJWT, // <-- Deixei comentado para você rodar direto pelo navegador
    function (req, res) {
      application.app.controllers.historicoRecuperacao.sincronizarTaxasAntigas(
        req,
        res,
      );
    },
  );
};
