const xl = require("excel4node");

function geraPlanilhaBradesco(obj) {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet("Primeira Aba");
  var values = [];
  var colunas = new Array();
  /*Object.entries(obj[0]).map(([chave, valor]) =>
    colunas.push({ header: chave, key: chave })
  );
  obj.forEach((element) => {
    values.push({Object.values(element)});
  });
  sheet.columns = colunas;*/
  Object.entries(obj[0]).map(([chave, valor]) => colunas.push(chave));
  let colunaIndex = 1;
  colunas.forEach((heading) => {
    ws.cell(1, colunaIndex++).string(heading);
  });
  let linhaIndex = 2;
  obj.forEach((record) => {
    let colunaIndex = 1;
    Object.keys(record).forEach((colunaNome) => {
      ws.cell(linhaIndex, colunaIndex++).string(record[colunaNome]);
    });
    linhaIndex++;
  });

  wb.write("teste.xls");
  console.log(colunas);
  //console.log("Valores", values);
}
module.exports = { geraPlanilhaBradesco };
