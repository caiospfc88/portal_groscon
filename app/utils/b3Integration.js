// app/utils/b3Integration.js
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

// 1. Configuração do Certificado (mTLS)
function criarAgenteHttps() {
  // CORREÇÃO: Apontando direto para a pasta certs na raiz do projeto
  const certPath = path.resolve(
    __dirname,
    `../../certs/${process.env.B3_P12_NAME}`,
  );

  return new https.Agent({
    pfx: fs.readFileSync(certPath),
    passphrase: process.env.B3_CERT_PASSWORD, // Lê do seu .env
    rejectUnauthorized: false,
  });
}

// 2. Geração do Token
async function gerarTokenSNG() {
  try {
    const agent = criarAgenteHttps();

    const bodyParams = new URLSearchParams();
    bodyParams.append("grant_type", "client_credentials");
    bodyParams.append("client_id", process.env.B3_CLIENT_ID);
    bodyParams.append("client_secret", process.env.B3_CLIENT_SECRET);

    const tokenResponse = await axios.post(
      process.env.B3_URL + "/api/oauth/token", // CORREÇÃO: Usando a sua B3_URL + o endpoint de token
      bodyParams.toString(),
      {
        headers: {
          chave: process.env.B3_CHAVE_INTEGRACAO, // CORREÇÃO: Usando o seu nome do .env
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent: agent,
      },
    );

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error(
      "Erro ao gerar token B3:",
      error.response?.data || error.message,
    );
    throw new Error("Falha ao obter token de acesso da B3.");
  }
}

// 3. Envio do Gravame
async function enviarGravameSNG(payloadJSON) {
  try {
    const token = await gerarTokenSNG();
    const agent = criarAgenteHttps();

    // Gera um ID único para essa transação, exigido pela B3
    const idTransacao = crypto.randomUUID();

    const response = await axios.post(
      // A URL MATADORA: B3_URL + Basepath + Endpoint
      process.env.B3_URL + "/api/rsng/v2/apontamentos/transacoes/inclusoes",
      payloadJSON,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          chave: process.env.B3_CHAVE_INTEGRACAO,
          "Content-Type": "application/json",
          // Headers Obrigatórios baseados no PDF da B3:
          "x-v": "2.0.0", // Atualizado para acompanhar o v2 da URL
          "x-id-transacao": idTransacao,
          "x-contexto-cliente": "Groscon",
        },
        httpsAgent: agent,
      },
    );

    return response;
  } catch (error) {
    console.error(
      "Erro ao enviar Gravame para B3:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// 4. Envio de Baixa de Gravame
async function baixarGravameSNG(payloadJSON) {
  try {
    const token = await gerarTokenSNG();
    const agent = criarAgenteHttps();
    const idTransacao = crypto.randomUUID();

    const response = await axios.post(
      process.env.B3_URL + "/api/rsng/v2/apontamentos/transacoes/baixas",
      payloadJSON,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          chave: process.env.B3_CHAVE_INTEGRACAO,
          "Content-Type": "application/json",
          "x-v": "2.0.0",
          "x-id-transacao": idTransacao,
          "x-contexto-cliente": "Groscon",
        },
        httpsAgent: agent,
      },
    );

    return response;
  } catch (error) {
    console.error(
      "Erro ao Baixar Gravame na B3:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// 5. Envio de Cancelamento de Gravame
async function cancelarGravameSNG(payloadJSON) {
  try {
    const token = await gerarTokenSNG();
    const agent = criarAgenteHttps();
    const idTransacao = crypto.randomUUID();

    const response = await axios.post(
      process.env.B3_URL + "/api/rsng/v2/apontamentos/transacoes/cancelamentos",
      payloadJSON,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          chave: process.env.B3_CHAVE_INTEGRACAO,
          "Content-Type": "application/json",
          "x-v": "2.0.0",
          "x-id-transacao": idTransacao,
          "x-contexto-cliente": "Groscon",
        },
        httpsAgent: agent,
      },
    );

    return response;
  } catch (error) {
    console.error(
      "Erro ao Cancelar Gravame na B3:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function consultarGravameSNG(apontamento, chassi, placa) {
  try {
    const token = await gerarTokenSNG();
    const agent = criarAgenteHttps();
    const idTransacao = crypto.randomUUID();

    // Rota com a trinca completa: Apontamento + Chassi + Placa
    const urlConsulta = `${process.env.B3_URL}/api/rsng/v2/apontamentos/ultimas-posicoes?numApontamento=${apontamento}&numChassiVeiculo=${chassi}&numPlacaVeiculo=${placa}`;

    const response = await axios.get(urlConsulta, {
      headers: {
        Authorization: `Bearer ${token}`,
        chave: process.env.B3_CHAVE_INTEGRACAO,
        "Content-Type": "application/json",
        "x-v": "2.0.0",
        "x-id-transacao": idTransacao,
        "x-contexto-cliente": "Groscon",
      },
      httpsAgent: agent,
    });

    return response;
  } catch (error) {
    console.error(
      "Erro ao Consultar Gravame na B3:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Não esqueça de exportar as novas funções no final do arquivo:
module.exports = {
  gerarTokenSNG,
  enviarGravameSNG,
  baixarGravameSNG,
  cancelarGravameSNG,
  consultarGravameSNG,
};
