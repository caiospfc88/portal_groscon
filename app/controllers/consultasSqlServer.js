const { formataComissao } = require("../utils/comissaoFormat");

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
  console.log(comissao);
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
