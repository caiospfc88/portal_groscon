const xl = require("excel4node");

function geraPlanilhaBradesco(obj, nomeArquivo) {
  const options = {
    sheetView: {
      showGridLines: false,
    },
  };
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet(nomeArquivo, options);
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

  wb.write("P:/TI/seguroBradesco/" + nomeArquivo + ".xls");
}

module.exports = { geraPlanilhaBradesco };
