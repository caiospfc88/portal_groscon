// app/controllers/gravame.js
const models = require("../../db/models"); // Corrige o erro "models is not defined"
const {
  enviarGravameSNG,
  baixarGravameSNG,
  cancelarGravameSNG,
} = require("../utils/b3Integration");

// 1. LISTAR GRAVAMES (Corrige o erro "listarGravames is not a function")
module.exports.listarGravames = async function (req, res) {
  try {
    const models = require("../../db/models");

    // Busca todos os gravames ordenados pelos mais recentes
    const gravames = await models.gravame.findAll({
      order: [["createdAt", "DESC"]],
    });

    // O segredo está aqui: Enviamos o array puro do Sequelize,
    // com TODOS os campos (inclusive o payload_enviado e status_b3)
    res.json(gravames);
  } catch (error) {
    console.error("Erro ao listar gravames:", error);
    res.status(500).json({ Msg: "Erro interno ao listar os gravames" });
  }
};

// 2. CADASTRAR E TRANSMITIR GRAVAME
module.exports.cadastrarGravame = async function (req, res) {
  try {
    const dados = req.body;

    const idGravameLocal = dados.idGravameLocal;

    // O payload recebido do front-end já vem mapeado no padrão da B3
    const payloadB3 = {
      data: {
        veiculo: dados.veiculo,
        credor: {
          nome: "GROSCON ADM CONS SC LTDA", // Ajustado para não estourar 40 chars
          codInstitucional: 2998,
          numDocumento: "26228270000148",
          nomeEndereco: "RUA SAO SEBASTIAO DO PARAISO", // Removido acentos por segurança na B3
          numEndereco: "1035",
          descComplementoEndereco: "SALA 1",
          nomeBairroEndereco: "CENTRO",
          siglaUfEndereco: "MG",
          codMunicipioEndereco: 4123,
          numCepEndereco: "14405010",
          numDddTelefone: "16",
          numTelefone: "37075500",
        },
        financiado: dados.financiado,
        contrato: {
          ...dados.contrato,
          codTipoApontamento: 3, // FORÇANDO A ALIENAÇÃO FIDUCIÁRIA AQUI
        },
      },
    };
    let gravameLocal;

    // === LÓGICA DE UPSERT (UPDATE OU INSERT) ===
    if (idGravameLocal) {
      // É uma EDIÇÃO de um gravame rejeitado
      gravameLocal = await models.gravame.findByPk(idGravameLocal);

      if (!gravameLocal) {
        return res
          .status(404)
          .json({ Msg: "Gravame original não encontrado para edição." });
      }

      await gravameLocal.update({
        chassi: dados.veiculo.numChassi,
        contrato: dados.contrato.numContrato,
        documento_financiado: dados.financiado.numDocumento,
        status_b3: "TRANSMITINDO",
        payload_enviado: JSON.stringify(payloadB3),
      });
      console.log(JSON.stringify(payloadB3));
    } else {
      // É um NOVO gravame
      gravameLocal = await models.gravame.create({
        chassi: dados.veiculo.numChassi,
        contrato: dados.contrato.numContrato,
        documento_financiado: dados.financiado.numDocumento,
        status_b3: "TRANSMITINDO",
        payload_enviado: JSON.stringify(payloadB3),
      });
      console.log(JSON.stringify(payloadB3));
    }

    try {
      // Tentar enviar para a B3 via mTLS
      const retornoB3 = await enviarGravameSNG(payloadB3);

      // Se deu certo, atualiza o banco local com os dados de sucesso
      await gravameLocal.update({
        status_b3: "REGISTRADO",
        numero_apontamento: retornoB3.data?.numApontamento?.toString(),
        codigo_retorno: retornoB3.data?.codigoRetorno,
        mensagem_retorno: retornoB3.data?.mensagemRetorno,
      });

      res.json({
        Status: "Transmitido",
        CodigoB3: retornoB3.data?.codigoRetorno,
        MensagemB3: retornoB3.data?.mensagemRetorno,
        Apontamento: retornoB3.data?.numApontamento,
      });
    } catch (apiError) {
      // Se a B3 rejeitar, capturamos a falha exata
      const erroB3 = apiError.response?.data?.erros?.[0] || {};

      await gravameLocal.update({
        status_b3: "REJEITADO",
        codigo_retorno: erroB3.codigo || 500,
        mensagem_retorno: erroB3.detalhe || apiError.message,
      });

      res.status(400).json({
        Msg: "Gravame rejeitado pela B3.",
        Detalhes: erroB3.detalhe || apiError.message,
      });
    }
  } catch (error) {
    console.error("Erro interno no servidor ao cadastrar:", error);
    res.status(500).json({ Msg: "Falha interna ao processar gravame." });
  }
};

