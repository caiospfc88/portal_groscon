// app/routes/atualizacaoCadastral.js
const { verifyJWT } = require("../utils/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuração segura do Multer para armazenamento local
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
  storage: storageInterno,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware escudo (Chave entre VPS e Servidor Interno)
const verificarApiKeyInterna = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res
      .status(403)
      .json({ Msg: "Acesso negado. Origem da DMZ não confirmada." });
  }
  next();
};

module.exports = function (application) {
  // 🚀 ROTA ACESSADA PELA VPS (KONG) -> Recebe os dados e salva o arquivo
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

  // 👤 ROTA ACESSADA PELO PORTAL (Next.js interno) -> Lista a fila de trabalho
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
};
