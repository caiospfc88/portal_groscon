const { application } = require("express");
const models = require("../../db/models");
const { geraPlanilha } = require("../utils/geraPlanilha");

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
/*module.exports.geraPlanilhasBradesco = async function (application, req, res) {
  var connection = application.config.dbConnection;
  var consultaModel = new application.app.models.ConsultasDAO(connection);
  var resultPf = await consultaModel.getRelatorioSeguroBradescoPf(req, res);
  var resultPj = await consultaModel.getRelatorioSeguroBradescoPj(req, res);
  geraPlanilha(req, res, resultPf);
  geraPlanilha(req, res, resultPj);
  req.body.data = Date.now();
  //this.cadastrarArquivoBradesco(req, res);
};*/
