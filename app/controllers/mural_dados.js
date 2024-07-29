const models = require("../../db/models");
const { Op } = require("sequelize");

module.exports.listarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findAll();
  res.send(dados);
};

module.exports.listarDadosMuralAnualSemestre1 = async function (req, res) {
  var dados = await models.mural_dados.findAll({
    where: { ano: req.query.ano, mes: { [Op.lte]: 6 } },
  });
  res.send(dados);
};

module.exports.listarDadosMuralAnualSemestre2 = async function (req, res) {
  var dados = await models.mural_dados.findAll({
    where: { ano: req.query.ano, mes: { [Op.gt]: 6 } },
  });
  res.send(dados);
};

module.exports.consultarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findOne({
    where: { id: req.query.id },
  });
  res.send(dados);
};

module.exports.cadastrarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.create({
    ano: req.body.ano,
    mes: req.body.mes,
    valor: req.body.valor,
    id_mural_descricao: req.body.id_mural_descricao,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ Dados: dados, Msg: "Cadastrada com sucesso!" });
};
module.exports.alterarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findOne({ where: req.body.id });
  dados.update(req.body);
  res.json({ Dados: dados, Msg: "Atualizado com sucesso!" });
};
module.exports.excluirDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findOne({ where: req.body.id });
  dados.destroy();
  res.json({ Dados: dados, Msg: "Excluido com sucesso!" });
};
