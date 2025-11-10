const { formataComissao } = require("../utils/comissaoFormat");
const { geraPlanilha } = require("../utils/geraPlanilha");
const { geraPdfComissao } = require("../utils/geradorPDF");
const { formataComissaoPdf } = require("../utils/comissaoFormatPdf");
const { geraPlanilhaRelatorios } = require("../utils/geraPlanilhaRelatorios");
const { gerarRelatorioPDF } = require("../utils/gerarPDFGenerico");

module.exports.comissoesComReducao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getComissoesComReducao(req);
  var comissao = formataComissao(req, resConsulta);
  res.send(comissao);
};

module.exports.comissoesSemReducao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getComissoesSemReducao(req);
  var comissao = formataComissao(req, resConsulta);
  res.send(comissao);
};

module.exports.comissoesPagasAnalitico = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.comissoesPagasAnalitico(req);
  res.send(resConsulta);
};

module.exports.comissoesPagasSintetico = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.comissoesPagasSintetico(req);
  res.send(resConsulta);
};

module.exports.rateioComissaoFixa = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.rateioComissaoFixa(req);
  res.send(resConsulta);
};

module.exports.ComissaoExtraManual = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.ComissaoExtraManual(req);
  res.send(resConsulta);
};

module.exports.quitados = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getQuitados(req);
  res.send(resConsulta);
};

module.exports.aniversariantesMes = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getAniversariantesMes(req);
  res.send(resConsulta);
};

module.exports.getAniversariantesPeriodo = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getAniversariantesPeriodo(req);
  res.send(resConsulta);
};

module.exports.relatorioRenegociacoes = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getRelatorioRenegociacoes(req);
  res.send(resConsulta);
};

module.exports.relatorioAproveitamento = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getRelatorioAproveitamento(req);
  res.send(resConsulta);
};
module.exports.relatorioSeguroBradesco = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioSeguroBradesco(req, res);
  res.send(resConsulta);
};

module.exports.relatorioSeguroHdi = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioSeguroHdi(req, res);
  res.send(resConsulta);
};

module.exports.gerarPlanilhasBradesco = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioSeguroBradesco(req, res);
  geraPlanilha(req, res, resConsulta);
};

module.exports.gerarPlanilhasHdi = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioSeguroHdi(req, res);
  geraPlanilha(req, res, resConsulta);
};

module.exports.gerarPlanilhasRelatorios = async function (req, res) {
  let Obj = req.body;
  await geraPlanilhaRelatorios(req, res, Obj);
};

module.exports.gerarPdfComissao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  if (req.query.reducao == 0) {
    var resConsulta = await consultaModel.getComissoesSemReducao(req);
  } else {
    var resConsulta = await consultaModel.getComissoesComReducao(req);
  }
  var comissao = formataComissaoPdf(req, resConsulta);
  geraPdfComissao(comissao, req, res);
  //res.send("Relatório gerado");
};

module.exports.gerarPdfComissaoDados = async function (application, req, res) {
  var resConsulta = req.body;
  var comissao = formataComissaoPdf(req, resConsulta);
  geraPdfComissao(comissao, req, res);
  //res.send("Relatório gerado");
};

module.exports.gerarPdfGenerico = async function (application, req, res) {
  const { dados, relatorio, usuario, complemento, total, representantes } =
    req.body;
  if (!dados || !Array.isArray(dados)) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  try {
    const pdfBuffer = await gerarRelatorioPDF(
      dados,
      relatorio,
      usuario,
      complemento,
      total,
      representantes
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).json({ erro: "Erro ao gerar o PDF" });
  }
};

module.exports.selecionaPeriodoComissao = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaPeriodoComissao(req);
  res.send(resConsulta);
};

module.exports.selecionaRepresentantes = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaRepresentantes(req);
  res.send(resConsulta);
};

module.exports.selecionaEquipes = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaEquipes(req);
  res.send(resConsulta);
};

module.exports.selecionaCliente = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaCliente(req);
  res.send(resConsulta);
};

module.exports.selecionaContatosCliente = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaContatosCliente(req);
  res.send(resConsulta);
};

