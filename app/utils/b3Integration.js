// app/utils/b3Integration.js
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Carregando os certificados do mTLS
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

// Cache do token em memória
let cachedToken = null;
let tokenExpirationTime = null;

const b3Client = axios.create({
  baseURL: "URL_BASE_DA_B3_A_DEFINIR",
  httpsAgent,
});

// Função para buscar ou reaproveitar o token
async function getB3Token() {
  const now = new Date().getTime();

  // Renova se não houver token ou se faltar menos de 10 minutos (600000 ms) para expirar
  if (
    !cachedToken ||
    (tokenExpirationTime && now > tokenExpirationTime - 600000)
  ) {
    try {
      // Exemplo da chamada de autenticação (a rota exata depende da liberação do portal)
      const authResponse = await b3Client.post(
        "/oauth2/token",
        "grant_type=client_credentials",
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          // auth: { username: "CLIENT_ID", password: "CLIENT_SECRET" } // Será necessário o portal
        },
      );

      cachedToken = authResponse.data.access_token;

      // Calcula o tempo de expiração usando o expires_in (segundos para milissegundos)
      tokenExpirationTime = now + authResponse.data.expires_in * 1000;
    } catch (error) {
      console.error("Erro ao gerar token da B3:", error.message);
      throw new Error("Falha na autenticação com a B3");
    }
  }

  return cachedToken;
}

// Função final para enviar os dados do gravame
module.exports.enviarGravameSNG = async function (payload) {
  const token = await getB3Token();

  const response = await b3Client.post("/rota/sng/inclusao", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};
