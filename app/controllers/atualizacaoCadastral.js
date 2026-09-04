// app/controllers/atualizacaoCadastral.js
const models = require("../../db/models");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

// 1. RECEBER DADOS DA VPS E SALVAR NO COFRE (Já fizemos antes)
module.exports.receberAtualizacao = async function (req, res) {
  try {
    const dados = req.body;
    const caminhoComprovante = req.file ? req.file.path : null;

    const solicitacao = await models.solicitacaoAtualizacao.create({
      cpf_cnpj: dados.cpfCnpj,
      status: "PENDENTE",
      dados_alterados: dados.dadosAlteradosJSON,
      comprovante_endereco: caminhoComprovante,
      ip_origem:
        dados.ipOrigem ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress,
    });

    res.status(201).json({ Msg: "Sucesso", idSolicitacao: solicitacao.id });
  } catch (error) {
    console.error("Erro ao receber atualização:", error);
    res.status(500).json({ Msg: "Falha interna ao gravar solicitação." });
  }
};

// 2. LISTAR PENDÊNCIAS NO PORTAL (Já fizemos antes)
module.exports.listarPendentes = async function (req, res) {
  try {
    const pendencias = await models.solicitacaoAtualizacao.findAll({
      where: { status: "PENDENTE" },
      order: [["createdAt", "ASC"]],
    });
    res.json(pendencias);
  } catch (error) {
    res.status(500).json({ Msg: "Erro interno ao listar." });
  }
};

// 3. DISPARAR CAMPANHA (ACIONAL O WORKER-COMUNICACAO)
module.exports.dispararCampanha = async function (application, req, res) {
  try {
    const { cpfCnpj } = req.body;

    // 1. Instancia o model e busca os dados na view colossal do ERP
    const connection = application.config.dbConnection;
    const modelERP = new application.app.models.AtualizacaoCadastralERP(
      connection,
    );
    const clienteERP = await modelERP.buscarDadosCliente(cpfCnpj);

    if (!clienteERP || !clienteERP["E-mail"]) {
      return res
        .status(404)
        .json({
          Msg: "Cliente não encontrado ou sem e-mail cadastrado no ERP.",
        });
    }

    // 2. Gera o Token Seguro (Válido por 48 horas)
    const token = jwt.sign(
      { cpfCnpj: clienteERP["CPF/CNPJ"] },
      process.env.JWT_SECRET || "sua_chave_secreta_aqui",
      { expiresIn: "48h" },
    );

    // URL do Shield na VPS
    const linkSeguro = `https://vps-groscon.com.br/atualizar-cadastro?token=${token}`;

    // 3. Monta o Payload no exato formato que a rota do seu worker-comunicacao espera
    const payloadWorker = {
      dados: JSON.stringify({
        templateSelecionado: "ATUALIZACAO_CADASTRAL",
        nomeCampanha: "Campanha de Atualização Cadastral",
        emailRemetente: "Groscon <onboarding@consorciogroscon.com.br>",
        destinatarios: [
          {
            id: clienteERP["CPF/CNPJ"], // Usado apenas para log individual
            nome: clienteERP.NOME,
            email: clienteERP["E-mail"].trim(),
            documento: clienteERP["CPF/CNPJ"],
            dadosExtras: {
              mensagem: linkSeguro, // Passando o link gerado para o e-mail
            },
          },
        ],
      }),
    };

    // 4. Delega a responsabilidade para o Worker-Comunicação!
    // Ele cuidará de enfileirar no RabbitMQ e gerar os templates.
    const urlWorker = `${process.env.URL_WORKER_COMUNICACAO}/enviar-campanha`;

    // O axios usará form-data ou json dependendo do que o worker aceitar
    // Como no seu worker você usa @UseInterceptors(AnyFilesInterceptor()), mandamos via multipart
    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("dados", payloadWorker.dados);

    await axios.post(urlWorker, formData, {
      headers: formData.getHeaders(),
    });

    res.json({
      Msg: "Campanha repassada ao Worker de Comunicação com sucesso!",
    });
  } catch (error) {
    console.error(
      "Erro ao processar disparo de atualização:",
      error.response?.data || error.message,
    );
    res.status(500).json({ Msg: "Erro ao comunicar com o Worker de E-mails." });
  }
};
