//const db = require('../../db/models/index.js');

function PortalDAO(mySqlConnection){
    this._mySqlConnection = mySqlConnection;
}

PortalDAO.prototype.getMuralDados = async function(){
    var result = await this._mySqlConnection('select * from mural_dados where ano_mes = 202301');
        /*`select 
                                                    bens_entregues,
                                                    percent_inadimplencia,
                                                    bens_pendentes_entrega, 
                                                    recuperacao_cotas, 
                                                    boletos_dev_nao_entregues, 
                                                    impressoes_n_copias, 
                                                    agua, 
                                                    luz, 
                                                    telefone,
                                                    vendas,
                                                    vendas_franca 
                                              from mural_dados where ano_mes = 202301`)*/
    console.log('DAO:', result)
    return result;
}

module.exports = function(){
    return PortalDAO;
}