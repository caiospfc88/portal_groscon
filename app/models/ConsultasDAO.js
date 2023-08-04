function ConsultasDAO(connection){
	this._connection = connection;
};

ConsultasDAO.prototype.getTeste = async function(){
    var result = await this._connection('select codigo_grupo,codigo_cota,versao,cgc_cpf_cliente from cotas where codigo_grupo >= 63 and codigo_cota = 23 and versao = 00')
    return result
};

module.exports = function(){
    return ConsultasDAO;
};