module.exports.index = async function(application, req, res){

    var connection = application.config.dbConnection();
	var noticiasModel = new application.app.models.PortalDAO(connection);

}