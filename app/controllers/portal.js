module.exports.muralDados = async function(application, req, res){

    var mySqlConnection = application.config.mySqlDb;
	var portalModel = new application.app.models.PortalDAO(mySqlConnection);

    var resConsulta = await portalModel.getMuralDados()
    //console.log('controller',resConsulta);
    res.send(resConsulta);

}