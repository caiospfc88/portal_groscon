const PDFPrinter = require("pdfmake");
const fs = require("fs");

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

  const printer = new PDFPrinter(fonts);

  let docDefinitions = {
    defaultStyle: { font: "Helvetica" },
    content: [{ text: "Relatório de Comissão" }],
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