// 3. BUSCAR DADOS DO ERP (SQL SERVER)
module.exports.buscarDadosERP = async function (application, req, res) {
  try {
    const { grupo, cota } = req.params;

    // Injetando a conexão SQL Server através do Consign
    const connection = application.config.dbConnection;

    const gravamesERP = new application.app.models.GravamesERP(connection);

    // O 0 representa a "versao" do contrato
    const dadosB3 = await gravamesERP.buscarDadosCotaParaB3(grupo, cota, 0);

    if (!dadosB3) {
      return res.status(404).json({ Msg: "Cota não encontrada no ERP." });
    }

    res.json(dadosB3);
  } catch (error) {
    console.error("Erro na controller buscarDadosERP:", error);
    res.status(500).json({ Msg: "Erro interno ao buscar cota." });
  }
};

module.exports.consultarB3 = async function (req, res) {
  try {
    const { apontamento } = req.params;
    const { chassi, placa } = req.query;

    // Chama a função que criamos no passo anterior
    const retornoB3 =
      await require("../utils/b3Integration").consultarGravameSNG(
        apontamento,
        chassi,
        placa,
      );

    res.json(retornoB3.data);
  } catch (error) {
    console.error(
      "Erro ao consultar B3:",
      error.response?.data || error.message,
    );
    res.status(400).json({
      Msg: "Erro ao consultar a B3",
      Detalhes:
        error.response?.data?.erros?.[0]?.detalhe || "Falha na comunicação",
    });
  }
};

module.exports.excluirGravameLocal = async function (req, res) {
  try {
    const { id } = req.params;
    const models = require("../../db/models");

    const gravame = await models.gravame.findByPk(id);

    if (!gravame) {
      return res.status(404).json({ Msg: "Registro não encontrado." });
    }

    // Trava de segurança no back-end
    if (gravame.status_b3 !== "REJEITADO") {
      return res
        .status(400)
        .json({ Msg: "Apenas registros REJEITADOS podem ser excluídos." });
    }

    await gravame.destroy();
    res.json({ Msg: "Registro excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir gravame local:", error);
    res.status(500).json({ Msg: "Erro interno ao excluir registro." });
  }
};

// 6. BAIXAR GRAVAME (Quitação)
module.exports.baixarGravameLocal = async function (req, res) {
  try {
    const { id } = req.params;
    const models = require("../../db/models");

    // 1. Encontra o gravame no banco local
    const gravameLocal = await models.gravame.findByPk(id);
    if (!gravameLocal)
      return res.status(404).json({ Msg: "Gravame não encontrado." });

    // 2. Monta o Payload exigido pelo Swagger da B3 para Baixas
    const payloadBaixa = {
      data: {
        dadosValidacao: {
          numChassiVeiculo: gravameLocal.chassi,
          numDocumentoFinanciado: gravameLocal.documento_financiado,
          numApontamento: Number(gravameLocal.numero_apontamento),
        },
      },
    };

    // 3. Envia para a B3
    const retornoB3 = await baixarGravameSNG(payloadBaixa);

    // 4. Atualiza o banco local
    await gravameLocal.update({
      status_b3: "BAIXADO",
      codigo_retorno: retornoB3.data?.codigoRetorno,
      mensagem_retorno: retornoB3.data?.mensagemRetorno,
    });

    res.json({ Msg: "Gravame baixado com sucesso na B3." });
  } catch (error) {
    const erroB3 = error.response?.data?.erros?.[0] || {};
    res.status(400).json({
      Msg: "Erro ao tentar baixar na B3.",
      Detalhes: erroB3.detalhe || error.message,
    });
  }
};

// 7. CANCELAR GRAVAME (Erro de Inclusão)
module.exports.cancelarGravameLocal = async function (req, res) {
  try {
    const { id } = req.params;
    const models = require("../../db/models");

    const gravameLocal = await models.gravame.findByPk(id);
    if (!gravameLocal)
      return res.status(404).json({ Msg: "Gravame não encontrado." });

    // Monta o Payload exigido pelo Swagger da B3 para Cancelamentos
    const payloadCancelamento = {
      data: {
        dadosValidacao: {
          numChassiVeiculo: gravameLocal.chassi,
          numDocumentoFinanciado: gravameLocal.documento_financiado,
          numApontamento: Number(gravameLocal.numero_apontamento),
        },
      },
    };

    const retornoB3 = await cancelarGravameSNG(payloadCancelamento);

    await gravameLocal.update({
      status_b3: "CANCELADO",
      codigo_retorno: retornoB3.data?.codigoRetorno,
      mensagem_retorno: retornoB3.data?.mensagemRetorno,
    });

    res.json({ Msg: "Gravame cancelado com sucesso na B3." });
  } catch (error) {
    const erroB3 = error.response?.data?.erros?.[0] || {};
    res.status(400).json({
      Msg: "Erro ao tentar cancelar na B3.",
      Detalhes: erroB3.detalhe || error.message,
    });
  }
};
