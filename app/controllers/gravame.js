// app/controllers/gravame.js
const models = require("../../db/models");
const {
  enviarGravameSNG,
  baixarGravameSNG,
  cancelarGravameSNG,
} = require("../utils/b3Integration");

// 1. LISTAR GRAVAMES
module.exports.listarGravames = async function (req, res) {
  try {
    const models = require("../../db/models");

    // Busca todos os gravames ordenados pelos mais recentes
    const gravames = await models.gravame.findAll({
      order: [["createdAt", "DESC"]],
    });

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

    const payloadB3 = {
      data: {
        veiculo: dados.veiculo,
        credor: {
          nome: "GROSCON ADM CONS SC LTDA",
          codInstitucional: 2998,
          numDocumento: "26228270000148",
          nomeEndereco: "RUA SAO SEBASTIAO DO PARAISO",
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
          codTipoApontamento: 3,
        },
      },
    };

    let gravameLocal;

    if (idGravameLocal) {
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
    } else {
      gravameLocal = await models.gravame.create({
        chassi: dados.veiculo.numChassi,
        contrato: dados.contrato.numContrato,
        documento_financiado: dados.financiado.numDocumento,
        status_b3: "TRANSMITINDO",
        payload_enviado: JSON.stringify(payloadB3),
      });
    }

    try {
      const retornoB3 = await enviarGravameSNG(payloadB3);

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
    const connection = application.config.dbConnection;
    const gravamesERP = new application.app.models.GravamesERP(connection);

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

// 4. CONSULTA AVULSA B3
module.exports.consultarB3 = async function (req, res) {
  try {
    const { apontamento } = req.params;
    const { chassi, placa } = req.query;

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

// 5. EXCLUIR LOCAL
module.exports.excluirGravameLocal = async function (req, res) {
  try {
    const { id } = req.params;
    const models = require("../../db/models");

    const gravame = await models.gravame.findByPk(id);

    if (!gravame) {
      return res.status(404).json({ Msg: "Registro não encontrado." });
    }

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

    const gravameLocal = await models.gravame.findByPk(id);
    if (!gravameLocal)
      return res.status(404).json({ Msg: "Gravame não encontrado." });

    const payloadBaixa = {
      data: {
        dadosValidacao: {
          numChassiVeiculo: gravameLocal.chassi,
          numDocumentoFinanciado: gravameLocal.documento_financiado,
          numApontamento: Number(gravameLocal.numero_apontamento),
        },
      },
    };

    const retornoB3 = await baixarGravameSNG(payloadBaixa);

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

// 8. ALTERAR CONTRATO B3
module.exports.alterarContratoGravameLocal = async function (req, res) {
  try {
    const { numContrato } = req.params;
    const dados = req.body;
    const models = require("../../db/models");

    // Mapeamento EXATO do payload exigido pelo Swagger (ContratoAltDadosReq)
    const payloadAlteracao = {
      data: {
        dadosValidacao: {
          numChassiVeiculo: dados.veiculo.numChassi,
          numDocumentoFinanciado: dados.financiado.numDocumento,
        },
        contatoCredor: {
          nomeEndereco: "RUA SAO SEBASTIAO DO PARAISO",
          numEndereco: "1035",
          descComplementoEndereco: "SALA 1",
          nomeBairroEndereco: "CENTRO",
          siglaUfEndereco: "MG", // Fixo da integração
          codMunicipioEndereco: 4123,
          numCepEndereco: "14405010",
          numDddTelefone: "16",
          numTelefone: "37075500",
        },
        contatoFinanciado: {
          nomeEndereco: dados.financiado.nomeEndereco,
          numEndereco: dados.financiado.numEndereco,
          descComplementoEndereco:
            dados.financiado.descComplementoEndereco || "",
          nomeBairroEndereco: dados.financiado.nomeBairroEndereco,
          siglaUfEndereco: dados.financiado.siglaUfEndereco,
          codMunicipioEndereco: Number(dados.financiado.codMunicipioEndereco),
          numCepEndereco: dados.financiado.numCepEndereco,
          numDddTelefone: dados.financiado.numDddTelefone,
          numTelefone: dados.financiado.numTelefone,
        },
        contrato: {
          valPrincipal: Number(dados.contrato.valPrincipal),
          dtLiberacao: dados.contrato.dtLiberacao,
          siglaUfLiberacao: dados.contrato.siglaUfLiberacao,
          nomeCidadeLiberacao: dados.contrato.nomeCidadeLiberacao,
          dtVencimentoPrimeiraParcela:
            dados.contrato.dtVencimentoPrimeiraParcela,
          dtVencimentoUltimaParcela: dados.contrato.dtVencimentoUltimaParcela,
          valParcela: Number(dados.contrato.valParcela),
          nomeIndiceCorrecaoUtilizado:
            dados.contrato.nomeIndiceCorrecaoUtilizado,
          valTaxaContrato: Number(dados.contrato.valTaxaContrato || 0),
          valIof: Number(dados.contrato.valIof || 0),
          indMulta: Number(dados.contrato.indMulta),
          valPercentualMulta: Number(dados.contrato.valPercentualMulta || 0),
          valPercentualTaxaJurosMes: Number(
            dados.contrato.valPercentualTaxaJurosMes || 0,
          ),
          valPercentualTaxaJurosAno: Number(
            dados.contrato.valPercentualTaxaJurosAno || 0,
          ),
          indJurosMora: Number(dados.contrato.indJurosMora),
          valPercentualJurosMora: Number(
            dados.contrato.valPercentualJurosMora || 0,
          ),
          indPenalidade: Number(dados.contrato.indPenalidade),
          descPenalidade: dados.contrato.descPenalidade || "",
          indComissao: Number(dados.contrato.indComissao),
          valComissao: Number(dados.contrato.valComissao || 0),
          numDocumentoVendedor: dados.contrato.numDocumentoVendedor,
          indTipoDocumentoRecebedor: Number(
            dados.contrato.indTipoDocumentoRecebedor,
          ),
          numDocumentoRecebedor: dados.contrato.numDocumentoRecebedor,
          codGrupoConsorcio: dados.contrato.codGrupoConsorcio,
          numCotaConsorcio: Number(dados.contrato.numCotaConsorcio),
          txtObservacao: dados.contrato.txtObservacao || "",
        },
      },
    };

    const retornoB3 =
      await require("../utils/b3Integration").alterarContratoGravameSNG(
        numContrato,
        payloadAlteracao,
      );

    // Se o gravame estava na nossa base local, atualizamos o JSON dele
    if (dados.idGravameLocal) {
      const gravameLocal = await models.gravame.findByPk(dados.idGravameLocal);
      if (gravameLocal) {
        // Recria um payload de cadastro atualizado para manter sincronizado caso editem de novo
        const payloadAtualizado = {
          data: {
            veiculo: dados.veiculo,
            credor: payloadAlteracao.data.contatoCredor,
            financiado: dados.financiado,
            contrato: dados.contrato,
          },
        };
        await gravameLocal.update({
          payload_enviado: JSON.stringify(payloadAtualizado),
        });
      }
    }

    res.json({
      Msg: "Contrato alterado com sucesso",
      Detalhes: retornoB3.data,
    });
  } catch (error) {
    console.error(
      "Erro ao alterar contrato B3:",
      error.response?.data || error.message,
    );
    res.status(400).json({
      Msg: "Erro ao alterar contrato na B3",
      Detalhes:
        error.response?.data?.erros?.[0]?.detalhe || "Falha na comunicação",
    });
  }
};

// 9. CONSULTAR HISTÓRICO B3
module.exports.consultarHistoricoB3 = async function (req, res) {
  try {
    const { chassi, dtInicio, dtFim } = req.query;

    const retornoB3 =
      await require("../utils/b3Integration").consultarHistoricoGravameSNG(
        chassi,
        dtInicio,
        dtFim,
      );

    res.json(retornoB3.data);
  } catch (error) {
    console.error(
      "Erro ao consultar Histórico B3:",
      error.response?.data || error.message,
    );
    res.status(400).json({
      Msg: "Erro ao consultar histórico na B3",
      Detalhes:
        error.response?.data?.erros?.[0]?.detalhe || "Falha na comunicação",
    });
  }
};
