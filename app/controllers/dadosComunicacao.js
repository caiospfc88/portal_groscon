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

module.exports.listaDadosFcPagoSituacao = async function (
  application,
  req,
  res,
) {
  try {
    let fcPago = req.query.fcPago;
    if (!fcPago) {
      return res.status(400).json({ Msg: "Parâmetro fcPago é obrigatório." });
    }

    var connection = application.config.dbConnection;
    var listaDadosPeriodoSituacao = new application.app.models.DadosComunicacao(
      connection,
    );

    var resConsulta =
      await listaDadosPeriodoSituacao.listaDadosFcPagoSituacao(req);

    // 🌟 PROTEÇÃO: Se o banco retornou o objeto de erro em vez de um Array, estoure o erro!
    if (resConsulta && resConsulta.name === "RequestError") {
      throw resConsulta;
    }

    res.json(resConsulta);
  } catch (error) {
    console.error(
      "❌ Erro do SQL Server na consulta FC Pago:",
      error.message || error,
    );
    res.status(500).json({ Msg: "Erro interno no banco de dados." });
  }
};
