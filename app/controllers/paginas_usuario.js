const models = require("../../db/models");

module.exports.listarPaginasUsuario = async function (req, res) {
  var paginas_usuario = await models.paginas_usuario.findAll();
  res.send(paginas_usuario);
};

module.exports.consultarPaginasUsuario = async function (req, res) {
  var paginas_usuario = await models.paginas_usuario.findOne({
    where: { id: req.query.id },
  });
  res.send(paginas_usuario);
};

module.exports.cadastrarPaginasUsuario = async function (req, res) {
  var paginas_usuario = await models.paginas_usuario.create({
    id_pagina: req.body.id_pagina,
    id_usuario: req.body.id_usuario,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ PaginaXUsuario: paginas_usuario, Msg: "Cadastrada com sucesso!" });
};
module.exports.alterarPaginasUsuario = async function (req, res) {
  var paginas_usuario = await models.paginas_usuario.findOne({
    where: req.body.id,
  });
  paginas_usuario.update(req.body);
  res.json({ PaginaXUsuario: paginas_usuario, Msg: "Atualizada com sucesso!" });
};
module.exports.excluirPaginasUsuario = async function (req, res) {
  var paginas_usuario = await models.paginas_usuario.findOne({
    where: req.body.id,
  });
  paginas_usuario.destroy();
  res.json({ PaginaXUsuario: paginas_usuario, Msg: "Excluida com sucesso!" });
};
