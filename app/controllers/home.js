module.exports.index = function(application, req, res){

   var consultaModel = new application.app.models.ConsultasDAO();
    
    let result = consultaModel.getTeste();
        console.log('controller',result);
        res.render("home/index", {selectTeste : result});
    
};