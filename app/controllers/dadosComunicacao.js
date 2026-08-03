module.exports.listaDadosQuitados = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var listaDadosQuitados = new application.app.models.DadosComunicacao(
    connection,
  );
  var resConsulta = await listaDadosQuitados.listaDadosQuitados(req);

  res.send(resConsulta);
};

module.exports.listaDadosPeriodoSituacao = async function (
  application,
  req,
  res,
) {
  var connection = application.config.dbConnection;
  var listaDadosPeriodoSituacao = new application.app.models.DadosComunicacao(
    connection,
  );
  var resConsulta =
    await listaDadosPeriodoSituacao.listaDadosPeriodoSituacao(req);

  res.send(resConsulta);
};
