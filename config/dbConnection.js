const sql = require('mssql')
const sqlConfig = {
  user: 'microserv',
  password: 'xpmsv',
  database: 'NewconPlus050423',
  server: 'WIN',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    //encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

var conexao = async function(sqlQuery) {
  await sql.connect(sqlConfig)
  await sql.query(sqlQuery).then((result)=>{
    var resultado = JSON.stringify(result.recordset);
    console.log('resultado:', resultado)
    return resultado;
})
};  

/*const conexão = new Promise((resolve,reject)=>{

})*/   

module.exports = function(){
    return conexao;
};

/*async () => {
 try {
  // make sure that any items are correctly URL encoded in the connection string
  await sql.connect(sqlConfig)
  const result = await sql.query`select * from mytable where id = ${value}`
  console.dir(result)
 } catch (err) {
  // ... error checks
 }
};*/