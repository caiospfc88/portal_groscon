const xl = require("excel4node");
// const { fillPattern } = require("excel4node/distribution/lib/types"); // Mantido se você usa em outro lugar

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
  return new Date(Number(year), Number(month) - 1, Number(day));
}

// NOVA FUNÇÃO: Verifica se é um número monetário ou decimal em formato texto (Ex: "R$ 1.234,56", "R$853,24", "123,45")
function isMonetaryOrDecimalBR(str) {
  // Aceita strings com ou sem "R$", espaços, números com separador de milhar (.) e decimal (,)
  const regex = /^(?:R\$\s*)?-?(\d{1,3}(?:\.\d{3})*|\d+),\d{1,2}$/;
  return regex.test(str.trim());
}

// NOVA FUNÇÃO: Converte a string formatada em Real para um tipo Number nativo do Javascript
function parseMonetaryBR(str) {
  let cleaned = str.replace(/R\$/g, "").trim(); // Remove o R$
  cleaned = cleaned.replace(/\./g, ""); // Remove os pontos de separação de milhar
  cleaned = cleaned.replace(",", "."); // Troca a vírgula decimal por ponto (para o parseFloat)
  return parseFloat(cleaned);
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

  // Alteração de segurança: se req.body.nomeArquivo não for passado, ele pega nomeArquivo (para não dar erro de undefined no nome da sheet)
  const ws = wb.addWorksheet(
    req.body.nomeArquivo || nomeArquivo || "Planilha 1",
    options,
  );

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

  // NOVO ESTILO: Estilo de número para a formatação de Moeda no Excel
  const currencyStyle = wb.createStyle({
    numberFormat: '"R$" #,##0.00;-"R$" #,##0.00',
    font: { size: 10, name: "Calibri" },
    alignment: { shrinkToFit: false, horizontal: "center", wrapText: false },
    border: {
      left: { style: "thin", color: "#000000" },
      right: { style: "thin", color: "#000000" },
      top: { style: "thin", color: "#000000" },
      bottom: { style: "thin", color: "#000000" },
    },
  });

  // NOVO ESTILO: Estilo para decimais que não vieram com "R$" (caso tenha algum outro valor)
  const numberDecimalStyle = wb.createStyle({
    numberFormat: "#,##0.00;-#,##0.00",
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
  const largurasColunas = colunas.map((col) => col.length);

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

      if (valor == null) {
        texto = "";
        ws.cell(linhaIndex, colunaIndex).string(texto).style(myStyle);
      } else if (typeof valor === "number") {
        // CORREÇÃO 1: Trata os números que já chegam nativos corretamente (ex: grupo, cota, % fc Pago)
        ws.cell(linhaIndex, colunaIndex).number(valor).style(myStyle);
        texto = valor.toString();
      } else if (typeof valor === "string") {
        // Valida se a string é data ou monetário
        if (isValidDateBR(valor)) {
          const data = parseDateBR(valor);
          if (!isNaN(data.getTime())) {
            ws.cell(linhaIndex, colunaIndex).date(data).style(dateStyle);
            texto = valor;
          } else {
            ws.cell(linhaIndex, colunaIndex).string(valor).style(myStyle);
            texto = valor;
          }
        } else if (isMonetaryOrDecimalBR(valor)) {
          // CORREÇÃO 2: Se for identificada uma string de moeda
          const numVal = parseMonetaryBR(valor);
          const isCurrency = valor.toUpperCase().includes("R$");

          // Insere o número real na célula aplicando o estilo visual baseado no formato Excel
          ws.cell(linhaIndex, colunaIndex)
            .number(numVal)
            .style(isCurrency ? currencyStyle : numberDecimalStyle);

          texto = valor; // Mantemos a string original na variavel texto apenas para o cálculo da largura das colunas
        } else {
          // Se for string comum
          ws.cell(linhaIndex, colunaIndex).string(valor).style(myStyle);
          texto = valor;
        }
      } else {
        // Outros tipos (bools, objetos, etc)
        texto = valor.toString();
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
    ws.column(i + 2).setWidth(colWidth + 5);
  });

  ws.row(6).filter();
  ws.row(6).freeze();
  let pathArquivo = nomeArquivo + ".xlsx";

  wb.write(pathArquivo, res);
}

module.exports = { geraPlanilhaRelatorios };
