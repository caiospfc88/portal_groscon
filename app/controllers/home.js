module.exports.index = function(app, req, res){

    var connection = app.config.dbConnection;
    var consultaModel = new app.app.models.ConsultasDAO(connection);
    
    consultaModel.getTeste(function(error, result){
        console.log(result);
        res.render("home/index", {selectTeste : result});
    });

    //app.app.controllers.home

};