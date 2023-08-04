module.exports.comissoes = async function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    var resConsulta = await consultaModel.getTeste();
    //console.log(resConsulta);
    res.send(resConsulta)
    //res.render('home/comissoes',{selectTeste : resConsulta});
};