const xl = require("excel4node");

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xls";

var FileSaver = require("file-saver");

function saveAsExcel(buffer, filename) {
  const data = new Blob([buffer], { type: EXCEL_TYPE });
  FileSaver.saveAs(data, filename + EXCEL_EXTENSION);
}

function geraPlanilha(req, res, obj) {
  let data_inicial = req.query.contabil_ini;

  let mes, ano;

  if (data_inicial.substr(4, 1) == 0) {
    mes = data_inicial.substr(5, 1);
  } else {
    mes = data_inicial.substr(4, 2);
  }
  ano = data_inicial.substr(0, 4);

  let nomeArquivo = req.query.nomeArquivo + mes + ano;
  const options = {
    sheetView: {
      showGridLines: false,
    },
    headerFooter: {
      alignWithMargins: true,
      scaleWithDoc: true,
    },
  };
  const wb = new xl.Workbook({ workbookView: { visibility: "visible" } });
  const ws = wb.addWorksheet(req.body.nomeArquivo, options);
  var colunas = new Array();
  var myStyle = wb.createStyle({
    font: {
      size: 10,
      name: "Calibri",
    },
    alignment: {
      shrinkToFit: false,
      horizontal: "right",
      wrapText: false,
    },
    border: {
      left: {
        style: "thin", //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
        color: "#000000", // HTML style hex value
      },
      right: {
        style: "thin",
        color: "#000000",
      },
      top: {
        style: "thin",
        color: "#000000",
      },
      bottom: {
        style: "thin",
        color: "#000000",
      },
    },
  });

  Object.entries(obj[0]).map(([chave, valor]) => colunas.push(chave));
  let colunaIndex = 1;
  colunas.forEach((heading) => {
    ws.cell(1, colunaIndex++).string(heading).style(myStyle);
    //ws.column(colunaIndex).setWidth(heading.length);
  });
  let linhaIndex = 2;
  obj.forEach((record) => {
    let colunaIndex = 1;
    Object.keys(record).forEach((colunaNome) => {
      ws.cell(linhaIndex, colunaIndex++)
        .string(record[colunaNome].toString())
        .style(myStyle);
    });
    linhaIndex++;
  });
  let pathArquivo = "/planilhas/" + nomeArquivo + ".xls";

  wb.write(pathArquivo);
  return pathArquivo;
}

module.exports = { geraPlanilha, saveAsExcel };
