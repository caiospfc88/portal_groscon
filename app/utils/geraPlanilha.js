const xl = require("excel4node");

function geraPlanilhaBradesco(obj) {
  /*const wb = new xl.Workbook();
  const ws = wb.addWorkSheet("Teste");*/
  let valor = [];
  valor = Object.values(obj);
  console.log("valor", valor);
  return valor;
}
module.exports = { geraPlanilhaBradesco };
