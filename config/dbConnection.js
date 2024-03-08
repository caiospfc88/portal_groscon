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
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

var conexao = async function (sqlQuery) {
  console.log(sqlQuery);
  await sql.connect(sqlConfig);
  var result = await sql.query(sqlQuery);
  console.log("resultado:", result.recordset);
  return result.recordset;
};

module.exports = function () {
  return conexao;
};
