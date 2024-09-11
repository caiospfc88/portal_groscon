const xl = require("excel4node");
const { fillPattern } = require("excel4node/distribution/lib/types");

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";


function geraPlanilhaRelatorios(req, res, obj) {

  let nomeArquivo = req.query.nomeArquivo;
  const options = {
    sheetView: {
      showGridLines: true,
    },
    headerFooter: {
      alignWithMargins: true,
      scaleWithDoc: true,
    },
    printOptions: {
        printGridLines: true,
    },
    defaultColWidth: 30, 
  };
  const wb = new xl.Workbook({ workbookView: { visibility: "visible" }});
  const ws = wb.addWorksheet(req.body.nomeArquivo, options);
    
  var colunas = new Array();
  var myStyle = wb.createStyle({
    font: {
      size: 10,
      name: "Calibri",
    },
    alignment: {
      shrinkToFit: false,
      horizontal: "center",
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

  var myHeadStyle = wb.createStyle({
    font: {
      size: 11,
      bold: true,
      name: "Calibri",
      color: "ffffff",
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "035191",
      fgColor: "035191",
    },
    alignment: {
      shrinkToFit: false,
      horizontal: "center",
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

  ws.addImage({
    path: "img/logoPlanilha.jpg",
    type: 'picture',
    position: {
    type: 'absoluteAnchor',
    x: '2.35cm',
    y: '0.5cm',
  },
  });
  Object.entries(obj[0]).map(([chave, valor]) => colunas.push(chave));
  let colunaIndex = 2;
  colunas.forEach((heading) => {
    ws.column(colunaIndex).setWidth(25)
    ws.cell(6, colunaIndex++).string(heading).style(myHeadStyle)
    //ws.column(colunaIndex).setWidth(heading.length);
  });
  let linhaIndex = 7;
  obj.forEach((record) => {
    let colunaIndex = 2;
    Object.keys(record).forEach((colunaNome) => {
      ws.cell(linhaIndex, colunaIndex++)
        .string(record[colunaNome] == null ? "" : record[colunaNome].toString())
        .style(myStyle);
    });
    linhaIndex++;
  });
  ws.row(6).filter();
  ws.row(6).freeze();
  let pathArquivo = nomeArquivo + ".xlsx";
  
  wb.write(pathArquivo, res);

}

module.exports = { geraPlanilhaRelatorios };
