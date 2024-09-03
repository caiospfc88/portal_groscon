const xl = require("excel4node");

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";


function geraPlanilhaRelatorios(req, res, obj) {

  let nomeArquivo = req.query.nomeArquivo;
  const options = {
    sheetView: {
      showGridLines: false,
    },
    headerFooter: {
      alignWithMargins: true,
      scaleWithDoc: true,
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

  ws.addImage({
    path: "img/logo.jpg",
    type: 'picture',
    position: {
      type: 'twoCellAnchor',
      from: {
        col: 3,
        colOff: 0,
        row: 2,
        rowOff: 0,
      },
      to: {
        col: 6,
        colOff: 0,
        row: 5,
        rowOff: 0,
      },
    },
  });
  Object.entries(obj[0]).map(([chave, valor]) => colunas.push(chave));
  let colunaIndex = 3;
  colunas.forEach((heading) => {
    ws.cell(7, colunaIndex++).string(heading).style(myStyle);
    //ws.column(colunaIndex).setWidth(heading.length);
  });
  let linhaIndex = 8;
  obj.forEach((record) => {
    let colunaIndex = 3;
    Object.keys(record).forEach((colunaNome) => {
      ws.cell(linhaIndex, colunaIndex++)
        .string(record[colunaNome] == null ? "" : record[colunaNome].toString())
        .style(myStyle);
    });
    linhaIndex++;
  });
  ws.row(7).filter();
  ws.row(7).freeze();
  let pathArquivo = nomeArquivo + ".xlsx";
  
  wb.write(pathArquivo, res);

}

module.exports = { geraPlanilhaRelatorios };
