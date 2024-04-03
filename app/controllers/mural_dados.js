const models = require("../../db/models");

module.exports.listarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findAll();
  res.send(dados);
};

module.exports.listarDadosMuralAnual = async function (req, res) {
  var dados = await models.mural_dados.findAll({
    where: { ano: req.query.ano },
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
    ano: req.query.ano,
    mes: req.query.mes,
    valor: req.query.valor,
    id_mural_descricao: req.query.id_mural_descricao,
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
