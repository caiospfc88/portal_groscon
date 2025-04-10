const { formataComissao } = require("../utils/comissaoFormat");
const { geraPlanilha, saveAsExcel } = require("../utils/geraPlanilha");
const { geraPdfComissao } = require("../utils/geradorPDF");
const { formataComissaoPdf } = require("../utils/comissaoFormatPdf");
const { geraPlanilhaRelatorios } = require("../utils/geraPlanilhaRelatorios");

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

module.exports.relatorioSeguroBradescoPf = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getRelatorioSeguroBradescoPf(req, res);
  res.send(resConsulta);
};

module.exports.relatorioSeguroBradescoPj = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getRelatorioSeguroBradescoPj(req, res);
  res.send(resConsulta);
};

module.exports.gerarPlanilhasBradescoPf = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getRelatorioSeguroBradescoPf(req, res);
  geraPlanilha(req, res, resConsulta);
};

module.exports.gerarPlanilhasBradescoPj = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getRelatorioSeguroBradescoPj(req, res);
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
