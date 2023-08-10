module.exports.comissoesComReducao = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getComissoesComReducao(req);
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.comissoesSemReducao = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getComissoesSemReducao(req);
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.quitados = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getQuitados(req);
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.aniversariantesMesAtual = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getAniversariantesMesAtual(req);
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.relatorioRenegociacoes = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getRelatorioRenegociacoes(req);
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.relatorioAproveitamento = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    console.log(req);

    var resConsulta = await consultaModel.getRelatorioAproveitamento(req);
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};