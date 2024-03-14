const { and } = require("sequelize");

module.exports.comissoesComReducao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);

  var resConsulta = await consultaModel.getComissoesComReducao(req);
  console.log(application.app.utils);
  var comissao = application.app.utils.formataComissao(req, resConsulta);
  res.send(comissao);
};

module.exports.comissoesSemReducao = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  let comissao = new Array();
  comissao = [[], [], []];
  function ItemComissao(
    GRUPO,
    COTA,
    VS,
    DT_CONT,
    COD_EQ,
    COD_REP,
    TIPO,
    TAB_COMISSAO,
    NUM_PARCELA,
    VAL_TAXA,
    VAL_BEM,
    PERC_COMISSAO,
    VAL_COMISSAO,
    TOTAL_VENDAS,
    MAX_COMISSAO
  ) {
    this.GRUPO = GRUPO;
    this.COTA = COTA;
    this.VS = VS;
    this.DT_CONT = DT_CONT;
    this.COD_EQ = COD_EQ;
    this.COD_REP = COD_REP;
    this.TIPO = TIPO;
    this.TAB_COMISSAO = TAB_COMISSAO;
    this.NUM_PARCELA = NUM_PARCELA;
    this.VAL_TAXA = VAL_TAXA;
    this.VAL_BEM = VAL_BEM;
    this.PERC_COMISSAO = PERC_COMISSAO;
    this.VAL_COMISSAO = VAL_COMISSAO;
    this.TOTAL_VENDAS = TOTAL_VENDAS;
    this.MAX_COMISSAO = MAX_COMISSAO;
  }
  var valorTotal = new Object();
  valorTotal.valTotalComissao = 0;
  valorTotal.qtdCotas = 0;

  var resConsulta = await consultaModel.getComissoesSemReducao(req);
  //console.log(resConsulta[0]);

  if (req.query.opcao == 2) {
    resConsulta[0].forEach((i) => {
      if (i["N1_COD"] !== null && i["VAL_N1"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N1"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N1_COD"],
          i["N1_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N1"],
          i["VAL_N1"],
          i["TOTAL_VENDAS_MES"],
          i["N1_MAXIMO"]
        );
        comissao[0].push(item);
      } else if (i["N2_COD"] !== null && i["VAL_N2"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N2"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N2_COD"],
          i["N2_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N2"],
          i["VAL_N2"],
          i["TOTAL_VENDAS_MES"],
          i["N2_MAXIMO"]
        );
        comissao[0].push(item);
      } else if (i["N3_COD"] !== null && i["VAL_N3"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N3"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N3_COD"],
          i["N3_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N3"],
          i["VAL_N3"],
          i["TOTAL_VENDAS_MES"],
          i["N3_MAXIMO"]
        );
        comissao[0].push(item);
      } else if (i["N4_COD"] !== null && i["VAL_N4"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N4"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N4_COD"],
          i["N4_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N4"],
          i["VAL_N4"],
          i["TOTAL_VENDAS_MES"],
          i["N4_MAXIMO"]
        );
        comissao[0].push(item);
      }
    });
    comissao[1].push(resConsulta[1][0]);
    comissao[2].push(valorTotal);
  } else {
    resConsulta[0].forEach((i) => {
      if (i["N1_COD"] == req.query.codigo && i["VAL_N1"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N1"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N1_COD"],
          i["N1_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N1"],
          i["VAL_N1"],
          i["TOTAL_VENDAS_MES"],
          i["N1_MAXIMO"]
        );
        comissao[0].push(item);
      } else if (i["N2_COD"] == req.query.codigo && i["VAL_N2"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N2"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N2_COD"],
          i["N2_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N2"],
          i["VAL_N2"],
          i["TOTAL_VENDAS_MES"],
          i["N2_MAXIMO"]
        );
        comissao[0].push(item);
      } else if (i["N3_COD"] == req.query.codigo && i["VAL_N3"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N3"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N3_COD"],
          i["N3_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N3"],
          i["VAL_N3"],
          i["TOTAL_VENDAS_MES"],
          i["N3_MAXIMO"]
        );
        comissao[0].push(item);
      } else if (i["N4_COD"] == req.query.codigo && i["VAL_N4"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N4"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"],
          i["COD_EQ"],
          i["N4_COD"],
          i["N4_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"],
          i["VL_BEM"],
          i["PERC_COM_N4"],
          i["VAL_N4"],
          i["TOTAL_VENDAS_MES"],
          i["N4_MAXIMO"]
        );
        comissao[0].push(item);
      }
    });
    comissao[1].push(resConsulta[1][0]);
    comissao[2].push(valorTotal);
  }
  res.send(comissao);
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
