const { verifyJWT } = require("../utils/auth");

module.exports = (application) => {
  const controller = application.app.controllers.paginas_usuario;

  application.get(
    "/listarPaginasUsuario",
    verifyJWT,
    controller.listarPaginasUsuario
  );
  application.get(
    "/consultarPaginasUsuario",
    verifyJWT,
    controller.consultarPaginasUsuario
  );
  application.post(
    "/cadastrarPaginasUsuario",
    verifyJWT,
    controller.cadastrarPaginasUsuario
  );
  application.post(
    "/cadastrarPaginasUsuarioBatch",
    verifyJWT,
    controller.cadastrarPaginasUsuarioBatch
  );

  application.delete(
    "/excluirPaginasUsuarioBatch",
    verifyJWT,
    controller.excluirPaginasUsuarioBatch
  );
  application.put(
    "/alterarPaginasUsuario",
    verifyJWT,
    controller.alterarPaginasUsuario
  );
  application.delete(
    "/excluirPaginasUsuario",
    verifyJWT,
    controller.excluirPaginasUsuario
  );
};
