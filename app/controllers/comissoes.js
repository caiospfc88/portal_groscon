module.exports.comissoesComReducao = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getComissoesComReducao();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

/*module.exports.comissoesSemReducao = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getComissoesSemReducao();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};*/