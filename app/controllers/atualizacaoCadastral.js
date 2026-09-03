// app/controllers/atualizacaoCadastral.js
const models = require("../../db/models");

// 1. RECEBER DADOS DA VPS E SALVAR NO COFRE
module.exports.receberAtualizacao = async function (req, res) {
  try {
    const dados = req.body;

    // O arquivo físico já foi salvo no servidor interno pela rota (via multer)
    const caminhoComprovante = req.file ? req.file.path : null;

    // Criamos o registro de auditoria PENDENTE
    const solicitacao = await models.solicitacaoAtualizacao.create({
      cpf_cnpj: dados.cpfCnpj,
      grupo: dados.grupo,
      cota: dados.cota,
      versao: dados.versao,
      status: "PENDENTE",
      dados_alterados: dados.dadosAlteradosJSON, // JSON em formato string vindo do form-data
      comprovante_endereco: caminhoComprovante,
      ip_origem:
        dados.ipOrigem ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress,
    });

    res.status(201).json({
      Msg: "Solicitação recebida e armazenada com sucesso no cofre.",
      idSolicitacao: solicitacao.id,
    });
  } catch (error) {
    console.error("Erro ao receber atualização cadastral:", error);
    res.status(500).json({ Msg: "Falha interna ao gravar solicitação." });
  }
};

// 2. LISTAR PENDÊNCIAS PARA O PORTAL DOS COLABORADORES
module.exports.listarPendentes = async function (req, res) {
  try {
    const pendencias = await models.solicitacaoAtualizacao.findAll({
      where: { status: "PENDENTE" },
      order: [["createdAt", "ASC"]], // O mais antigo primeiro (SLA)
    });

    res.json(pendencias);
  } catch (error) {
    console.error("Erro ao listar pendências:", error);
    res.status(500).json({ Msg: "Erro interno ao listar as atualizações." });
  }
};
