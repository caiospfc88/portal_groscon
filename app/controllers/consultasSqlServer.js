module.exports.comissoesComReducao = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getComissoesComReducao();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.comissoesSemReducao = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getComissoesSemReducao();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.quitados = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getQuitados();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.aniversariantesMesAtual = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getAniversariantesMesAtual();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.relatorioRenegociacoes = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getRelatorioRenegociacoes();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};

module.exports.relatorioRenegociacoes = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getRelatorioAproveitamento();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};