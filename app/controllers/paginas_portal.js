const models = require("../../db/models");

module.exports.listarPaginasPortal = async function (req, res) {
  var pagina = await models.paginas_portal.findAll();
  res.send(pagina);
};

module.exports.consultarPaginasPortal = async function (req, res) {
  var pagina = await models.paginas_portal.findOne({
    where: { id: req.query.id },
  });
  res.send(pagina);
};

module.exports.cadastrarPaginasPortal = async function (req, res) {
  var pagina = await models.paginas_portal.create({
    descricao: req.body.descricao,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ Pagina: pagina, Msg: "Cadastrada com sucesso!" });
};
module.exports.alterarPaginasPortal = async function (req, res) {
  var pagina = await models.paginas_portal.findOne({ where: req.body.id });
  pagina.update(req.body);
  res.json({ Pagina: pagina, Msg: "Atualizada com sucesso!" });
};
module.exports.excluirPaginasPortal = async function (req, res) {
  var pagina = await models.paginas_portal.findOne({ where: req.body.id });
  pagina.destroy();
  res.json({ Pagina: pagina, Msg: "Excluida com sucesso!" });
};
