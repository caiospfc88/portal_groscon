const { formataComissao } = require("../utils/comissaoFormat");
const { geraPlanilha, saveAsExcel } = require("../utils/geraPlanilha");
const { geraPdfComissao } = require("../utils/geradorPDF");
const { formataComissaoPdf } = require("../utils/comissaoFormatPdf");

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
  console.log(req.headers);
  var resConsulta = await consultaModel.getAniversariantesMes(req);
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
  let arq = geraPlanilha(req, res, resConsulta);
  saveAsExcel(arq);
  res.download(arq);
};

module.exports.gerarPlanilhasBradescoPj = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.getRelatorioSeguroBradescoPj(req, res);
  let arq = geraPlanilha(req, res, resConsulta);
  saveAsExcel(arq);
  res.download(arq);
};

module.exports.gerarPdfComissao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  if (req.query.reducao == 0) {
    var resConsulta = await consultaModel.getComissoesSemReducao(req);
  } else {
    var resConsulta = await consultaModel.getComissoesComReducao(req);
  }
  console.log(resConsulta);
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

module.exports.relatorioPerfilVendas = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resConsulta = await consultaModel.relatorioPerfilVendas(req);
  res.send(resConsulta);
};
