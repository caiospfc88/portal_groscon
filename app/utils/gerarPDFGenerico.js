// gerarPDFGenerico.js
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

const printer = new PdfPrinter(fonts);

/**
 * calcularTamanhoFonte(dados)
 * - calcula um tamanho de fonte razoável com base no número de colunas
 *   e no comprimento médio do conteúdo.
 */
function calcularTamanhoFonte(dados) {
  if (!Array.isArray(dados) || dados.length === 0) return 10;
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

/**
 * formatarBRL(valor)
 * - formata number/string para BRL, se possível; senão retorna a string original
 */
function formatarBRL(valor) {
  try {
    const n =
      typeof valor === "number"
        ? valor
        : parseFloat(
            String(valor)
              .replace(/[^\d,-\.]/g, "")
              .replace(",", ".")
          );
    if (!isFinite(n)) return String(valor);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n);
  } catch (e) {
    return String(valor);
  }
}

/**
 * formatarPeriodo(dataInicial, dataFinal)
 * - aceita formatos 'yyyymmdd' ou 'yyyy-mm-dd' ou já 'string' e devolve 'dd/mm/yyyy → dd/mm/yyyy'
 */
function formatarPeriodo(dataInicial, dataFinal) {
  const toPt = (d) => {
    if (!d) return "";
    const cleaned = String(d).replace(/-/g, "");
    if (cleaned.length !== 8) return d;
    const ano = cleaned.slice(0, 4);
    const mes = cleaned.slice(4, 6);
    const dia = cleaned.slice(6, 8);
    return `${dia}/${mes}/${ano}`;
  };
  if (dataInicial && dataFinal)
    return `${toPt(dataInicial)} a ${toPt(dataFinal)}`;
  if (dataInicial) return `Desde ${toPt(dataInicial)}`;
  if (dataFinal) return `Até ${toPt(dataFinal)}`;
  return "";
}

/**
 * gerarRelatorioPDF(dados, relatorio, usuario, complemento, total = null, representantes = null)
 * - total: number | string | object (como antes)
 * - representantes: array opcional de { codigo, nome, dataSqlInicial, dataSqlFinal, quantidadeCotas, valor }
 */
function gerarRelatorioPDF(
  dados,
  relatorio,
  usuario,
  complemento,
  total = null,
  representantes = null
) {
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

    // --- Bloco opcional de total (igual ao código original) ---
    let blocoTotal = null;
    if (total !== null && total !== undefined) {
      if (typeof total === "object" && !Array.isArray(total)) {
        const linhas = Object.keys(total).map((k) => {
          const v = total[k];
          const texto = `${k}: ${
            typeof v === "number" ? formatarBRL(v) : String(v)
          }`;
          return { text: texto, margin: [0, 2, 0, 2] };
        });
        blocoTotal = {
          margin: [0, 8, 0, 0],
          stack: [
            { text: "Totais", style: "subHeader", margin: [0, 0, 0, 6] },
            ...linhas,
          ],
          alignment: "right",
        };
      } else {
        const textoTotal =
          typeof total === "number" ? formatarBRL(total) : String(total);
        blocoTotal = {
          margin: [0, 8, 0, 0],
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              stack: [
                { text: "Total", style: "subHeader", margin: [0, 0, 0, 6] },
                { text: textoTotal, bold: true },
              ],
              alignment: "right",
            },
          ],
        };
      }
    }

    // --- Bloco opcional de representantes (nova página before) ---
    let blocoRepresentantes = null;
    if (Array.isArray(representantes) && representantes.length > 0) {
      // Cabeçalho usando style específico para cabeçalho de representantes
      const headerReps = [
        { text: "Representante", style: "tableHeaderReps" },
        { text: "Período", style: "tableHeaderReps" },
        { text: "Cotas", style: "tableHeaderReps" },
        { text: "Valor", style: "tableHeaderReps" },
      ];

      const bodyReps = representantes.map((r) => [
        String((r.codigo ?? "") + " - " + (r.nome ?? "")),
        formatarPeriodo(r.dataSqlInicial, r.dataSqlFinal),
        String(r.quantidadeCotas ?? ""),
        typeof r.valor === "number"
          ? formatarBRL(r.valor)
          : String(r.valor ?? ""),
      ]);

      const tabelaReps = {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto"],
          body: [headerReps, ...bodyReps],
        },
        layout: {
          hLineWidth: function (i, node) {
            if (i === 0 || i === 1 || i === node.table.body.length) return 0.5;
            return 0.25;
          },
          vLineWidth: () => 0,
          hLineColor: () => "#bbb",
        },
        // aplica estilo específico apenas a essa tabela
        style: "tabelaRepresentantes",
      };

      blocoRepresentantes = {
        pageBreak: "before",
        stack: [
          {
            text: "Representantes adicionados",
            style: "header",
            margin: [0, 0, 0, 6],
          },
          {
            text: `(Períodos e valores associados a cada representante)`,
            style: "subHeader",
            margin: [0, 0, 0, 8],
          },
          tabelaReps,
        ],
      };
    }

    const docDefinition = {
      pageOrientation: relatorio.pdfOrientation,
      pageMargins: [25, 25, 25, 35],
      content: [
        {
          columns: [
            { image: "img/logo.jpg", width: 150, margin: [15, 0, 10, 10] },
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
        { text: `(${complemento})`, style: "subHeader", margin: [0, 5, 0, 10] },
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
        ...(blocoTotal ? [blocoTotal] : []),
        ...(blocoRepresentantes ? [blocoRepresentantes] : []),
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: "center" },
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
        subHeader: { fontSize: 8, bold: true, alignment: "center" },
        // novos estilos para representantes (AUMENTE O valor se quiser fontes maiores)
        tableHeaderReps: {
          bold: true,
          fillColor: "#035191",
          color: "white",
          alignment: "left",
          lineHeight: 1.4,
          fontSize: tamanhoFonteCalculado + 3, // <- aqui aumenta o header dos reps
          margin: [0, 4, 0, 4],
          valign: "middle",
        },
        tabelaRepresentantes: {
          fontSize: tamanhoFonteCalculado + 2, // <- aqui aumenta as células da tabela de reps
          alignment: "left", // normalmente left fica melhor para nomes
          lineHeight: 1.25,
          margin: [0, 2, 0, 10],
          valign: "middle",
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
      defaultStyle: { font: "Roboto" },
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
