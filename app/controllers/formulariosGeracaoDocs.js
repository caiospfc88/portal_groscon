module.exports.listaDadosContratoVendaImovel = async function (
  application,
  req,
  res,
) {
  var connection = application.config.dbConnection;
  var formularioGeracaoDocs = new application.app.models.FormulariosGeracaoDocs(
    connection,
  );
  var resConsulta =
    await formularioGeracaoDocs.formularioContratoVendaImovel(req);

  res.send(resConsulta);
};

module.exports.listaCotasContratoVendaImovel = async function (
  application,
  req,
  res,
) {
  var connection = application.config.dbConnection;
  var formulariosGeracaoDocs =
    new application.app.models.FormulariosGeracaoDocs(connection);
  var resConsulta =
    await formulariosGeracaoDocs.formularioContratoVendaImovelCotas(req);

  res.send(resConsulta);
};

module.exports.formularioTransferenciaCota = async function (
  application,
  req,
  res,
) {
  var connection = application.config.dbConnection;
  var formulariosGeracaoDocs =
    new application.app.models.FormulariosGeracaoDocs(connection);
  var resConsulta =
    await formulariosGeracaoDocs.formularioTransferenciaCota(req);

  res.send(resConsulta);
};
