module.exports = function(application){
        application.get('/comissoes', function(req, res){        
        application.app.controllers.home.comissoes(application, req, res);
    });
};