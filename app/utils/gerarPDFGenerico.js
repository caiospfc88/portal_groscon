const PdfPrinter = require("pdfmake");
const path = require("path");

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, "../fonts/roboto/Roboto-Regular.ttf"),
    bold: path.resolve(__dirname, "../fonts/roboto/Roboto-Bold.ttf"),
    italics: path.resolve(__dirname, "../fonts/roboto/Roboto-Italic.ttf"),
    bolditalics: path.resolve(
      __dirname,
      "../fonts/roboto/Roboto-BoldItalic.ttf"
    ),
  },
};

function calcularTamanhoFonte(dados) {
  const colunas = Object.keys(dados[0]);
  const totalColunas = colunas.length;

  let fontePorColunas = 10;
  if (totalColunas > 14) fontePorColunas = 4;
  else if (totalColunas > 12) fontePorColunas = 6.5;
  else if (totalColunas > 10) fontePorColunas = 7.5;
  else if (totalColunas > 8) fontePorColunas = 8.5;
  else if (totalColunas > 5) fontePorColunas = 9;

  let somaTotalChars = 0;
  colunas.forEach((col) => {
    const somaColuna = dados.reduce((acc, item) => {
      const valor = item[col] ? String(item[col]) : "";
      return acc + valor.length;
    }, 0);
    const mediaColuna = somaColuna / dados.length;
    somaTotalChars += mediaColuna;
  });
  const mediaTotalChars = somaTotalChars / totalColunas;

  let fontePorConteudo = 10;
  if (mediaTotalChars > 30) fontePorConteudo = 4;
  else if (mediaTotalChars > 25) fontePorConteudo = 6.5;
  else if (mediaTotalChars > 20) fontePorConteudo = 7.5;
  else if (mediaTotalChars > 10) fontePorConteudo = 8.5;
  else if (mediaTotalChars > 8) fontePorConteudo = 9;

  return Math.min(fontePorColunas, fontePorConteudo);
}

const printer = new PdfPrinter(fonts);

function gerarRelatorioPDF(dados, relatorio, usuario, complemento) {
  const data = new Date().toLocaleDateString("pt-BR");
  return new Promise((resolve, reject) => {
    if (!Array.isArray(dados) || dados.length === 0) {
      return reject(new Error("Dados inválidos ou vazios."));
    }

    const colunas = Object.keys(dados[0]);
    const corpoTabela = [
      colunas.map((coluna) => ({
        text: coluna,
        style: "tableHeader",
        margin: [3, 3, 3, 0],
      })),
      ...dados.map((item) =>
        colunas.map((coluna) => String(item[coluna] ?? ""))
      ),
    ];

    const tamanhoFonteCalculado = calcularTamanhoFonte(dados);

    const docDefinition = {
      pageOrientation: relatorio.pdfOrientation,
      pageMargins: [25, 25, 25, 35],
      content: [
        {
          columns: [
            {
              image: "img/logo.jpg",
              width: 150,
              margin: [15, 0, 10, 10],
            },
            {
              stack: [
                {
                  text: `Usuário: ${usuario.nome}`,
                  alignment: "right",
                  fontSize: 7,
                },
                { text: `Data: ${data}`, alignment: "right", fontSize: 7 },
              ],
              margin: [0, 10, 10, 10],
            },
          ],
        },
        {
          text: relatorio.pdfTitulo.toUpperCase(),
          style: "header",
          margin: [0, 0, 0, 0],
        },
        {
          text: `(${complemento})`,
          style: "subHeader",
          margin: [0, 5, 0, 10],
        },
        {
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              table: {
                headerRows: 1,
                widths: Array(colunas.length).fill("auto"),
                body: corpoTabela,
                valign: "middle",
              },
              layout: {
                hLineWidth: function (i, node) {
                  if (i === 0 || i === 1 || i === node.table.body.length)
                    return 0.5;
                  return 0.25;
                },
                vLineWidth: () => 0,
                hLineColor: () => "#bbb",
              },
              style: "tabela",
            },
            { width: "*", text: "" },
          ],
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: "center",
        },
        tableHeader: {
          bold: true,
          fillColor: "#035191",
          color: "white",
          alignment: "center",
          lineHeight: 1.5,
          fontSize: tamanhoFonteCalculado + 1,
          margin: [0, 4, 0, 4],
          valign: "middle",
        },
        tabela: {
          fontSize: tamanhoFonteCalculado,
          alignment: "center",
          lineHeight: 1.3,
          margin: [0, 2, 0, 10],
          valign: "middle",
        },
        subHeader: {
          fontSize: 8,
          bold: true,
          alignment: "center",
        },
      },
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              text: relatorio.descricao || "",
              fontSize: 6,
              color: "#555",
              alignment: "left",
              margin: [30, 10, 0, 10],
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              fontSize: 6,
              alignment: "right",
              margin: [0, 10, 30, 10],
              color: "#555",
            },
          ],
        };
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);

    pdfDoc.end();
  });
}

module.exports = { gerarRelatorioPDF };
