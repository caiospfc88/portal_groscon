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
    sheetView: { showGridLines: true },
    headerFooter: { alignWithMargins: true, scaleWithDoc: true },
    printOptions: { printGridLines: true },
    // Removi o defaultColWidth fixo para priorizar o ajuste dinâmico
  };

  const wb = new xl.Workbook({ workbookView: { visibility: "visible" } });
  let nomeAba = req.body.nomeArquivo || nomeArquivo || "Planilha 1";

  // REGRA DO EXCEL: O nome da aba não pode ter mais de 31 caracteres e nem caracteres especiais.
  // Isso corta o texto no limite e remove caracteres que corrompem o workbook.xml
  nomeAba = nomeAba.substring(0, 31).replace(/[\\/*?:\[\]]/g, "");

  const ws = wb.addWorksheet(nomeAba, options);

  // --- ESTILOS (Mantidos conforme seu original) ---
  const myStyle = wb.createStyle({
    /* ... seu estilo ... */ font: { size: 10, name: "Calibri" },
    alignment: { horizontal: "center" },
    border: {
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
    },
  });
  const dateStyle = wb.createStyle({
    numberFormat: "dd/mm/yyyy",
    font: { size: 10, name: "Calibri" },
    alignment: { horizontal: "center" },
    border: {
      /* ... */
    },
  });
  const currencyStyle = wb.createStyle({
    numberFormat: '"R$" #,##0.00;-"R$" #,##0.00',
    font: { size: 10, name: "Calibri" },
    alignment: { horizontal: "center" },
    border: {
      /* ... */
    },
  });
  const numberDecimalStyle = wb.createStyle({
    numberFormat: "#,##0.00;-#,##0.00",
    font: { size: 10, name: "Calibri" },
    alignment: { horizontal: "center" },
    border: {
      /* ... */
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
    alignment: { horizontal: "center" },
    border: {
      /* ... */
    },
  });

  // Ajuste da Logo (Se quiser que ela comece no canto superior esquerdo agora)
  ws.addImage({
    path: "img/logoPlanilha.jpg",
    type: "picture",
    position: { type: "absoluteAnchor", x: "0.5cm", y: "0.5cm" },
  });

  const colunas = Object.keys(obj[0]);

  // Inicializa larguras com o tamanho do cabeçalho
  const largurasColunas = colunas.map((col) => col.length);

  // --- CABEÇALHOS (colunaIndex começa em 1 para remover a coluna em branco) ---
  colunas.forEach((heading, i) => {
    ws.cell(6, i + 1)
      .string(heading)
      .style(myHeadStyle);
  });

  // --- DADOS ---
  let linhaIndex = 7;
  obj.forEach((record) => {
    colunas.forEach((colunaNome, i) => {
      const valor = record[colunaNome];
      const colunaIndex = i + 1; // Coluna A = 1, B = 2...
      let valorParaCalcularLargura = "";

      if (valor == null) {
        ws.cell(linhaIndex, colunaIndex).string("").style(myStyle);
      } else if (typeof valor === "number") {
        ws.cell(linhaIndex, colunaIndex).number(valor).style(myStyle);
        valorParaCalcularLargura = valor.toString();
      } else if (typeof valor === "string") {
        if (isValidDateBR(valor)) {
          const data = parseDateBR(valor);
          ws.cell(linhaIndex, colunaIndex).date(data).style(dateStyle);
          valorParaCalcularLargura = valor;
        } else if (isMonetaryOrDecimalBR(valor)) {
          const numVal = parseMonetaryBR(valor);

          // NOVA PROTEÇÃO: Se a conversão resultar em NaN (Not a Number), salva como texto puro para não quebrar o Excel
          if (isNaN(numVal)) {
            ws.cell(linhaIndex, colunaIndex).string(valor).style(myStyle);
            valorParaCalcularLargura = valor;
          } else {
            const isCurrency = valor.toUpperCase().includes("R$");
            ws.cell(linhaIndex, colunaIndex)
              .number(numVal)
              .style(isCurrency ? currencyStyle : numberDecimalStyle);

            valorParaCalcularLargura =
              "R$ " +
              numVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
          }
        } else {
          ws.cell(linhaIndex, colunaIndex).string(valor).style(myStyle);
          valorParaCalcularLargura = valor;
        }
      } else {
        valorParaCalcularLargura = valor.toString();
        ws.cell(linhaIndex, colunaIndex)
          .string(valorParaCalcularLargura)
          .style(myStyle);
      }

      // Cálculo de largura dinâmica
      if (valorParaCalcularLargura.length > largurasColunas[i]) {
        largurasColunas[i] = valorParaCalcularLargura.length;
      }
    });
    linhaIndex++;
  });

  // --- APLICAR LARGURAS ---
  largurasColunas.forEach((largura, i) => {
    let colWidth = largura * 1.2 + 2;

    // O Excel quebra se a largura for maior que 255.
    // Coloquei um teto de 100 para manter a planilha utilizável visualmente e um mínimo de 10.
    colWidth = Math.min(Math.max(colWidth, 10), 100);

    ws.column(i + 1).setWidth(colWidth);
  });

  ws.row(6).filter();
  ws.row(6).freeze();

  wb.write(nomeArquivo + ".xlsx", res);
}

module.exports = { geraPlanilhaRelatorios };
