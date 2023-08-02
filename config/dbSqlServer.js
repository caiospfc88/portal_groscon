const sql = require('mssql');

sqlConfig = {
    server: '192.168.201.10',
    database: 'NewconPlus050423',
    user: 'microserv',
    password: 'xpmsv',
    stream: true
};


const consulta = async (sqlQuery)=>{
    sql.connect(sqlConfig);
    result = await sql.query(sqlQuery);
    const resultado = JSON.stringify(result.recordset);
    return resultado
}

module.exports = function(){
    return consulta;
};
