module.exports.index = function(application, req, res){

    var connection = application.config.dbConnection;
    var consultaModel = new application.app.models.ConsultasDAO(connection);
    
    consultaModel.getTeste(function(error, result){
        console.log('teste');
        res.render("home/index", {selectTeste : result});
    });

    //app.app.controllers.home

};