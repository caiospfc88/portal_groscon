/*module.exports = function(application){
        application.get('/comissoesSemReducao', function(req, res){        
        application.app.controllers.comissoes.comissoesSemReducao(application, req, res);
    });
};*/

module.exports = function(application){
    application.get('/comissoesComReducao', function(req, res){        
    application.app.controllers.comissoes.comissoesComReducao(application, req, res);
});
};