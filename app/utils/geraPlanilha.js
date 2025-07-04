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
      horizontal: "left",
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

  if (!Array.isArray(obj) || obj.length === 0) {
    return res
      .status(400)
      .send("Nenhum dado encontrado para gerar a planilha.");
  }

  Object.entries(obj[0]).map(([chave, valor]) => colunas.push(chave));
  let colunaIndex = 1;
  let largurasColunas = [];

  colunas.forEach((heading, index) => {
    ws.cell(1, colunaIndex).string(heading).style(myStyle);
    // Inicializa largura com o tamanho do cabeçalho
    largurasColunas[index] = heading.length;
    colunaIndex++;
  });
  let linhaIndex = 2;
  obj.forEach((record) => {
    let colunaIndex = 1;
    Object.keys(record).forEach((colunaNome, i) => {
      let valorCelula =
        record[colunaNome] != null ? record[colunaNome].toString() : "";
      ws.cell(linhaIndex, colunaIndex).string(valorCelula).style(myStyle);

      // Atualiza largura máxima
      if (valorCelula.length > largurasColunas[i]) {
        largurasColunas[i] = valorCelula.length;
      }

      colunaIndex++;
    });
    linhaIndex++;
  });
  let pathArquivo = nomeArquivo + ".xls";

  largurasColunas.forEach((largura, index) => {
    // Limita largura mínima/máxima se quiser
    let larguraFinal = Math.min(Math.max(largura, 10), 50); // entre 10 e 50
    ws.column(index + 1).setWidth(larguraFinal);
  });

  res.setHeader("Content-Type", EXCEL_TYPE);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${nomeArquivo}.xlsx`
  );

  wb.write(pathArquivo, res);
}

module.exports = { geraPlanilha, saveAsExcel };
