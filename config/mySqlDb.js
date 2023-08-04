var mysql = require('mysql');
	
var connMySql = function(){
	return mysql.createConnection({
			host : 'localhost',
			user : 'root',
			password : '1035',
			database : 'portal_groscon'
		});

}

	module.exports = function(){
		return connMySql;
	}