const PDFPrinter = require("pdfmake");
const fs = require("fs");
const { table } = require("console");
const { text } = require("body-parser");
const { alignment } = require("excel4node/distribution/lib/types");

function geraPdf(dados, req, res) {
  const fonts = {
    Courier: {
      normal: "Courier",
      bold: "Courier-Bold",
      italics: "Courier-Oblique",
      bolditalics: "Courier-BoldOblique",
    },
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
    Times: {
      normal: "Times-Roman",
      bold: "Times-Bold",
      italics: "Times-Italic",
      bolditalics: "Times-BoldItalic",
    },
    Symbol: {
      normal: "Symbol",
    },
    ZapfDingbats: {
      normal: "ZapfDingbats",
    },
  };
  let cabecalho = [];
  let valores = [];
  let cabecalhoRep = [];
  let infoRep = [];
  let data = new Date().toLocaleDateString("pt-Br", { dateStyle: "long" });

  Object.entries(dados[0][0]).map(([chave, valor]) => cabecalho.push(chave));
  for (i = 0; i < dados[0].length; i++) {
    let linha = [];
    Object.entries(dados[0][i]).map(([chave, valor]) => linha.push(valor));
    valores.push(linha);
  }

  const printer = new PDFPrinter(fonts);

  let docDefinitions = {
    defaultStyle: { font: "Helvetica", fontSize: 7 },
    content: [
      {
        image: "img/logo.jpg",
        width: 200,
        // margin: [left, top, right, bottom]
        margin: [5, 2, 10, 20],
      },
      {
        text: "Relatório de Comissão",
        style: "header",
        alignment: "left",
        margin: [5, 2, 10, 20],
      },
      {
        table: {
          body: [cabecalho, ...valores],
        },
        margin: [5, 2, 10, 20],
      },
      {
        text: "Franca, " + data,
        alignment: "right",
        fontSize: 10,
        margin: [5, 2, 10, 20],
      },
      {
        text: "Total: " + dados[2][0].valTotalComissao,
        alignment: "right",
        fontSize: 11,
        bold: true,
        lineHeight: 10,
        margin: [5, 2, 10, 20],
      },
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
      },
      anotherStyle: {
        italics: true,
        alignment: "right",
      },
    },
    pageOrientation: "landscape",
    pageMargins: [40, 60, 40, 60],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinitions);

  //pdfDoc.pipe(fs.createWriteStream("relatoriosPDF/Relatorio.pdf"));

  let chunks = [];

  pdfDoc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  pdfDoc.end();

  pdfDoc.on("end", () => {
    const result = Buffer.concat(chunks);
    res.end(result);
  });
}

module.exports = { geraPdf };
