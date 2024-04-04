const models = require("../../db/models");

module.exports.listarMuralDescricao = async function (req, res) {
  var descricao = await models.mural_descricao.findAll();
  res.send(descricao);
};

module.exports.consultarMuralDescricao = async function (req, res) {
  var descricao = await models.mural_descricao.findOne({
    where: { id: req.query.id },
  });
  res.send(descricao);
};

module.exports.cadastrarMuralDescricao = async function (req, res) {
  var descricao = await models.mural_descricao.create({
    descricao: req.body.descricao,
    id_usuario: req.body.id_usuario,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ Descrição: descricao, Msg: "Cadastrada com sucesso!" });
};
module.exports.alterarMuralDescricao = async function (req, res) {
  var descricao = await models.mural_descricao.findOne({ where: req.body.id });
  descricao.update(req.body);
  res.json({ Descrição: descricao, Msg: "Atualizado com sucesso!" });
};
module.exports.excluirMuralDescricao = async function (req, res) {
  var descricao = await models.mural_descricao.findOne({ where: req.body.id });
  descricao.destroy();
  res.json({ Descrição: descricao, Msg: "Excluido com sucesso!" });
};
