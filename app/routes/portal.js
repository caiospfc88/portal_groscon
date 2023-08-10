module.exports = function(application){
    application.get('/muralDados', function(req, res){
        application.app.controllers.portal.muralDados(application, req, res);
    });
};    