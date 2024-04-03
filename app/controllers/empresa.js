const models = require("../../db/models");

module.exports.listarEmpresa = async function (req, res) {
  var empresa = await models.empresa.findAll();
  res.send(empresa);
};

module.exports.consultarEmpresa = async function (req, res) {
  var empresa = await models.empresa.findOne({
    where: { id: req.query.id },
  });
  res.send(empresa);
};

module.exports.cadastrarEmpresa = async function (req, res) {
  var empresa = await models.empresa.create({
    nome: req.body.nome,
    cnpj: req.body.cnpj,
    cod_uni_negocio: req.body.cod_uni_negocio,
    cod_comissionado: req.body.cod_comissionado,
    cod_grupo_usuario: req.body.cod_grupo_usuario,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ Empresa: empresa.nome, Msg: "Cadastrada com sucesso!" });
};
module.exports.alterarEmpresa = async function (req, res) {
  var empresa = await models.empresa.findOne({ where: req.body.id });
  empresa.update(req.body);
  res.json({ Empresa: empresa, Msg: "Atualizado com sucesso!" });
};
module.exports.excluirEmpresa = async function (req, res) {
  var empresa = await models.empresa.findOne({ where: req.body.id });
  empresa.destroy();
  res.json({ Empresa: empresa.nome, Msg: "Excluido com sucesso!" });
};
