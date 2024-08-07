const PDFPrinter = require("pdfmake");

function geraPdfComissao(dados, req, res) {
  let valores = [];
  let colunaInf = [];
  let colunaVal = [];
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
  let cabecalho = [
    { text: "GRUPO", style: "columnsTitle" },
    { text: "COTA", style: "columnsTitle" },
    { text: "VS", style: "columnsTitle" },
    { text: "DT CONT.", style: "columnsTitle" },
    { text: "EQ.", style: "columnsTitle" },
    { text: "REP.", style: "columnsTitle" },
    { text: "TIPO", style: "columnsTitle" },
    { text: "TAB.", style: "columnsTitle" },
    { text: "Nº PAR.", style: "columnsTitle" },
    //{ text: "VAL TAXA", style: "columnsTitle" },
    { text: "BEM", style: "columnsTitle" },
    { text: "%", style: "columnsTitle" },
    { text: "VALOR", style: "columnsTitle" },
    //{ text: "TOTAL VENDAS", style: "columnsTitle" },
    { text: "MAX.", style: "columnsTitle" },
  ];
  if (dados[1][0]["CODIGO_EQUIPE"]) {
    colunaInf = ["Equipe: "];
    colunaVal = [dados[1][0]["DESCRICAO"]];
  } else {
    colunaInf = ["Representante: "];
    colunaVal = [dados[1][0]["NOME"]];
  }

  let data = new Date().toLocaleDateString("pt-Br", { dateStyle: "long" });

  for (i = 0; i < dados[0].length; i++) {
    let linha = [];
    Object.entries(dados[0][i]).map(([chave, valor]) => linha.push(valor));
    valores.push(linha);
  }
  const printer = new PDFPrinter(fonts);

  let docDefinitions = {
    footer: function (currentPage, pageCount) {
      return [
        {
          columns: [
            /*{
              image: "img/logoMenor.jpg",
              width: 50,
              margin: [25, 15, 300, 30],
              alignment: "left",
            },*/
            {
              stack: [
                /*{
                  text: "Franca, " + data,
                  alignment: "right",
                  fontSize: 10,
                  margin: [5, 2, 30, 10],
                },
                {
                  text: "Total: " + dados[2][0].valTotalComissao,
                  alignment: "right",
                  fontSize: 9,
                  bold: true,
                  margin: [5, 2, 30, 10],
                },*/
                {
                  text: "Página " + currentPage.toString() + " / " + pageCount,
                  alignment: "right",
                  fontSize: 8,
                  margin: [5, 40, 30, 15],
                },
              ],
            },
          ],
        },
      ];
    },

    defaultStyle: {
      font: "Helvetica",
      fontSize: 10,
      alignment: "center",
      characterSpacing: 0.3,
    },
    content: [
      {
        columns: [
          {
            image: "img/logo.jpg",
            width: 200,
            margin: [15, 2, 10, 20],
            alignment: "left",
          },
          {
            text: "Relatório de Comissão",
            style: "header",
            margin: [10, 22, 10, 20],
          },
        ],
        columnGap: 16,
      },
      {
        columns: [
          {
            stack: [colunaInf],
            fontSize: 11,
            alignment: "left",
            bold: true,
            margin: [5, 4, 1, 4],
            width: 95,
          },
          {
            stack: colunaVal,
            fontSize: 11,
            alignment: "left",
            bold: true,
            width: 430,
            margin: [1, 4, 10, 4],
          },
          {
            text: "Período selecionado: ",
            fontSize: 11,
            alignment: "right",
            bold: true,
            width: 125,
            margin: [1, 4, 2, 4],
          },
          {
            text: dados[2][0].periodo,
            fontSize: 11,
            alignment: "left",
            bold: true,
            width: 250,
            margin: [1, 4, 20, 4],
          },
        ],
        columnGap: 1,
      },
      {
        layout: "lightHorizontalLines",
        table: {
          headerRows: 1,
          widths: [44, 34, 20, 55, 24, 35, 130, 30, 45, 69, 26, 58, 32],
          body: [cabecalho, ...valores],
          style: "tabela",
          marginTop: 1.2,
        },
        margin: [5, 2, 10, 20],
      },
      {
        text: "Franca, " + data,
        alignment: "right",
        fontSize: 10,
        margin: [5, 2, 13, 20],
      },
      {
        text: "Total: " + dados[2][0].valTotalComissao,
        alignment: "right",
        fontSize: 11,
        bold: true,
        lineHeight: 6,
        margin: [5, 2, 13, 20],
      },
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        alignment: "left",
      },
      anotherStyle: {
        italics: true,
        alignment: "right",
      },
      columnsTitle: {
        fontSize: 9.5,
        fillColor: "#035191",
        color: "#FFFFFF",
        bold: true,
        margin: 3,
      },
      tabela: {
        fontSize: 8.5,
        alignment: "center",
        bold: true,
        margin: [5, 5, 10, 5],
      },
    },
    pageOrientation: "landscape",
    pageMargins: [20, 40, 20, 60],
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

module.exports = { geraPdfComissao };
