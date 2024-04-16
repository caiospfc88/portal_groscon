function formataComissao(req, resConsulta) {
  let comissao = new Array();
  comissao = [[], [], []];
  var valorTotal = new Object();
  valorTotal.valTotalComissao = 0;
  valorTotal.qtdCotas = 0;
  if (req.query.opcao == 2) {
    resConsulta[0].forEach((i) => {
      if (i["N1_COD"] !== null && i["VAL_N1"] !== 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N1"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N1_COD"],
          TIPO: i["N1_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N1"],
          VAL_COMISSAO: i["VAL_N1"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N1_MAXIMO"],
        };
        comissao[0].push(item);
      }
      if (i["N2_COD"] !== null && i["VAL_N2"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N2"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N2_COD"],
          TIPO: i["N2_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N2"],
          VAL_COMISSAO: i["VAL_N2"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N2_MAXIMO"],
        };
        comissao[0].push(item);
      }
      if (i["N3_COD"] !== null && i["VAL_N3"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N3"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N3_COD"],
          TIPO: i["N3_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N3"],
          VAL_COMISSAO: i["VAL_N3"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N3_MAXIMO"],
        };
        comissao[0].push(item);
      }
      if (i["N4_COD"] !== null && i["VAL_N4"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N4"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N4_COD"],
          TIPO: i["N4_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N4"],
          VAL_COMISSAO: i["VAL_N4"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N4_MAXIMO"],
        };
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
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N1_COD"],
          TIPO: i["N1_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N1"],
          VAL_COMISSAO: i["VAL_N1"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N1_MAXIMO"],
        };
        //console.log("item: ", item);
        comissao[0].push(item);
      }
      if (i["N2_COD"] == req.query.codigo && i["VAL_N2"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N2"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N2_COD"],
          TIPO: i["N2_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N2"],
          VAL_COMISSAO: i["VAL_N2"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N2_MAXIMO"],
        };
        //console.log("item: ", item);
        comissao[0].push(item);
      }
      if (i["N3_COD"] == req.query.codigo && i["VAL_N3"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N3"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N3_COD"],
          TIPO: i["N3_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N3"],
          VAL_COMISSAO: i["VAL_N3"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N3_MAXIMO"],
        };
        //console.log("item: ", item);
        comissao[0].push(item);
      }
      if (i["N4_COD"] == req.query.codigo && i["VAL_N4"] > 0) {
        valorTotal.valTotalComissao = valorTotal.valTotalComissao + i["VAL_N4"];
        valorTotal.qtdCotas = valorTotal.qtdCotas + 1;
        var item = {
          GRUPO: i["GRUPO"],
          COTA: i["COTA"],
          VS: i["VS"],
          DT_CONT: i["DT_CONT"]
            .toISOString()
            .substr(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          COD_EQ: i["COD_EQ"],
          COD_REP: i["N4_COD"],
          TIPO: i["N4_DESCRICAO"],
          TAB_COMISSAO: i["COD_TAB_COM"],
          NUM_PARCELA: i["NUM_PAR"],
          VAL_TAXA: i["VL_TX_ADM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          VAL_BEM: i["VL_BEM"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          PERC_COMISSAO: i["PERC_COM_N4"],
          VAL_COMISSAO: i["VAL_N1"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          TOTAL_VENDAS: i["TOTAL_VENDAS_MES"].toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          MAX_COMISSAO: i["N4_MAXIMO"],
        };
        //console.log("item: ", item);
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

  valorTotal.periodo = resConsulta[2];
  //console.log(valorTotal);
  return comissao;
}
module.exports = { formataComissao };
