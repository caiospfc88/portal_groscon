require("dotenv").config();

const sql = require("mssql");
const sqlConfig = {
  user: process.env.DB_SSQL_USER,
  password: process.env.DB_SSQL_PASS,
  database: process.env.DB_SSQL_BASE,
  server: process.env.DB_SSQL_HOST,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    //encrypt: true, // for azure
    encrypt: false,
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
  requestTimeout: 120000, // até 120s para execução do select
  connectionTimeout: 30000, // até 30s para conectar
};

var conexao = async function (sqlQuery) {
  try {
    await sql.connect(sqlConfig);
    var result = await sql.query(sqlQuery);
    return result.recordset;
  } catch (error) {
    let mensage = error;
    return JSON.stringify(mensage);
  }
};

module.exports = function () {
  return conexao;
};
