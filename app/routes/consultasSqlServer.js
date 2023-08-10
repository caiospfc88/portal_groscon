module.exports = function(application){
        application.get('/comissoesSemReducao', function(req, res){        
        application.app.controllers.consultasSqlServer.comissoesSemReducao(application, req, res);
    });
        application.get('/comissoesComReducao', function(req, res){        
        application.app.controllers.consultasSqlServer.comissoesComReducao(application, req, res);
    });
        application.get('/quitados', function(req, res){        
        application.app.controllers.consultasSqlServer.quitados(application, req, res);
    });
        application.get('/aniversariantesMesAtual', function(req, res){        
        application.app.controllers.consultasSqlServer.aniversariantesMesAtual(application, req, res);
    });
        application.get('/relatorioRenegociacoes', function(req, res){        
        application.app.controllers.consultasSqlServer.relatorioRenegociacoes(application, req, res);
    });
        application.get('/relatorioAproveitamento', function(req, res){        
        application.app.controllers.consultasSqlServer.relatorioAproveitamento(application, req, res);
    });
};


       