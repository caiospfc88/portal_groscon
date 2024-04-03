const models = require("../../db/models");

module.exports.listarArquivosBradesco = async function (req, res) {
  var arquivo = await models.arquivos_bradesco.findAll();
  res.send(arquivo);
};

module.exports.consultarArquivoBradesco = async function (req, res) {
  var arquivo = await models.arquivos_bradesco.findOne({
    where: { id: req.query.id },
  });
  res.send(arquivo);
};

module.exports.cadastrarArquivoBradesco = async function (req, res) {
  var arquivo = await models.arquivos_bradesco.create({
    nome: req.body.nome,
    data: req.body.data,
    contabil_ini: req.body.contabil_ini,
    contabil_fin: req.body.contabil_fin,
    envio_arquivo: req.body.envio_arquivo,
    visualiza: req.body.visualiza,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ Arquivo: arquivo.nome, Msg: "Cadastrado com sucesso!" });
};
module.exports.alterarArquivoBradesco = async function (req, res) {
  var arquivo = await models.arquivos_bradesco.findOne({ where: req.body.id });
  arquivo.update(req.body);
  res.json({ Arquivo: arquivo, Msg: "Atualizado com sucesso!" });
};
module.exports.excluirArquivoBradesco = async function (req, res) {
  var arquivo = await models.arquivos_bradesco.findOne({ where: req.body.id });
  arquivo.destroy();
  res.json({ Arquivo: arquivo.nome, Msg: "Excluido com sucesso!" });
};
