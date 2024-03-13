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
  let comissao = new Array();
  comissao = [[], {}];
  function ItemComissao() {
    this.GRUPO = GRUPO;
    this.COTA = COTA;
    this.VS = VS;
    this.DT_CONT = DT_CONT;
    this.COD_EQ = COD_EQ;
    this.COD_REP = COD_REP;
  }
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
          (comissao[0][n] = i["GRUPO"]),
          n++;
      }
    });
  } else {
    resConsulta[0].forEach((i) => {
      console.log("fora do if", resConsulta[0][i]);

      if (i["N2_COD"] !== null && i["VAL_N2"] > 0) {
        console.log(i["GRUPO"], n);
        console.log(i["COTA"], n);
        console.log(i["VAL_N2"], n);
        comissao.valTotalComissao = comissao.valTotalComissao + i["VAL_N2"];
        comissao[0]["GRUPO"] = i["GRUPO"];
        n++;
      }
    });
  }
  console.log("comissão", comissao);
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
