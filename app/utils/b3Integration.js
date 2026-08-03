// app/utils/b3Integration.js
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

const p12Path = path.resolve(
  __dirname,
  `../../certs/${process.env.B3_P12_NAME}`,
);

const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(p12Path),
  passphrase: process.env.B3_CERT_PASSWORD,
  rejectUnauthorized: false,
});

let cachedToken = null;
let tokenExpirationTime = null;

const b3Client = axios.create({
  baseURL: process.env.B3_URL,
  httpsAgent,
});

// ESPIÃO PARA DEBUG B3
b3Client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("--- LOG DE DEBUG B3 ---");
    console.error("URL Tentada:", error.config?.url);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Dados de Retorno:", error.response.data);
    } else {
      // Melhoramos a captura para pegar o código exato da queda de rede
      console.error("Erro de Rede (Mensagem):", error.message);
      console.error("Código do Erro (Node.js):", error.code);
      console.error(
        "Detalhe completo:",
        error.cause || "Sem causa raiz listada",
      );
    }
    console.error("-----------------------");
    return Promise.reject(error);
  },
);

async function getB3Token() {
  const now = new Date().getTime();

  if (
    !cachedToken ||
    (tokenExpirationTime && now > tokenExpirationTime - 600000)
  ) {
    try {
      const clientId = process.env.B3_CLIENT_ID;
      const clientSecret = process.env.B3_CLIENT_SECRET;

      // 1. Formata as credenciais APENAS para o cabeçalho (Padrão Basic Auth)
      const credentials = `${clientId}:${clientSecret}`;
      const base64Credentials = Buffer.from(credentials).toString("base64");

      // 2. No corpo (payload), mandamos APENAS o grant_type (Sem duplicar credenciais aqui)
      const payload = new URLSearchParams();
      payload.append("grant_type", "client_credentials");
      payload.append("client_id", clientId);
      payload.append("client_secret", clientSecret);

      // --- GERADOR DE EVIDÊNCIA PARA O SUPORTE DA B3 ---
      console.log(
        "\n================================================================",
      );
      console.log(
        "🕵️ EVIDÊNCIA PARA O SUPORTE DA B3 (Copie se o erro 401 persistir)",
      );
      console.log("Comando cURL exato da requisição sendo feita:");
      console.log(
        `curl --cert-type P12 --cert ./certs/${process.env.B3_P12_NAME}:${process.env.B3_CERT_PASSWORD} \\`,
      );
      console.log(`--request POST '${process.env.B3_URL}/api/oauth/token' \\`);
      console.log(
        `--header 'Content-Type: application/x-www-form-urlencoded' \\`,
      );
      console.log(`--header 'Authorization: Basic ${base64Credentials}' \\`);
      console.log(`--data 'grant_type=client_credentials'`);
      console.log(
        "================================================================\n",
      );

      // 3. Disparo da requisição limpa
      const authResponse = await b3Client.post(
        "/api/oauth/token",
        payload.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // Remova a linha do "Authorization: Basic..."
          },
        },
      );

      cachedToken = authResponse.data.access_token;
      tokenExpirationTime = now + authResponse.data.expires_in * 1000;
      console.log("✅ Token B3 gerado com sucesso!");
    } catch (error) {
      throw error;
    }
  }

  return cachedToken;
}

module.exports.enviarGravameSNG = async function (payload) {
  const token = await getB3Token();

  const response = await b3Client.post(
    "/apontamentos/transacoes/inclusoes",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-contexto-cliente": `GROSCON-${Date.now()}`,
      },
    },
  );

  return response;
};

module.exports.verificarStatusB3 = async function () {
  try {
    await b3Client.get("/api/oauth/token");
    return true;
  } catch (error) {
    if (error.response) return true;
    return false;
  }
};

module.exports.consultarGravameSNG = async function (numApontamento) {
  const token = await getB3Token();

  // A rota padrão de consulta do Swagger da B3 costuma ser um GET com o número do apontamento
  const response = await b3Client.get(
    `/apontamentos/transacoes/${numApontamento}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-contexto-cliente": `GROSCON-CONSULTA-${Date.now()}`,
      },
    },
  );

  return response;
};
