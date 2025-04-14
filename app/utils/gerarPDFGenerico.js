const PdfPrinter = require("pdfmake");
const path = require("path");
const { stack } = require("sequelize/lib/utils");

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

  // Critério 1: Número de colunas
  // Exemplo: quanto mais colunas, menor a fonte
  let fontePorColunas = 10;
  if (totalColunas > 14) {
    fontePorColunas = 3.5;
  } else if (totalColunas > 12) {
    fontePorColunas = 6;
  } else if (totalColunas > 10) {
    fontePorColunas = 7;
  } else if (totalColunas > 8) {
    fontePorColunas = 8;
  } else if (totalColunas > 5) {
    fontePorColunas = 9;
  }

  // Critério 2: Média de caracteres por coluna (estimativa de largura do conteúdo)
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
  // Em linhas de exemplo: se a média for pequena, pode ser uma fonte maior.
  // Esses valores limite podem ser ajustados conforme seus dados.
  let fontePorConteudo = 10;
  if (mediaTotalChars > 30) {
    fontePorConteudo = 3.5;
  } else if (mediaTotalChars > 25) {
    fontePorConteudo = 6;
  } else if (mediaTotalChars > 20) {
    fontePorConteudo = 7;
  } else if (mediaTotalChars > 10) {
    fontePorConteudo = 8;
  } else if (mediaTotalChars > 8) {
    fontePorConteudo = 9;
  }

  // Você pode combinar os dois critérios; por exemplo, usar o menor valor
  const tamanhoFonte = Math.min(fontePorColunas, fontePorConteudo);
  return tamanhoFonte;
}

const printer = new PdfPrinter(fonts);

function gerarRelatorioPDF(dados, relatorio, usuario) {
  console.log("user: ", usuario);
  const data = new Date().toLocaleDateString("pt-Br", { dateStyle: "short" });
  return new Promise((resolve, reject) => {
    if (!Array.isArray(dados) || dados.length === 0) {
      return reject(new Error("Dados inválidos ou vazios."));
    }

    const colunas = Object.keys(dados[0]);

    const corpoTabela = [
      colunas.map((coluna) => ({
        text: coluna,
        style: "tableHeader",
        margin: [4, 2, 4, 2],
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
              width: 200,
              margin: [15, 0, 10, 10],
              alignment: "left",
            },
            {
              text: `Usuário: ${usuario.nome}`,
              style: "userInfo",
              stack: [
                { text: `Usuário: ${usuario.nome}`, alignment: "right" },
                { text: `Data: ${data}`, alignment: "right" },
              ],
              margin: [6, 10, 6, 15],
            },
          ],
        },
        {
          text: relatorio.label,
          style: "header",
          margin: [0, 0, 0, 15],
        },
        {
          // Container de columns com três colunas para centralizar a tabela
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              table: {
                headerRows: 1,
                widths: Array(colunas.length).fill("auto"),
                body: corpoTabela,
              },
              layout: "lightHorizontalLines",
              style: "tabela",
            },
            { width: "*", text: "" },
          ],
        },
        /*{
          stack: [
            { text: "Descrição do relatório:" },
            { text: relatorio.descricao },
          ],
          pageBreak: "before", // Força uma nova página antes deste conteúdo
          style: "descricao",
          alignment: "center",
          margin: [0, 20, 0, 0], // opcional, para espaçamento superior
        },*/
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
        },
        tabela: {
          fontSize: tamanhoFonteCalculado,
          alignment: "center",
          lineHeight: 1.3,
          margin: [0, 0, 0, 15],
        },
        userInfo: {
          fontSize: 7,
          alignment: "right",
        },
        descricao: {
          fontSize: 12,
          bold: true,
          italics: true,
        },
      },
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              text: relatorio.descricao,
              fontSize: 6,
              alignment: "justify",
              margin: [40, 10, 0, 10],
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              alignment: "right",
              margin: [0, 10, 40, 10],
              fontSize: 6,
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
