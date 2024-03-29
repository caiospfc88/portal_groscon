function formataComissao(req, resConsulta) {
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

  if (req.query.opcao == 2) {
    resConsulta[0].forEach((i) => {
      if (i["N1_COD"] !== null && i["VAL_N1"] !== 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N1"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N1_COD"],
          i["N1_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N1"],
          i["VAL_N1"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["N1_MAXIMO"]
        );
        comissao[0].push(item);
      }
      if (i["N2_COD"] !== null && i["VAL_N2"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N2"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N2_COD"],
          i["N2_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N2"],
          i["VAL_N2"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["N2_MAXIMO"]
        );
        comissao[0].push(item);
      }
      if (i["N3_COD"] !== null && i["VAL_N3"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N3"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N3_COD"],
          i["N3_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N3"],
          i["VAL_N3"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["N3_MAXIMO"]
        );
        comissao[0].push(item);
      }
      if (i["N4_COD"] !== null && i["VAL_N4"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N4"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N4_COD"],
          i["N4_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N4"],
          i["VAL_N4"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
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
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N1_COD"],
          i["N1_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N1"],
          i["VAL_N1"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["N1_MAXIMO"]
        );
        comissao[0].push(item);
      }
      if (i["N2_COD"] == req.query.codigo && i["VAL_N2"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N2"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N2_COD"],
          i["N2_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N2"],
          i["VAL_N2"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["N2_MAXIMO"]
        );
        comissao[0].push(item);
      }
      if (i["N3_COD"] == req.query.codigo && i["VAL_N3"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N3"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N3_COD"],
          i["N3_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N3"],
          i["VAL_N3"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["N3_MAXIMO"]
        );
        comissao[0].push(item);
      }
      if (i["N4_COD"] == req.query.codigo && i["VAL_N4"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N4"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = new ItemComissao(
          i["GRUPO"],
          i["COTA"],
          i["VS"],
          i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          i["COD_EQ"],
          i["N4_COD"],
          i["N4_DESCRICAO"],
          i["COD_TAB_COM"],
          i["NUM_PAR"],
          i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["PERC_COM_N4"],
          i["VAL_N4"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          i["N4_MAXIMO"]
        );
        comissao[0].push(item);
      }
    });
    comissao[1].push(resConsulta[1][0]);
    comissao[2].push(valorTotal);
  }
  valorTotal.valTotalComissao = valorTotal.valTotalComissao.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
  return comissao;
}
module.exports = { formataComissao };
