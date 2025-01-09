function geraFiltroSql(cotasAtivas,quitados){
    let result = ""
    console.log("parametro funçao: ", cotasAtivas,quitados)
    if (cotasAtivas == '1' && quitados == '0'){
        result = "and ct.versao = 0"
    } else if (cotasAtivas == '1' && quitados == '1'){
        result = "and ct.versao = 0 and ct.CODIGO_SITUACAO not like '%Q%'"
    } else if (cotasAtivas == '0' && quitados == '1'){
        result = "and ct.CODIGO_SITUACAO not like '%Q%'"
    }
    return result
} 

module.exports = { geraFiltroSql };