module.exports.selecionaTabTel = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaTabTel(req);
  res.send(resConsulta);
};

module.exports.selecionaEstados = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaEstados(req);
  res.send(resConsulta);
};

module.exports.situacaoCotasEstado = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.situacaoCotasEstado(req);
  res.send(resConsulta);
};

module.exports.selecionaCotasAtivasComEmail = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaCotasAtivasComEmail(req);
  res.send(resConsulta);
};

module.exports.selecionaCotasAtivasComEmailEx = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.selecionaCotasAtivasComEmail(req);
  await geraPlanilhaRelatorios(req, res, resConsulta);
};

module.exports.relatorioPerfilVendas = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioPerfilVendas(req);
  res.send(resConsulta);
};

module.exports.relatorioVendasTabelaComissao = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioVendasTabelaComissao(req);
  res.send(resConsulta);
};

module.exports.verificacaoNacionalidade = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoNacionalidade(req);
  res.send(resConsulta);
};

module.exports.verificacaoNome = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoNome(req);
  res.send(resConsulta);
};

module.exports.verificacaoFiliacao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoFiliacao(req);
  res.send(resConsulta);
};

module.exports.verificacaoDtNascimento = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoDtNascimento(req);
  res.send(resConsulta);
};

module.exports.verificacaoLocalNascimento = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoLocalNascimento(req);
  res.send(resConsulta);
};

module.exports.verificacaoNumeroRg = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoNumeroRg(req);
  res.send(resConsulta);
};

module.exports.verificacaoDtEmissaoRg = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoDtEmissaoRg(req);
  res.send(resConsulta);
};

module.exports.verificacaoOrgaoExpedicaoRg = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoOrgaoExpedicaoRg(req);
  res.send(resConsulta);
};

module.exports.verificacaoSemRendaPf = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoSemRendaPf(req);
  res.send(resConsulta);
};

module.exports.verificacaoFirmaDenominacaoSocial = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoFirmaDenominacaoSocial(req);
  res.send(resConsulta);
};

module.exports.verificacaoAtivoPrincipal = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoAtivoPrincipal(req);
  res.send(resConsulta);
};

module.exports.verificacaoDataConstituicao = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoDataConstituicao(req);
  res.send(resConsulta);
};

module.exports.verificacaoSemRendaPj = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.verificacaoSemRendaPj(req);
  res.send(resConsulta);
};

module.exports.cotasNaoContempParQuitacao = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.cotasNaoContempParQuitacao(req);
  res.send(resConsulta);
};

module.exports.dadosCliente = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.dadosCliente(req);
  res.send(resConsulta);
};

module.exports.docPorCota = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.docPorCota(req);
  res.send(resConsulta);
};

module.exports.docPorPlaca = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.docPorPlaca(req);
  res.send(resConsulta);
};

module.exports.cotasPagasAtrasoSemMultaJuros = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.cotasPagasAtrasoSemMultaJuros(req);
  res.send(resConsulta);
};

module.exports.cotasCliente = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.cotasCliente(req);
  res.send(resConsulta);
};

module.exports.historicoCota = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.historicoCota(req);
  res.send(resConsulta);
};

module.exports.alienacao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.alienacao(req);
  res.send(resConsulta);
};

module.exports.fasesProcessoAlienacao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.fasesProcessoAlienacao(req);
  res.send(resConsulta);
};

module.exports.gruposAtivos = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.gruposAtivos(req);
  res.send(resConsulta);
};

module.exports.telefonesCota = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.telefonesCota(req);
  res.send(resConsulta);
};

module.exports.relatorioValoresDevolver = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioValoresDevolver(req);
  res.send(resConsulta);
};

module.exports.movimentosFinanceirosCota = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.movimentosFinanceirosCota(req);
  res.send(resConsulta);
};

module.exports.proximasAssembleias = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.proximasAssembleias(req);
  res.send(resConsulta);
};

module.exports.codigosMovimentosFinanceirosCota = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.codigosMovimentosFinanceirosCota(req);
  res.send(resConsulta);
};
