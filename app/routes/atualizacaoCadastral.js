// app/routes/atualizacaoCadastral.js
const { verifyJWT } = require("../utils/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuração segura do Multer para o cofre
const storageInterno = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/comprovantes_cadastrais");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `comprovante_${suffix}${ext}`);
  },
});
const uploadLocal = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: storageInterno,
});

const verificarApiKeyInterna = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res
      .status(403)
      .json({ Msg: "Acesso negado. Origem não confirmada." });
  }
  next();
};

module.exports = function (application) {
  // ROTA DA DMZ (A VPS POSTA OS DADOS AQUI)
  application.post(
    "/api/interno/receber-atualizacao",
    verificarApiKeyInterna,
    uploadLocal.single("comprovante"),
    function (req, res) {
      application.app.controllers.atualizacaoCadastral.receberAtualizacao(
        req,
        res,
      );
    },
  );

  // ROTA DO FRONT-END (PORTAL NODE) - Lista a fila de trabalho para a moderação
  application.get(
    "/api/atualizacoes/pendentes",
    verifyJWT,
    function (req, res) {
      application.app.controllers.atualizacaoCadastral.listarPendentes(
        req,
        res,
      );
    },
  );

  // ROTA DO FRONT-END (PORTAL NODE) - Botão que o atendente clica para gerar o e-mail pro cliente
  application.post(
    "/api/atualizacoes/disparar",
    verifyJWT,
    function (req, res) {
      application.app.controllers.atualizacaoCadastral.dispararCampanha(
        application,
        req,
        res,
      );
    },
  );
};
