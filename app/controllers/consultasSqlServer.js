const { and } = require("sequelize");

module.exports.comissoesComReducao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);

  var resConsulta = await consultaModel.getComissoesComReducao(req);
  //console.log(resConsulta);
  res.send(resConsulta);
  //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.comissoesSemReducao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  let comissao = [[{}], {}];
  comissao.valTotalComissao = 0;
  var n = 0;

  var resConsulta = await consultaModel.getComissoesSemReducao(req);
  //console.log(resConsulta[0]);

  if (req.query.opcao == 2) {
    resConsulta[0].forEach((i) => {
      console.log(i["N2_COD"]);

      if ((i["N1_COD"] = !null && i["VAL_N1"] > 0)) {
        console.log(i["N2_COD"]);
        (comissao.valTotalComissao += i["VAL_N1"]),
          comissao[n].push(i["GRUPO"]),
          n++;
      }
    });
  } else {
    resConsulta[0].forEach((i) => {
      console.log("fora do if", i["N2_COD"]);

      if (i["N2_COD"] !== null && i["VAL_N2"] > 0) {
        console.log(i["VAL_N2"], n);
        console.log(comissao[0]);
        comissao.valTotalComissao = comissao.valTotalComissao + i["VAL_N2"];
        //comissao[0][n]["GRUPO"] = i["GRUPO"];
        n++;
      }
    });
  }
  console.log(comissao);
  res.send(resConsulta);
};

module.exports.quitados = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);

  var resConsulta = await consultaModel.getQuitados(req);
  //console.log(resConsulta);
  res.send(resConsulta);
  //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.aniversariantesMes = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);

  console.log(req.headers);

  var resConsulta = await consultaModel.getAniversariantesMes(req);

  res.send(resConsulta);
  //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.relatorioRenegociacoes = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);

  var resConsulta = await consultaModel.getRelatorioRenegociacoes(req);
  //console.log(resConsulta);
  res.send(resConsulta);
  //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.relatorioAproveitamento = async function (
  application,
  req,
  res
) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);

  console.log(req);

  var resConsulta = await consultaModel.getRelatorioAproveitamento(req);
  //console.log(resConsulta);
  res.send(resConsulta);
  //res.render('home/comissoes',{selectTeste : resConsulta});
};
