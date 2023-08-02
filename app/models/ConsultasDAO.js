const sql = require('mssql');
const sqlConfig = require('../../config/dbConnection');

function ConsultasDAO(){
	
};

ConsultasDAO.prototype.getTeste = async function(){
   await sql.connect(sqlConfig);
   var result = await sql.query('select codigo_grupo,codigo_cota,versao,cgc_cpf_cliente from cotas where codigo_grupo = 63 and codigo_cota = 23 and versao = 00');
   /*console.log('DAO',result)
   var resultado = JSON.stringify(result.recordset);
   console.log('DAO RESULTADO', resultado);*/
   return result.recordset;
};

module.exports = function(){
    return ConsultasDAO;
}