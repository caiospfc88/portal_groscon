// app/utils/b3Integration.js
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Carregando os certificados do mTLS (Lembre-se de usar os de CERT/HOMOLOGAÇÃO para testes se tiver)
const certPath = path.resolve(
  __dirname,
  "../../certs/2998-111-0001RSNG_PROD.cer",
);
const keyPath = path.resolve(
  __dirname,
  "../../certs/2998-111-0001RSNG_PROD.key",
);

const httpsAgent = new https.Agent({
  cert: fs.readFileSync(certPath),
  key: fs.readFileSync(keyPath),
  rejectUnauthorized: true,
});

let cachedToken = null;
let tokenExpirationTime = null;

// Criando o client apontando para a URL base informada no e-mail para testes
const b3Client = axios.create({
  baseURL: "https://api-revolucaosng-cert.b3.com.br", // URL de certificação[cite: 1]
  httpsAgent,
});

async function getB3Token() {
  const now = new Date().getTime();

  if (
    !cachedToken ||
    (tokenExpirationTime && now > tokenExpirationTime - 600000)
  ) {
    try {
      // A chave de integração gerada pelo máster deverá ser colocada aqui (no .env futuramente)
      const chaveIntegracao =
        process.env.B3_CHAVE_INTEGRACAO || "SUA_CHAVE_AQUI";

      // Chamada exata para a rota de token[cite: 1]
      const authResponse = await b3Client.post(
        "/api/oauth/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // O padrão de mercado para OAuth2 é enviar a chave em base64 no header Authorization
            Authorization: `Basic ${Buffer.from(chaveIntegracao).toString("base64")}`,
          },
        },
      );

      cachedToken = authResponse.data.access_token;
      tokenExpirationTime = now + authResponse.data.expires_in * 1000;
    } catch (error) {
      console.error("Erro ao gerar token da B3:", error.message);
      throw new Error("Falha na autenticação com a B3");
    }
  }

  return cachedToken;
}

module.exports.enviarGravameSNG = async function (payload) {
  const token = await getB3Token();

  // A rota final de inclusão será definida baseada na documentação Swagger
  const response = await b3Client.post("/rota/sng/inclusao", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};
