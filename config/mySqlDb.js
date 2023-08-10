const mysql = require('mysql2/promise');
	
const mySqlConfig = {
			host : 'localhost',
			user : 'root',
			password : '1035',
			database : 'portal_groscon'
};

var connMySql = async function(mysqlQuery){
	await mysql.createPool(mySqlConfig)
	result = await mysql.query(mysqlQuery)
	console.log('bd',result)
	return result
}

module.exports = function(){
		return connMySql;
}

