const xl = require("excel4node");
const { fillPattern } = require("excel4node/distribution/lib/types");

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";

// Função auxiliar para validar o padrão dd/MM/yyyy
function isValidDateBR(str) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = regex.exec(str);
  if (!match) return false;
  const [, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return (
    date.getFullYear() === parseInt(year) &&
    date.getMonth() === parseInt(month) - 1 &&
    date.getDate() === parseInt(day)
  );
}

function parseDateBR(str) {
  const [day, month, year] = str.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day)); // <-- nota o uso de argumentos numéricos
}

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
  const wb = new xl.Workbook({ workbookView: { visibility: "visible" } });
  const ws = wb.addWorksheet(req.body.nomeArquivo, options);

  const dateStyle = wb.createStyle({
    numberFormat: "dd/mm/yyyy",
    font: { size: 10, name: "Calibri" },
    alignment: { horizontal: "center" },
    border: {
      left: { style: "thin", color: "#000000" },
      right: { style: "thin", color: "#000000" },
      top: { style: "thin", color: "#000000" },
      bottom: { style: "thin", color: "#000000" },
    },
  });

  const myStyle = wb.createStyle({
    font: { size: 10, name: "Calibri" },
    alignment: { shrinkToFit: false, horizontal: "center", wrapText: false },
    border: {
      left: { style: "thin", color: "#000000" },
      right: { style: "thin", color: "#000000" },
      top: { style: "thin", color: "#000000" },
      bottom: { style: "thin", color: "#000000" },
    },
  });

  const myHeadStyle = wb.createStyle({
    font: { size: 11, bold: true, name: "Calibri", color: "ffffff" },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "035191",
      fgColor: "035191",
    },
    alignment: { shrinkToFit: false, horizontal: "center", wrapText: false },
    border: {
      left: { style: "thin", color: "#000000" },
      right: { style: "thin", color: "#000000" },
      top: { style: "thin", color: "#000000" },
      bottom: { style: "thin", color: "#000000" },
    },
  });

  ws.addImage({
    path: "img/logoPlanilha.jpg",
    type: "picture",
    position: { type: "absoluteAnchor", x: "2.35cm", y: "0.5cm" },
  });

  // Cabeçalhos
  const colunas = Object.keys(obj[0]);
  const largurasColunas = colunas.map((col) => col.length); // Inicializa com o tamanho do cabeçalho

  let colunaIndex = 2;
  colunas.forEach((heading) => {
    ws.cell(6, colunaIndex).string(heading).style(myHeadStyle);
    colunaIndex++;
  });

  // Dados
  let linhaIndex = 7;
  obj.forEach((record) => {
    let colunaIndex = 2;
    colunas.forEach((colunaNome, i) => {
      const valor = record[colunaNome];
      let texto = "";

      if (typeof valor === "string" && isValidDateBR(valor)) {
        const data = parseDateBR(valor);
        if (!isNaN(data.getTime())) {
          ws.cell(linhaIndex, colunaIndex).date(data).style(dateStyle);
          texto = valor;
        } else {
          ws.cell(linhaIndex, colunaIndex).string(valor).style(myStyle);
          texto = valor;
        }
      } else {
        texto = valor == null ? "" : valor.toString();
        ws.cell(linhaIndex, colunaIndex).string(texto).style(myStyle);
      }

      // Atualiza largura máxima por coluna
      if (texto.length > largurasColunas[i]) {
        largurasColunas[i] = texto.length;
      }

      colunaIndex++;
    });
    linhaIndex++;
  });

  // Aplicar largura das colunas com limite (mínimo 10, máximo 50)
  largurasColunas.forEach((largura, i) => {
    const colWidth = Math.min(Math.max(largura, 10), 50);
    ws.column(i + 2).setWidth(colWidth + 5); // +2 pois começa na coluna 2
  });

  ws.row(6).filter();
  ws.row(6).freeze();
  let pathArquivo = nomeArquivo + ".xlsx";

  wb.write(pathArquivo, res);
}

module.exports = { geraPlanilhaRelatorios };
